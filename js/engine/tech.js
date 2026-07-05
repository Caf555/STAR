/* ============================================================
   tech.js — 科技樹與製造(M3)
   - 研究:消耗資料核心,解鎖被動加成(bonus 鍵值累加)
   - 靜態加成(hullMax/fuelMax)於研究當下套用
   - 製造:配方 + 素材;INT ≥ 10 有 20% 產出加倍
   ============================================================ */
(function () {
    "use strict";

    const Tech = {
        _tab: "tech",

        has(id) { return SE.State.data && SE.State.data.tech.indexOf(id) !== -1; },

        /** 累加被動加成(dmg/psi/armor/shield/shipdmg/erosion_guard/check_WIL/hp/resonance) */
        bonus(key) {
            if (!SE.State.data) return 0;
            let sum = 0;
            SE.State.data.tech.forEach(function (id) {
                const n = SE.DATA.tech[id];
                if (n && n.bonus && n.bonus[key]) sum += n.bonus[key];
            });
            return sum;
        },

        canResearch(id) {
            const n = SE.DATA.tech[id];
            if (!n || Tech.has(id)) return false;
            if (n.req && !Tech.has(n.req)) return false;
            return SE.State.itemQty("data_core") >= n.cost;
        },

        research(id) {
            if (!Tech.canResearch(id)) return false;
            const n = SE.DATA.tech[id];
            SE.State.addItem("data_core", -n.cost);
            SE.State.data.tech.push(id);
            // 靜態加成立即套用
            if (n.bonus && n.bonus.hullMax) {
                SE.State.data.ship.hullMax += n.bonus.hullMax;
                SE.State.data.ship.hull += n.bonus.hullMax;
            }
            if (n.bonus && n.bonus.fuelMax) SE.State.data.ship.fuelMax += n.bonus.fuelMax;
            SE.State.derive();
            if (SE.UI) SE.UI.toast("研究完成:" + n.name);
            return true;
        },

        canCraft(r) {
            return Object.keys(r.mats).every(m => SE.State.hasItem(m, r.mats[m]));
        },

        craft(rid) {
            const r = SE.DATA.recipes[rid];
            if (!r || !Tech.canCraft(r)) return false;
            const mats = Object.keys(r.mats);
            mats.forEach(m => SE.State.addItem(m, -r.mats[m]));

            if (SE.State.benched("elena") && Math.random() < 0.2) {   // 伊蓮娜留守:逆向工程材料回收
                const refund = mats[Math.floor(Math.random() * mats.length)];
                SE.State.addItem(refund, 1);
                if (SE.UI) SE.UI.toast("逆向工程:回收了 " + SE.DATA.items[refund].name);
            }

            let qty = r.qty || 1;
            const doubleChance = (SE.State.data.player.attrs.INT >= 10 ? 0.2 : 0) + (SE.State.benched("rivet") ? 0.15 : 0);
            if (doubleChance > 0 && Math.random() < doubleChance) {
                qty *= 2;
                if (SE.UI) SE.UI.toast("精工!產出加倍");
            }
            SE.State.addItem(r.out, qty);
            if (SE.UI) SE.UI.toast("製造完成:" + SE.DATA.items[r.out].name + " ×" + qty);
            return true;
        },

        /* ---------- UI ---------- */
        open() {
            Tech._tab = "tech";
            Tech.render();
            SE.UI.openModal("modal-tech");
        },

        render() {
            document.getElementById("tech-tab-tech").classList.toggle("on", Tech._tab === "tech");
            document.getElementById("tech-tab-craft").classList.toggle("on", Tech._tab === "craft");
            document.getElementById("tech-cores").textContent =
                "資料核心:" + SE.State.itemQty("data_core");
            const body = document.getElementById("tech-list");
            body.innerHTML = "";

            if (Tech._tab === "tech") {
                const BR = { mil: "軍備工程", ship: "艦船工程", pre: "先驅研究" };
                ["mil", "ship", "pre"].forEach(function (br) {
                    const h = document.createElement("div");
                    h.className = "char-h";
                    h.textContent = BR[br];
                    body.appendChild(h);
                    Object.keys(SE.DATA.tech).filter(id => SE.DATA.tech[id].branch === br).forEach(function (id) {
                        const n = SE.DATA.tech[id];
                        const row = document.createElement("div");
                        const owned = Tech.has(id);
                        const gated = n.req && !Tech.has(n.req);
                        row.className = "slot-row" + (owned ? " tech-owned" : "");
                        row.innerHTML = '<div class="slot-info"><div class="slot-name">' +
                            (owned ? "✔ " : gated ? "🔒 " : "") + n.name + "</div>" +
                            '<div class="slot-meta">' + n.desc +
                            (gated ? "(需先研究:" + SE.DATA.tech[n.req].name + ")" : "") + "</div></div>" +
                            (owned ? "" : '<div class="shop-price">◆' + n.cost + "</div>");
                        if (!owned) {
                            const btn = document.createElement("button");
                            btn.className = "icon-btn"; btn.type = "button"; btn.textContent = "研究";
                            btn.disabled = !Tech.canResearch(id);
                            btn.addEventListener("click", function () { Tech.research(id); Tech.render(); SE.UI.refreshHUD(); });
                            row.appendChild(btn);
                        }
                        body.appendChild(row);
                    });
                });
            } else {
                Object.keys(SE.DATA.recipes).forEach(function (rid) {
                    const r = SE.DATA.recipes[rid];
                    const out = SE.DATA.items[r.out];
                    const mats = Object.keys(r.mats).map(m =>
                        SE.DATA.items[m].name + " ×" + r.mats[m] + "(持有 " + SE.State.itemQty(m) + ")").join("、");
                    const row = document.createElement("div");
                    row.className = "slot-row";
                    row.innerHTML = '<div class="slot-info"><div class="slot-name">' + out.name +
                        (r.qty > 1 ? " ×" + r.qty : "") + "</div>" +
                        '<div class="slot-meta">' + mats + "</div></div>";
                    const btn = document.createElement("button");
                    btn.className = "icon-btn"; btn.type = "button"; btn.textContent = "製造";
                    btn.disabled = !Tech.canCraft(r);
                    btn.addEventListener("click", function () { Tech.craft(rid); Tech.render(); SE.UI.refreshHUD(); });
                    row.appendChild(btn);
                    body.appendChild(row);
                });
            }
        }
    };

    window.SE = window.SE || {};
    SE.Tech = Tech;
})();
