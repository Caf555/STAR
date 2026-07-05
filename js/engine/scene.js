/* ============================================================
   scene.js — 敘事節點渲染
   打字機效果(可關/點擊跳過)、輕量標記、條件式選項、
   檢定選項標示與結果橫幅。
   ============================================================ */
(function () {
    "use strict";

    const Scene = {
        _typing: null,        // 進行中的打字機計時器
        _pendingHTML: "",     // 跳過時直接補完

        /** 輕量標記 → HTML:{名字} 說話者、**重點** 高亮;先做 HTML escape */
        markup(text) {
            const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return esc
                .replace(/\{([^}]+)\}/g, function (_, name) {
                    return '<span class="speaker">' + name + "</span>";
                })
                .replace(/\*\*([^*]+)\*\*/g, '<span class="hl">$1</span>');
        },

        node(id) {
            const n = SE.DATA.nodes[id];
            if (!n) throw new Error("未知的敘事節點:" + id);
            return n;
        },

        /** 顯示節點(核心入口,由 Core.goto 呼叫) */
        show(id, opts) {
            opts = opts || {};
            const n = Scene.node(id);
            SE.State.data.node = id;
            if (n.location) SE.State.data.location = n.location;

            // 讀檔回到節點時不得重複執行 onEnter(效果已包含在存檔狀態中)
            if (!opts.skipEnter) {
                const msgs = SE.State.apply(n.onEnter);
                msgs.forEach(m => SE.UI.toast(m));
            }

            const box = document.getElementById("narrative");
            if (!opts.append) box.innerHTML = "";
            if (opts.banner) {
                const div = document.createElement("div");
                div.innerHTML = opts.banner;
                box.appendChild(div.firstChild);
            }

            let raw = String(n.text || "");
            // 動態文字:節點可指定 dyn 建構器(如尾聲後日談),依當前狀態組裝
            if (n.dyn && SE.Dyn && SE.Dyn[n.dyn]) raw += SE.Dyn[n.dyn]();
            const paras = raw.split(/\n\s*\n/).map(Scene.markup);
            Scene.renderChoices(null); // 打字期間先清空選項
            Scene.typewrite(box, paras, function () {
                Scene.renderChoices(n);
            });

            SE.UI.refreshHUD();
            if (!opts.noAutosave) SE.Save.save("auto");
        },

        /* ---------- 打字機 ---------- */
        typewrite(box, paras, done) {
            Scene.stopTyping();
            const speed = 14; // ms/字
            if (!SE.settings.typewriter) {
                paras.forEach(html => {
                    const p = document.createElement("p");
                    p.innerHTML = html;
                    box.appendChild(p);
                });
                box.scrollTop = box.scrollHeight;
                done();
                return;
            }

            let pi = 0, ci = 0;
            let p = null;
            const cursor = document.createElement("span");
            cursor.className = "cursor";

            function finishAll() {
                Scene.stopTyping();
                cursor.remove();
                // 補完尚未輸出的段落
                if (p) { p.innerHTML = paras[pi]; pi++; }
                for (; pi < paras.length; pi++) {
                    const el = document.createElement("p");
                    el.innerHTML = paras[pi];
                    box.appendChild(el);
                }
                box.scrollTop = box.scrollHeight;
                box.removeEventListener("click", finishAll);
                done();
            }
            box.addEventListener("click", finishAll);

            // 為避免打字中途出現破碎的 HTML 標籤,以「可見字元計數」漸進渲染整段 HTML
            function visibleSlice(html, count) {
                let out = "", vis = 0, i = 0;
                while (i < html.length && vis < count) {
                    if (html[i] === "<") { const j = html.indexOf(">", i); out += html.slice(i, j + 1); i = j + 1; }
                    else if (html[i] === "&") { const j = html.indexOf(";", i); out += html.slice(i, j + 1); i = j + 1; vis++; }
                    else { out += html[i]; i++; vis++; }
                }
                return { html: out, complete: i >= html.length };
            }

            function tick() {
                if (pi >= paras.length) { finishAll(); return; }
                if (!p) {
                    p = document.createElement("p");
                    box.appendChild(p);
                    box.appendChild(cursor);
                    ci = 0;
                }
                ci += 1;
                const r = visibleSlice(paras[pi], ci);
                p.innerHTML = r.html;
                p.appendChild(cursor);
                box.scrollTop = box.scrollHeight;
                if (r.complete) { cursor.remove(); pi++; p = null; }
                Scene._typing = setTimeout(tick, speed);
            }
            tick();
        },

        stopTyping() {
            if (Scene._typing) { clearTimeout(Scene._typing); Scene._typing = null; }
        },

        /* ---------- 選項 ---------- */
        renderChoices(n) {
            const wrap = document.getElementById("choices");
            wrap.innerHTML = "";
            if (!n || !n.choices) return;

            const visible = n.choices.filter(c => SE.State.cond(c.show));
            visible.forEach(function (c, idx) {
                const btn = document.createElement("button");
                btn.className = "choice-btn";
                btn.type = "button";
                let html = '<span class="num">' + (idx + 1) + "</span>" + Scene.markup(c.text);
                if (c.check) html += '<span class="check-tag">' + SE.Check.tagText(c.check) + "</span>";
                if (c.tag) html += '<span class="req-tag">' + Scene.markup(c.tag) + "</span>";
                btn.innerHTML = html;
                btn.addEventListener("click", function () { Scene.pick(c); });
                wrap.appendChild(btn);
            });
        },

        pick(c) {
            const msgs = SE.State.apply(c.effects);
            msgs.forEach(m => SE.UI.toast(m));

            if (c.check) {
                const r = SE.Check.roll(c.check, SE.State.data.player);
                const banner = SE.Check.bannerHTML(r);
                const target = r.success ? c.check.success : c.check.fail;
                SE.Core.goto(target, { banner: banner });
                return;
            }
            if (c.combat) { SE.Combat.start(c.combat); return; }
            if (c.shipCombat) { SE.ShipCombat.start(c.shipCombat); return; }
            if (c.shop) { SE.Shop.open(c.shop); SE.UI.refreshHUD(); return; }   // 停留在原節點
            if (c.goto) { SE.Core.goto(c.goto); return; }
            if (c.action) { SE.Core.action(c.action); return; }  // 引擎級動作(回主選單等)
        }
    };

    window.SE = window.SE || {};
    SE.Scene = Scene;
})();
