/* ============================================================
   shipCombat.js — 艦船對戰(spec §5.2,M3 基礎版)
   距離帶(0 近/1 中/2 遠);每回合 2 行動點:
   開火(武器有有效距離帶)/機動/護盾充能/脫離。
   迴響號:脈衝炮(近中)、魚雷(中遠,冷卻 2 回合)。
   船體傷害戰後保留;戰敗回到 30% 並走 defeat 節點。
   ============================================================ */
(function () {
    "use strict";
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const BAND = ["近距", "中距", "遠距"];

    const ShipCombat = {
        cur: null,

        playerWeapons() {
            const bonus = SE.Tech ? SE.Tech.bonus("shipdmg") : 0;
            return [
                { id: "pulse", name: "脈衝炮", dmg: [6, 10], bands: [0, 1], cd: 0, bonus: bonus },
                { id: "torpedo", name: "魚雷", dmg: [9, 14], bands: [1, 2], cd: 2, bonus: bonus }
            ];
        },

        start(encId) {
            const enc = SE.DATA.shipEncounters[encId];
            if (!enc) throw new Error("未知艦船遭遇:" + encId);
            const s = SE.State.data;
            const shieldMax = 20 + (SE.Tech ? SE.Tech.bonus("shield") : 0);
            ShipCombat.cur = {
                enc: enc,
                band: 2,                          // 開場遠距
                ap: 2, round: 1, over: false,
                player: { shield: shieldMax, shieldMax: shieldMax, weapons: ShipCombat.playerWeapons(), cds: {} },
                enemy: Object.assign({ shield: enc.enemy.shieldMax || 0, cd: 0 }, JSON.parse(JSON.stringify(enc.enemy)))
            };
            document.getElementById("shipcombat").classList.add("open");
            document.getElementById("sc-result").style.display = "none";
            document.getElementById("sc-log").innerHTML = "";
            ShipCombat.log("⚓ " + (enc.title || "艦船遭遇") + "!", "sys");
            if (SE.Audio) SE.Audio.enterCombatMood("ship");
            ShipCombat.render();
        },

        log(msg, kind) {
            const el = document.getElementById("sc-log");
            const div = document.createElement("div");
            div.className = "cb-line " + (kind || "");
            div.textContent = msg;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        },

        damageShip(target, dmg, isPlayer) {
            const absorbed = Math.min(target.shield || 0, dmg);
            target.shield -= absorbed;
            const hullDmg = dmg - absorbed;
            if (isPlayer) {
                SE.State.data.ship.hull = Math.max(0, SE.State.data.ship.hull - hullDmg);
            } else {
                target.hull = Math.max(0, target.hull - hullDmg);
            }
            if (SE.Audio) SE.Audio.play(isPlayer ? "shipHit" : "hit_en");
            return { absorbed: absorbed, hull: hullDmg };
        },

        /* ---------- 玩家行動(各消耗 1 AP) ---------- */
        act(kind, arg) {
            const c = ShipCombat.cur;
            if (!c || c.over || c.ap <= 0) return;

            if (kind === "fire") {
                const w = c.player.weapons.find(x => x.id === arg);
                if (c.player.cds[w.id] > 0 || w.bands.indexOf(c.band) === -1) return;
                c.ap--;
                if (w.cd) c.player.cds[w.id] = w.cd + 1;
                if (SE.Audio) SE.Audio.play("shipFire");
                const dmg = rnd(w.dmg[0], w.dmg[1]) + w.bonus;
                const r = ShipCombat.damageShip(c.enemy, dmg, false);
                ShipCombat.log("迴響號【" + w.name + "】命中 " + c.enemy.name + ":護盾 −" + r.absorbed + "、船體 −" + r.hull, "good");
            } else if (kind === "move") {
                c.ap--;
                c.band = Math.max(0, Math.min(2, c.band + arg));
                ShipCombat.log("迴響號機動:進入" + BAND[c.band], "sys");
            } else if (kind === "recharge") {
                c.ap--;
                c.player.shield = Math.min(c.player.shieldMax, c.player.shield + 8);
                ShipCombat.log("護盾充能 +8", "sys");
            } else if (kind === "flee") {
                c.ap--;
                if (!c.enc.escapable) { ShipCombat.log("躍遷通道被鎖定,無法脫離!", "bad"); }
                else if (c.band < 2) { ShipCombat.log("距離太近,無法安全脫離——先拉開到遠距!", "bad"); }
                else {
                    const r = SE.Check.roll({ attr: "AGI", dc: 12 }, SE.State.data.player);
                    if (r.success) { ShipCombat.log("脫離成功!(d20:" + r.die + ")", "good"); ShipCombat.finish("fled"); return; }
                    ShipCombat.log("脫離失敗——引擎過載中(d20:" + r.die + ")", "bad");
                }
            }

            if (ShipCombat.checkEnd()) return;
            if (c.ap <= 0) setTimeout(() => ShipCombat.enemyTurn(), 500);
            ShipCombat.render();
        },

        enemyTurn() {
            const c = ShipCombat.cur;
            if (!c || c.over) return;
            const e = c.enemy;
            // 機動:向偏好距離帶移動
            if (c.band !== e.band) {
                c.band += c.band > e.band ? -1 : 1;
                ShipCombat.log(e.name + " 機動:進入" + BAND[c.band], "bad");
            }
            // 開火:在偏好帶 ±1 內
            if (Math.abs(c.band - e.band) <= 1) {
                const dmg = rnd(e.dmg[0], e.dmg[1]);
                const r = ShipCombat.damageShip(c.player, dmg, true);
                ShipCombat.log(e.name + " 開火:護盾 −" + r.absorbed + "、船體 −" + r.hull, "bad");
            } else {
                ShipCombat.log(e.name + " 正在逼近……", "sys");
            }
            if (ShipCombat.checkEnd()) return;

            // 新回合
            c.round++;
            c.ap = 2;
            Object.keys(c.player.cds).forEach(k => { if (c.player.cds[k] > 0) c.player.cds[k]--; });
            ShipCombat.render();
        },

        checkEnd() {
            const c = ShipCombat.cur;
            if (c.over) return true;
            if (c.enemy.hull <= 0) { ShipCombat.finish(true); return true; }
            if (SE.State.data.ship.hull <= 0) { ShipCombat.finish(false); return true; }
            return false;
        },

        finish(result) {
            const c = ShipCombat.cur;
            c.over = true;
            const victory = result === true;
            if (SE.Audio) { SE.Audio.play(victory ? "victory" : "defeat"); SE.Audio.exitCombatMood(); }
            const lines = [];
            if (victory) {
                const msgs = SE.State.apply([{ xp: c.enemy.xp || 0 }, { credits: c.enemy.credits || 0 }]);
                lines.push.apply(lines, msgs);
            } else if (result === false) {
                SE.State.data.ship.hull = Math.max(1, Math.round(SE.State.data.ship.hullMax * 0.3));
                lines.push("迴響號重創,緊急躍遷脫離(船體 30%)");
            }
            const res = document.getElementById("sc-result");
            res.style.display = "block";
            res.innerHTML = '<div class="cb-result-title ' + (victory ? "ok" : "ng") + '">' +
                (victory ? "◆ 敵艦擊破" : result === "fled" ? "◇ 成功脫離" : "◇ 迴響號重創…") + "</div>" +
                (lines.length ? '<div class="cb-result-lines">' + lines.join("<br>") + "</div>" : "") +
                '<button class="menu-btn" type="button" id="sc-continue">▸ 繼續</button>';
            document.getElementById("sc-actions").innerHTML = "";
            res.scrollIntoView({ block: "nearest" });
            document.getElementById("sc-continue").addEventListener("click", function () {
                document.getElementById("shipcombat").classList.remove("open");
                ShipCombat.cur = null;
                SE.UI.refreshHUD();
                if (victory) SE.Core.goto(c.enc.victory);
                else if (result === "fled" && c.enc.fled) SE.Core.goto(c.enc.fled);
                else if (c.enc.defeat) SE.Core.goto(c.enc.defeat);
                else SE.Core.loadGame("auto");
            });
        },

        render() {
            const c = ShipCombat.cur;
            if (!c) return;
            const s = SE.State.data;

            // 距離帶示意
            const bandEl = document.getElementById("sc-bands");
            bandEl.innerHTML = ["近距", "中距", "遠距"].map(function (name, i) {
                return '<div class="sc-band' + (c.band === i ? " on" : "") + '">' + name +
                    (c.band === i ? '<div class="sc-ships">🛰 ⚡ 🚀</div>' : "") + "</div>";
            }).join("");

            document.getElementById("sc-player").innerHTML =
                '<div class="cb-name">迴響號</div>' +
                '<div class="bar hull"><i style="width:' + (100 * s.ship.hull / s.ship.hullMax) + '%"></i></div>' +
                '<div class="cb-nums">船體 ' + s.ship.hull + "/" + s.ship.hullMax + "</div>" +
                '<div class="bar ep"><i style="width:' + (100 * c.player.shield / c.player.shieldMax) + '%"></i></div>' +
                '<div class="cb-nums">護盾 ' + c.player.shield + "/" + c.player.shieldMax + "</div>";
            document.getElementById("sc-enemy").innerHTML =
                '<div class="cb-name">' + c.enemy.name + '</div>' +
                '<div class="bar hull"><i style="width:' + (100 * c.enemy.hull / c.enemy.hullMax) + '%"></i></div>' +
                '<div class="cb-nums">船體 ' + c.enemy.hull + "/" + c.enemy.hullMax + "</div>" +
                '<div class="bar ep"><i style="width:' + (100 * (c.enemy.shield || 0) / Math.max(1, c.enemy.shieldMax || 1)) + '%"></i></div>' +
                '<div class="cb-nums">護盾 ' + (c.enemy.shield || 0) + "/" + (c.enemy.shieldMax || 0) + "</div>";

            const bar = document.getElementById("sc-actions");
            bar.innerHTML = "";
            if (c.over) return;
            const mk = function (label, fn, disabled) {
                const b = document.createElement("button");
                b.className = "icon-btn cb-act"; b.type = "button"; b.innerHTML = label;
                if (disabled) b.disabled = true; else b.addEventListener("click", fn);
                bar.appendChild(b);
            };
            const ap = document.createElement("span");
            ap.className = "cb-wait";
            ap.textContent = "第 " + c.round + " 回合｜行動點 " + c.ap + "/2";
            bar.appendChild(ap);

            c.player.weapons.forEach(function (w) {
                const onCd = c.player.cds[w.id] > 0;
                const inBand = w.bands.indexOf(c.band) !== -1;
                mk("☄ " + w.name + (onCd ? " <small>冷卻" + c.player.cds[w.id] + "</small>" : "") +
                    (!inBand ? " <small>射程外</small>" : ""),
                    function () { ShipCombat.act("fire", w.id); }, c.ap <= 0 || onCd || !inBand);
            });
            mk("⇤ 接近", function () { ShipCombat.act("move", -1); }, c.ap <= 0 || c.band === 0);
            mk("⇥ 拉開", function () { ShipCombat.act("move", 1); }, c.ap <= 0 || c.band === 2);
            mk("🛡 護盾充能", function () { ShipCombat.act("recharge"); }, c.ap <= 0);
            mk("↯ 脫離", function () { ShipCombat.act("flee"); }, c.ap <= 0 || !c.enc.escapable);
        }
    };

    window.SE = window.SE || {};
    SE.ShipCombat = ShipCombat;
})();
