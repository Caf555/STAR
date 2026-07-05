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
        },
        zealot_adept: {
            name: "燃燈庭執誦者", family: "human",
            hp: 34, agi: 7, atk: [6, 9], dtype: "psi", range: "ranged",
            resist: { kin: 1, en: 1, psi: 0.5 },
            skills: [{ name: "低語灌注", dmg: [5, 8], dtype: "psi", status: { id: "stun", turns: 1, chance: 0.3 } }],
            xp: 45, credits: 30
        },
        rift_spawn: {
            name: "裂隙幼體", family: "rift",
            hp: 22, agi: 8, atk: [4, 7], dtype: "psi", range: "melee",
            resist: { kin: 0.75, en: 0.75, psi: 1.5 },
            xp: 30, credits: 0
        },
        rift_maw: {
            name: "裂隙撕裂者", family: "rift",
            hp: 72, agi: 6, atk: [8, 12], dtype: "psi", range: "melee",
            resist: { kin: 0.75, en: 0.75, psi: 1.5 },
            skills: [{ name: "錯頻嘶鳴", dmg: [4, 6], dtype: "psi", status: { id: "suppress", turns: 2 } }],
            xp: 90, credits: 0,
            loot: [{ item: "data_core", qty: 1, chance: 1 }]
        },

        /* ---- 守夜人 VIGIL 單元(機械,弱靈能/能量) ---- */
        vigil_drone: {
            name: "守夜人巡衛", family: "mech",
            hp: 40, agi: 9, atk: [6, 10], dtype: "en", range: "ranged",
            resist: { kin: 1, en: 0.5, psi: 1.25 },
            xp: 55, credits: 0,
            loot: [{ item: "data_core", qty: 1, chance: 0.5 }]
        },
        vigil_sentinel: {
            name: "守夜人哨戍機", family: "mech",
            hp: 66, agi: 7, atk: [8, 12], dtype: "en", range: "ranged",
            resist: { kin: 1, en: 0.5, psi: 1.25 },
            skills: [{ name: "靜默脈衝", dmg: [6, 9], dtype: "en", status: { id: "stun", turns: 1, chance: 0.35, chanceMech: 0 } }],
            xp: 80, credits: 0,
            loot: [{ item: "data_core", qty: 2, chance: 0.6 }]
        },
        vigil_core: {
            name: "守夜人 VIGIL・具現核", family: "mech",
            hp: 150, agi: 8, atk: [10, 15], dtype: "en", range: "ranged",
            resist: { kin: 0.75, en: 0.5, psi: 1 },
            skills: [{ name: "審判矩陣", dmg: [8, 12], dtype: "en", status: { id: "suppress", turns: 2 } }],
            xp: 260, credits: 0,
            loot: [{ item: "vigil_cipher", qty: 1, chance: 1 }]
        },

        /* ---- 黑曜精銳(第三/四章) ---- */
        obsidian_elite: {
            name: "黑曜獵犬精銳", family: "human",
            hp: 52, agi: 8, atk: [8, 12], dtype: "kin", range: "ranged",
            resist: { kin: 0.6, en: 1, psi: 1.25 },
            skills: [{ name: "穿甲彈幕", dmg: [7, 11], dtype: "kin", mult: 1.2 }],
            xp: 70, credits: 45,
            loot: [{ item: "stim_patch", qty: 1, chance: 0.5 }]
        },

        /* ---- 深淵威脅(第四章災變) ---- */
        rift_horror: {
            name: "裂隙恐懼體", family: "rift",
            hp: 110, agi: 7, atk: [10, 14], dtype: "psi", range: "melee",
            resist: { kin: 0.5, en: 0.5, psi: 1.5 },
            skills: [{ name: "存在剝離", dmg: [7, 10], dtype: "psi", status: { id: "burn", turns: 2, power: 5 } }],
            xp: 130, credits: 0,
            loot: [{ item: "void_shard", qty: 1, chance: 1 }]
        }
    });
})();
