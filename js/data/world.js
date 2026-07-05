/* ============================================================
   world.js — 幽弦星區:星系、航線、商店(M2)
   系統欄位:pos(星圖座標)、lanes{目標:燃料}、arrive(抵達節點)、
   locked(未開放)、blurb(鎖定時的說明)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.systems = {
        siren: {
            name: "賽壬星系", sub: "邊境墾殖區",
            pos: [130, 310], lanes: { helios: 2, mist: 2 },
            arrive: "arrive_siren"
        },
        helios: {
            name: "赫利俄斯星系", sub: "星區樞紐・燈塔站",
            pos: [300, 225], lanes: { siren: 2, newcanaan: 2, ironcrown: 2, hymn: 3, mist: 3, mutering: 3 },
            arrive: "arrive_helios"
        },
        newcanaan: {
            name: "新迦南星系", sub: "聯邦星區首府",
            pos: [455, 110], lanes: { helios: 2 },
            locked: true, blurb: "聯邦航道管制中(第一章後開放)"
        },
        ironcrown: {
            name: "鐵冠星系", sub: "黑曜採礦重鎮",
            pos: [180, 95], lanes: { helios: 2 },
            locked: true, arrive: "arrive_ironcrown", blurb: "黑曜集團封鎖航道(第二章開放)"
        },
        hymn: {
            name: "聖詠星系", sub: "星語教會聖地",
            pos: [520, 300], lanes: { helios: 3 },
            locked: true, arrive: "arrive_hymn", blurb: "朝聖航道需教會通行證(第二章開放)"
        },
        mist: {
            name: "霧海星雲", sub: "流亡者船團藏身處",
            pos: [70, 150], lanes: { siren: 2, helios: 3 },
            locked: true, arrive: "arrive_mist", blurb: "星雲亂流,需要領航資料(第二章開放)"
        },
        mutering: {
            name: "緘默之環", sub: "織界者遺跡群",
            pos: [420, 380], lanes: { helios: 3 },
            locked: true, arrive: "arrive_mutering", blurb: "未知訊號干擾,座標不完整(第三章開放)"
        },
        chordheart: {
            name: "弦心星系", sub: "???",
            pos: [590, 185], lanes: {},
            locked: true, blurb: "空間屏障。任何已知航道都無法抵達。"
        }
    };

    /* ---------- 商店 ---------- */
    D.shops = {
        lighthouse_market: {
            name: "燈塔站・環廊市場",
            buy: [
                { item: "stim_patch", price: 25 },
                { item: "adrenal_boost", price: 60 },
                { item: "scrap_alloy", price: 12 }
            ],
            sellRate: 0.5
        }
    };
})();
