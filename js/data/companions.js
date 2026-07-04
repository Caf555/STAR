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
            shipPassive: "艦上待命:自動保養(製造品質加成,M3 啟用)"
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
