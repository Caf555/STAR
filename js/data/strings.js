/* ============================================================
   strings.js — UI 字串集中管理(資料檔)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    SE.DATA = SE.DATA || {};

    SE.DATA.strings = {
        engineTag: "M2 星圖與第一章",
        demoChapter: "示範場景〈曙光港的訊號〉",
        noQuest: "(目前沒有追蹤中的任務)",

        saveTitle: "存檔",
        loadTitle: "讀檔",
        autoSlot: "自動存檔",
        slot: "存檔槽",
        emptySlot: "(空)",
        doSave: "存檔",
        doLoad: "讀取",
        doExport: "匯出",
        doDelete: "刪除",
        saved: "已存檔",
        loadFail: "讀檔失敗",
        importFail: "匯入失敗:檔案格式錯誤",

        check: {
            skill: "技能",
            ok: "成功",
            ng: "失敗",
            critOk: "★ 大成功",
            critNg: "☠ 大失敗"
        },
        fx: {
            gain: "獲得:",
            lose: "失去:",
            credits: "學分",
            xp: "經驗",
            erosionUp: "侵蝕 +",
            erosionDown: "侵蝕 ",
            affinity: "好感",
            levelUp: "升級!Lv.",
            joined: "加入了小隊"
        }
    };
})();
