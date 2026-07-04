/* ============================================================
   demo.js — M0 示範場景〈曙光港的訊號〉
   目的:驗證引擎完成定義「選項 → 檢定 → 旗標 → 存讀檔」。
   覆蓋:純敘事、條件選項(職業/出身/旗標)、檢定成功/失敗
   分支、效果(旗標/道具/學分/侵蝕/經驗/任務)、引擎級動作。
   正式序章(×3 出身)於 M1 里程碑實作。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    D.start = "demo_01";

    /* ---------- 地點 ---------- */
    Object.assign(D.locations = D.locations || {}, {
        siren_dawnport: { name: "曙光港・碼頭區", sub: "賽壬星系・邊境殖民地" },
        siren_k77_depot: { name: "K-77 舊貨棧", sub: "賽壬星系・曙光港外圍" }
    });

    /* ---------- 道具 ---------- */
    Object.assign(D.items = D.items || {}, {
        weaver_fragment: { name: "織界者碎片", type: "key", desc: "溫熱的黑色晶體,內部有光在移動,像一句沒說完的話。" },
        data_core: { name: "資料核心", type: "material", desc: "可用於科技研究的加密資料結晶。" },
        stim_patch: { name: "急救貼片", type: "consumable", desc: "戰地用凝膠貼片,恢復少量生命值。" }
    });

    /* ---------- 任務 ---------- */
    Object.assign(D.quests = D.quests || {}, {
        demo_signal: {
            title: "碼頭盡頭的訊號",
            type: "main",
            stages: [
                { objective: "查明接收器捕捉到的異常訊號來源" },
                { objective: "潛入 K-77 舊貨棧" },
                { objective: "帶著發現安全脫身" }
            ]
        }
    });

    /* ---------- 敘事節點 ---------- */
    const CH = "示範場景〈曙光港的訊號〉";
    const nodes = {

        demo_01: {
            location: "siren_dawnport", chapterLabel: CH,
            onEnter: [{ quest: "demo_signal", op: "start" }, { set: "demo.started" }],
            text: "夜班的曙光港像一頭睡著的巨獸。起重機的骨架橫在星空下,焊接火花從船塢那頭一明一滅,空氣裡混著臭氧與冷卻劑的味道。\n\n你腰間那台拼裝接收器突然震了一下——不是走私頻道的雜訊,也不是港務局的廣播。這個訊號**很老**,老得不像這個時代的東西,卻精準地重複著同一段脈衝,像某種心跳。\n\n定位指向港區外圍:黑曜集團名下、據說早已清空的 **K-77 舊貨棧**。",
            choices: [
                { text: "循著訊號,直接走向 K-77 舊貨棧", goto: "demo_03" },
                { text: "先繞去「斷纜酒吧」,向老船長賈維打聽貨棧的底細", goto: "demo_02" }
            ]
        },

        demo_02: {
            location: "siren_dawnport", chapterLabel: CH,
            text: "斷纜酒吧的燈永遠壞一半。{賈維}窩在最裡面的卡座,聽完你的描述,渾濁的眼睛難得亮了一下。\n\n「K-77?」他壓低聲音,「三個月前黑曜的人半夜進駐,說是『清點資產』。清點到今天,燈還亮著。」他用指節敲了敲桌面,「後門的貨運閘是老式的洛克希德鎖,出廠密碼從來沒人改——**7-7-4-1**。別問我怎麼知道的。」\n\n他往你手裡塞了一片急救貼片:「拿著。半夜去黑曜的地盤,總得帶點保險。」",
            onEnter: [{ set: "demo.tip_javi" }, { item: "stim_patch", qty: 1 }],
            choices: [
                { text: "謝過賈維,動身前往 K-77 舊貨棧", goto: "demo_03" }
            ]
        },

        demo_03: {
            location: "siren_k77_depot", chapterLabel: CH,
            onEnter: [{ quest: "demo_signal", op: "advance" }],
            text: "K-77 舊貨棧蹲在港區照明的死角裡。鐵皮外牆鏽出大片暗紅,但門口那組**黑曜集團的電子鎖**嶄新得刺眼——「清空」的倉庫不會裝新鎖。\n\n接收器的脈衝在這裡強得發燙。訊號源就在裡面。",
            choices: [
                {
                    text: "駭入電子鎖,讓它以為你是巡檢員",
                    show: { class: "hacker" },
                    check: { attr: "INT", skill: "hacking", dc: 12, success: "demo_04a", fail: "demo_04b" }
                },
                {
                    text: "輸入賈維給的出廠密碼:7-7-4-1",
                    show: { flag: "demo.tip_javi" }, tag: "賈維的情報",
                    goto: "demo_04a",
                    effects: [{ set: "demo.used_code" }]
                },
                {
                    text: "攀上外牆,從屋頂的通風管潛入",
                    check: { attr: "AGI", dc: 12, success: "demo_04a", fail: "demo_04b" }
                },
                {
                    text: "用撬棍硬撬側門——快,但不會安靜",
                    check: { attr: "STR", dc: 14, success: "demo_04c", fail: "demo_04b" }
                }
            ]
        },

        demo_04a: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "門鎖無聲地滑開。你閃進倉庫,黑暗裡只有貨架的輪廓與遠處一盞孤零零的工作燈。\n\n燈下擺著一組**打開到一半的檢測儀器**——黑曜的人走得很急,急到連加密資料核心都忘在讀取槽裡。你順手收進口袋。",
            onEnter: [{ item: "data_core", qty: 1 }, { set: "demo.quiet_entry" }],
            choices: [
                { text: "朝訊號最強的深處走去", goto: "demo_05" }
            ]
        },

        demo_04b: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "刺耳的警報撕裂夜色——一架黑曜的**哨戒無人機**從貨架頂端俯衝下來,探照燈釘住你的影子。\n\n你在貨箱間翻滾閃避,雷射灼過肩頭,燒焦的布料味嗆進鼻腔。連滾帶爬衝進倉庫深處後,警報聲糊成一片背景——它暫時跟丟了,但這裡的每一秒都在倒數。",
            onEnter: [{ hp: -8 }, { set: "demo.alarm_raised" }],
            choices: [
                { text: "忍著肩上的灼痛,朝訊號源逼近", goto: "demo_05" }
            ]
        },

        demo_04c: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "側門在你的撬棍下呻吟著讓步,金屬扭曲聲在夜裡傳得很遠。你屏住呼吸數了十秒——沒有警報。看來黑曜的預算沒花在這扇門上。\n\n倉庫深處,一盞工作燈孤零零亮著,照著一組打開到一半的檢測儀器。",
            onEnter: [{ item: "data_core", qty: 1 }, { set: "demo.loud_entry" }],
            choices: [
                { text: "朝訊號最強的深處走去", goto: "demo_05" }
            ]
        },

        demo_05: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "貨棧最深處,一只軍規保存箱被單獨供在檢測架上,周圍環繞著量測探頭——黑曜在**研究**它。\n\n箱裡是一枚拳頭大的黑色晶體。你湊近的瞬間,它亮了:一縷幽藍的光在晶體內部游動,接收器的脈衝與它完全同步。\n\n然後你聽見了。不是聲音——是**直接出現在你腦海裡的低語**,像有人隔著四十萬年的距離,用你不認識的語言呼喚你。",
            choices: [
                {
                    text: "閉上眼,讓低語流進來——你想聽懂它",
                    goto: "demo_06_listen",
                    effects: [{ erosion: 8 }, { set: "demo.listened" }]
                },
                {
                    text: "咬住舌尖斬斷幻聽,迅速把晶體包進屏蔽布",
                    goto: "demo_06_resist"
                }
            ]
        },

        demo_06_listen: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "低語湧進來的剎那,你看見了不屬於你的畫面:**一張橫跨星海的巨大琴弦之網**,某處斷了一根,斷口正在滲出黑暗。\n\n一個念頭清晰得像烙印:「**弦斷之處,它在聽。**」\n\n你踉蹌著回神,鼻腔裡有血的鐵鏽味。晶體安靜下來,溫順地躺進你掌心——它認得你了。這不知道是恩賜,還是標記。",
            onEnter: [{ item: "weaver_fragment", qty: 1 }],
            choices: [
                { text: "帶著碎片離開這裡", goto: "demo_07" }
            ]
        },

        demo_06_resist: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "你用疼痛把自己錨在現實裡。低語像退潮般散去,只留下太陽穴突突的鈍痛。\n\n晶體的光黯了下去,彷彿有些失望。你不去想這個「彷彿」意味著什麼,俐落地用屏蔽布裹住它塞進背包——**有些門,現在還不是打開的時候。**",
            onEnter: [{ item: "weaver_fragment", qty: 1 }, { set: "demo.resisted" }],
            choices: [
                { text: "帶著碎片離開這裡", goto: "demo_07" }
            ]
        },

        demo_07: {
            location: "siren_k77_depot", chapterLabel: CH,
            text: "你退到貨棧出口,外頭傳來氣墊車的低鳴——**黑曜的巡邏隊回來了**,兩道人影正朝這邊走,對講機的雜訊越來越近。",
            choices: [
                {
                    text: "貼著陰影繞開探照範圍,無聲離開",
                    check: { attr: "AGI", dc: 10, success: "demo_08_sneak", fail: "demo_08_caught" }
                },
                {
                    text: "整整衣領迎面走出去,抱怨港務局又派錯巡檢單",
                    check: { attr: "CHA", dc: 12, success: "demo_08_bluff", fail: "demo_08_caught" }
                }
            ]
        },

        demo_08_sneak: {
            location: "siren_dawnport", chapterLabel: CH,
            text: "你比夜色更安靜。巡邏隊踩著你三秒前的影子走過去,對講機裡還在抱怨加班。等他們轉過貨架,你已經站在港區的燈火裡,像什麼都沒發生過。\n\n口袋裡,碎片隔著屏蔽布**輕輕搏動**,和你的心跳漸漸同步。",
            choices: [{ text: "回到碼頭", goto: "demo_09" }]
        },

        demo_08_bluff: {
            location: "siren_dawnport", chapterLabel: CH,
            text: "「港務局第三班,巡檢單又他媽派錯區了。」你把煩躁演得渾然天成,還順手把資料核心的空盒拍在對方胸口。\n\n兩個黑曜警衛對看一眼,居然向你**道了歉**。你哼著跑調的小曲走出他們的視線,直到轉角才容許自己出汗。",
            choices: [{ text: "回到碼頭", goto: "demo_09" }]
        },

        demo_08_caught: {
            location: "siren_dawnport", chapterLabel: CH,
            text: "「站住!」探照燈掃到你的瞬間,你選擇了最古老的方案——**跑**。\n\n電擊彈擦著耳邊炸出火花,你跳下裝卸平台、滾過輸送帶、從兩只貨櫃的縫隙裡擠出去,最後跌進碼頭區熟悉的霓虹裡。肋骨在抗議,但追兵的腳步聲留在了身後。",
            onEnter: [{ hp: -6 }],
            choices: [{ text: "揉著肋骨走回碼頭", goto: "demo_09" }]
        },

        demo_09: {
            location: "siren_dawnport", chapterLabel: CH,
            onEnter: [
                { quest: "demo_signal", op: "complete" },
                { xp: 50 }, { credits: 80 },
                { set: "demo.finished" }
            ],
            text: "回到碼頭時,天邊已經泛起賽壬星淡紫色的黎明。\n\n你攤開掌心。織界者碎片安靜地躺著,幽藍的光紋緩慢明滅——四十萬年前的訊號,選在今夜、選中了你。黑曜集團在研究它,老船長知道的比說出口的多,而那句低語還烙在你腦海深處:\n\n「**弦斷之處,它在聽。**」\n\n這只是開始。曙光港之外,整個幽弦星區正等著你——",
            choices: [
                { text: "【示範結束】完整序章(三種出身)將於 M1 里程碑推出", goto: "demo_10" }
            ]
        },

        demo_10: {
            location: "siren_dawnport", chapterLabel: CH,
            text: "感謝遊玩《星淵迴響》M0 引擎示範。\n\n本段示範驗證了:敘事節點與打字機、條件式選項(職業/情報旗標)、透明檢定(成功/失敗分支)、效果系統(道具/學分/侵蝕/任務)、自動存檔與多槽存讀檔。\n\n接下來的 M1 里程碑:角色創建(3 出身 × 3 職業)、三段專屬序章、回合制小隊戰鬥。",
            choices: [
                { text: "重新體驗示範場景", action: "newGame" },
                { text: "回到主選單", action: "mainMenu" }
            ]
        }
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
