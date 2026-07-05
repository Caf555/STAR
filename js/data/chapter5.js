/* ============================================================
   chapter5.js — 第五章〈弦心〉與四種結局(M5・完結)
   突破屏障 → 弦心與最終真相 → 噬淵化身決戰 →
   依全程抉擇進入四結局 → 動態尾聲後日談。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.locations = D.locations || {}, {
        chordheart_approach: { name: "弦心・空間屏障", sub: "弦網中樞・屏障缺口" },
        chordheart_city: { name: "弦心・織界者最後之城", sub: "弦網中樞" }
    });

    Object.assign(D.quests = D.quests || {}, {
        q_ch5: {
            title: "弦心",
            type: "main",
            stages: [
                { objective: "突破弦心的空間屏障" },
                { objective: "深入弦心,面對最終真相" },
                { objective: "在弦的另一端,做出你的選擇" }
            ]
        }
    });

    Object.assign(D.encounters = D.encounters || {}, {
        enc_ch5_abyss: {
            title: "噬淵化身",
            enemies: [
                { id: "abyss_avatar", row: "front" },
                { id: "abyss_tendril", row: "front" }
            ],
            victory: "ch5_ending_gate", defeat: "ch5_abyss_lose"
        }
    });

    const nodes = {};
    const CH = "第五章〈弦心〉";

    /* 星圖入口(玩家自星圖前往弦心;未通關則導向屏障戰) */
    nodes.arrive_chordheart = {
        location: "chordheart_approach", chapterLabel: CH, travel: true,
        text: "弦心的空間屏障橫亙眼前,裂隙撕開的缺口在虛空中泛著不祥的微光。",
        choices: [
            { text: "突破屏障,進入弦心", show: { not: { flag: "game.finished" } }, goto: "ch5_01" },
            { text: "重返弦心(旅程已完結)", show: { flag: "game.finished" }, goto: "ch5_credits" },
            { text: "返回星圖", action: "starmap" }
        ]
    };

    /* ---------- 突破屏障 ---------- */
    nodes.ch5_01 = {
        location: "chordheart_approach", chapterLabel: CH,
        onEnter: [{ quest: "q_ch5", op: "start" }, { unlock: "chordheart" }, { system: "chordheart" }],
        text: "弦心的空間屏障,是一面橫亙在虛空中的、由純粹的弦張力織成的牆。四十萬年來,沒有任何已知的航道能穿過它——直到噬淵的裂隙,把它撕開了一道正在擴大的傷口。\n\n你的艦隊在傷口前集結。{凱菈}的聲音透過全艦廣播傳來:「所有單位,聽我口令。我們只有一次機會,趁傷口還沒被噬淵完全佔據,**衝進去**。」\n\n屏障的缺口處,盤踞著最後的守衛——不知是守夜人的遺存,還是被噬淵扭曲的什麼。它轉向了迴響號。",
        choices: [
            { text: "(VIGIL 為盟友)召喚守夜人艦隊開路", show: { flag: "vigil.ally" }, goto: "ch5_barrier_vigil" },
            { text: "(VIGIL 為工具)命令守夜人艦隊清場", show: { flag: "vigil.tool" }, goto: "ch5_barrier_vigil" },
            { text: "率艦隊強攻缺口", shipCombat: "se_final_barrier" }
        ]
    };
    nodes.ch5_barrier_vigil = {
        location: "chordheart_approach", chapterLabel: CH,
        onEnter: [{ set: "ch5.vigil_opened" }, { xp: 80 }],
        text: "你的一聲令下,成千上萬的守夜人單元從躍遷中湧現,如一片銀色的潮水撲向屏障守衛。\n\n無論它們是出於盟友的信任,還是工具的服從——四十萬年的看守之力,終於不再對準人類,而是為人類**開路**。\n\n守衛在守夜人的圍攻下崩解。屏障的缺口,朝迴響號敞開。",
        choices: [
            { text: "全速穿越屏障", goto: "ch5_02" }
        ]
    };
    nodes.ch5_barrier_retry = {
        location: "chordheart_approach", chapterLabel: CH,
        text: "迴響號被守衛的火力逼退,你不得不重整陣型。屏障的傷口還在,機會還在——但每耽擱一刻,噬淵就滲入得更深。\n\n{凱菈}切換了通訊頻道:「別忘了——**我們不是一艘船在打**。要嘛修好船再衝一次,要嘛,讓盟軍替我們把路轟開。」",
        choices: [
            { text: "呼叫盟軍艦隊集火掩護,強行突入", show: { flag: "ch4.allies_ready" }, goto: "ch5_barrier_allies" },
            { text: "整補後再次強攻(修復船體)", goto: "ch5_barrier_fix" },
            { text: "立刻再衝一次", shipCombat: "se_final_barrier" }
        ]
    };
    nodes.ch5_barrier_allies = {
        location: "chordheart_approach", chapterLabel: CH,
        onEnter: [{ repairHull: true }, { set: "ch5.allies_covered" }, { xp: 60 }],
        text: "你的訊號發出去不到十秒,整片虛空亮了起來。\n\n聯邦巡防艦的主炮、教會朝聖船的聖詠廣播、流亡者拼裝艦的蜂群飛彈——你這一路積攢的每一份人情,在同一刻化作壓向屏障守衛的火網。守衛巨艦在集火中踉蹌、轉向、崩解。\n\n「通道清空!」{凱菈}把推進器推到底,「**全艦隊,跟上迴響號!**」",
        choices: [
            { text: "全速穿越屏障", goto: "ch5_02" }
        ]
    };
    nodes.ch5_barrier_fix = {
        location: "chordheart_approach", chapterLabel: CH,
        onEnter: [{ repairHull: true }],
        text: "隨行的補給艦替迴響號緊急修復了裝甲。船體重新滿載,引擎嗡鳴。",
        choices: [
            { text: "再次強攻屏障缺口", shipCombat: "se_final_barrier" }
        ]
    };

    /* ---------- 弦心與最終真相 ---------- */
    nodes.ch5_02 = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ quest: "q_ch5", op: "advance" }],
        text: "穿過屏障的剎那,所有的聲音都消失了。\n\n弦心——織界者最後之城——懸浮在弦網的正中央,美得令人窒息:億萬條光弦從這裡向整個星區輻射,像一件仍在演奏的、活著的樂器。而城市本身,是由**凝固的音樂**建成的。\n\n但它在**死去**。光弦一根接一根地黯淡、斷裂;城市的邊緣,正被噬淵的黑暗一寸寸吞噬。\n\n{鉚釘}的鏡頭光環顫抖著:「**這裡……就是弦網的心臟。也是……織界者的墳墓。**」\n\n你掌心的鑰石,發出了前所未有的、近乎哀鳴的共振。它想帶你去某個地方。",
        choices: [
            { text: "跟隨鑰石的指引,深入城市核心", goto: "ch5_03" }
        ]
    };
    nodes.ch5_03 = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ quest: "q_ch5", op: "advance" }],
        text: "鑰石引你來到城市的核心——一座巨大的、環形的殿堂,億萬條光弦在此匯聚成一個緩慢旋轉的光球。\n\n當你走近,光球「開口」了。不是聲音,是**直接在你意識中綻放的理解**:\n\n「**你來了,持鑰者。也是,守夜人。**」\n\n「**你想知道我們去了哪裡。答案是:我們哪裡都沒去。**」\n\n「**噬淵無法被殺死,只能被『聽不見』。所以我們把整個文明,連同我們自己的意識,織進了這張網——我們沒有建造封印。我們**成為**了封印。四十萬年,我們用自己的存在,唱著讓噬淵聽不見這片星區的歌。**」\n\n「**但我們累了。一個接一個地,潰散了。而現在,黑曜割斷了太多弦,噬淵……聽見了。**」",
        choices: [
            { text: "「我能做什麼?」", goto: "ch5_04" }
        ]
    };
    nodes.ch5_04 = {
        location: "chordheart_city", chapterLabel: CH,
        text: "「**你手中的鑰,是我們留下的最後一手。它能重新調諧這張網——但需要一個『歌者』,一個願意站在網的中心、替我們把歌唱下去的人。**」\n\n光球的旋轉慢了下來,像一次疲憊的嘆息。\n\n「**選擇權在你。你可以接過這首歌,你可以毀掉這張網,你可以……做我們從未想過的事。但你要快——因為——**」\n\n殿堂劇烈震動。城市核心的黑暗猛地暴漲,億萬條光弦同時發出刺耳的悲鳴。從弦網最深的裂口裡,**噬淵的化身**正在具現——一團否定了一切形狀與意義的存在,朝著弦心的心臟,朝著你,緩緩張開了「口」。\n\n「**它來了。孩子——先活下來。然後,做你的選擇。**」",
        choices: [
            { text: "迎戰噬淵化身!", combat: "enc_ch5_abyss" }
        ]
    };
    nodes.ch5_abyss_lose = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ healParty: true }],
        text: "噬淵的力量將你們逐一擊倒。就在黑暗即將吞沒一切時,你掌心的鑰石爆發出刺目的光——弦心的光球,用它殘存的最後力量,替你們擋下了這一擊,治癒了你們的創傷,將噬淵化身暫時逼退。\n\n「**起來,持鑰者。**」那疲憊的意識在你腦中低語,「**這一戰,你輸不起。我會為你們續上力量——再來一次。**」",
        choices: [
            { text: "撐起身子,再次迎戰", combat: "enc_ch5_abyss" }
        ]
    };

    /* ---------- 結局抉擇門(依全程資格開放對應結局) ---------- */
    nodes.ch5_ending_gate = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ quest: "q_ch5", op: "advance" }, { quest: "q_ch5", op: "complete" }, { xp: 300 }, { set: "ch5.abyss_beaten" }],
        text: "噬淵的化身被暫時逼退,但它不會被殺死——它只會**餓著**,等待下一次弦網變弱。\n\n弦心的光球在你面前緩緩旋轉,億萬條殘存的光弦等待著你的決定。這一刻,你這一路的每一個抉擇、每一份羈絆、每一個盟友,都匯聚成了此刻手中的可能性。\n\n**你要如何,為幽弦星區的故事,寫下結尾?**\n\n(以下選項依你的旅程而開放。)",
        choices: [
            {
                text: "【新的弦歌】接過歌者之責,以完整的歌謠重新調諧弦網",
                show: { all: [{ flag: "song.vessari" }, { flag: "song.church" }, { flag: "song.relic" }, { flag: "vigil.ally" }, { flag: "ch4.allies_ready" }] },
                goto: "ch5_end_song"
            },
            {
                text: "【守夜人的繼承者】與 VIGIL 融合,成為新的看守者,永守這片邊境",
                show: { all: [{ any: [{ flag: "vigil.ally" }, { flag: "vigil.tool" }] }, { any: [{ class: "conductor" }, { attr: { name: "WIL", gte: 9 } }] }] },
                goto: "ch5_end_heir"
            },
            {
                text: "【淵之默許】接受回聲的提議,與噬淵達成一場沒有人理解的交易",
                show: { all: [{ companion: "echo" }, { erosion: { gte: 40 } }] },
                goto: "ch5_end_abyss"
            },
            {
                text: "【燃燒的星圖】引爆弦心,以整片弦網的毀滅,將噬淵的前鋒一同焚盡",
                goto: "ch5_end_burn"
            }
        ]
    };

    /* ---------- 結局一:新的弦歌 ---------- */
    nodes.ch5_end_song = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ set: "ending.song" }, { set: "game.finished" }],
        text: "你走向弦網的中心,舉起鑰石。\n\n{塞恩}的歸巢調、教會的警戒調、遺跡的錨定調——三段歌謠在你胸中匯成一首完整的歌。而這一次,你不是在聆聽它,你是在**唱**它。VIGIL 的守夜人軍團接上了你的旋律,結盟的艦隊亮起了共鳴的燈,整個星區的人——聯邦、教會、流亡者、維薩里——都在這一刻,聽見了那首四十萬年前的歌。\n\n斷裂的光弦,一根接一根地,**重新亮起**。\n\n噬淵的化身在越來越響亮的歌聲中,漸漸「聽不見」了這片星區——它茫然地在虛空中徘徊,最終,退回了膜層之外的黑暗。\n\n織界者疲憊的意識,終於得以安息。而你,成為了弦網新的、活著的一部分——不是囚徒,是歌者。你偶爾還能回到迴響號,回到你的船員身邊。因為這一次的封印,不需要犧牲,只需要**有人願意記得那首歌**。\n\n幽弦星區,迎來了它的新紀元。",
        choices: [{ text: "尾聲", goto: "ch5_epilogue" }]
    };

    /* ---------- 結局二:燃燒的星圖 ---------- */
    nodes.ch5_end_burn = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ set: "ending.burn" }, { set: "game.finished" }],
        text: "有些結,解不開,只能斬斷。\n\n你將鑰石插入弦心的核心,把它從「調諧器」逆轉為「引爆器」。{伊蓮娜}若在隊,含淚替你校準了過載頻率;{凱菈}下令全艦隊撤離。\n\n「所有單位,最大船速,離開弦心!」\n\n在噬淵化身再度撲來的瞬間,弦心——連同四十萬年的織界者意識、連同整張弦網——化作一顆吞噬一切的白光。噬淵的前鋒,在那場毀滅中被一同焚盡,慘嚎著退回了虛空的裂縫。\n\n代價是慘重的。失去了弦網的星區,再也沒有了那層「聽不見」的保護膜。噬淵還會回來——也許幾百年後,也許更久。但**這一代人活下來了**,帶著一張需要自己去守護的、沒有神的星圖。\n\n迴響號駛離燃燒的弦心。身後,一個紀元結束了；身前,一個由人類自己書寫的、危險而自由的紀元,開始了。",
        choices: [{ text: "尾聲", goto: "ch5_epilogue" }]
    };

    /* ---------- 結局三:守夜人的繼承者 ---------- */
    nodes.ch5_end_heir = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ set: "ending.heir" }, { set: "game.finished" }],
        text: "「讓我來。」你對弦心的光球說,也對佇立在你身旁的{鉚釘}說。\n\nVIGIL 的意識,透過鉚釘這座橋,與你相接。四十萬年的看守經驗,與一個凡人有限卻滾燙的一生,在鑰石的共振中緩緩交融。你將成為新的守夜人——不是冰冷的機器,而是一個**記得如何愛、如何選擇**的看守者。\n\n「**你確定嗎?**」VIGIL 問,「**這意味著,你將不再是『人類』。你將站在網的中心,直到下一個接班者出現。可能是幾千年。**」\n\n你確定。\n\n人類撤離了幽弦星區——聯邦的疏散船隊、教會的朝聖船、流亡者的拼裝艦,載著這片星區的所有居民,駛向更安全的星域。而你,與 VIGIL 合一,留了下來,成為這片邊境永恆的守望。\n\n{凱菈}是最後一個離開的。她在舷梯口回頭,對著弦心的方向,敬了一個久違的、標準的軍禮:「晨星號的舵手……不,**守夜人**。我們會記得你。」\n\n你會看著他們遠去。然後,你會開始唱歌。一唱,就是幾千年。而你不覺得孤單——因為你記得,他們曾經在這裡。",
        choices: [{ text: "尾聲", goto: "ch5_epilogue" }]
    };

    /* ---------- 結局四:淵之默許(黑化) ---------- */
    nodes.ch5_end_abyss = {
        location: "chordheart_city", chapterLabel: CH,
        onEnter: [{ set: "ending.abyss" }, { set: "game.finished" }],
        text: "{回聲}飄到你身邊,那張終於學會了表情的臉上,是一種近乎慈悲的哀傷。\n\n「還有一條路,」它輕聲說,「它不想毀滅這片星區。它只是**餓**,只是**孤單**——就像我曾經那樣。你手裡的鑰,能讓它『聽懂』我們。不是聽不見——是**聽懂**。」\n\n「代價是,」回聲望進你的眼睛,「你要成為它與我們之間的『聲音』。你會改變。你會不再完全是你。但沒有人需要死,沒有文明需要毀滅。噬淵會……**加入**這首歌,而不是吞掉它。」\n\n你握緊了鑰石。心裡那片低語待了太久的角落,輕輕地、甜蜜地,舒展開來。\n\n你做出了選擇。\n\n當你將鑰石按上弦心的核心,整張弦網的旋律變了——它不再是「讓噬淵聽不見」的歌,而是一首邀請它**共鳴**的歌。星區的居民們永遠不會知道,他們頭頂的星空裡,多了一種古老而飢餓的和聲;也永遠不會知道,是誰,用自己的人性作為代價,替他們與深淵簽下了這場沉默的默許。\n\n迴響號的船員們看著你,眼神裡有他們讀不懂的陌生。而你對他們微笑——用一張,已經不完全屬於你自己的臉。",
        choices: [{ text: "尾聲", goto: "ch5_epilogue" }]
    };

    /* ---------- 動態尾聲後日談 ---------- */
    SE.Dyn = SE.Dyn || {};
    SE.Dyn.epilogue = function () {
        const S = SE.State, has = f => S.getFlag(f), inParty = id => S.data.party.indexOf(id) !== -1;
        const met = id => !!S.data.companions[id];
        const L = [];
        L.push("");
        L.push("——————");
        L.push("**尾聲・幽弦星區後日談**");
        L.push("");

        // 結局基調
        if (has("ending.song")) L.push("**星區・新紀元**:那首歌,如今由無數人接力傳唱。孩子們在學校裡學它,船長們用它導航。沒有人再說「封印」是瘋話。");
        else if (has("ending.burn")) L.push("**星區・無網之世**:人類第一次,在沒有神的保護下仰望星空。恐懼與自由,同樣真實。他們開始建造自己的守望塔。");
        else if (has("ending.heir")) L.push("**星區・大遷徙**:幽弦星區成了傳說中「被守望者換來的應許之地」的故事。每一艘離開的船,都在航海日誌的第一頁,寫下守夜人的名字。");
        else if (has("ending.abyss")) L.push("**星區・沉默的和聲**:表面上,一切如常。只是夜裡做夢的人,偶爾會夢見一首溫柔的歌——沒有人知道,那是誰,替他們付了代價。");
        L.push("");

        // 夥伴後日談
        if (met("kaila")) {
            if (has("ch2.knows_kalshe") && has("ch3.evidence_public")) L.push("**凱菈·沃斯**:她親手把卡爾榭送上了聯邦的審判庭。晨星號的每一個船員,都等到了遲來的公道。她重新戴上了艦長的軍銜。");
            else L.push("**凱菈·沃斯**:她說,替賈維、替晨星號、替這一路死去的人,這趟值了。她仍在飛——只是這一次,是為了活人。");
        }
        if (met("rivet")) {
            if (has("vigil.ally") || has("ending.heir")) L.push("**鉚釘 RIVET**:四十萬年的孤獨,終於有了盡頭。它說,它終於明白了「希望」該如何歸類——歸類為:值得。");
            else if (has("vigil.defeated")) L.push("**鉚釘 RIVET**:它是最後一個守夜人了。它把 VIGIL 的核心密鑰,安葬在了第一弦。它說,它會替它,繼續看下去。");
            else L.push("**鉚釘 RIVET**:它繼續留在迴響號上,維護著這艘老船,和船上這群它稱之為「優先保護項目」的人。");
        }
        if (met("thane")) L.push("**塞恩**:歸巢調完整的那一天,維薩里的商隊接納了他。族人不再叫他叛徒——他們叫他「把歌帶回家的人」。");
        if (met("elena")) {
            if (has("ch3.evidence_leverage")) L.push("**伊蓮娜·魁**:她最終還是離開了。她說,她無法原諒那場用死者鮮血做的交易——但她也承認,是你的選擇,讓活人撐過了噬淵。她們的帳,誰也算不清。");
            else L.push("**伊蓮娜·魁**:她成了新星區聲學研究的領頭人——這一次,是為了修補,而不是切割。深井的亡者,終於可以安息。");
        }
        if (met("dax")) L.push("**「野犬」達克斯**:他的長槍上,再也沒有添過新的刻痕。他說,欠鐵冠的、欠那些沒能救的人的,總算還清了。");
        if (met("echo")) {
            if (has("ending.abyss")) L.push("**回聲**:它成了唯一理解你的存在。它說,它很抱歉,把你帶上了這條路;但它也說,它很慶幸,不再是宇宙裡唯一「選擇了人性的怪物」。");
            else L.push("**回聲**:一個選擇了人性的裂隙之子,如今努力地、笨拙地,學著做一個「人」。它最珍惜的,是你給它的那個名字。");
        }

        // 陣營
        L.push("");
        const allies = [];
        if (has("ally.fed")) allies.push("聯邦");
        if (has("ally.church")) allies.push("教會");
        if (has("ally.exile")) allies.push("流亡者與維薩里");
        if (allies.length) L.push("**並肩者**:" + allies.join("、") + "——他們記得,在星區最黑暗的那一夜,是誰召集了他們。");

        // 侵蝕餘響
        if (S.data.player.erosion >= 50 && !has("ending.abyss")) L.push("");
        if (S.data.player.erosion >= 50 && !has("ending.abyss")) L.push("*但夜深人靜時,你偶爾還是會聽見那個聲音。它很輕,很遠。你告訴自己,那只是風。*");

        L.push("");
        L.push("——————");
        return L.join("\n\n");
    };

    nodes.ch5_epilogue = {
        location: "chordheart_city", chapterLabel: CH,
        dyn: "epilogue",
        text: "迴響號的舷窗外,幽弦星區的星光,第一次顯得如此安穩。\n\n這一路,你從一個追查訊號的無名之輩,走成了決定整片星區命運的人。芮妮、歐嘉、泰奧、賈維、深井的亡者、織界者……無數的名字,匯成了你掌心那枚鑰石最後一次、溫柔的搏動。\n\n然後,它安靜了下來。它的工作,做完了。",
        choices: [
            { text: "—— 全篇完 ——", goto: "ch5_credits" }
        ]
    };
    nodes.ch5_credits = {
        location: "chordheart_city", chapterLabel: CH,
        text: "**《星淵迴響》STAR: Abyssal Echoes**\n\n感謝你陪伴這趟橫跨幽弦星區的旅程,走到了弦的另一端。\n\n這是一款純手工編寫的文字冒險 RPG:5 章主線 + 三段出身序章、3 出身 × 3 職業、7 名可招募夥伴、回合制小隊戰鬥與艦船對戰、星圖航行、科技樹與製造、以及依你全程抉擇分歧的**四種結局**。\n\n你剛才走到的,只是四個結局之一,和無數種旅程中的一種。換一種出身、一種職業、一組不同的抉擇——燈塔站的燈,永遠為下一次啟航亮著。\n\n**弦斷之處,它在聽。而你,聽完了整首歌。**",
        choices: [
            { text: "以另一種出身重新啟程", action: "newGame" },
            { text: "回到主選單", action: "mainMenu" }
        ]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
