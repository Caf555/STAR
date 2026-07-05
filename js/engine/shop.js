/* ============================================================
   shop.js — 商店系統(M2)
   購買/出售兩頁;魅力影響價格(每點 ±2%,基準 5);
   出售價 = 基價 × sellRate。
   觸發:選項 { shop:"shopId" }
   ============================================================ */
(function () {
    "use strict";

    const Shop = {
        _id: null,
        _tab: "buy",

        /** 魅力修正後的購買價 */
        buyPrice(base) {
            const cha = SE.State.data.player.attrs.CHA || 5;
            return Math.max(1, Math.round(base * (1 - 0.02 * (cha - 5))));
        },
        sellPrice(base, rate) {
            return Math.max(1, Math.floor(base * (rate == null ? 0.5 : rate)));
        },

        open(id) {
            Shop._id = id;
            Shop._tab = "buy";
            Shop.render();
            SE.UI.openModal("modal-shop");
        },

        render() {
            const def = SE.DATA.shops[Shop._id];
            const s = SE.State.data;
            document.getElementById("shop-title").textContent = def.name;
            document.getElementById("shop-credits").textContent = "學分:" + s.credits;
            document.getElementById("shop-tab-buy").classList.toggle("on", Shop._tab === "buy");
            document.getElementById("shop-tab-sell").classList.toggle("on", Shop._tab === "sell");

            const list = document.getElementById("shop-list");
            list.innerHTML = "";

            if (Shop._tab === "buy") {
                def.buy.forEach(function (entry) {
                    const it = SE.DATA.items[entry.item];
                    const price = Shop.buyPrice(entry.price);
                    const row = document.createElement("div");
                    row.className = "slot-row";
                    row.innerHTML = '<div class="slot-info"><div class="slot-name">' + it.name +
                        ' <span class="slot-meta">持有 ' + SE.State.itemQty(entry.item) + "</span></div>" +
                        '<div class="slot-meta">' + (it.desc || "") + "</div></div>" +
                        '<div class="shop-price">' + price + "</div>";
                    const btn = document.createElement("button");
                    btn.className = "icon-btn"; btn.type = "button"; btn.textContent = "購買";
                    btn.disabled = s.credits < price;
                    btn.addEventListener("click", function () {
                        if (s.credits < price) return;
                        SE.State.apply([{ credits: -price }, { item: entry.item, qty: 1 }]).forEach(m => SE.UI.toast(m));
                        Shop.render(); SE.UI.refreshHUD();
                    });
                    row.appendChild(btn);
                    list.appendChild(row);
                });
            } else {
                const priceOf = {};
                (def.buy || []).forEach(e => priceOf[e.item] = e.price);
                let any = false;
                Object.keys(s.inventory).forEach(function (id) {
                    const it = SE.DATA.items[id];
                    if (!it || it.type === "key" || it.type === "weapon" || it.price === 0) return;
                    const base = priceOf[id] != null ? priceOf[id] : it.price;
                    if (base == null) return;
                    any = true;
                    const price = Shop.sellPrice(base, def.sellRate);
                    const row = document.createElement("div");
                    row.className = "slot-row";
                    row.innerHTML = '<div class="slot-info"><div class="slot-name">' + it.name +
                        " ×" + s.inventory[id] + "</div></div>" +
                        '<div class="shop-price">' + price + "</div>";
                    const btn = document.createElement("button");
                    btn.className = "icon-btn"; btn.type = "button"; btn.textContent = "出售";
                    btn.addEventListener("click", function () {
                        SE.State.apply([{ item: id, qty: -1 }, { credits: price }]).forEach(m => SE.UI.toast(m));
                        Shop.render(); SE.UI.refreshHUD();
                    });
                    row.appendChild(btn);
                    list.appendChild(row);
                });
                if (!any) list.innerHTML = '<div class="modal-note">沒有可出售的物品(關鍵道具與武器不可出售)。</div>';
            }
        }
    };

    window.SE = window.SE || {};
    SE.Shop = Shop;
})();
