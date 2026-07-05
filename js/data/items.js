/* ============================================================
   items.js — 核心道具:武器、消耗品、素材、關鍵道具(M1)
   武器欄位:dmg[min,max]、dtype(kin/en/psi)、attr(加成屬性)、
   range(melee/ranged)
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.items = D.items || {}, {
        /* ---- 武器 ---- */
        rifle_standard: { name: "制式突擊步槍", type: "weapon", dmg: [6, 10], dtype: "kin", attr: "AGI", range: "ranged", desc: "聯邦軍規逾期品,保養得宜的話依然可靠。" },
        pistol_em: { name: "電磁手槍", type: "weapon", dmg: [5, 8], dtype: "en", attr: "AGI", range: "ranged", desc: "對電路特別不友善的側臂,黑市改裝款。" },
        tuning_blade: { name: "調諧刃", type: "weapon", dmg: [5, 9], dtype: "psi", attr: "WIL", range: "melee", desc: "刃身以未知合金鑄成,揮動時發出只有你聽得見的音。" },
        pistol_service: { name: "聯邦制式手槍", type: "weapon", dmg: [5, 8], dtype: "kin", attr: "AGI", range: "ranged", desc: "凱菈的舊配槍,槍柄刻著「晨星號」。" },
        welding_arm: { name: "工程焊束", type: "weapon", dmg: [5, 8], dtype: "en", attr: "INT", range: "ranged", desc: "鉚釘的維修工具。「本體強調:這不是武器。」" },
        vessari_lance: { name: "維薩里長矛槍", type: "weapon", dmg: [6, 9], dtype: "psi", attr: "AGI", range: "ranged", desc: "塞恩的族傳武器,矛尖鑲著一小片會共鳴的鑰石殘屑。" },
        long_rifle: { name: "長程狙擊槍", type: "weapon", dmg: [7, 12], dtype: "kin", attr: "AGI", range: "ranged", desc: "達克斯的愛槍,槍身上刻著十七道賞金結算的刻痕。" },

        /* ---- 消耗品 ---- */
        stim_patch: { name: "急救貼片", type: "consumable", price: 25, combat: { heal: 20 }, desc: "戰地用凝膠貼片,恢復 20 點生命值。" },
        adrenal_boost: { name: "軍用刺激劑", type: "consumable", price: 60, combat: { heal: 35 }, desc: "黑市流出的軍規強心劑,恢復 35 點生命值。" },
        frag_grenade: { name: "破片手榴彈", type: "consumable", price: 45, combat: { dmg: [12, 18], dtype: "kin" }, desc: "對單一敵人造成 12–18 點動能傷害。" },

        /* ---- 素材 ---- */
        scrap_alloy: { name: "廢船合金", type: "material", price: 12, desc: "殘骸帶最常見的收穫,製造與交易的基本材料。" },
        data_core: { name: "資料核心", type: "material", price: 40, desc: "可用於科技研究的加密資料結晶。" },
        med_gel: { name: "醫療凝膠", type: "material", price: 18, desc: "製造急救用品的基礎原料。" },
        void_shard: { name: "淵痕碎屑", type: "material", price: 55, desc: "裂隙獸消散後殘留的物質,摸起來像冰,又像沒有溫度的火。" },

        /* ---- 關鍵道具 ---- */
        med_crate: { name: "蘿希的藥箱", type: "key", desc: "貼著醫療標誌的合金箱。收件人:七號泊架,卡爾。" },
        sealed_case: { name: "密封手提箱", type: "key", desc: "軍規密封箱,鎖著一段你還不明白的重量。收件人:曙光港,斷纜酒吧,賈維。" },
        weaver_fragment: { name: "織界者碎片", type: "key", desc: "溫熱的黑色晶體,內部有光在移動,像一句沒說完的話。" },
        echo_keycard: { name: "迴響號啟動鑰卡", type: "key", desc: "賈維交給你的舊式鑰卡,邊角磨得發亮。" }
    });
})();
