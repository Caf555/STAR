/* ============================================================
   companion_quests.js — 六名夥伴的個人任務(好感達「信任」以上,
   於小隊面板點擊「💬 交談」觸發,一次對話內完結)。
   觸發與完成判定見 js/engine/ui.js 的 UI.pqEligible()。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.items = D.items || {}, {
        kaila_badge: { name: "晨星號徽章", type: "key", desc: "凱菈舊艦的船徽,邊緣還留著一道燒痕。她把它別回了衣領上。" },
        rivet_memory: { name: "維護日誌殘片", type: "key", desc: "鉚釘四百年前的私人記憶片段,織界者文字寫著一個不知名的名字。" },
        thane_crest: { name: "維薩里家族徽記", type: "key", desc: "塞恩母親回信附上的家族徽記,銀色紋路刻著歸巢調的第一個音。" }
    });

    const CH = "個人任務";
    const nodes = {};

    /* ============================================================
       凱菈・沃斯 ——「晨星號的黑盒子」
       ============================================================ */
    nodes.pq_kaila_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "你在貨艙找到{凱菈}時,她正盯著一枚巴掌大的殘骸碎片發呆——邊角燒得焦黑,卻還連著一絲微弱的電力訊號。\n\n「歐蕾的人在霧海撈殘骸時撿到的。」她的聲音很輕,「晨星號的飛行記錄器。黑盒子。」她抬頭看你,眼神裡混著渴望與恐懼,「我想聽,又不敢一個人聽。」",
        choices: [
            { text: "「我陪妳一起聽。」", goto: "pq_kaila_02" },
            { text: "「妳確定要現在打開它嗎?」", goto: "pq_kaila_02" }
        ]
    };
    nodes.pq_kaila_02 = {
        location: "echo_ship", chapterLabel: CH,
        text: "她的手指懸在播放鍵上很久,才終於按下去。\n\n雜訊之後,是晨星號最後三分鐘的艦橋錄音——警報聲、船員的喊叫、還有凱菈自己當年的聲音,冷靜得不像在赴死:「**全員撤離,我殿後。**」最後一段,是一個你聽不出名字的舵手,對著通訊器說:「**艦長,黑曜的攔截碼……跟聯邦的一模一樣。這不是意外——**」錄音在爆炸聲中斷了。",
        choices: [
            { text: "穩住她的肩膀,讓她把情緒哭出來", check: { attr: "WIL", dc: 10, success: "pq_kaila_03a", fail: "pq_kaila_03b" } },
            { text: "「這證實了卡爾榭的罪。這不是白白犧牲。」", goto: "pq_kaila_03a" }
        ]
    };
    nodes.pq_kaila_03a = {
        location: "echo_ship", chapterLabel: CH,
        text: "凱菈靠著你的肩膀,終於讓自己哭了一場——不是崩潰,是遲來十年的告別。\n\n「謝謝你陪我聽完。」她抹掉眼淚,把黑盒子小心收好,又從口袋裡摸出一枚燒過的船徽別回衣領上,「晨星號的每一個人,現在都有了一個能說出口的真相。這就夠了。」",
        choices: [{ text: "「他們不會被忘記。」", goto: "pq_kaila_04" }]
    };
    nodes.pq_kaila_03b = {
        location: "echo_ship", chapterLabel: CH,
        text: "凱菈別開臉,把情緒重新鎖回去——多年的軍人習慣,不是那麼容易放下。「我沒事。」她的聲音有點啞,但很堅定,「我只是……需要知道真相。現在我知道了。」\n\n她把燒過的船徽別回衣領,動作乾淨俐落,像結束一場任務簡報。",
        choices: [{ text: "「妳不用一個人扛著。」", goto: "pq_kaila_04" }]
    };
    nodes.pq_kaila_04 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.kaila_done" }, { affinity: "kaila", val: 2 }, { item: "kaila_badge", qty: 1 }, { xp: 40 }],
        text: "「晨星號沉了十年,」凱菈望向舷窗外的星海,「但今天之後,我覺得她終於可以真正安息了。」\n\n她轉頭看你,眼神比以往任何時候都更篤定:「謝謝你——不只是陪我聽完,是這一路,讓我有機會把真相找出來。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    /* ============================================================
       鉚釘 RIVET ——「四百年前的維護日誌」
       ============================================================ */
    nodes.pq_rivet_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "{鉚釘}站在貨艙角落,鏡頭光環閃爍著一種你從沒見過的頻率——不規則,像在猶豫。\n\n「**持有者。本體在自我診斷時,發現一段被覆寫過的記憶區塊。標記為『個人』。四百年來,本體從未嘗試讀取它——本體……害怕裡面是空的。**」它罕見地停頓,「**你願意陪本體嘗試一次嗎?**」",
        choices: [
            { text: "「我在。試試看吧。」", goto: "pq_rivet_02" }
        ]
    };
    nodes.pq_rivet_02 = {
        location: "echo_ship", chapterLabel: CH,
        text: "鉚釘的鏡頭暗了一瞬,像人類閉眼回憶。\n\n「**……找到了。一段對話記錄。對象:『悉恩』,織界紀元的維護技師,本體當年的……夥伴。**」它播放出一小段破碎的織界者語音,語調帶著明顯的、跨越四十萬年依然聽得出的溫暖,「**祂常說,本體『太認真』,需要學會『浪費時間』。本體不明白這句話的意思。四百年後的現在……本體好像,懂了一點。**」",
        choices: [
            { text: "「那是朋友之間的玩笑話。」", check: { attr: "WIL", dc: 10, success: "pq_rivet_03a", fail: "pq_rivet_03b" } },
            { text: "「悉恩,聽起來是個好朋友。」", goto: "pq_rivet_03a" }
        ]
    };
    nodes.pq_rivet_03a = {
        location: "echo_ship", chapterLabel: CH,
        text: "「**玩笑話。**」鉚釘重複這個詞,像在資料庫裡新建一個條目,「**本體……記得了。謝謝你,持有者。本體本來以為,四百年的孤獨會讓那段記憶失去意義。它沒有。**」\n\n它將那段記憶自行封存成一枚可攜式的記憶殘片,鄭重地遞給你,「**本體想讓你保管它。你比本體,更懂得如何『不弄丟』重要的東西。**」",
        choices: [{ text: "接下記憶殘片", goto: "pq_rivet_04" }]
    };
    nodes.pq_rivet_03b = {
        location: "echo_ship", chapterLabel: CH,
        text: "鉚釘沉默了幾秒,鏡頭光環轉為一種近似困惑的閃爍。「**本體無法完全解析『浪費時間』的效益函數。但本體選擇……相信悉恩的判斷。祂從未在維護紀錄上說錯過話。**」\n\n它將那段記憶封存成一枚記憶殘片,遞給你保管——即使不完全理解,它仍然珍視著。",
        choices: [{ text: "接下記憶殘片", goto: "pq_rivet_04" }]
    };
    nodes.pq_rivet_04 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.rivet_done" }, { affinity: "rivet", val: 2 }, { item: "rivet_memory", qty: 1 }, { xp: 40 }],
        text: "「**四百年的維護日誌裡,本體第一次記錄了一件與『職能』無關的事。**」鉚釘的鏡頭光環穩定地亮著,一種你漸漸讀懂的、屬於它的平靜,「**本體想,這就是『擁有過去』的感覺。謝謝你,把它還給本體。**」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    /* ============================================================
       塞恩 ——「給母親的信」
       ============================================================ */
    nodes.pq_thane_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "{塞恩}坐在他那堆手繪航圖中間,手裡拿著一小片錄音水晶,遲遲沒有按下錄製鍵。\n\n「族人已經不再叫我叛徒了,」他苦笑,「但我還沒有勇氣,單獨錄一段話給我母親。族群和解是一回事——**兒子對母親說話**,是另一回事。」他把水晶遞給你,「幫我聽聽,這樣說會不會太蠢?」",
        choices: [
            { text: "「說吧,我聽著。」", goto: "pq_thane_02" }
        ]
    };
    nodes.pq_thane_02 = {
        location: "echo_ship", chapterLabel: CH,
        text: "塞恩清了清嗓子,錄下一段斷斷續續的話——道歉、解釋、和一句反覆修改的「我很好,別擔心」。錄完後他盯著你,顯然很沒把握。\n\n「……太生硬了對吧。」",
        choices: [
            { text: "「加一句『我想妳』——她要的是這個。」", tag: "洞察", check: { attr: "CHA", dc: 11, success: "pq_thane_03a", fail: "pq_thane_03b" } },
            { text: "「這樣就很好了,寄出去吧。」", goto: "pq_thane_03b" }
        ]
    };
    nodes.pq_thane_03a = {
        location: "echo_ship", chapterLabel: CH,
        text: "塞恩愣了一下,又重錄了一次,在結尾笨拙地加上那句話。他把水晶封裝好,透過船團的中繼頻道送了出去。\n\n訊號來回不過一天。回信裡,是他母親的聲音,帶著哭腔的笑:「**傻孩子,說這些做什麼——回家就好。**」",
        choices: [{ text: "陪塞恩聽完回信", goto: "pq_thane_04" }]
    };
    nodes.pq_thane_03b = {
        location: "echo_ship", chapterLabel: CH,
        text: "塞恩把水晶封裝好,透過船團的中繼頻道送了出去,忐忑地等待。\n\n訊號來回不過一天。回信裡,是他母親的聲音,平靜卻藏不住顫抖:「**四年了。我以為再也聽不到你的聲音。歡迎……歡迎你,隨時回家。**」",
        choices: [{ text: "陪塞恩聽完回信", goto: "pq_thane_04" }]
    };
    nodes.pq_thane_04 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.thane_done" }, { affinity: "thane", val: 2 }, { item: "thane_crest", qty: 1 }, { xp: 40 }],
        text: "塞恩聽完回信,久久說不出話,最後只是用力抹了把臉。隨信附上一枚家族徽記——銀色紋路刻著歸巢調的第一個音,是維薩里母親對遠行孩子的傳統餽贈。\n\n「謝謝你,」他把徽記塞進你手裡,「這一路上,是你先聽懂了我沒說出口的話。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    /* ============================================================
       伊蓮娜・魁 ——「留在深井的人」
       ============================================================ */
    nodes.pq_elena_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "{伊蓮娜}對著加密終端坐了整晚,螢幕上是一張深井計畫的舊員工名單。她的手指停在一個名字上——**諾亞**。\n\n「他是幫我把第一批警告偷渡出去的人,」她的聲音緊繃,「代價是他自己被列為『不可靠人員』,調去更深的隔離區。我一直不敢查他的下落——現在,我不能再不敢了。」",
        choices: [
            { text: "「我們想辦法傳個訊息給他。」", goto: "pq_elena_02" }
        ]
    };
    nodes.pq_elena_02 = {
        location: "echo_ship", chapterLabel: CH,
        text: "「深井的內部通訊全被監控,」伊蓮娜咬著唇,「唯一的辦法,是利用舊維護頻道埋一段加密訊號——如果他還在,而且還記得我們的暗號,他會聽懂。如果查得太用力,反而會害死他。」",
        choices: [
            { text: "親自操刀,精準埋入訊號、降低被抓包風險", show: { class: "hacker" }, tag: "系統駭客", check: { attr: "INT", skill: "hacking", dc: 14, success: "pq_elena_03a", fail: "pq_elena_03b" } },
            { text: "讓伊蓮娜主導,你在旁協助降低風險", check: { attr: "INT", dc: 15, success: "pq_elena_03a", fail: "pq_elena_03b" } }
        ]
    };
    nodes.pq_elena_03a = {
        location: "echo_ship", chapterLabel: CH,
        text: "訊號乾淨地埋了進去,沒有觸發任何警報。兩天後,一段同樣加密的回訊悄悄傳回——只有短短一句舊暗號翻譯過來的話:\n\n「**種子已經發芽。別為我回頭。——諾亞**」\n\n伊蓮娜盯著那句話看了很久,眼眶泛紅,卻也鬆了一口氣:「他還活著。他還在做對的事。這樣就夠了。」",
        choices: [{ text: "陪她靜靜坐一會兒", goto: "pq_elena_04" }]
    };
    nodes.pq_elena_03b = {
        location: "echo_ship", chapterLabel: CH,
        text: "訊號傳出去的方式不夠乾淨,觸發了深井內部一次小規模的安檢——所幸沒有查到源頭,但也沒有等到任何回音。\n\n伊蓮娜盯著沉默的螢幕,最終只是輕輕嘆氣:「……至少,我試過了。如果他還活著,他會知道有人沒有忘記他。」",
        choices: [{ text: "陪她靜靜坐一會兒", goto: "pq_elena_04" }]
    };
    nodes.pq_elena_04 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.elena_done" }, { affinity: "elena", val: 2 }, { xp: 40 }],
        text: "「深井裡還有很多個諾亞,」伊蓮娜終於開口,聲音卻不再只是愧疚,「但我現在知道——我離開,不是拋棄他們。我是去把能揭發這一切的人,活著帶出來。」\n\n她看向你:「謝謝你陪我查完這件事。這是我這一路,第一次不覺得自己是懦夫。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    /* ============================================================
       「野犬」達克斯 ——「第十八道刻痕」
       ============================================================ */
    nodes.pq_dax_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "{達克斯}擦槍擦到一半停了手,獨眼盯著槍身上那十七道刻痕出神。\n\n「收到一條老消息,」他終於開口,「當年鐵冠礦坑的工頭——就是把我賣給黑曜當礦工的那個——聽說在霧海邊緣的難民船上,躲得很慘。」他的手指懸在刻刀上方,「我可以去補上第十八道刻痕。輕輕鬆鬆。」",
        choices: [
            { text: "「你真的想這麼做嗎?」", goto: "pq_dax_02" },
            { text: "「他都淪落成難民了,你還想動手?」", goto: "pq_dax_02" }
        ]
    };
    nodes.pq_dax_02 = {
        location: "echo_ship", chapterLabel: CH,
        text: "達克斯沉默了很久,獨眼裡的算計漸漸褪成別的東西。「說實話——我不知道。這十七道刻痕裡,沒有一個是我後悔的。但那傢伙……只是個被黑曜逼著幹活的可憐蟲,跟我當年一樣。」\n\n「你怎麼看?」他把選擇權遞給你。",
        choices: [
            { text: "「放過他。你不是黑曜,別變成他們的樣子。」", tag: "說服", check: { attr: "CHA", dc: 11, success: "pq_dax_03a", fail: "pq_dax_03c" } },
            { text: "「這是你的帳,我不替你決定。」", goto: "pq_dax_03b" }
        ]
    };
    nodes.pq_dax_03a = {
        location: "echo_ship", chapterLabel: CH,
        text: "達克斯盯著你看了幾秒,忽然笑了,是他難得不帶算計的笑:「……行。就這一次,聽你的。」\n\n他把刻刀收回去,長槍上的十七道刻痕,終究沒有變成十八道。「算是我欠鐵冠那些死鬼的一點利息吧。」",
        choices: [{ text: "「這才是真正的了結。」", goto: "pq_dax_04" }]
    };
    nodes.pq_dax_03b = {
        location: "echo_ship", chapterLabel: CH,
        text: "達克斯最終自己做了決定——他去了一趟那艘難民船,卻只是遠遠看了那工頭一眼:一個瘦得脫形、抱著孩子發抖的男人,再也不是記憶裡耀武揚威的礦頭。\n\n他一言不發地回了船,把刻刀收進工具箱最底層,再沒提起這件事。",
        choices: [{ text: "「你做了對的選擇。」", goto: "pq_dax_04" }]
    };
    nodes.pq_dax_03c = {
        location: "echo_ship", chapterLabel: CH,
        text: "達克斯搖搖頭:「這不是誰能勸得動的事,狙擊手。」他還是去了一趟——但回來時,長槍上依然只有十七道刻痕。\n\n「他現在的樣子,比我親手了結他還慘,」他哼了一聲,語氣裡卻沒有得意,「這帳,我就當還清了。」",
        choices: [{ text: "「至少,你沒讓自己後悔。」", goto: "pq_dax_04" }]
    };
    nodes.pq_dax_04 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.dax_done" }, { affinity: "dax", val: 2 }, { xp: 40 }],
        text: "達克斯把長槍重新扛上肩,獨眼裡少了一分算計,多了一分他自己都沒察覺的輕鬆。\n\n「十七道刻痕,」他說,「夠了。剩下的仇,我留給黑曜自己去背——反正他們欠的,遠比我這桿槍能討的多。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    /* ============================================================
       回聲 ——「一個問題」
       ============================================================ */
    nodes.pq_echo_01 = {
        location: "echo_ship", chapterLabel: CH,
        text: "{回聲}飄到你面前,那張還沒完全學會表情的臉上,是一種罕見的、認真的專注。\n\n「我想問一個問題,」它說,「一個我在裂縫裡看了很久、卻怎麼也不懂的問題——**你們明明知道,喜歡的人終究會死,為什麼還要喜歡?** 那不是很浪費嗎?你們的『划算』,跟我算的不一樣。」",
        choices: [
            { text: "「正因為會失去,喜歡才有重量。」", goto: "pq_echo_02a" },
            { text: "「不是划算的事。是心甘情願的事。」", goto: "pq_echo_02b" }
        ]
    };
    nodes.pq_echo_02a = {
        location: "echo_ship", chapterLabel: CH,
        text: "回聲沉默了很久,那雙還沒定形的眼睛裡,某種東西在緩慢地運算、崩解、又重新組裝。「……重量。」它重複這個詞,「噬淵沒有重量的概念。它只有『多』與『少』。你是說,**短暫**本身就是一種價值?」\n\n「這個想法,」它輕聲說,「很不划算,但很美。」",
        choices: [{ text: "「妳說『美』了。」", goto: "pq_echo_03" }]
    };
    nodes.pq_echo_02b = {
        location: "echo_ship", chapterLabel: CH,
        text: "「心甘情願,」回聲慢慢咀嚼這四個字,「不是被迫,不是計算後的最優解——是**選擇**。」它抬起頭,「我好像,第一次沒有把這件事,套進『划算』或『不划算』的框架裡。」\n\n它的輪廓罕見地穩定了幾秒,像是找到了某種平衡。",
        choices: [{ text: "「這就是妳學會的東西。」", goto: "pq_echo_03" }]
    };
    nodes.pq_echo_03 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ set: "pq.echo_done" }, { affinity: "echo", val: 2 }, { xp: 40 }],
        text: "回聲久久看著自己的手——那雙還在學習如何維持形狀的手——然後做了一件從未做過的事:它試著,笨拙地,對你露出一個微笑。\n\n「謝謝你回答我。」它說,「噬淵教我『吞噬』。你們教我『喜歡』。我還不確定自己算是哪一邊——但至少現在,我知道自己**想**選哪一邊了。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
