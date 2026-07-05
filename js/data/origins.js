/* ============================================================
   origins.js — 出身、職業、戰鬥技能定義(spec §4.3/§4.4)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.origins = {
        scavenger: {
            name: "邊境拾荒者",
            blurb: "曙光港的孤兒,靠拆解廢船與黑市交易長大。殘骸帶是你的獵場,沉默是你的第二母語。",
            perk: "流亡者船團初始友好;「黑市」對話選項",
            attrBonus: "AGI",
            credits: 150,
            start: "pro_scav_01"
        },
        officer: {
            name: "前聯邦軍官",
            blurb: "巡防艦「哨兵號」的前副長,因一場你沒有犯的錯被除役。制服收進了箱底,骨子裡的紀律沒有。",
            perk: "聯邦線特殊路徑;「軍旅」對話選項",
            attrBonus: "STR",
            credits: 100,
            start: "pro_off_01"
        },
        exile: {
            name: "星語逐徒",
            blurb: "曾是星語教會最年輕的銘文學者,因質疑教義被逐出碑林。他們燒掉了你的著作,燒不掉你記得的東西。",
            perk: "可直接閱讀部分織界者銘文;「教義」對話選項",
            attrBonus: "WIL",
            credits: 80,
            start: "pro_exile_01"
        }
    };

    D.classes = {
        assault: {
            name: "突擊專家",
            blurb: "火線是你最熟悉的語言。武器、掩體、射界——你用三秒鐘讀完一個房間,然後決定誰能離開。",
            role: "小隊火力核心",
            weapon: "rifle_standard",
            skills: ["precise_shot", "suppress_fire"],
            baseSkills: { tactics: 2 }
        },
        hacker: {
            name: "系統駭客",
            blurb: "門禁、無人機、艦載腦——這個星區跑在四十年沒換的韌體上,而你的指尖記得每一個後門。",
            role: "控制與工程",
            weapon: "pistol_em",
            skills: ["overload", "nano_heal"],
            baseSkills: { hacking: 2 }
        },
        conductor: {
            name: "弦引者",
            blurb: "你天生聽得見別人聽不見的頻率。醫生說是幻聽,教會說是天賦——而織界者的遺物,會回應你。",
            role: "靈能與謎團",
            weapon: "tuning_blade",
            skills: ["chord_quake", "tune_shield"],
            baseSkills: { attune: 2 }
        }
    };

    /* 戰鬥技能(M1 各職業起手 2 招 + 夥伴技) */
    D.skills = {
        precise_shot: { id: "precise_shot", name: "精準射擊", ep: 8, target: "enemy", mult: 1.5, hitBonus: 10, desc: "對單一目標造成 150% 武器傷害,命中 +10%" },
        suppress_fire: { id: "suppress_fire", name: "壓制火力", ep: 10, target: "enemies", mult: 0.6, status: { id: "suppress", turns: 2 }, desc: "對全體敵人造成 60% 傷害並壓制(命中 −15%)2 回合" },
        overload: { id: "overload", name: "過載脈衝", ep: 8, target: "enemy", dtype: "en", mult: 1.2, status: { id: "stun", turns: 1, chance: 0.3, chanceMech: 0.6 }, desc: "能量傷害 120%,30% 癱瘓 1 回合(對機械 60%)" },
        nano_heal: { id: "nano_heal", name: "奈米修復", ep: 8, target: "ally", heal: 0.35, desc: "恢復目標 35% 生命值" },
        chord_quake: { id: "chord_quake", name: "弦震", ep: 8, target: "enemy", dtype: "psi", mult: 1.4, desc: "以靈能撥動目標的存在頻率,造成 140% 靈能傷害" },
        tune_shield: { id: "tune_shield", name: "調諧屏障", ep: 10, target: "ally", shield: 15, desc: "為目標展開吸收 15 點傷害的靈能護盾" },
        guard_wall: { id: "guard_wall", name: "戰術掩護", ep: 8, target: "ally", shield: 12, desc: "以站位為隊友擋下 12 點傷害" }
    };
})();
