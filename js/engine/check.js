/* ============================================================
   check.js — 檢定系統(spec §4.2)
   1d20 + 屬性修正(屬性−5) + 技能加值 vs DC
   20 = 大成功、1 = 大失敗;過程全透明供 UI 呈現。
   ============================================================ */
(function () {
    "use strict";

    const ATTR_NAMES = { STR: "體魄", AGI: "反應", INT: "智力", WIL: "意志", CHA: "魅力" };
    const ATTR_ICONS = { STR: "💪", AGI: "⚡", INT: "🧠", WIL: "🔮", CHA: "💬" };

    const Check = {
        ATTR_NAMES: ATTR_NAMES,
        ATTR_ICONS: ATTR_ICONS,

        modOf(attrValue) { return attrValue - 5; },

        /** 可注入亂數來源(測試用) */
        _rng: Math.random,
        rollDie() { return 1 + Math.floor(Check._rng() * 20); },

        /**
         * spec: { attr:"INT", skill?:"hacking", dc:12 }
         * actor: state.player(或任何有 attrs/skills 的物件)
         * 回傳完整明細
         */
        roll(spec, actor) {
            const die = Check.rollDie();
            const attrVal = (actor.attrs && actor.attrs[spec.attr]) || 5;
            const mod = Check.modOf(attrVal);
            let skill = (spec.skill && actor.skills && actor.skills[spec.skill]) || 0;
            if (window.SE && SE.Tech && SE.State && SE.State.data) skill += SE.Tech.bonus("check_" + spec.attr);
            if (spec.skill === "hacking" && window.SE && SE.State && SE.State.data && SE.State.benched("elena")) skill += 1;   // 伊蓮娜留守:逆向工程
            const total = die + mod + skill;
            let crit = null;
            if (die === 20) crit = "success";
            else if (die === 1) crit = "fail";
            const success = crit === "success" ? true : crit === "fail" ? false : total >= spec.dc;
            return {
                die: die, mod: mod, skill: skill, total: total,
                dc: spec.dc, attr: spec.attr, success: success, crit: crit
            };
        },

        /** 選項上的檢定標籤文字,如「🧠智力 DC12」 */
        tagText(spec) {
            return (ATTR_ICONS[spec.attr] || "") + (ATTR_NAMES[spec.attr] || spec.attr) + " DC" + spec.dc;
        },

        /** 檢定結果橫幅 HTML(scene.js 插入敘事流) */
        bannerHTML(r) {
            const T = (SE.DATA.strings && SE.DATA.strings.check) || {};
            const parts = [
                '<span class="die">d20:' + r.die + "</span>",
                (ATTR_NAMES[r.attr] || r.attr) + (r.mod >= 0 ? " +" : " ") + r.mod
            ];
            if (r.skill) parts.push((T.skill || "技能") + " +" + r.skill);
            let html = parts.join(" ｜ ") + " ＝ " + r.total + "　vs　DC" + r.dc;
            html += '<span class="verdict">' + (r.success ? (T.ok || "成功") : (T.ng || "失敗")) + "</span>";
            if (r.crit === "success") html += '<span class="crit">' + (T.critOk || "★ 大成功") + "</span>";
            if (r.crit === "fail") html += '<span class="crit">' + (T.critNg || "☠ 大失敗") + "</span>";
            return '<div class="check-banner ' + (r.success ? "ok" : "ng") + '">' + html + "</div>";
        }
    };

    window.SE = window.SE || {};
    SE.Check = Check;
})();
