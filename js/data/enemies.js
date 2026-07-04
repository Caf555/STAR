/* ============================================================
   enemies.js — 敵人資料(M1:序章用)
   resist:傷害倍率(0.5 抗性 / 1 普通 / 1.5 弱點)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.enemies = D.enemies || {}, {
        drone_sentry: {
            name: "黑曜哨戒無人機", family: "mech",
            hp: 30, agi: 7, atk: [5, 9], dtype: "en", range: "ranged",
            resist: { kin: 1, en: 0.5, psi: 1.5 },
            xp: 35, credits: 20,
            loot: [{ item: "data_core", qty: 1, chance: 0.6 }, { item: "scrap_alloy", qty: 1, chance: 1 }]
        },
        merc_gun: {
            name: "獵犬傭兵", family: "human",
            hp: 30, agi: 6, atk: [5, 9], dtype: "kin", range: "ranged",
            resist: { kin: 0.75, en: 1, psi: 1.25 },
            xp: 30, credits: 25,
            loot: [{ item: "stim_patch", qty: 1, chance: 0.4 }]
        },
        merc_blade: {
            name: "獵犬突擊手", family: "human",
            hp: 38, agi: 5, atk: [7, 11], dtype: "kin", range: "melee",
            resist: { kin: 0.75, en: 1, psi: 1.25 },
            xp: 35, credits: 25,
            loot: [{ item: "scrap_alloy", qty: 1, chance: 0.5 }]
        },
        merc_leader: {
            name: "獵犬小隊長", family: "human",
            hp: 48, agi: 7, atk: [7, 11], dtype: "kin", range: "ranged",
            resist: { kin: 0.75, en: 1, psi: 1.25 },
            skills: [{ name: "燃燒彈", dmg: [5, 8], dtype: "en", status: { id: "burn", turns: 2, power: 4 } }],
            xp: 60, credits: 60,
            loot: [{ item: "stim_patch", qty: 1, chance: 1 }]
        },
        zealot: {
            name: "燃燈庭追隨者", family: "human",
            hp: 24, agi: 6, atk: [5, 8], dtype: "psi", range: "melee",
            resist: { kin: 1, en: 1, psi: 0.5 },
            xp: 25, credits: 15
        }
    });
})();
