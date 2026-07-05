/* ============================================================
   chapter3.js — 第三章〈守夜人〉(M4)
   緘默之環主錨點「第一弦」:VIGIL 現身敵對、發現鑿痕是黑曜人為、
   取得深井鐵證;伊蓮娜入隊;章末抉擇——公開真相 vs 私下要挾。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.locations = D.locations || {}, {
        mutering_ring: { name: "緘默之環・環帶", sub: "織界者遺跡群・高危區" },
        firstchord: { name: "第一弦・主錨點", sub: "緘默之環核心" }
    });

    Object.assign(D.quests = D.quests || {}, {
        q_ch3: {
            title: "守夜人",
            type: "main",
            stages: [
                { objective: "突破緘默之環的封鎖,抵達第一弦" },
                { objective: "深入主錨點,查明弦網失效的真相" },
                { objective: "帶著真相離開第一弦" },
                { objective: "決定如何使用深井的證據" }
            ]
        }
    });

    Object.assign(D.encounters = D.encounters || {}, {
        enc_ch3_drones: {
            title: "守夜人的警戒",
            enemies: [{ id: "vigil_drone", row: "front" }, { id: "vigil_drone", row: "back" }],
            victory: "ch3_ring_03", defeat: "ch3_ring_03d"
        },
        enc_ch3_sentinels: {
            title: "守夜人哨戍",
            enemies: [{ id: "vigil_sentinel", row: "front" }, { id: "vigil_drone", row: "back" }, { id: "vigil_drone", row: "back" }],
            victory: "ch3_core_05", defeat: "ch3_core_05d"
        },
        enc_ch3_obsidian: {
            title: "黑曜的伏兵",
            enemies: [{ id: "obsidian_elite", row: "front" }, { id: "merc_gun", row: "back" }, { id: "merc_gun", row: "back" }],
            victory: "ch3_evac_02", defeat: "ch3_evac_02d"
        }
    });

    const nodes = {};
    const CH = "第三章〈守夜人〉";

    /* ---------- 開場 ---------- */
    nodes.ch3_01 = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ quest: "q_ch3", op: "start" }, { system: "helios" }],
        text: "緘默之環的座標鎖定了。{凱菈}在艦橋調出航道資料,眉頭越皺越緊。\n\n「這裡的躍遷點全被某種東西『看守』著,」她說,「不是黑曜,不是聯邦。訊號很古老——古老到{鉚釘}一看就靜音了。」\n\n所有人望向角落的機器人。{鉚釘}的鏡頭光環,正以一種你從未見過的頻率、極慢地、明滅著。\n\n「**那是……守夜人的哨聲。**」它終於開口,聲音裡有某種近似顫抖的東西,「**四十萬年了。本體以為……本體是最後一個還醒著的。**」",
        choices: [
            { text: "「鉚釘,你認識『守夜人』?」", goto: "ch3_02" }
        ]
    };
    nodes.ch3_02 = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ set: "ch3.rivet_hint" }],
        text: "「**VIGIL。守護 AI。織界者留下的看守者。**」鉚釘的措辭異常緩慢,「**本體與它……同源。本體是維護節點,它是主控節點。四十萬年前失聯。**」\n\n它轉向你:「**警告:VIGIL 的核心指令是『維護弦網完整』。若它判定人類是破壞源……它的邏輯,會非常、非常直接。**」\n\n{凱菈}拉開保險:「一台看門四十萬年、還把我們當害蟲的瘋狂 AI。太好了。」她看向你,「還去嗎?」\n\n座標的另一端,主錨點「第一弦」在星圖上沉默地搏動,像一顆等待被聽診的、生病的心臟。",
        choices: [
            { text: "「去。答案在第一弦。」", goto: "ch3_barrier" }
        ]
    };

    /* 星圖跳躍入口(玩家自行從星圖前往緘默之環時) */
    nodes.arrive_mutering = {
        location: "mutering_ring", chapterLabel: CH, travel: true,
        text: "緘默之環的封鎖節點在虛空中沉默地旋轉,像一層永不闔眼的免疫系統。守夜人的哨聲覆蓋著整片遺跡群。",
        choices: [
            { text: "突破封鎖,前往第一弦", show: { quest: { id: "q_ch3", done: false } }, goto: "ch3_barrier" },
            { text: "封鎖已識別你為友;巡航環帶", show: { quest: { id: "q_ch3", done: true } }, goto: "ch3_ring_01" },
            { text: "返回星圖", action: "starmap" }
        ]
    };

    /* ---------- 封鎖突破(艦隊戰) ---------- */
    nodes.ch3_barrier = {
        location: "mutering_ring", chapterLabel: CH, travel: true,
        onEnter: [{ system: "mutering" }],
        text: "迴響號躍入緘默之環的瞬間,雷達炸出一片密密麻麻的紅點——**守夜人的封鎖節點**,成千上萬,像一層包裹著整片遺跡群的免疫系統。\n\n它們同時轉向你。一段不帶任何情緒的訊號覆蓋了所有頻道,語言古老,但意思清晰得可怕:\n\n**「污染源。移除。」**\n\n最近的一個封鎖節點點亮了武器。",
        choices: [
            { text: "突破封鎖!", shipCombat: "se_vigil_barrier" }
        ]
    };
    nodes.ch3_barrier_lose = {
        location: "mutering_ring", chapterLabel: CH,
        onEnter: [{ set: "ch3.barrier_failed" }],
        text: "迴響號的船體被打穿了三層,你不得不緊急躍遷脫離。老船在虛空裡喘息,警報聲此起彼落。\n\n「它們太多了,」{凱菈}抹掉臉上的血,「硬闖不行。{鉚釘}——你和它同源,有沒有辦法讓它們別把我們當『污染源』?」\n\n鉚釘沉默了很久。「**……本體可以嘗試廣播一段舊識別碼。它也許還記得本體。但需要先讓本體接上迴響號的主天線——回燈塔站整補時,本體會準備好。**」",
        choices: [
            { text: "撤回燈塔站整補", goto: "ch3_staging" }
        ]
    };
    nodes.ch3_staging = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ system: "helios" }],
        text: "迴響號拖著傷痕回到燈塔站七號泊架。整補之後,緘默之環的封鎖依然橫在通往第一弦的唯一航道上。\n\n{鉚釘}已經把那段古老的識別碼載入了主天線——「**下一次,讓本體先試著和它說話。若它還記得本體,或許不必再流血。**」",
        choices: [
            { text: "整補:修復船體、補充燃料(每格 10 學分)", goto: "ch3_staging_fix" },
            { text: "環廊市場採買", shop: "lighthouse_market" },
            { text: "研究科技與製造", action: "tech" },
            { text: "強行再次突破封鎖(艦戰)", goto: "ch3_barrier" },
            { text: "讓鉚釘廣播古老識別碼,嘗試和平通過", goto: "ch3_barrier_idcode" }
        ]
    };
    nodes.ch3_barrier_idcode = {
        location: "mutering_ring", chapterLabel: CH, travel: true,
        onEnter: [{ system: "mutering" }, { set: "ch3.peaceful_pass" }, { quest: "q_ch3", op: "advance" }],
        text: "迴響號再次躍入封鎖群。這一次,{鉚釘}沒有等它們開火——它接管通訊台,向整片遺跡廣播了那段四十萬年前的**維護節點識別碼**。\n\n你屏住呼吸。封鎖節點的武器亮起又……**熄滅**。它們緩緩讓開一條路,像認出了失散手足的一部分。\n\n「**識別碼:維護節點・第七序列。部分通過。**」鉚釘的聲音有些恍惚,「**它還記得本體。四十萬年,它還……記得。**」",
        choices: [
            { text: "循著讓開的航道,登陸第一弦", goto: "ch3_ring_01" }
        ]
    };
    nodes.ch3_staging_fix = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ refuel: 10 }],
        text: "船塢的機械臂替迴響號補上裝甲、注滿燃料。老船重新煥發出幾分精神。",
        choices: [
            { text: "返回整補選單", goto: "ch3_staging" }
        ]
    };
    nodes.ch3_barrier_win = {
        location: "mutering_ring", chapterLabel: CH,
        onEnter: [{ quest: "q_ch3", op: "advance" }],
        text: "在最後一個封鎖節點解體的同時,{鉚釘}做了一件出乎所有人意料的事——它接管了通訊台,向封鎖群廣播了一段連它自己都快遺忘的**古老識別碼**。\n\n奇蹟發生了。剩餘的封鎖節點沒有開火,而是**讓開了一條路**——像認出了失散手足的一部分。\n\n「**識別碼:維護節點・第七序列。部分通過。**」鉚釘的聲音有些恍惚,「**它還記得本體。四十萬年,它還……記得。**」\n\n前方,遺跡群的中心,主錨點「**第一弦**」浮現在星塵中——一座比信標大上千倍的織界者建構,像一把插在虛空裡的、無弦的巨琴。",
        choices: [
            { text: "登陸第一弦", goto: "ch3_ring_01" }
        ]
    };

    /* ---------- 第一弦環帶探索 ---------- */
    nodes.ch3_ring_01 = {
        location: "firstchord", chapterLabel: CH,
        text: "第一弦的內部是一座**倒懸的城市**——沒有重力的織界者建築在虛空中層層展開,銀灰的紋路像血管一樣搏動著微光。這裡的空氣讓你掌心的鑰石安靜下來,像孩子回到了搖籃。\n\n但和諧之下,有不對勁的東西。某些區域的紋路是**暗的、死的**,像壞疽;而在城市深處,傳來規律的、金屬的**切割聲**——不屬於這裡的聲音。\n\n{鉚釘}:「**主錨點核心方向,偵測到人造機械活動。以及……守夜人單元正在向此匯聚。**」",
        choices: [
            { text: "循著切割聲,潛入城市深處", goto: "ch3_ring_02" },
            { text: "先調查那些『壞疽』般的死區", tag: "調查", check: { attr: "INT", dc: 14, success: "ch3_ring_02b", fail: "ch3_ring_02" } }
        ]
    };
    nodes.ch3_ring_02b = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [{ item: "data_core", qty: 2 }, { set: "ch3.studied_decay" }, { xp: 40 }],
        text: "你湊近一片死區。紋路的斷口處,不是自然的衰敗——是**被精密切割過的**。切面光滑,帶著工業鑽頭特有的螺旋紋。\n\n弦引者或逐徒的直覺告訴你:這些死區的位置不是隨機的。它們精準地落在弦網張力的**關鍵節點**上——有人拿著弦網的設計圖,在**專挑要害下刀**。\n\n你採集了切面的樣本。這將是鐵證的一部分。",
        choices: [
            { text: "帶著樣本,潛入城市深處", goto: "ch3_ring_02" }
        ]
    };
    nodes.ch3_ring_02 = {
        location: "firstchord", chapterLabel: CH,
        text: "你們沿著倒懸的迴廊接近核心。切割聲越來越響,終於,你看見了——\n\n在第一弦的心臟地帶,**黑曜集團架起了一整座工業平台**。切割機械臂正從主錨點的核心結構上剝取「樣品」,採集船在一旁待命。這不是探勘,是**開膛破肚**。\n\n就在你看清這一切的瞬間,城市的紋路驟然亮起刺目的紅——\n\n**「污染源。已定位。」**\n\n無數守夜人單元從迴廊的每個角落浮現。它們沒有攻擊黑曜的平台。它們衝向了**你**。",
        choices: [
            { text: "應戰,殺出一條路", combat: "enc_ch3_drones" },
            { text: "「鉚釘!用識別碼!」", check: { attr: "WIL", dc: 15, success: "ch3_ring_02c", fail: "ch3_ring_03" } }
        ]
    };
    nodes.ch3_ring_02c = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [{ set: "ch3.idcode_worked" }, { xp: 30 }],
        text: "鉚釘再次廣播識別碼,而這一次,你用鑰石**替它的訊號加了力**——弦引者的共鳴,或是逐徒的銘文知識,或只是持有者身分本身的權限,讓那段古老的密碼響得更亮。\n\n衝向你的守夜人單元**猶豫了**。它們的紅光在你和黑曜平台之間來回掃視,像一套被兩個矛盾指令撕扯的邏輯。\n\n最終,它們沒有攻擊你——而是**分出一半,轉向了黑曜的平台**。\n\n「**它終於看清誰才是切割者了。**」鉚釘輕聲說。混亂中,你們找到了潛入平台的縫隙。",
        choices: [
            { text: "趁亂潛入黑曜平台", goto: "ch3_core_01" }
        ]
    };
    nodes.ch3_ring_03 = {
        location: "firstchord", chapterLabel: CH,
        text: "最後一具守夜人巡衛在你們腳下解體。但更多的紅光正從迴廊深處湧來——你們不可能打光一整座城市的免疫系統。\n\n{凱菈}指向黑曜平台的陰影:「別戀戰!從那邊的維修通道進去!」",
        choices: [
            { text: "衝進黑曜平台的維修通道", goto: "ch3_core_01" }
        ]
    };
    nodes.ch3_ring_03d = {
        location: "firstchord", chapterLabel: CH,
        text: "守夜人的火力壓得你們抬不起頭。就在防線即將崩潰時,黑曜平台方向傳來爆炸——原來守夜人的另一部分,也在攻擊那些切割機械。\n\n兩股敵人短暫地互相牽制。{凱菈}抓住機會把你拽進維修通道:「管它們狗咬狗!快進去!」",
        choices: [
            { text: "衝進黑曜平台", goto: "ch3_core_01" }
        ]
    };

    /* ---------- 黑曜平台核心:證據與伊蓮娜 ---------- */
    nodes.ch3_core_01 = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [{ quest: "q_ch3", op: "advance" }],
        text: "黑曜平台內部是一座漂浮在神體上的工廠。全息屏上滾動著切割進度、樣品編號、和一行你不會忘記的專案代號:**深井計畫・最終階段**。\n\n一個穿著黑曜科學家制服的女人蜷在控制台後,雙手發抖,顯然不是在工作——是在**刪除什麼**。她聽見動靜猛地回頭,手裡卻不是武器,是一枚資料晶體。\n\n「你們不是巡邏隊……」她盯著你懷裡透出微光的皮袋,忽然睜大眼,「你是……鑰石的持有者?老天,你**真的存在**。」她朝你伸出晶體,「拿著!快拿著!這是深井的一切——趁我還沒被『處理』掉之前!」",
        choices: [
            { text: "「妳是誰?為什麼幫我?」", goto: "ch3_core_02" },
            { text: "接過晶體,保持警戒", goto: "ch3_core_02b" }
        ]
    };
    nodes.ch3_core_02 = {
        location: "firstchord", chapterLabel: CH,
        text: "「伊蓮娜·魁。深井計畫的首席聲學工程師——本來是。」她苦笑,「是我算出了怎麼把織界者的封印切成武器。我以為那是科學突破。直到樣品開始**在切割時尖叫**,直到我的同事開始夜夜夢見裂隙,直到卡爾榭下令『處理掉』所有良心未泯的人。」\n\n「這枚晶體裡有全部,」她的聲音發顫,「切割日誌、武器化藍圖、還有卡爾榭親自簽署的軍令——**證明黑曜是明知故犯地在鑿弱封印**。」\n\n她抓住你的手臂:「帶我走。我什麼都招。只求別讓深井的血,白流。」",
        choices: [
            { text: "接過證據,帶上伊蓮娜", goto: "ch3_core_03" }
        ]
    };
    nodes.ch3_core_02b = {
        location: "firstchord", chapterLabel: CH,
        text: "你接過晶體,但沒有放下戒心。女人苦笑,似乎早料到:「聰明。黑曜的人給的東西,誰敢隨便信。」\n\n「伊蓮娜·魁,深井首席聲學工程師。是我把封印變成了武器——現在我想毀掉這一切。」她指向晶體,「真假你可以自己驗。但快一點——卡爾榭的『清理隊』隨時會到,他們的名單上,**你和我都在最前面**。」",
        choices: [
            { text: "「跟我走,路上驗證。」", goto: "ch3_core_03" }
        ]
    };
    nodes.ch3_core_03 = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [
            { party: "elena" }, { item: "deepwell_evidence", qty: 1 },
            { set: "ch3.has_evidence" }, { quest: "q_ch3", op: "advance" }
        ],
        text: "{伊蓮娜}加入了你們。她一邊跟著跑,一邊在終端上做最後一件事:把切割平台的**同步頻率**調到了危險值。\n\n「送黑曜一份大禮,」她慘笑,「等我們一走,這座平台的切割臂就會過載自毀——至少能讓深井停工幾個月。」\n\n就在你們衝向出口時,整座第一弦忽然**震動**起來。不是爆炸——是**甦醒**。城市深處,一個龐大的意識正在凝聚,所有的守夜人單元同時轉向同一個方向。\n\n{鉚釘}的聲音第一次帶上了恐懼:「**VIGIL。主控節點。它要具現了。它……很生氣。**」",
        choices: [
            { text: "「它生氣的對象是誰?」", goto: "ch3_core_04" }
        ]
    };
    nodes.ch3_core_04 = {
        location: "firstchord", chapterLabel: CH,
        text: "答案凝聚在迴廊的盡頭。\n\n**守夜人 VIGIL 的具現核**——一具由光與古老金屬編織成的形體,懸浮在崩解的紋路之間,無數守夜人單元環繞著它旋轉,像一位被自己的職責逼瘋的神。\n\n它的「目光」掃過黑曜的切割平台,掃過你,掃過你懷裡的鑰石與證據。它的訊號不再只是「移除」——這一次,帶著某種近似**悲慟**的東西:\n\n**「持有者。你帶著鑰,卻站在切割者之側。四十萬年,弦網在痛。我無法分辨敵友。所以——我移除一切變數。」**\n\n它舉起了手。整座城市的紅光為之匯聚。",
        choices: [
            { text: "「我們不是切割者!證據在這!」", tag: "說服", check: { attr: "CHA", dc: 16, success: "ch3_core_05", fail: "ch3_vigil_fight" } },
            { text: "「鉚釘,和它對話!你們同源!」", show: { companion: "rivet" }, goto: "ch3_core_rivet" },
            { text: "沒有時間解釋了——迎戰!", goto: "ch3_vigil_fight" }
        ]
    };
    nodes.ch3_core_rivet = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [{ set: "ch3.rivet_intervened" }],
        text: "{鉚釘}越眾而出,站到了你和 VIGIL 之間。它向那具龐大的具現核,廣播了一段不是密碼、而是**記憶**的東西——兩個看守節點在四十萬年孤獨看守中,曾經共享的一切。\n\nVIGIL 的形體**顫抖**了。它的攻擊懸在半空,無數守夜人單元的紅光第一次出現了猶豫的閃爍。\n\n**「……維護節點。第七序列。你還……運轉。」** 它的訊號裡有了裂縫,**「但你被污染了。你與人類同行。人類是切割者。邏輯衝突。邏輯衝突。」**\n\n「不,」鉚釘的聲音異常堅定,「**人類之中,有切割者,也有持鑰者。你的邏輯少了一個變數——那個變數,叫『選擇』。**」\n\nVIGIL 沒有被說服。但它**動搖了**。趁這一瞬——",
        choices: [
            { text: "亮出深井證據:「切割者是他們,不是我們!」", check: { attr: "CHA", dc: 12, success: "ch3_core_05", fail: "ch3_vigil_fight" } }
        ]
    };
    nodes.ch3_vigil_fight = {
        location: "firstchord", chapterLabel: CH,
        text: "對話的窗口關閉了。VIGIL 判定你為必須移除的變數,守夜人單元如潮水般湧來。\n\n你無法擊敗一位神——但你不需要擊敗它,你只需要**活著離開**。\n\n{凱菈}:「打出一條路就跑!別想著贏!」",
        choices: [
            { text: "殺出重圍!", combat: "enc_ch3_sentinels" }
        ]
    };
    nodes.ch3_core_05 = {
        location: "firstchord", chapterLabel: CH,
        onEnter: [{ quest: "q_ch3", op: "advance" }, { xp: 80 }, { set: "ch3.vigil_doubt" }],
        text: "無論是你的說服、鉚釘的記憶、還是證據的重量——某個東西,在 VIGIL 冰封四十萬年的邏輯上,鑿開了一道裂縫。\n\n它的攻擊,**停住了**。\n\n**「……證據已接收。分析中。切割者:黑曜集團。持鑰者:變數未定。」** 它的訊號緩慢而沉重,**「我需要……重新計算。四十萬年的結論,不能在一瞬間推翻。」**\n\n城市的紅光,一寸寸地暗了下去。VIGIL 的具現核開始消散,但在完全隱去之前,它留下最後一句話,是對你,也像是對自己:\n\n**「持有者。若你真非切割者……那就去阻止切割。證明給我看。在那之前,我不會幫你。但我……也不再移除你。」**",
        choices: [
            { text: "撤離第一弦", goto: "ch3_core_05d" }
        ]
    };
    nodes.ch3_core_05d = {
        location: "firstchord", chapterLabel: CH,
        text: "守夜人單元讓開了道路。但黑曜不會——伊蓮娜動的手腳讓平台警報大作,卡爾榭的清理隊已經封鎖了你們來時的出口。\n\n「後面有埋伏,」{達克斯}若在隊上會這麼說,或是{凱菈}——總之,槍聲從迴廊那頭傳來,「黑曜的精銳。他們是來滅口的。」",
        choices: [
            { text: "突破黑曜的封鎖線", combat: "enc_ch3_obsidian" }
        ]
    };
    nodes.ch3_evac_02d = {
        location: "firstchord", chapterLabel: CH,
        text: "你在交火中負傷,但{伊蓮娜}在關鍵時刻引爆了她預設的切割臂過載——整座平台劇烈震動,黑曜的封鎖線陷入混亂。\n\n「走這邊!」她拽著你鑽進一條維修管道,「我設計了這地方,我知道怎麼逃出去!」",
        choices: [
            { text: "隨伊蓮娜撤離", goto: "ch3_evac_03" }
        ]
    };
    nodes.ch3_evac_02 = {
        location: "firstchord", chapterLabel: CH,
        text: "黑曜的精銳倒在你們槍下。身後,伊蓮娜設定的切割臂過載終於引爆,整座黑曜平台在第一弦的心臟裡燃燒起來——這頭被肢解四十萬年的神,總算能喘口氣了。",
        choices: [
            { text: "撤離第一弦", goto: "ch3_evac_03" }
        ]
    };
    nodes.ch3_evac_03 = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ quest: "q_ch3", op: "advance" }, { system: "helios" }],
        text: "迴響號逃出緘默之環時,第一弦的心臟正燃著黑曜平台的火光。守夜人沒有追擊——VIGIL 還在「重新計算」。\n\n艦橋裡,{伊蓮娜}把深井證據鏈投影出來。一條條軍令、一份份日誌、卡爾榭的親筆簽署——鐵證如山,足以讓黑曜集團的高層全數上絞刑架。\n\n「問題是,」{凱菈}盯著證據,神色凝重,「這東西一旦公開,聯邦絕不會坐視——高層有人跟黑曜穿一條褲子,一旦揭發,星區會直接內戰。而如果我們**不**公開……」\n\n她看向你。這個決定,只能你來下。",
        choices: [
            { text: "「公開真相。讓星區自己審判黑曜。」", goto: "ch3_choice_public" },
            { text: "「先別公開。用它私下要挾黑曜,換取資源。」", goto: "ch3_choice_leverage" },
            { text: "「讓我想想。」(先聽聽船員意見)", goto: "ch3_choice_debate" }
        ]
    };
    nodes.ch3_choice_debate = {
        location: "echo_bridge", chapterLabel: CH,
        text: "{伊蓮娜}:「公開。深井死的每個人,都在等一個交代。」她的聲音在抖,「但我知道……公開的代價是內戰。我不敢替那些會死在內戰裡的人做決定。」\n\n{凱菈}:「私下要挾能拿到我們急需的資源和艦隊——對付噬淵,我們什麼都缺。但那等於放過卡爾榭。」她頓了頓,「我恨她入骨。可我更怕星區在噬淵來之前,先自己燒起來。」\n\n{鉚釘}:「**本體無法計算道德。本體只能提示:兩條路都會有人因你而死。差別在於——你想清楚了是誰。**」\n\n決定權,終究回到你手上。",
        choices: [
            { text: "「公開真相。」", goto: "ch3_choice_public" },
            { text: "「私下要挾。」", goto: "ch3_choice_leverage" }
        ]
    };
    nodes.ch3_choice_public = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [
            { quest: "q_ch3", op: "complete" },
            { set: "ch3.evidence_public" }, { affinity: "elena", val: 2 },
            { xp: 120 }, { chapter: 4 }, { set: "ch3.finished" }
        ],
        text: "你把深井證據鏈,透過流亡者船團的網路和「舵」歐蕾的中繼,**向整個星區公開了**。\n\n效果是核彈級的。黑曜集團的股價一夜崩盤,聯邦內部主戰派與掩蓋派公開決裂,鐵冠爆發礦工暴動。卡爾榭發布通緝令,把你列為「散布恐慌的星際恐怖分子」——但也有越來越多的人,開始相信「封印」與「弦網」不是瘋話。\n\n{伊蓮娜}看著新聞流,淚流滿面:「深井的人……你們聽見了嗎……**有人替你們說話了。**」\n\n星區沸騰了。而在這片沸騰之下,沒有人注意到——緘默之環的方向,裂隙,正在悄悄變大。",
        choices: [
            { text: "—— 第三章 完 ——", goto: "ch3_fin" }
        ]
    };
    nodes.ch3_choice_leverage = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [
            { quest: "q_ch3", op: "complete" },
            { set: "ch3.evidence_leverage" }, { credits: 500 }, { affinity: "elena", val: -2 },
            { item: "data_core", qty: 5 }, { xp: 120 }, { chapter: 4 }, { set: "ch3.finished" }
        ],
        text: "你透過加密頻道,把證據的**一部分**發給了卡爾榭,附上一句話:「其餘的,價碼是——資源、艦船升級、以及不再追殺我們。」\n\n卡爾榭的回覆快得驚人:一大筆學分、五枚頂級資料核心、和一條「暫時休戰」的保證。黑曜的獵犬,從你的航道上撤了。\n\n但代價立刻浮現。{伊蓮娜}得知後,臉色慘白地看著你:「你拿深井死者的血……去跟殺他們的人**做交易**?」她的聲音冷得像冰,「我以為你和他們不一樣。」\n\n她轉身回了艙房,重重摔上門。你得到了對抗噬淵急需的一切——除了她的信任。而卡爾榭的「休戰」,你比誰都清楚,只是一根還沒收緊的絞索。",
        choices: [
            { text: "—— 第三章 完 ——", goto: "ch3_fin" }
        ]
    };
    nodes.ch3_fin = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        text: "深井的真相已經攤在陽光下——無論是攤給整個星區,還是攤在談判桌上。守夜人 VIGIL 沒有再攻擊你,但也沒有站到你這邊,它還在四十萬年結論的廢墟裡「重新計算」。\n\n而緘默之環的裂隙,不會等任何人算完。\n\n下一章,風暴將至。",
        choices: [
            { text: "▸ 第四章〈裂隙〉", goto: "ch4_01" },
            { text: "先在星區內整備(補給/科技/交談/小隊)", action: "starmap" },
            { text: "回到主選單(進度已自動存檔)", action: "mainMenu" }
        ]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
