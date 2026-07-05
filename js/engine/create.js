/* ============================================================
   create.js — 角色創建流程(spec §4.3/§4.4)
   四步驟:出身 → 職業 → 屬性配點 → 名字與確認。
   完成後建立狀態並進入該出身的專屬序章。
   ============================================================ */
(function () {
    "use strict";

    const POINTS = 10, BASE = 5, CAP = 15;
    const ATTRS = ["STR", "AGI", "INT", "WIL", "CHA"];

    const Create = {
        sel: null,

        begin() {
            Create.sel = { origin: null, class: null, attrs: { STR: BASE, AGI: BASE, INT: BASE, WIL: BASE, CHA: BASE }, name: "" };
            SE.UI.showScreen("create");
            Create.step(1);
        },

        step(n) {
            Create.sel.step = n;
            const head = document.getElementById("create-head");
            const body = document.getElementById("create-body");
            const steps = ["選擇出身", "選擇職業", "屬性配點", "最後確認"];
            head.innerHTML = steps.map((s, i) =>
                '<span class="create-step' + (i + 1 === n ? " on" : i + 1 < n ? " done" : "") + '">' + (i + 1) + ". " + s + "</span>"
            ).join('<span class="create-sep">─</span>');
            body.innerHTML = "";
            Create["render" + n](body);
        },

        _nav(body, backFn, nextLabel, nextFn, nextDisabled) {
            const nav = document.createElement("div");
            nav.className = "create-nav";
            if (backFn) {
                const b = document.createElement("button");
                b.className = "icon-btn"; b.type = "button"; b.textContent = "◂ 上一步";
                b.addEventListener("click", backFn);
                nav.appendChild(b);
            }
            const n = document.createElement("button");
            n.className = "menu-btn create-next"; n.type = "button"; n.textContent = nextLabel;
            n.id = "create-next";
            if (nextDisabled) n.disabled = true;
            n.addEventListener("click", nextFn);
            nav.appendChild(n);
            body.appendChild(nav);
        },

        /* ---------- 1. 出身 ---------- */
        render1(body) {
            const grid = document.createElement("div");
            grid.className = "card-grid";
            Object.keys(SE.DATA.origins).forEach(function (id) {
                const o = SE.DATA.origins[id];
                const card = document.createElement("button");
                card.type = "button";
                card.className = "create-card" + (Create.sel.origin === id ? " on" : "");
                card.innerHTML = '<div class="cc-name">' + o.name + '</div>' +
                    '<div class="cc-blurb">' + o.blurb + '</div>' +
                    '<div class="cc-perk">◆ ' + SE.Check.ATTR_NAMES[o.attrBonus] + " +1<br>◆ " + o.perk + "</div>";
                card.addEventListener("click", function () {
                    Create.sel.origin = id;
                    grid.querySelectorAll(".create-card").forEach(c => c.classList.remove("on"));
                    card.classList.add("on");
                    document.getElementById("create-next").disabled = false;
                });
                grid.appendChild(card);
            });
            body.appendChild(grid);
            Create._nav(body,
                function () { SE.UI.showScreen("menu"); },
                "▸ 下一步", function () { Create.step(2); }, !Create.sel.origin);
        },

        /* ---------- 2. 職業 ---------- */
        render2(body) {
            const grid = document.createElement("div");
            grid.className = "card-grid";
            Object.keys(SE.DATA.classes).forEach(function (id) {
                const c = SE.DATA.classes[id];
                const skills = c.skills.map(s => SE.DATA.skills[s].name).join("、");
                const card = document.createElement("button");
                card.type = "button";
                card.className = "create-card" + (Create.sel.class === id ? " on" : "");
                card.innerHTML = '<div class="cc-name">' + c.name + '</div>' +
                    '<div class="cc-blurb">' + c.blurb + '</div>' +
                    '<div class="cc-perk">◆ 定位:' + c.role + "<br>◆ 起手技能:" + skills + "</div>";
                card.addEventListener("click", function () {
                    Create.sel.class = id;
                    grid.querySelectorAll(".create-card").forEach(x => x.classList.remove("on"));
                    card.classList.add("on");
                    document.getElementById("create-next").disabled = false;
                });
                grid.appendChild(card);
            });
            body.appendChild(grid);
            Create._nav(body, function () { Create.step(1); }, "▸ 下一步", function () { Create.step(3); }, !Create.sel.class);
        },

        /* ---------- 3. 屬性配點 ---------- */
        remaining() {
            let used = 0;
            ATTRS.forEach(a => used += Create.sel.attrs[a] - BASE);
            return POINTS - used;
        },

        render3(body) {
            const o = SE.DATA.origins[Create.sel.origin];
            const wrap = document.createElement("div");
            wrap.className = "attr-alloc";

            const info = document.createElement("div");
            info.className = "alloc-remain";
            wrap.appendChild(info);

            const DESCS = { STR: "生命值、近戰傷害、負重", AGI: "行動順序、閃避、遠程命中", INT: "科技檢定、駭入、製造品質", WIL: "靈能強度、抗低語侵蝕", CHA: "說服交涉、價格、好感增速" };

            ATTRS.forEach(function (a) {
                const row = document.createElement("div");
                row.className = "alloc-row";
                const bonus = o.attrBonus === a ? 1 : 0;
                row.innerHTML =
                    '<div class="alloc-name">' + SE.Check.ATTR_ICONS[a] + " " + SE.Check.ATTR_NAMES[a] +
                    (bonus ? ' <span class="alloc-bonus">出身 +1</span>' : "") + "</div>" +
                    '<div class="alloc-desc">' + DESCS[a] + "</div>" +
                    '<div class="alloc-ctrl">' +
                    '<button class="icon-btn" type="button" data-a="' + a + '" data-d="-1">−</button>' +
                    '<span class="alloc-val" id="alloc-' + a + '"></span>' +
                    '<button class="icon-btn" type="button" data-a="' + a + '" data-d="1">＋</button></div>';
                wrap.appendChild(row);
            });
            body.appendChild(wrap);

            function refresh() {
                const rem = Create.remaining();
                info.innerHTML = "剩餘點數:<b>" + rem + "</b>(基礎 5,上限 " + CAP + ";出身加成於確認時套用)";
                ATTRS.forEach(function (a) {
                    document.getElementById("alloc-" + a).textContent = Create.sel.attrs[a];
                });
                wrap.querySelectorAll("button[data-a]").forEach(function (b) {
                    const a = b.getAttribute("data-a"), d = parseInt(b.getAttribute("data-d"), 10);
                    const v = Create.sel.attrs[a];
                    b.disabled = d > 0 ? (rem <= 0 || v >= CAP - (o.attrBonus === a ? 1 : 0)) : v <= BASE;
                });
                const next = document.getElementById("create-next");
                if (next) next.disabled = rem !== 0;
            }
            wrap.addEventListener("click", function (ev) {
                const b = ev.target.closest("button[data-a]");
                if (!b || b.disabled) return;
                Create.sel.attrs[b.getAttribute("data-a")] += parseInt(b.getAttribute("data-d"), 10);
                refresh();
            });

            Create._nav(body, function () { Create.step(2); }, "▸ 下一步", function () { Create.step(4); }, true);
            refresh();
        },

        /* ---------- 4. 名字與確認 ---------- */
        render4(body) {
            const o = SE.DATA.origins[Create.sel.origin];
            const c = SE.DATA.classes[Create.sel.class];
            const finalAttrs = Object.assign({}, Create.sel.attrs);
            finalAttrs[o.attrBonus] = Math.min(CAP, finalAttrs[o.attrBonus] + 1);

            const box = document.createElement("div");
            box.className = "create-summary";
            box.innerHTML =
                '<label class="cs-name-label">你的名字<br>' +
                '<input id="create-name" class="cs-name" type="text" maxlength="12" placeholder="旅人" value="' + (Create.sel.name || "") + '"></label>' +
                '<div class="cs-grid">' +
                '<div><span class="label">出身</span>' + o.name + "</div>" +
                '<div><span class="label">職業</span>' + c.name + "</div>" +
                ATTRS.map(a => "<div><span class=\"label\">" + SE.Check.ATTR_NAMES[a] + "</span>" + finalAttrs[a] +
                    (o.attrBonus === a ? ' <span class="alloc-bonus">+1</span>' : "") + "</div>").join("") +
                "</div>" +
                '<div class="cc-perk">◆ ' + o.perk + "<br>◆ 起手裝備:" + SE.DATA.items[c.weapon].name + "、急救貼片 ×2</div>";
            body.appendChild(box);

            Create._nav(body, function () { Create.step(3); }, "▸ 開始你的故事", function () {
                Create.sel.name = document.getElementById("create-name").value.trim() || "旅人";
                Create.finish(finalAttrs);
            }, false);
        },

        finish(finalAttrs) {
            const o = SE.DATA.origins[Create.sel.origin];
            const c = SE.DATA.classes[Create.sel.class];
            SE.State.create({
                name: Create.sel.name,
                origin: Create.sel.origin,
                class: Create.sel.class,
                attrs: finalAttrs,
                skills: Object.assign({}, c.baseSkills),
                credits: o.credits
            });
            SE.State.apply([{ item: "stim_patch", qty: 2 }, { item: c.weapon, qty: 1 }]);
            SE.UI.showScreen("game");
            if (SE.Audio) SE.Audio.startAmbient("explore");
            SE.Core.goto(o.start);
        }
    };

    window.SE = window.SE || {};
    SE.Create = Create;
})();
