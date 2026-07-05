/* ============================================================
   combat.js — 地面小隊回合制戰鬥(spec §5.1,M1 基礎版)
   前/後排、行動順序(反應)、指令:攻擊/技能/道具/防禦/換位、
   傷害三型與抗性、狀態效果(灼燒/癱瘓/壓制/護盾)。
   觸發:選項 { combat:"encounterId" };結束後跳轉 victory/defeat 節點。
   ============================================================ */
(function () {
    "use strict";

    const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const Combat = {
        cur: null,
        _mode: null,     // 目標選擇模式 { kind:"attack"|"skill"|"item", data, targetSide }

        /* ---------- 建立戰鬥 ---------- */
        start(encId) {
            const enc = SE.DATA.encounters[encId];
            if (!enc) throw new Error("未知遭遇:" + encId);
            const s = SE.State.data, p = s.player;
            const actors = [];

            // 玩家
            const cls = SE.DATA.classes[p.class];
            actors.push({
                key: "player", side: "ally", ref: "player",
                name: p.name, row: "front",
                hp: p.hp, hpMax: p.hpMax, ep: p.ep, epMax: p.epMax,
                agi: p.attrs.AGI, attrs: p.attrs,
                weapon: SE.DATA.items[cls.weapon],
                skills: (cls.skills || []).slice(),
                statuses: [], defending: false
            });
            // 出戰夥伴
            s.party.forEach(id => actors.push(Combat._allyFromDef(id, SE.DATA.companions[id], s.companions[id])));
            // 本場客串
            (enc.guests || []).forEach(id => {
                const g = Combat._allyFromDef(id, SE.DATA.guests[id], null);
                g.guest = true;
                actors.push(g);
            });
            // 敵人
            (enc.enemies || []).forEach(function (e, i) {
                const def = SE.DATA.enemies[e.id];
                actors.push({
                    key: "e" + i, side: "enemy", def: def,
                    name: def.name + ((enc.enemies.filter(x => x.id === e.id).length > 1) ? " " + "甲乙丙丁戊"[enc.enemies.filter((x, j) => j <= i && x.id === e.id).length - 1] : ""),
                    row: e.row || "front",
                    hp: def.hp, hpMax: def.hp, ep: 99, epMax: 99,
                    agi: def.agi, statuses: [], defending: false
                });
            });

            Combat.cur = { enc: enc, encId: encId, actors: actors, round: 0, queue: [], over: false };
            document.getElementById("combat").classList.add("open");
            document.getElementById("cb-result").style.display = "none";
            document.getElementById("cb-log").innerHTML = "";
            Combat.log("⚔ " + (enc.title || "遭遇戰") + " 開始!", "sys");
            Combat.nextRound();
        },

        _allyFromDef(id, def, persist) {
            return {
                key: id, side: "ally", ref: id,
                name: def.name, row: def.row || "front",
                hp: persist && persist.hp != null ? persist.hp : def.hpMax,
                hpMax: def.hpMax,
                ep: persist && persist.ep != null ? persist.ep : def.epMax,
                epMax: def.epMax,
                agi: def.attrs.AGI, attrs: def.attrs,
                weapon: SE.DATA.items[def.weapon],
                skills: (def.skills || []).slice(),
                statuses: [], defending: false, npc: true
            };
        },

        /* ---------- 回合流程 ---------- */
        alive(side) { return Combat.cur.actors.filter(a => a.side === side && a.hp > 0); },

        nextRound() {
            const c = Combat.cur;
            c.round++;
            c.queue = c.actors.filter(a => a.hp > 0)
                .sort((a, b) => b.agi - a.agi || (a.side === "ally" ? -1 : 1));
            Combat.log("— 第 " + c.round + " 回合 —", "sys");
            Combat.nextTurn();
        },

        nextTurn() {
            const c = Combat.cur;
            if (c.over) return;
            if (Combat.checkEnd()) return;
            let actor;
            do { actor = c.queue.shift(); } while (actor && actor.hp <= 0);
            if (!actor) { Combat.nextRound(); return; }

            c.active = actor;
            actor.defending = false;
            actor.ep = Math.min(actor.epMax, actor.ep + 2);

            // 狀態效果:回合開始結算
            let skip = false;
            actor.statuses = actor.statuses.filter(function (st) {
                if (st.id === "burn") {
                    actor.hp = Math.max(0, actor.hp - st.power);
                    Combat.log(actor.name + " 受到灼燒 " + st.power + " 點傷害", "bad");
                }
                if (st.id === "stun" && st.turns > 0) { skip = true; }
                st.turns--;
                return st.turns > 0 || st.id === "shield";
            });
            if (actor.hp <= 0) { Combat.log(actor.name + " 倒下了!", "bad"); Combat.render(); Combat.after(); return; }
            if (skip) {
                Combat.log(actor.name + " 陷入癱瘓,無法行動", "bad");
                Combat.render(); Combat.after(); return;
            }

            Combat.render();
            if (actor.side === "enemy") setTimeout(() => Combat.aiAct(actor), 550);
            // 我方:等待 UI 指令
        },

        after() {
            if (Combat.checkEnd()) return;
            setTimeout(() => Combat.nextTurn(), 420);
        },

        checkEnd() {
            if (Combat.cur.over) return true;
            if (Combat.alive("enemy").length === 0) { Combat.finish(true); return true; }
            if (Combat.alive("ally").length === 0) { Combat.finish(false); return true; }
            return false;
        },

        /* ---------- 命中與傷害 ---------- */
        hitChance(atk, def, bonus) {
            let h = 85 + 3 * (atk.agi - def.agi) + (bonus || 0);
            if (atk.statuses.some(s => s.id === "suppress")) h -= 15;
            return clamp(h, 50, 98);
        },

        attrMod(actor, weapon) {
            if (!actor.attrs || !weapon || !weapon.attr) return 0;
            return (actor.attrs[weapon.attr] || 5) - 5;
        },

        resistOf(target, dtype) {
            if (target.def && target.def.resist) return target.def.resist[dtype] != null ? target.def.resist[dtype] : 1;
            return 1;
        },

        /** 是否可攻擊該目標(近戰只能打前排,除非前排全滅) */
        canReach(attacker, target, range) {
            if (range !== "melee") return true;
            if (target.row === "front") return true;
            return Combat.alive(target.side).every(a => a.row !== "front");
        },

        dealDamage(atk, target, opt) {
            let dmg = rnd(opt.base[0], opt.base[1]) + (opt.flatMod || 0);
            if (atk && atk.side === "ally" && SE.Tech) {
                dmg += SE.Tech.bonus("dmg");
                if (opt.dtype === "psi") dmg += SE.Tech.bonus("psi");
            }
            dmg = Math.round(dmg * (opt.mult || 1) * Combat.resistOf(target, opt.dtype));
            if (target.side === "ally" && SE.Tech) dmg = Math.max(0, dmg - SE.Tech.bonus("armor"));
            if (target.defending) dmg = Math.round(dmg * 0.5);
            const shield = target.statuses.find(s => s.id === "shield");
            if (shield) {
                const absorbed = Math.min(shield.value, dmg);
                shield.value -= absorbed; dmg -= absorbed;
                if (shield.value <= 0) target.statuses = target.statuses.filter(s => s !== shield);
                if (absorbed > 0) Combat.log(target.name + " 的護盾吸收了 " + absorbed + " 點傷害", "sys");
            }
            dmg = Math.max(0, dmg);
            target.hp = Math.max(0, target.hp - dmg);
            return dmg;
        },

        applyStatus(target, st, sourceName) {
            let chance = st.chance != null ? st.chance : 1;
            if (st.chanceMech != null && target.def && target.def.family === "mech") chance = st.chanceMech;
            if (Math.random() > chance) return false;
            if (st.id === "shield") {
                target.statuses = target.statuses.filter(s => s.id !== "shield");
                target.statuses.push({ id: "shield", value: st.value, turns: 99 });
            } else {
                target.statuses.push({ id: st.id, turns: st.turns, power: st.power || 0 });
            }
            Combat.log(target.name + " " + Combat.statusName(st.id) + "!", target.side === "enemy" ? "good" : "bad");
            return true;
        },

        statusName(id) {
            return { burn: "陷入灼燒", stun: "陷入癱瘓", suppress: "被壓制", shield: "獲得護盾" }[id] || id;
        },

        /* ---------- 我方指令 ---------- */
        doAttack(actor, target) {
            const w = actor.weapon || { dmg: [3, 5], dtype: "kin", attr: "STR", range: "melee" };
            const hit = Combat.hitChance(actor, target, w.hitBonus || 0);
            if (rnd(1, 100) > hit) {
                Combat.log(actor.name + " 攻擊 " + target.name + " —— 未命中(" + hit + "%)", "miss");
            } else {
                const dmg = Combat.dealDamage(actor, target, { base: w.dmg, dtype: w.dtype, flatMod: Combat.attrMod(actor, w) });
                Combat.log(actor.name + " 攻擊 " + target.name + ",造成 " + dmg + " 點傷害", actor.side === "ally" ? "good" : "bad");
                if (target.hp <= 0) Combat.log(target.name + " 倒下了!", actor.side === "ally" ? "good" : "bad");
            }
            Combat.render(); Combat.after();
        },

        doSkill(actor, skillId, target) {
            const sk = SE.DATA.skills[skillId];
            if (actor.ep < sk.ep) return;
            actor.ep -= sk.ep;
            const w = actor.weapon || { dmg: [3, 5], dtype: "kin" };

            const applyTo = function (t) {
                if (sk.heal) {
                    const amt = Math.round(t.hpMax * sk.heal);
                    t.hp = Math.min(t.hpMax, t.hp + amt);
                    Combat.log(actor.name + " 對 " + t.name + " 使用【" + sk.name + "】,恢復 " + amt + " 點生命", "good");
                    return;
                }
                if (sk.shield) {
                    Combat.log(actor.name + " 對 " + t.name + " 使用【" + sk.name + "】", "good");
                    Combat.applyStatus(t, { id: "shield", value: sk.shield }, actor.name);
                    return;
                }
                const hit = Combat.hitChance(actor, t, sk.hitBonus || 0);
                if (rnd(1, 100) > hit) {
                    Combat.log(actor.name + " 的【" + sk.name + "】未命中 " + t.name + "(" + hit + "%)", "miss");
                    return;
                }
                const dmg = Combat.dealDamage(actor, t, {
                    base: sk.dmg || w.dmg, dtype: sk.dtype || w.dtype,
                    mult: sk.mult || 1, flatMod: Combat.attrMod(actor, w)
                });
                Combat.log(actor.name + " 對 " + t.name + " 使用【" + sk.name + "】,造成 " + dmg + " 點傷害", actor.side === "ally" ? "good" : "bad");
                if (sk.status) Combat.applyStatus(t, sk.status, actor.name);
                if (t.hp <= 0) Combat.log(t.name + " 倒下了!", actor.side === "ally" ? "good" : "bad");
            };

            if (sk.target === "enemies") Combat.alive("enemy").forEach(applyTo);
            else applyTo(target);
            Combat.render(); Combat.after();
        },

        doItem(actor, itemId, target) {
            const it = SE.DATA.items[itemId];
            if (!it || !it.combat || !SE.State.hasItem(itemId)) return;
            SE.State.addItem(itemId, -1);
            if (it.combat.heal) {
                target.hp = Math.min(target.hpMax, target.hp + it.combat.heal);
                Combat.log(actor.name + " 對 " + target.name + " 使用【" + it.name + "】,恢復 " + it.combat.heal + " 點生命", "good");
            } else if (it.combat.dmg) {
                const dmg = Combat.dealDamage(actor, target, { base: it.combat.dmg, dtype: it.combat.dtype || "kin" });
                Combat.log(actor.name + " 對 " + target.name + " 投擲【" + it.name + "】,造成 " + dmg + " 點傷害", "good");
                if (target.hp <= 0) Combat.log(target.name + " 倒下了!", "good");
            }
            Combat.render(); Combat.after();
        },

        doDefend(actor) {
            actor.defending = true;
            actor.ep = Math.min(actor.epMax, actor.ep + 3);
            Combat.log(actor.name + " 進入防禦姿態(傷害減半、能量 +3)", "sys");
            Combat.render(); Combat.after();
        },

        doSwap(actor) {
            actor.row = actor.row === "front" ? "back" : "front";
            Combat.log(actor.name + " 移動到" + (actor.row === "front" ? "前排" : "後排"), "sys");
            Combat.render(); Combat.after();
        },

        /* ---------- 敵方 AI ---------- */
        aiAct(actor) {
            if (Combat.cur.over || actor.hp <= 0) return;
            const def = actor.def;
            // 低血量偶爾防禦
            if (actor.hp / actor.hpMax < 0.25 && Math.random() < 0.2) { Combat.doDefend(actor); return; }
            // 每 3 回合嘗試技能
            if (def.skills && def.skills.length && Combat.cur.round % 3 === 0) {
                const sk = def.skills[0];
                const targets = Combat.alive("ally").filter(t => Combat.canReach(actor, t, sk.range || def.range));
                if (targets.length) {
                    const t = targets[rnd(0, targets.length - 1)];
                    const hit = Combat.hitChance(actor, t, 0);
                    if (rnd(1, 100) <= hit) {
                        const dmg = Combat.dealDamage(actor, t, { base: sk.dmg || def.atk, dtype: sk.dtype || def.dtype, mult: sk.mult || 1 });
                        Combat.log(actor.name + " 使用【" + sk.name + "】,對 " + t.name + " 造成 " + dmg + " 點傷害", "bad");
                        if (sk.status) Combat.applyStatus(t, sk.status, actor.name);
                        if (t.hp <= 0) Combat.log(t.name + " 倒下了!", "bad");
                    } else Combat.log(actor.name + " 的【" + sk.name + "】落空了", "miss");
                    Combat.render(); Combat.after(); return;
                }
            }
            // 一般攻擊:近戰優先前排;遠程隨機(偏好低血量)
            let targets = Combat.alive("ally").filter(t => Combat.canReach(actor, t, def.range));
            if (!targets.length) targets = Combat.alive("ally");
            targets.sort((a, b) => (a.row === "front" ? 0 : 1) - (b.row === "front" ? 0 : 1) || a.hp - b.hp);
            const t = def.range === "melee" ? targets[0] : targets[rnd(0, Math.min(1, targets.length - 1))];
            Combat.doAttack(actor, t);
        },

        /* ---------- 結束 ---------- */
        finish(victory) {
            const c = Combat.cur;
            c.over = true;
            // 我方狀態寫回(戰敗恢復 30%)
            c.actors.filter(a => a.side === "ally").forEach(function (a) {
                const hp = victory ? Math.max(1, a.hp) : Math.max(1, Math.round(a.hpMax * 0.3));
                if (a.ref === "player") { SE.State.data.player.hp = hp; SE.State.data.player.ep = a.ep; }
                else if (!a.guest && SE.State.data.companions[a.ref]) {
                    SE.State.data.companions[a.ref].hp = hp;
                    SE.State.data.companions[a.ref].ep = a.ep;
                }
            });

            const lines = [];
            if (victory) {
                let xp = 0, credits = 0;
                c.actors.filter(a => a.side === "enemy").forEach(function (a) {
                    xp += a.def.xp || 0; credits += a.def.credits || 0;
                    (a.def.loot || []).forEach(function (l) {
                        if (Math.random() <= (l.chance != null ? l.chance : 1)) {
                            SE.State.addItem(l.item, l.qty || 1);
                            lines.push("獲得:" + (SE.DATA.items[l.item] ? SE.DATA.items[l.item].name : l.item));
                        }
                    });
                });
                const msgs = SE.State.apply([{ xp: xp }, { credits: credits }]);
                lines.unshift.apply(lines, msgs);
            }

            const res = document.getElementById("cb-result");
            res.style.display = "block";
            res.innerHTML = '<div class="cb-result-title ' + (victory ? "ok" : "ng") + '">' +
                (victory ? "◆ 戰鬥勝利" : "◇ 你被擊倒了…") + "</div>" +
                (lines.length ? '<div class="cb-result-lines">' + lines.join("<br>") + "</div>" : "") +
                '<button class="menu-btn" type="button" id="cb-continue">▸ 繼續</button>';
            document.getElementById("cb-actions").innerHTML = "";
            document.getElementById("cb-continue").addEventListener("click", function () {
                document.getElementById("combat").classList.remove("open");
                Combat.cur = null;
                SE.UI.refreshHUD();
                const enc = c.enc;
                if (victory) SE.Core.goto(enc.victory);
                else if (enc.defeat) SE.Core.goto(enc.defeat);
                else SE.Core.loadGame("auto");   // 預設:回到上一檢查點
            });
        },

        /* ---------- 渲染 ---------- */
        log(msg, kind) {
            const el = document.getElementById("cb-log");
            const div = document.createElement("div");
            div.className = "cb-line " + (kind || "");
            div.textContent = msg;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        },

        render() {
            const c = Combat.cur;
            if (!c) return;
            Combat._renderSide("cb-enemies", c.actors.filter(a => a.side === "enemy"));
            Combat._renderSide("cb-allies", c.actors.filter(a => a.side === "ally"));
            Combat._renderActions();
            SE.UI.refreshHUD();
        },

        _renderSide(elId, list) {
            const el = document.getElementById(elId);
            el.innerHTML = "";
            const c = Combat.cur;
            list.forEach(function (a) {
                const card = document.createElement("div");
                card.className = "cb-card" + (a.hp <= 0 ? " dead" : "") +
                    (c.active === a ? " active" : "") +
                    (a.row === "back" ? " back" : "");
                let targetable = false;
                if (Combat._mode && a.hp > 0) {
                    const m = Combat._mode;
                    if (m.targetSide === a.side && (m.range == null || Combat.canReach(c.active, a, m.range))) targetable = true;
                }
                if (targetable) card.classList.add("targetable");
                const sts = a.statuses.map(s =>
                    s.id === "shield" ? "🛡" + s.value : { burn: "🔥", stun: "⚡", suppress: "⤓" }[s.id] || s.id).join(" ");
                card.innerHTML =
                    '<div class="cb-name">' + a.name + (a.row === "back" ? '<span class="cb-row-tag">後排</span>' : "") + "</div>" +
                    '<div class="bar hp"><i style="width:' + (100 * a.hp / a.hpMax) + '%"></i></div>' +
                    '<div class="cb-nums">' + a.hp + "/" + a.hpMax +
                    (a.side === "ally" ? '　<span class="cb-ep">EP ' + a.ep + "/" + a.epMax + "</span>" : "") + "</div>" +
                    (sts ? '<div class="cb-status">' + sts + "</div>" : "") +
                    (a.defending ? '<div class="cb-status">🛑 防禦中</div>' : "");
                if (targetable) card.addEventListener("click", function () { Combat._pickTarget(a); });
                el.appendChild(card);
            });
        },

        _renderActions() {
            const c = Combat.cur;
            const bar = document.getElementById("cb-actions");
            bar.innerHTML = "";
            const a = c.active;
            if (!a || a.side !== "ally" || c.over) {
                if (a && a.side === "enemy" && !c.over)
                    bar.innerHTML = '<span class="cb-wait">' + a.name + " 行動中…</span>";
                return;
            }
            if (a.npc) { // 夥伴 M1 由簡單 AI 代打:攻擊最脆的可及目標
                bar.innerHTML = '<span class="cb-wait">' + a.name + " 行動中…</span>";
                setTimeout(function () {
                    if (Combat.cur && Combat.cur.active === a && !Combat.cur.over) Combat._npcAllyAct(a);
                }, 550);
                return;
            }

            const mk = function (label, fn, disabled, title) {
                const b = document.createElement("button");
                b.className = "icon-btn cb-act"; b.type = "button"; b.innerHTML = label;
                if (title) b.title = title;
                if (disabled) b.disabled = true;
                else b.addEventListener("click", fn);
                bar.appendChild(b);
                return b;
            };

            if (Combat._mode) {
                mk("✕ 取消", function () { Combat._mode = null; Combat.render(); });
                const hint = document.createElement("span");
                hint.className = "cb-wait";
                hint.textContent = "選擇目標…";
                bar.appendChild(hint);
                return;
            }

            const w = a.weapon || {};
            mk("⚔ 攻擊", function () {
                Combat._mode = { kind: "attack", targetSide: "enemy", range: w.range };
                Combat.render();
            });
            (a.skills || []).forEach(function (id) {
                const sk = SE.DATA.skills[id];
                mk("✦ " + sk.name + " <small>EP" + sk.ep + "</small>", function () {
                    if (sk.target === "enemies") { Combat.doSkill(a, id, null); return; }
                    Combat._mode = { kind: "skill", data: id, targetSide: sk.target === "ally" ? "ally" : "enemy", range: null };
                    Combat.render();
                }, a.ep < sk.ep, sk.desc);
            });
            // 道具:列出可戰鬥使用的消耗品
            Object.keys(SE.State.data.inventory).forEach(function (itemId) {
                const it = SE.DATA.items[itemId];
                if (it && it.combat) {
                    mk("▣ " + it.name + " ×" + SE.State.itemQty(itemId), function () {
                        Combat._mode = { kind: "item", data: itemId, targetSide: it.combat.dmg ? "enemy" : "ally", range: null };
                        Combat.render();
                    });
                }
            });
            mk("🛑 防禦", function () { Combat.doDefend(a); });
            mk("⇄ 換位", function () { Combat.doSwap(a); });
        },

        _npcAllyAct(a) {
            const usable = (a.skills || []).map(id => SE.DATA.skills[id]).filter(s => s && a.ep >= s.ep);
            // 治療技:優先救血量最低且低於 55% 的隊友
            const healSk = usable.find(s => s.heal);
            if (healSk) {
                const hurt = Combat.alive("ally").filter(t => t.hp / t.hpMax < 0.55).sort((x, y) => x.hp / x.hpMax - y.hp / y.hpMax)[0];
                if (hurt) { Combat.doSkill(a, healSk.id, hurt); return; }
            }
            // 護盾技:玩家血低且無盾 → 上盾
            const sk = usable.find(s => s.shield);
            const player = Combat.cur.actors.find(x => x.ref === "player");
            if (sk && player && player.hp / player.hpMax < 0.5 && !player.statuses.some(s => s.id === "shield")) {
                Combat.doSkill(a, sk.id, player);
                return;
            }
            const w = a.weapon || {};
            let ts = Combat.alive("enemy").filter(t => Combat.canReach(a, t, w.range));
            if (!ts.length) ts = Combat.alive("enemy");
            ts.sort((x, y) => x.hp - y.hp);
            Combat.doAttack(a, ts[0]);
        },

        _pickTarget(target) {
            const m = Combat._mode;
            const a = Combat.cur.active;
            Combat._mode = null;
            if (m.kind === "attack") Combat.doAttack(a, target);
            else if (m.kind === "skill") Combat.doSkill(a, m.data, target);
            else if (m.kind === "item") Combat.doItem(a, m.data, target);
        }
    };

    window.SE = window.SE || {};
    SE.Combat = Combat;
})();
