/* ============================================================
   techtree.js — 科技樹節點與製造配方(M3:三分支各 4 節點)
   bonus 鍵:dmg(小隊武器傷害)、psi(靈能傷害)、armor(受傷減免)、
   hp(生命上限)、hullMax/fuelMax(靜態)、shield(艦船護盾)、
   shipdmg(艦船武器)、erosion_guard(侵蝕減免)、check_WIL(檢定)、
   resonance(劇情:歌謠共鳴)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.tech = {
        /* ---- 軍備工程 ---- */
        mil_dmg1: { branch: "mil", name: "武器強化 I", cost: 2, bonus: { dmg: 1 }, desc: "小隊武器傷害 +1" },
        mil_dmg2: { branch: "mil", name: "武器強化 II", cost: 4, req: "mil_dmg1", bonus: { dmg: 1 }, desc: "小隊武器傷害再 +1" },
        mil_armor: { branch: "mil", name: "複合護甲塗層", cost: 3, bonus: { armor: 1 }, desc: "小隊受到的傷害 −1" },
        mil_stim: { branch: "mil", name: "強化體能改造", cost: 3, bonus: { hp: 10 }, desc: "生命上限 +10" },

        /* ---- 艦船工程 ---- */
        ship_hull: { branch: "ship", name: "船體結構強化", cost: 2, bonus: { hullMax: 10 }, desc: "迴響號船體上限 +10" },
        ship_shield: { branch: "ship", name: "護盾電容擴充", cost: 3, bonus: { shield: 10 }, desc: "艦船護盾上限 +10" },
        ship_fuel: { branch: "ship", name: "燃料艙改裝", cost: 2, bonus: { fuelMax: 2 }, desc: "燃料上限 +2" },
        ship_guns: { branch: "ship", name: "武器火控校準", cost: 4, req: "ship_hull", bonus: { shipdmg: 2 }, desc: "艦船武器傷害 +2" },

        /* ---- 先驅研究 ---- */
        pre_guard: { branch: "pre", name: "心智屏障訓練", cost: 2, bonus: { erosion_guard: 2 }, desc: "每次侵蝕增加 −2(最低 0)" },
        pre_psi: { branch: "pre", name: "靈能聚焦矩陣", cost: 3, bonus: { psi: 2 }, desc: "靈能傷害 +2" },
        pre_sense: { branch: "pre", name: "調諧感知", cost: 3, bonus: { check_WIL: 1 }, desc: "意志檢定 +1" },
        pre_song: { branch: "pre", name: "歌謠共鳴解析", cost: 4, req: "pre_sense", bonus: { resonance: 1 }, desc: "解鎖與織界者遺物的特殊互動選項" }
    };

    D.recipes = {
        r_stim: { out: "stim_patch", qty: 1, mats: { med_gel: 1, scrap_alloy: 1 } },
        r_boost: { out: "adrenal_boost", qty: 1, mats: { med_gel: 2, data_core: 1 } },
        r_grenade: { out: "frag_grenade", qty: 2, mats: { scrap_alloy: 2 } }
    };
})();
