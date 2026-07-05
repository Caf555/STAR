/* ============================================================
   state.js — 全域遊戲狀態、條件 DSL、效果 DSL
   引擎不含劇情;所有條件/效果皆為宣告式物件,由此模組統一解析。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: { nodes: {}, speakers: {}, strings: {} } };

    const State = {
        data: null,

        /** 建立全新遊戲狀態(M0:示範用預設角色;M1 起由創角流程產生) */
        create(opts) {
            opts = opts || {};
            const attrs = Object.assign({ STR: 5, AGI: 6, INT: 6, WIL: 5, CHA: 5 }, opts.attrs);
            const s = {
                player: {
                    name: opts.name || "旅人",
                    origin: opts.origin || "scavenger",   // scavenger | officer | exile
                    class: opts.class || "hacker",        // assault | hacker | conductor
                    level: 1, xp: 0,
                    attrs: attrs,
                    skills: opts.skills || { hacking: 2 },
                    hp: 0, ep: 0,                          // 由 derive() 填入
                    erosion: 0
                },
                party: [],            // 出戰夥伴 id
                companions: {},       // id -> { affinity }
                inventory: {},        // itemId -> qty
                credits: opts.credits != null ? opts.credits : 120,
                flags: {},            // 巢狀旗標樹
                quests: {},           // questId -> { stage, done }
                chapter: 0,
                ship: { fuel: 6, fuelMax: 10, hull: 30, hullMax: 30, system: "siren" },
                tech: [],
                unlocked: [],
                location: opts.location || "siren_dawnport",
                node: null,           // 目前敘事節點 id
                playTime: 0           // 秒
            };
            State.data = s;
            State.derive();
            s.player.hp = s.player.hpMax;
            s.player.ep = s.player.epMax;
            return s;
        },

        /** 派生數值(spec §4.1) */
        derive() {
            const p = State.data.player;
            p.hpMax = 30 + p.attrs.STR * 6 + p.level * 4 + (SE.Tech ? SE.Tech.bonus("hp") : 0);
            p.epMax = 20 + p.attrs.WIL * 3;
            p.hp = Math.min(p.hp || p.hpMax, p.hpMax);
            p.ep = Math.min(p.ep || p.epMax, p.epMax);
        },

        /* ---------- 旗標(點路徑) ---------- */
        setFlag(path, val) {
            const parts = String(path).replace(/^flag\./, "").split(".");
            let o = State.data.flags;
            for (let i = 0; i < parts.length - 1; i++) {
                if (typeof o[parts[i]] !== "object" || o[parts[i]] === null) o[parts[i]] = {};
                o = o[parts[i]];
            }
            o[parts[parts.length - 1]] = (val === undefined) ? true : val;
        },
        getFlag(path) {
            const parts = String(path).replace(/^flag\./, "").split(".");
            let o = State.data.flags;
            for (const k of parts) {
                if (o == null || typeof o !== "object" || !(k in o)) return undefined;
                o = o[k];
            }
            return o;
        },

        /** 升級所需經驗 */
        xpNeed(level) { return level * 100; },

        /* ---------- 背包 ---------- */
        addItem(id, qty) {
            qty = qty == null ? 1 : qty;
            const inv = State.data.inventory;
            inv[id] = (inv[id] || 0) + qty;
            if (inv[id] <= 0) delete inv[id];
        },
        itemQty(id) { return State.data.inventory[id] || 0; },
        hasItem(id, qty) { return State.itemQty(id) >= (qty == null ? 1 : qty); },

        /* ============================================================
           條件 DSL
           { all:[...] } { any:[...] } { not:{...} }
           { flag:"a.b" [, val:x] }         旗標(預設檢查 truthy)
           { class:"hacker" } { origin:"scavenger" }
           { item:"id" [, qty:n] }
           { companion:"id" }               在隊
           { affinity:{ id:"kaila", gte:n } }
           { attr:{ name:"INT", gte:n } }
           { erosion:{ gte:n } / { lte:n } }
           { chapter:{ gte:n } }
           { credits:{ gte:n } }
           空/未定義 → true
           ============================================================ */
        cond(c) {
            if (c == null) return true;
            const s = State.data, p = s.player;
            if (Array.isArray(c)) return c.every(State.cond);            // 陣列 = all
            if (c.all) return c.all.every(State.cond);
            if (c.any) return c.any.some(State.cond);
            if (c.not) return !State.cond(c.not);

            if ("flag" in c) {
                const v = State.getFlag(c.flag);
                return ("val" in c) ? v === c.val : !!v;
            }
            if ("class" in c) return p.class === c.class;
            if ("origin" in c) return p.origin === c.origin;
            if ("item" in c) return State.hasItem(c.item, c.qty);
            if ("companion" in c) return s.party.indexOf(c.companion) !== -1;
            if ("affinity" in c) {
                const rec = s.companions[c.affinity.id];
                return !!rec && rec.affinity >= (c.affinity.gte || 0);
            }
            if ("attr" in c) {
                const v = p.attrs[c.attr.name] || 0;
                if ("gte" in c.attr) return v >= c.attr.gte;
                if ("lte" in c.attr) return v <= c.attr.lte;
                return false;
            }
            if ("erosion" in c) {
                if ("gte" in c.erosion) return p.erosion >= c.erosion.gte;
                if ("lte" in c.erosion) return p.erosion <= c.erosion.lte;
                return false;
            }
            if ("chapter" in c) return s.chapter >= (c.chapter.gte || 0);
            if ("credits" in c) return s.credits >= (c.credits.gte || 0);
            if ("quest" in c) {
                const q = s.quests[c.quest.id];
                if (!q) return false;
                if ("done" in c.quest && q.done !== c.quest.done) return false;
                if ("gte" in c.quest && q.stage < c.quest.gte) return false;
                if ("lte" in c.quest && q.stage > c.quest.lte) return false;
                return true;
            }
            return true;
        },

        /* ============================================================
           效果 DSL(回傳人類可讀訊息陣列,供 UI 浮層)
           { set:"a.b" [, val:x] }
           { item:"id", qty:±n }
           { credits:±n } { xp:+n } { erosion:±n } { hp:±n } { ep:±n }
           { affinity:"id", val:±n }
           { location:"id" } { chapter:n }
           { quest:"id", op:"start"|"advance"|"complete" }
           ============================================================ */
        apply(effects) {
            if (!effects) return [];
            const msgs = [];
            const s = State.data, p = s.player;
            const T = (SE.DATA.strings && SE.DATA.strings.fx) || {};
            const itemName = id => (SE.DATA.items && SE.DATA.items[id] && SE.DATA.items[id].name) || id;

            for (const e of effects) {
                if ("set" in e) { State.setFlag(e.set, e.val); continue; }
                if ("item" in e) {
                    const q = e.qty == null ? 1 : e.qty;
                    State.addItem(e.item, q);
                    msgs.push((q > 0 ? (T.gain || "獲得:") : (T.lose || "失去:")) + itemName(e.item) + (Math.abs(q) > 1 ? " ×" + Math.abs(q) : ""));
                    continue;
                }
                if ("credits" in e) {
                    s.credits = Math.max(0, s.credits + e.credits);
                    msgs.push((e.credits > 0 ? "+" : "") + e.credits + " " + (T.credits || "學分"));
                    continue;
                }
                if ("xp" in e) {
                    p.xp += e.xp;
                    msgs.push("+" + e.xp + " " + (T.xp || "經驗"));
                    while (p.xp >= State.xpNeed(p.level)) {
                        p.xp -= State.xpNeed(p.level);
                        p.level += 1;
                        p.attrPoints = (p.attrPoints || 0) + 1;
                        if (p.level % 2 === 0) p.skillPoints = (p.skillPoints || 0) + 1;
                        State.derive();
                        p.hp = p.hpMax; p.ep = p.epMax;
                        msgs.push((T.levelUp || "升級!Lv.") + p.level);
                    }
                    continue;
                }
                if ("party" in e) {
                    const def = SE.DATA.companions[e.party];
                    if (!s.companions[e.party]) s.companions[e.party] = { affinity: 0, hp: def.hpMax, ep: def.epMax };
                    if (s.party.indexOf(e.party) === -1) {
                        if (s.party.length < 2) {
                            s.party.push(e.party);
                            msgs.push((def ? def.name : e.party) + " " + (T.joined || "加入了小隊"));
                        } else {
                            msgs.push((def ? def.name : e.party) + " " + (T.joinedBench || "加入了船員(小隊已滿,可在「小隊」調度)"));
                        }
                    }
                    continue;
                }
                if ("allyCount" in e) {
                    // 結算第四章盟友數:達 2 個陣營即可對峙 VIGIL
                    let n = 0;
                    ["ally.fed", "ally.church", "ally.exile"].forEach(f => { if (State.getFlag(f)) n++; });
                    State.setFlag("ch4.ally_count", n);
                    if (n >= 2) State.setFlag("ch4.allies_ready", true);
                    continue;
                }
                if ("unlock" in e) {
                    if (s.unlocked.indexOf(e.unlock) === -1) {
                        s.unlocked.push(e.unlock);
                        const sys = SE.DATA.systems && SE.DATA.systems[e.unlock];
                        msgs.push((T.unlocked || "航道開通:") + (sys ? sys.name : e.unlock));
                    }
                    continue;
                }
                if ("erosion" in e) {
                    let amt = e.erosion;
                    if (amt > 0 && SE.Tech) amt = Math.max(0, amt - SE.Tech.bonus("erosion_guard"));
                    p.erosion = Math.max(0, Math.min(100, p.erosion + amt));
                    if (amt > 0) msgs.push((T.erosionUp || "侵蝕 +") + amt);
                    else if (amt < 0) msgs.push((T.erosionDown || "侵蝕 ") + amt);
                    continue;
                }
                if ("hp" in e) { p.hp = Math.max(0, Math.min(p.hpMax, p.hp + e.hp)); continue; }
                if ("ep" in e) { p.ep = Math.max(0, Math.min(p.epMax, p.ep + e.ep)); continue; }
                if ("affinity" in e) {
                    const rec = s.companions[e.affinity] || (s.companions[e.affinity] = { affinity: 0 });
                    rec.affinity += e.val;
                    msgs.push(e.affinity + " " + (T.affinity || "好感") + (e.val > 0 ? " +" : " ") + e.val);
                    continue;
                }
                if ("location" in e) { s.location = e.location; continue; }
                if ("chapter" in e) { s.chapter = e.chapter; continue; }
                if ("fuel" in e) {
                    s.ship.fuel = Math.max(0, Math.min(s.ship.fuelMax, s.ship.fuel + e.fuel));
                    continue;
                }
                if ("hull" in e) {
                    s.ship.hull = Math.max(0, Math.min(s.ship.hullMax, s.ship.hull + e.hull));
                    continue;
                }
                if ("system" in e) { s.ship.system = e.system; continue; }
                if ("refuel" in e) {
                    // 靠泊服務:免費修復船體至滿,並依學分補充燃料(每格 = e.refuel)
                    if (s.ship.hull < s.ship.hullMax) {
                        s.ship.hull = s.ship.hullMax;
                        msgs.push(T.repaired || "船體已修復");
                    }
                    const per = e.refuel || 10;
                    const want = s.ship.fuelMax - s.ship.fuel;
                    const can = Math.min(want, Math.floor(s.credits / per));
                    if (want <= 0) { msgs.push(T.fuelFull || "燃料已滿"); continue; }
                    if (can <= 0) { msgs.push(T.noCredits || "學分不足,無法加油"); continue; }
                    s.credits -= can * per;
                    s.ship.fuel += can;
                    msgs.push((T.refueled || "燃料 +") + can + "(−" + (can * per) + " " + (T.credits || "學分") + ")");
                    continue;
                }
                if ("repairHull" in e) {
                    s.ship.hull = s.ship.hullMax;
                    msgs.push(T.repaired || "船體已修復");
                    continue;
                }
                if ("quest" in e) {
                    const q = s.quests[e.quest] || (s.quests[e.quest] = { stage: 0, done: false });
                    if (e.op === "start") q.stage = Math.max(q.stage, 1);
                    else if (e.op === "advance") q.stage += 1;
                    else if (e.op === "complete") q.done = true;
                    continue;
                }
            }
            return msgs;
        }
    };

    SE.State = State;
})();
