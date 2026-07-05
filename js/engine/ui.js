/* ============================================================
   ui.js — HUD 面板、畫面切換、視窗(存讀檔/設定)、
   鍵盤操作(選項 1–9)、效果浮層。
   ============================================================ */
(function () {
    "use strict";

    const CLASS_NAMES = { assault: "突擊專家", hacker: "系統駭客", conductor: "弦引者" };
    const ORIGIN_NAMES = { scavenger: "邊境拾荒者", officer: "前聯邦軍官", exile: "星語逐徒" };

    const UI = {
        CLASS_NAMES: CLASS_NAMES,
        ORIGIN_NAMES: ORIGIN_NAMES,

        /* ---------- 畫面切換 ---------- */
        showScreen(name) {
            document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
            document.getElementById("screen-" + name).classList.add("active");
        },

        /* ---------- HUD ---------- */
        refreshHUD() {
            const s = SE.State.data;
            if (!s) return;
            const p = s.player;
            const $ = id => document.getElementById(id);

            $("hud-player-name").textContent = p.name;
            $("hud-player-class").textContent = CLASS_NAMES[p.class] || p.class;
            $("hud-hp").textContent = p.hp + " / " + p.hpMax;
            $("hud-hp-bar").style.width = (100 * p.hp / p.hpMax) + "%";
            $("hud-ep").textContent = p.ep + " / " + p.epMax;
            $("hud-ep-bar").style.width = (100 * p.ep / p.epMax) + "%";
            $("hud-erosion").textContent = p.erosion + " / 100";
            $("hud-erosion-bar").style.width = p.erosion + "%";
            $("hud-credits").textContent = s.credits;
            $("hud-level").textContent = "Lv." + p.level;

            // 夥伴列表
            const pwrap = $("hud-party");
            pwrap.innerHTML = "";
            s.party.forEach(function (id) {
                const def = SE.DATA.companions[id];
                const rec = s.companions[id];
                if (!def || !rec) return;
                const hpMax = SE.State.companionHpMax(id);
                const div = document.createElement("div");
                div.className = "hud-member";
                div.innerHTML = '<div class="member-name">' + def.name + '<span class="cls">' + def.title + "</span></div>" +
                    '<div class="bar hp"><i style="width:' + (100 * rec.hp / hpMax) + '%"></i></div>' +
                    '<div class="stat-row"><span class="label">生命</span><span class="value">' + rec.hp + " / " + hpMax + "</span></div>";
                pwrap.appendChild(div);
            });

            const loc = (SE.DATA.locations && SE.DATA.locations[s.location]) || null;
            $("hud-loc-name").textContent = loc ? loc.name : s.location;
            $("hud-loc-sub").textContent = loc ? loc.sub : "";

            // 迴響號面板(取得艦船後啟用)
            const shipEl = $("hud-ship");
            if (SE.State.getFlag("pro.finished")) {
                const sys = SE.DATA.systems && SE.DATA.systems[s.ship.system];
                shipEl.innerHTML =
                    '<div class="stat-row"><span class="label">所在星系</span><span class="value">' + (sys ? sys.name : s.ship.system) + "</span></div>" +
                    '<div class="stat-row"><span class="label">船體</span><span class="value">' + s.ship.hull + " / " + s.ship.hullMax + "</span></div>" +
                    '<div class="bar hull"><i style="width:' + (100 * s.ship.hull / s.ship.hullMax) + '%"></i></div>' +
                    '<div class="stat-row"><span class="label">燃料</span><span class="value">' + s.ship.fuel + " / " + s.ship.fuelMax + "</span></div>" +
                    '<div class="bar fuel"><i style="width:' + (100 * s.ship.fuel / s.ship.fuelMax) + '%"></i></div>';
            } else {
                shipEl.innerHTML = '<div class="stat-row"><span class="label">狀態</span><span class="value">尚未取得</span></div>' +
                    '<div class="loc-sub">在序章結尾取得迴響號</div>';
            }

            const node = s.node && SE.DATA.nodes[s.node];
            $("hud-chapter").textContent = (node && node.chapterLabel) || SE.DATA.strings.demoChapter || "";

            // 任務追蹤(M0:顯示啟動中的示範任務)
            const qwrap = $("hud-quests");
            qwrap.innerHTML = "";
            let any = false;
            for (const qid in s.quests) {
                const q = s.quests[qid];
                const def = SE.DATA.quests && SE.DATA.quests[qid];
                if (!def || q.done) continue;
                any = true;
                const div = document.createElement("div");
                div.className = "quest-item";
                const stage = def.stages && def.stages[Math.min(q.stage, def.stages.length) - 1];
                div.innerHTML = '<div class="q-title">◈ ' + def.title + '</div>' +
                    (stage ? '<div class="q-obj">' + stage.objective + "</div>" : "");
                qwrap.appendChild(div);
            }
            if (!any) qwrap.innerHTML = '<div class="quest-item"><span class="q-obj">' + (SE.DATA.strings.noQuest || "(目前沒有追蹤中的任務)") + "</span></div>";
        },

        /* ---------- 浮層 ---------- */
        toast(msg, warn) {
            const stack = document.getElementById("toast-stack");
            const el = document.createElement("div");
            el.className = "toast" + (warn ? " warn" : "");
            el.textContent = msg;
            stack.appendChild(el);
            setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .4s"; }, 2600);
            setTimeout(() => el.remove(), 3100);
        },

        /* ---------- 視窗 ---------- */
        openModal(id) { document.getElementById(id).classList.add("open"); },
        closeModal(id) { document.getElementById(id).classList.remove("open"); },
        closeAllModals() { document.querySelectorAll(".modal-backdrop").forEach(el => el.classList.remove("open")); },

        /* ---------- 存讀檔視窗 ---------- */
        _slotMode: "save",
        openSlots(mode) {
            UI._slotMode = mode; // "save" | "load"
            document.getElementById("slots-title").textContent =
                mode === "save" ? (SE.DATA.strings.saveTitle || "存檔") : (SE.DATA.strings.loadTitle || "讀檔");
            UI.renderSlots();
            UI.openModal("modal-slots");
        },

        renderSlots() {
            const listEl = document.getElementById("slot-list");
            listEl.innerHTML = "";
            const entries = SE.Save.list();
            entries.push({ slot: "auto", save: SE.Save.peek("auto") });

            entries.forEach(function (ent) {
                const row = document.createElement("div");
                row.className = "slot-row" + (ent.save ? "" : " empty");
                const label = ent.slot === "auto" ? (SE.DATA.strings.autoSlot || "自動存檔") :
                    (SE.DATA.strings.slot || "存檔槽") + " " + (ent.slot + 1);
                let meta = SE.DATA.strings.emptySlot || "(空)";
                if (ent.save) {
                    const d = new Date(ent.save.timestamp);
                    const node = SE.DATA.nodes[ent.save.node];
                    meta = (node && node.chapterLabel ? node.chapterLabel + "・" : "") +
                        d.toLocaleString("zh-TW", { hour12: false });
                }
                row.innerHTML = '<div class="slot-info"><div class="slot-name">' + label +
                    '</div><div class="slot-meta">' + meta + "</div></div>";

                if (UI._slotMode === "save" && ent.slot !== "auto") {
                    row.appendChild(UI._slotBtn(SE.DATA.strings.doSave || "存檔", function () {
                        SE.Save.save(ent.slot);
                        UI.renderSlots();
                        UI.toast(SE.DATA.strings.saved || "已存檔");
                    }));
                }
                if (ent.save) {
                    row.appendChild(UI._slotBtn(SE.DATA.strings.doLoad || "讀取", function () {
                        SE.Core.loadGame(ent.slot);
                    }));
                    row.appendChild(UI._slotBtn(SE.DATA.strings.doExport || "匯出", function () {
                        SE.Save.exportSlot(ent.slot);
                    }));
                    if (ent.slot !== "auto") {
                        row.appendChild(UI._slotBtn(SE.DATA.strings.doDelete || "刪除", function () {
                            SE.Save.remove(ent.slot);
                            UI.renderSlots();
                        }));
                    }
                }
                listEl.appendChild(row);
            });
        },

        _slotBtn(text, fn) {
            const b = document.createElement("button");
            b.className = "icon-btn"; b.type = "button"; b.textContent = text;
            b.addEventListener("click", fn);
            return b;
        },

        /* ---------- 角色面板 ---------- */
        openChar() {
            UI.renderChar();
            UI.openModal("modal-char");
        },

        renderChar() {
            const s = SE.State.data;
            if (!s) return;
            const p = s.player;
            const body = document.getElementById("char-body");
            const o = SE.DATA.origins[p.origin], c = SE.DATA.classes[p.class];
            const need = SE.State.xpNeed(p.level);

            let html = '<div class="cs-grid">' +
                '<div><span class="label">名字</span>' + p.name + "</div>" +
                '<div><span class="label">出身</span>' + (o ? o.name : p.origin) + "</div>" +
                '<div><span class="label">職業</span>' + (c ? c.name : p.class) + "</div>" +
                '<div><span class="label">等級</span>Lv.' + p.level + "</div>" +
                '<div><span class="label">經驗</span>' + p.xp + " / " + need + "</div>" +
                '<div><span class="label">學分</span>' + s.credits + "</div>" +
                "</div>";

            html += '<h3 class="char-h">屬性' +
                ((p.attrPoints || 0) > 0 ? '<span class="alloc-bonus">可分配點數:' + p.attrPoints + "</span>" : "") + "</h3>";
            html += '<div class="char-attrs">';
            ["STR", "AGI", "INT", "WIL", "CHA"].forEach(function (a) {
                html += '<div class="char-attr"><span>' + SE.Check.ATTR_ICONS[a] + " " + SE.Check.ATTR_NAMES[a] + "</span><b>" + p.attrs[a] + "</b>" +
                    ((p.attrPoints || 0) > 0 && p.attrs[a] < 15 ? '<button class="icon-btn char-plus" type="button" data-attr="' + a + '">＋</button>' : "") +
                    "</div>";
            });
            html += "</div>";

            if (c) {
                html += '<h3 class="char-h">技能</h3><div class="char-skills">' +
                    c.skills.map(function (id) {
                        const sk = SE.DATA.skills[id];
                        return '<div class="char-skill"><b>' + sk.name + "</b> <span class='label'>EP" + sk.ep + "</span><br><span class='label'>" + sk.desc + "</span></div>";
                    }).join("") + "</div>";
            }

            html += '<h3 class="char-h">背包</h3><div class="char-inv">';
            const keys = Object.keys(s.inventory);
            if (!keys.length) html += '<span class="label">(空)</span>';
            keys.forEach(function (id) {
                const it = SE.DATA.items[id] || { name: id, desc: "" };
                html += '<div class="char-item"><b>' + it.name + "</b> ×" + s.inventory[id] +
                    (it.desc ? '<br><span class="label">' + it.desc + "</span>" : "") + "</div>";
            });
            html += "</div>";

            body.innerHTML = html;
            body.querySelectorAll(".char-plus").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const a = btn.getAttribute("data-attr");
                    if ((p.attrPoints || 0) <= 0 || p.attrs[a] >= 15) return;
                    p.attrs[a] += 1; p.attrPoints -= 1;
                    SE.State.derive();
                    UI.renderChar();
                    UI.refreshHUD();
                });
            });
        },

        /* ---------- 小隊管理 ---------- */
        AFFINITY_LV: ["冷淡", "中立", "信任", "摯友", "羈絆"],
        affinityLevel(v) { return Math.max(0, Math.min(4, Math.floor((v || 0) / 2))); },

        /** 個人任務解鎖條件:好感達「信任」(≥4)、尚未完成、且該夥伴確實有個人任務資料 */
        pqEligible(id) {
            const rec = SE.State.data.companions[id];
            const aff = rec ? rec.affinity : 0;
            return aff >= 4 && !SE.State.getFlag("pq." + id + "_done") && !!SE.DATA.nodes["pq_" + id + "_01"];
        },

        openParty() {
            UI.renderParty();
            UI.openModal("modal-party");
        },

        renderParty() {
            const s = SE.State.data;
            const body = document.getElementById("party-body");
            const roster = Object.keys(s.companions).filter(id => SE.DATA.companions[id]);
            let html = '<div class="modal-note">出戰小隊上限 2 人;其餘船員留守迴響號提供被動加成。點擊切換出戰/待命。</div>';

            if (!roster.length) {
                html += '<div class="modal-note">目前沒有夥伴。</div>';
                body.innerHTML = html;
                return;
            }
            html += '<div class="party-list">';
            roster.forEach(function (id) {
                const def = SE.DATA.companions[id];
                const rec = s.companions[id];
                const active = s.party.indexOf(id) !== -1;
                const lv = UI.affinityLevel(rec.affinity);
                html += '<div class="party-card' + (active ? " active" : "") + '">' +
                    '<div class="pc-head"><b>' + def.name + '</b><span class="cls">' + def.title + "</span></div>" +
                    '<div class="pc-aff">好感:' + UI.AFFINITY_LV[lv] +
                    ' <span class="pc-aff-dots">' + "●".repeat(lv + 1) + "○".repeat(4 - lv) + "</span></div>" +
                    '<div class="pc-passive label">' + def.shipPassive + "</div>" +
                    '<div class="pc-actions">' +
                    '<button class="icon-btn" type="button" data-toggle="' + id + '">' +
                    (active ? "◂ 調回待命" : "▸ 加入出戰") + "</button>";
                const hasPQ = UI.pqEligible(id);
                if (hasPQ || SE.DATA.nodes["talk_" + id]) {
                    html += '<button class="icon-btn' + (hasPQ ? " pq-ready" : "") + '" type="button" data-talk="' + id + '">💬 交談' +
                        (hasPQ ? ' <span class="pq-badge">!</span>' : "") + "</button>";
                }
                html += "</div></div>";
            });
            html += "</div>";
            body.innerHTML = html;

            body.querySelectorAll("[data-toggle]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const id = btn.getAttribute("data-toggle");
                    const idx = s.party.indexOf(id);
                    if (idx !== -1) s.party.splice(idx, 1);
                    else if (s.party.length < 2) s.party.push(id);
                    else UI.toast("出戰小隊已滿(上限 2 人)", true);
                    UI.renderParty(); UI.refreshHUD();
                });
            });
            body.querySelectorAll("[data-talk]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const id = btn.getAttribute("data-talk");
                    const target = UI.pqEligible(id) ? "pq_" + id + "_01" : "talk_" + id;
                    UI.closeModal("modal-party");
                    SE.Core._returnNode = SE.State.data.node;
                    SE.Core.goto(target, { noAutosave: true });
                });
            });
        },

        /* ---------- 設定 ---------- */
        applySettings() {
            const st = SE.settings;
            document.documentElement.setAttribute("data-fontsize", st.fontSize);
            document.documentElement.setAttribute("data-fx", st.fx ? "on" : "off");
            document.querySelectorAll("[data-setting]").forEach(function (btn) {
                const key = btn.getAttribute("data-setting");
                const val = btn.getAttribute("data-value");
                const cur = String(st[key]);
                btn.classList.toggle("on", cur === val);
            });
            const vol = document.getElementById("setting-volume");
            if (vol) vol.value = Math.round((st.volume != null ? st.volume : 0.6) * 100);
        },

        bindSettings() {
            document.querySelectorAll("[data-setting]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const key = btn.getAttribute("data-setting");
                    let val = btn.getAttribute("data-value");
                    if (val === "true") val = true; else if (val === "false") val = false;
                    SE.settings[key] = val;
                    localStorage.setItem("se_settings", JSON.stringify(SE.settings));
                    if (SE.Audio) {
                        if (key === "sfxOn") SE.Audio.setSfxOn(val);
                        if (key === "musicOn") SE.Audio.setMusicOn(val);
                    }
                    UI.applySettings();
                });
            });
            const vol = document.getElementById("setting-volume");
            if (vol) {
                vol.addEventListener("input", function () {
                    const v = parseInt(vol.value, 10) / 100;
                    SE.settings.volume = v;
                    localStorage.setItem("se_settings", JSON.stringify(SE.settings));
                    if (SE.Audio) SE.Audio.setVolume(v);
                });
            }
        },

        /* ---------- 鍵盤 ---------- */
        bindKeyboard() {
            document.addEventListener("keydown", function (ev) {
                if (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA") return;
                if (ev.key === "Escape") { UI.closeAllModals(); return; }
                const gameActive = document.getElementById("screen-game").classList.contains("active");
                if (!gameActive) return;
                const n = parseInt(ev.key, 10);
                if (n >= 1 && n <= 9) {
                    const btns = document.querySelectorAll("#choices .choice-btn");
                    if (btns[n - 1]) btns[n - 1].click();
                }
            });
        }
    };

    window.SE = window.SE || {};
    SE.UI = UI;
})();
