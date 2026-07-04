/* ============================================================
   save.js — 存檔系統(spec §11)
   localStorage 5 槽 + 自動存檔;version 欄位 + 遷移函式鏈;
   匯出 / 匯入 JSON。
   ============================================================ */
(function () {
    "use strict";

    const PREFIX = "se_save_";
    const SLOTS = 5;
    const VERSION = 1;

    /* 版本遷移鏈:migrations[n] 將版本 n 的存檔升級為 n+1 */
    const migrations = {
        0: function (save) {
            // v0(開發期原型)→ v1:補上侵蝕與遊玩時間欄位
            if (save.state && save.state.player && save.state.player.erosion == null) save.state.player.erosion = 0;
            if (save.playTime == null) save.playTime = 0;
            save.version = 1;
            return save;
        }
    };

    const Save = {
        SLOTS: SLOTS,
        VERSION: VERSION,

        key(slot) { return PREFIX + slot; },   // slot: 0..4 或 "auto"

        serialize() {
            return {
                version: VERSION,
                timestamp: Date.now(),
                playTime: SE.State.data.playTime || 0,
                node: SE.State.data.node,
                state: SE.State.data
            };
        },

        save(slot) {
            try {
                localStorage.setItem(Save.key(slot), JSON.stringify(Save.serialize()));
                return true;
            } catch (e) {
                console.error("save failed", e);
                return false;
            }
        },

        migrate(save) {
            let v = save.version || 0;
            while (v < VERSION) {
                if (!migrations[v]) throw new Error("無法遷移的存檔版本:" + v);
                save = migrations[v](save);
                v = save.version;
            }
            return save;
        },

        peek(slot) {
            const raw = localStorage.getItem(Save.key(slot));
            if (!raw) return null;
            try { return Save.migrate(JSON.parse(raw)); }
            catch (e) { console.error("corrupt save", slot, e); return null; }
        },

        load(slot) {
            const save = Save.peek(slot);
            if (!save) return null;
            SE.State.data = save.state;
            SE.State.derive();
            return save;
        },

        remove(slot) { localStorage.removeItem(Save.key(slot)); },

        list() {
            const out = [];
            for (let i = 0; i < SLOTS; i++) out.push({ slot: i, save: Save.peek(i) });
            return out;
        },

        exportSlot(slot) {
            const save = Save.peek(slot === undefined ? "auto" : slot);
            if (!save) return;
            const blob = new Blob([JSON.stringify(save, null, 1)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "star-abyssal-echoes-save.json";
            a.click();
            URL.revokeObjectURL(a.href);
        },

        importFile(file, cb) {
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const save = Save.migrate(JSON.parse(reader.result));
                    cb(null, save);
                } catch (e) { cb(e); }
            };
            reader.readAsText(file);
        }
    };

    window.SE = window.SE || {};
    SE.Save = Save;
})();
