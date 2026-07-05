/* ============================================================
   core.js — 引擎核心:啟動、場景路由、引擎級動作。
   模組載入順序:strings → state/check/save/scene/ui → core → 資料檔。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || {};
    SE.VERSION = "1.0.0";
    SE.DATA = SE.DATA || {};
    SE.DATA.nodes = SE.DATA.nodes || {};
    SE.DATA.strings = SE.DATA.strings || {};
    SE.DATA.items = SE.DATA.items || {};
    SE.DATA.quests = SE.DATA.quests || {};
    SE.DATA.locations = SE.DATA.locations || {};

    /* 玩家偏好(與存檔分離,獨立保存) */
    SE.settings = (function () {
        try { return Object.assign({ typewriter: true, fontSize: "md", fx: true }, JSON.parse(localStorage.getItem("se_settings") || "{}")); }
        catch (e) { return { typewriter: true, fontSize: "md", fx: true }; }
    })();

    const Core = {
        /** 場景路由:一切節點跳轉的唯一入口 */
        goto(nodeId, opts) {
            SE.Scene.show(nodeId, opts);
        },

        /** 引擎級動作(資料檔以 { action:"..." } 觸發) */
        action(name) {
            switch (name) {
                case "mainMenu":
                    SE.UI.showScreen("menu");
                    Core.refreshMenu();
                    break;
                case "newGame":
                    Core.newGame();
                    break;
                case "starmap":
                    SE.Starmap.open();
                    break;
                case "tech":
                    SE.Tech.open();
                    break;
                case "resume":
                    // 交談等暫離結束後,回到原本的敘事節點
                    Core.goto(Core._returnNode || SE.DATA.start, { skipEnter: true });
                    break;
                default:
                    console.warn("未知動作:", name);
            }
        },

        newGame() {
            SE.Create.begin();             // 進入角色創建流程
        },

        /** M0 引擎示範場景(預設角色) */
        startDemo() {
            SE.State.create({ name: "旅人" });
            SE.State.apply([{ item: "pistol_em", qty: 1 }]);
            SE.UI.showScreen("game");
            Core.goto("demo_01");
        },

        loadGame(slot) {
            const save = SE.Save.load(slot);
            if (!save) { SE.UI.toast(SE.DATA.strings.loadFail || "讀檔失敗", true); return; }
            SE.UI.closeAllModals();
            SE.UI.showScreen("game");
            Core.goto(save.node || SE.DATA.start, { skipEnter: true, noAutosave: slot === "auto" });
        },

        refreshMenu() {
            const hasAuto = !!SE.Save.peek("auto");
            document.getElementById("btn-continue").disabled = !hasAuto;
        },

        boot() {
            SE.UI.applySettings();
            SE.UI.bindSettings();
            SE.UI.bindKeyboard();

            document.getElementById("btn-new").addEventListener("click", () => Core.newGame());
            document.getElementById("btn-demo").addEventListener("click", () => Core.startDemo());
            document.getElementById("btn-char").addEventListener("click", () => SE.UI.openChar());
            document.getElementById("btn-map").addEventListener("click", () => { if (SE.State.data) SE.Starmap.open(); });
            document.getElementById("btn-tech").addEventListener("click", () => { if (SE.State.data) SE.Tech.open(); });
            document.getElementById("btn-party").addEventListener("click", () => { if (SE.State.data) SE.UI.openParty(); });
            document.getElementById("shop-tab-buy").addEventListener("click", () => { SE.Shop._tab = "buy"; SE.Shop.render(); });
            document.getElementById("shop-tab-sell").addEventListener("click", () => { SE.Shop._tab = "sell"; SE.Shop.render(); });
            document.getElementById("tech-tab-tech").addEventListener("click", () => { SE.Tech._tab = "tech"; SE.Tech.render(); });
            document.getElementById("tech-tab-craft").addEventListener("click", () => { SE.Tech._tab = "craft"; SE.Tech.render(); });
            document.getElementById("btn-continue").addEventListener("click", () => Core.loadGame("auto"));
            document.getElementById("btn-load").addEventListener("click", () => SE.UI.openSlots("load"));
            document.getElementById("btn-settings").addEventListener("click", () => SE.UI.openModal("modal-settings"));
            document.getElementById("btn-game-save").addEventListener("click", () => SE.UI.openSlots("save"));
            document.getElementById("btn-game-settings").addEventListener("click", () => SE.UI.openModal("modal-settings"));
            document.getElementById("btn-game-menu").addEventListener("click", () => Core.action("mainMenu"));

            document.querySelectorAll("[data-close]").forEach(btn =>
                btn.addEventListener("click", () => SE.UI.closeModal(btn.getAttribute("data-close"))));

            document.getElementById("btn-import").addEventListener("change", function (ev) {
                const f = ev.target.files[0];
                if (!f) return;
                SE.Save.importFile(f, function (err, save) {
                    if (err) { SE.UI.toast(SE.DATA.strings.importFail || "匯入失敗:檔案格式錯誤", true); return; }
                    SE.State.data = save.state;
                    SE.State.derive();
                    SE.Save.save("auto");
                    SE.UI.closeAllModals();
                    SE.UI.showScreen("game");
                    Core.goto(save.node || SE.DATA.start, { skipEnter: true });
                });
                ev.target.value = "";
            });

            // 遊玩計時
            setInterval(function () {
                if (SE.State.data && document.getElementById("screen-game").classList.contains("active")) {
                    SE.State.data.playTime += 1;
                }
            }, 1000);

            document.getElementById("menu-version").textContent =
                "v" + SE.VERSION + "　" + (SE.DATA.strings.engineTag || "");
            Core.refreshMenu();
            SE.UI.showScreen("menu");
        }
    };

    SE.Core = Core;
    document.addEventListener("DOMContentLoaded", Core.boot);
})();
