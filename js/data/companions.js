/* ============================================================
   companions.js — 夥伴與客串角色(M1:凱菈)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.companions = Object.assign(D.companions || {}, {
        kaila: {
            name: "凱菈·沃斯",
            title: "前聯邦艦長・戰術官",
            hpMax: 70, epMax: 30,
            attrs: { STR: 8, AGI: 6, INT: 6, WIL: 6, CHA: 6 },
            weapon: "pistol_service",
            skills: ["guard_wall"],
            row: "front",
            shipPassive: "艦上待命:戰術簡報(全隊命中 +2%,M3 啟用)"
        },
        rivet: {
            name: "鉚釘 RIVET",
            title: "古董工程機器人",
            hpMax: 55, epMax: 35,
            attrs: { STR: 6, AGI: 5, INT: 9, WIL: 7, CHA: 4 },
            weapon: "welding_arm",
            skills: ["nano_heal", "overload"],
            row: "back",
            shipPassive: "艦上待命:自動保養(製造品質加成)"
        },
        thane: {
            name: "塞恩",
            title: "維薩里星圖師",
            hpMax: 52, epMax: 32,
            attrs: { STR: 5, AGI: 8, INT: 7, WIL: 7, CHA: 5 },
            weapon: "vessari_lance",
            skills: ["precise_shot", "chord_quake"],
            row: "back",
            shipPassive: "艦上待命:領航直覺(躍遷燃料偶爾不消耗)"
        },
        dax: {
            name: "「野犬」達克斯",
            title: "流亡者神槍手",
            hpMax: 58, epMax: 28,
            attrs: { STR: 6, AGI: 9, INT: 5, WIL: 5, CHA: 6 },
            weapon: "long_rifle",
            skills: ["precise_shot", "suppress_fire"],
            row: "back",
            shipPassive: "艦上待命:賞金人脈(商店售價略高)"
        },
        elena: {
            name: "伊蓮娜·魁",
            title: "黑曜叛逃科學家",
            hpMax: 50, epMax: 40,
            attrs: { STR: 4, AGI: 6, INT: 10, WIL: 7, CHA: 6 },
            weapon: "pistol_em",
            skills: ["overload", "nano_heal"],
            row: "back",
            shipPassive: "艦上待命:逆向工程(製造與駭入加成)"
        },
        echo: {
            name: "回聲",
            title: "裂隙誕生的擬人存在",
            hpMax: 60, epMax: 45,
            attrs: { STR: 6, AGI: 7, INT: 7, WIL: 9, CHA: 4 },
            weapon: "tuning_blade",
            skills: ["chord_quake", "tune_shield"],
            row: "front",
            shipPassive: "艦上待命:淵之低語(對裂隙獸傷害加成,但船員侵蝕緩增)"
        }
    });

    /* 非招募的客串戰鬥角色 */
    D.guests = Object.assign(D.guests || {}, {
        crew_dep: {
            name: "戴普(駝鹿號船員)",
            hpMax: 40, epMax: 20,
            attrs: { STR: 6, AGI: 5, INT: 5, WIL: 5, CHA: 5 },
            weapon: "pistol_service",
            skills: [],
            row: "front"
        }
    });
})();
