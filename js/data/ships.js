/* ============================================================
   ships.js — 艦船遭遇資料(M3)
   enemy:{ name, hull, hullMax, shieldMax, dmg[min,max], band(偏好距離帶),
           xp, credits }
   escapable:是否可脫離;victory/defeat/fled:結束後跳轉節點
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.shipEncounters = {
        se_pirate: {
            title: "海盜攔截艇",
            enemy: { name: "破爛攔截艇", hull: 34, hullMax: 34, shieldMax: 8, dmg: [4, 8], band: 0, xp: 40, credits: 60 },
            escapable: true,
            victory: "mist_02", defeat: "mist_02", fled: "mist_02"
        },
        se_obsidian_patrol: {
            title: "黑曜巡邏艦",
            enemy: { name: "黑曜巡邏艦「隼」", hull: 52, hullMax: 52, shieldMax: 18, dmg: [7, 11], band: 1, xp: 80, credits: 100 },
            escapable: false,
            victory: "ch2_ironrun_win", defeat: "ch2_ironrun_lose"
        },
        se_vigil_barrier: {
            title: "守夜人無人艦群",
            enemy: { name: "守夜人封鎖節點", hull: 52, hullMax: 52, shieldMax: 14, dmg: [7, 10], band: 1, xp: 140, credits: 0 },
            escapable: false,
            victory: "ch3_barrier_win", defeat: "ch3_barrier_lose"
        }
    };
})();
