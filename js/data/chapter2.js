/* ============================================================
   chapter2.js — 第二章〈弦上的低語〉(M3)
   開放結構:三段織界歌謠(維薩里/教會/遺跡),任意順序尋訪。
   集齊三段 → 補全緘默之環座標 → 進入第三章。
   途中:塞恩與達克斯入隊、艦船對戰、陣營抉擇、侵蝕加深。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    /* ---------- 地點 ---------- */
    Object.assign(D.locations = D.locations || {}, {
        mist_anchorage: { name: "霧海・船團錨泊地", sub: "霧海星雲・流亡者藏身處" },
        hymn_cathedral: { name: "軌道大教堂", sub: "聖詠星系・星語教會聖地" },
        ironcrown_edge: { name: "鐵冠・精煉廠外環", sub: "鐵冠星系・黑曜採礦重鎮" },
        echo_bridge: { name: "迴響號・艦橋", sub: "航行於幽弦星區" }
    });

    /* ---------- 任務 ---------- */
    Object.assign(D.quests = D.quests || {}, {
        q_ch2: {
            title: "弦上的低語",
            type: "main",
            stages: [
                { objective: "集齊三段織界歌謠:維薩里、教會、遺跡" },
                { objective: "返回迴響號艦橋,補全緘默之環的座標" }
            ]
        }
    });

    /* ---------- 遭遇 ---------- */
    Object.assign(D.encounters = D.encounters || {}, {
        enc_ch2_zealots: {
            title: "燃燈庭的狂信者",
            enemies: [{ id: "zealot", row: "front" }, { id: "zealot", row: "front" }, { id: "zealot_adept", row: "back" }],
            victory: "ch2_hymn_fight_win", defeat: "ch2_hymn_fight_lose"
        },
        enc_ch2_hounds: {
            title: "黑曜地面小隊",
            enemies: [{ id: "merc_gun", row: "front" }, { id: "merc_leader", row: "back" }],
            victory: "ch2_iron_ground_win", defeat: "ch2_iron_ground_lose"
        }
    });

    const nodes = {};
    const CH = "第二章〈弦上的低語〉";

    /* ============================================================
       開場:艦橋簡報,開放三條航線
       ============================================================ */
    nodes.ch2_01 = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        onEnter: [
            { quest: "q_ch2", op: "start" },
            { unlock: "mist" }, { unlock: "hymn" }, { unlock: "ironcrown" },
            { system: "helios" }
        ],
        text: "迴響號的艦橋擠進了四個人和一台機器人。{歐蕾}的全息影像從通訊台升起,身後是燈塔站繁忙的環廊。\n\n「補全座標,你需要三樣東西。」她調出一段古老的音波圖,「織界者沒有留下地圖——他們留下的是**歌**。三段殘缺的『織界歌謠』,合起來才是一把鑰匙。」\n\n{鉚釘}的鏡頭亮起:「**確認。歌謠即座標的聲學編碼。本體記得旋律,不記得音節。**」\n\n歐蕾豎起三根手指:「**維薩里遺民**在霧海,他們用歌謠當搖籃曲;**星語教會**在聖詠,把歌謠刻進了聖物;最後一段,埋在**鐵冠**的織界遺跡裡——但那裡現在是黑曜的地盤。」\n\n「三個地方,」{凱菈}接口,「哪個先去,你決定。」",
        choices: [
            { text: "開啟星圖,選擇第一個目的地", action: "starmap" },
            { text: "先問問船員的看法", goto: "ch2_01b" }
        ]
    };
    nodes.ch2_01b = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        text: "{凱菈}:「鐵冠最危險,但離『深井』最近——我想知道黑曜到底在挖什麼。不過那是我的私怨,你不必遷就。」\n\n{鉚釘}:「**建議優先霧海。維薩里是本體舊識的後裔。他們的歌……本體想再聽一次。**」\n\n如果奧菲莉亞或塞恩在場,他們大概也會有話說——但現在,決定權在你手裡。",
        choices: [
            { text: "開啟星圖,設定航向", action: "starmap" }
        ]
    };

    /* 艦橋樞紐:每完成一段歌謠回到這裡,檢查是否集齊 */
    nodes.echo_bridge = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        text: "迴響號的艦橋。星圖在主控台上緩緩旋轉,三個目的地的光點依你的進度明滅。",
        choices: [
            { text: "【座標已集齊】補全緘默之環的方位", show: { all: [{ flag: "song.vessari" }, { flag: "song.church" }, { flag: "song.relic" }] }, goto: "ch2_converge" },
            { text: "開啟星圖,前往下一個目的地", action: "starmap" },
            { text: "靠泊燈塔站:補給與採買", goto: "ch2_resupply" },
            { text: "在艦上與船員交談(小隊面板)", goto: "ch2_bridge_talk" }
        ]
    };
    nodes.ch2_resupply = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "迴響號靠上燈塔站七號泊架。老技師{卡爾}的加注管一如既往地先接上了你的船。環廊市場的喧囂隔著氣閘傳來。",
        choices: [
            { text: "補充燃料(每格 10 學分)", goto: "ch2_refuel" },
            { text: "環廊市場採買", shop: "lighthouse_market" },
            { text: "研究科技與製造", action: "tech" },
            { text: "返回艦橋", goto: "echo_bridge", effects: [{ system: "helios" }] }
        ]
    };
    nodes.ch2_refuel = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ refuel: 10 }],
        text: "加注管接上迴響號,流量表轉動起來。{卡爾}靠在泵旁,朝你點了點頭——你在燈塔站的信用,還記在他心裡。",
        choices: [
            { text: "再加一次", goto: "ch2_refuel" },
            { text: "返回補給選單", goto: "ch2_resupply" }
        ]
    };
    nodes.ch2_bridge_talk = {
        location: "echo_bridge", chapterLabel: CH,
        text: "你在狹窄的艦橋走道上停下。船員各自忙著——但你知道,這艘船上每個人都有還沒說完的故事。\n\n(提示:點右欄「⚔ 小隊」可調度出戰成員,並與夥伴交談以加深羈絆。)",
        choices: [
            { text: "回到艦橋", goto: "echo_bridge" }
        ]
    };

    /* ============================================================
       歌謠一:霧海星雲(維薩里 + 塞恩入隊)
       ============================================================ */
    nodes.arrive_mist = {
        location: "mist_anchorage", chapterLabel: CH, travel: true,
        text: "躍遷剛結束,霧海星雲就給了你一個下馬威——濃稠的電漿雲吞掉了大半儀表,雷達上,三個掠食般的光點正從雲層裡合圍過來。\n\n{凱菈}:「海盜!霧海的老規矩——先搶了再問是誰。抓穩!」",
        choices: [
            { text: "應戰!", shipCombat: "se_pirate" }
        ]
    };
    nodes.mist_02 = {
        location: "mist_anchorage", chapterLabel: CH,
        text: "海盜艇拖著煙鑽回雲層深處。你剛鬆一口氣,一道**船團的識別碼**就打上了迴響號的天線——是「舵」歐蕾的求援頻率救了你。\n\n一支流亡者導航船隊冒出雲海,護送你進入隱藏在星雲眼裡的**船團錨泊地**:數百艘拼裝船首尾相接,組成一座漂浮的城市。他們用歌謠導航,而那旋律,讓你掌心的碎片輕輕發燙。",
        choices: [
            { text: "登上錨泊地,尋找歌謠", goto: "mist_03" }
        ]
    };
    nodes.mist_03 = {
        location: "mist_anchorage", chapterLabel: CH,
        text: "船團母親{歐蕾}的姊妹在此接待你。聽明來意,她的神色複雜:「歌謠是維薩里的聖物。但完整記得它的,如今只剩一個人——而他，是被逐出船團的**叛徒**。」\n\n她指向錨泊地邊緣一艘孤零零的單人船:「{塞恩}。他為了跟外族學者交換星圖,把歌謠的片段賣了出去。族人不再與他說話。」\n\n「你想要歌謠,得去問他。但別指望我們幫你引見——**在維薩里,我們不提叛徒的名字。**」",
        choices: [
            { text: "前往塞恩的船", goto: "mist_04" }
        ]
    };
    nodes.mist_04 = {
        location: "mist_anchorage", chapterLabel: CH,
        text: "{塞恩}比你想像的年輕,眼睛卻像維薩里人特有的、盛著星圖的深色。他的船艙裡貼滿了手繪航圖,精密得驚人。\n\n「來看叛徒的?」他頭也不抬,「還是來買歌謠的?最近它突然搶手——上個月有個黑曜的女人也來問過。」他冷笑,「我把她趕走了。她眼神不對。」\n\n他終於抬頭,目光落在你的皮袋上,瞳孔驟然收縮:「……你帶著**鑰石**。真的鑰石。」他站起來,「那東西在你手裡響了多久了?你晚上,還睡得著嗎?」",
        choices: [
            { text: "「歌謠我要定了。開價吧。」", goto: "mist_05_deal" },
            { text: "「你也聽得見低語。」", goto: "mist_05_bond" },
            { text: "「你為什麼賣掉族人的聖物?」", tag: "洞察", check: { attr: "INT", dc: 12, success: "mist_05_truth", fail: "mist_05_deal" } }
        ]
    };
    nodes.mist_05_deal = {
        location: "mist_anchorage", chapterLabel: CH,
        text: "「開價?」塞恩搖頭,「你以為我缺錢?我缺的是**回家的路**。」\n\n他望向舷窗外的錨泊地,那座他再也回不去的漂浮城市:「歌謠不賣了。但——如果你真的要它,就帶我一起走。反正我在這裡,也只是等死。」",
        choices: [
            { text: "「上船吧。」", goto: "mist_06" }
        ]
    };
    nodes.mist_05_bond = {
        location: "mist_anchorage", chapterLabel: CH,
        onEnter: [{ set: "ch2.thane_bond" }],
        text: "塞恩沉默了很久。「……每個維薩里人都聽得見一點。那是我們血裡的東西。」他的聲音低下來,「但自從緘默之環那邊的『歌』變了調,我夜夜都被吵醒。它不再是搖籃曲了——它像**求救**。」\n\n「我賣掉歌謠片段,不是為了錢。」他看著你,「是為了拼湊出**它到底在求救什麼**。可我只有片段。而你,有鑰石。」\n\n他伸出手:「帶我走。我把完整的歌謠給你——我們一起,弄清楚那道弦為什麼在哭。」",
        choices: [
            { text: "握住他的手", goto: "mist_06" }
        ]
    };
    nodes.mist_05_truth = {
        location: "mist_anchorage", chapterLabel: CH,
        onEnter: [{ set: "ch2.thane_bond" }, { xp: 30 }],
        text: "你沒有指責,只是安靜地看著那些手繪航圖——每一張的邊緣,都標註著同一個座標:**緘默之環**。\n\n「你不是為了星圖賣掉歌謠,」你緩緩說,「你是在**追蹤那道變調的弦**。族人以為你背叛,其實你是唯一還在聽的人。」\n\n塞恩怔住了,眼眶泛紅。「……四年了。第一個這麼說的人。」他深吸一口氣,「歌謠是你的了。但我要跟你走——因為你手裡的鑰石,是我四年來離真相最近的一次。」",
        choices: [
            { text: "「歡迎上船,塞恩。」", goto: "mist_06" }
        ]
    };
    nodes.mist_06 = {
        location: "mist_anchorage", chapterLabel: CH,
        onEnter: [
            { party: "thane" }, { item: "data_core", qty: 1 },
            { set: "song.vessari" }, { quest: "q_ch2", op: "advance" }
        ],
        text: "塞恩閉上眼,唱起了維薩里的搖籃曲。\n\n那不是人類意義上的「歌」——音節在空氣裡凝成可見的銀色紋路,與你掌心的碎片共振。三段歌謠中的**第一段**,順著旋律烙進了鑰石的記憶裡。\n\n「這是『**歸巢調**』,」塞恩睜開眼,「織界者用它標記回家的路。可你聽——」他的聲音顫抖,「最後三個音,是**斷的**。有人,或有什麼東西,把回家的路截斷了。」\n\n{凱菈}在通訊器裡輕聲說:「一段到手。還有兩段。」",
        choices: [
            { text: "返回迴響號艦橋", goto: "echo_bridge", effects: [{ system: "helios" }] }
        ]
    };

    /* ============================================================
       歌謠二:聖詠星系(教會抉擇)
       ============================================================ */
    nodes.arrive_hymn = {
        location: "hymn_cathedral", chapterLabel: CH, travel: true,
        text: "聖詠星系只有一顆行星,行星只有一座建築:**軌道大教堂**——一座懸浮在恆星光環裡的巨構,由三百年來每一代信徒接力建成,尖塔指向緘默之環的方向。\n\n但今天的教堂不平靜。廣播頻道裡,兩種誦音在互相蓋過對方:一邊莊嚴,一邊狂熱。\n\n{鉚釘}:「**偵測到教義衝突。正統派主張『看守與警戒』;另一派……主張『迎接』。**」",
        choices: [
            { text: "降落,進入大教堂", goto: "hymn_02" }
        ]
    };
    nodes.hymn_02 = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "大祭司{安瑟姆}在中殿接見你——一位眼神清明的老人,袍角磨損,顯然親力親為。\n\n「你為歌謠而來。」他不等你開口,「我在你身上聞到鑰石的氣息。孩子,你來得正是時候,也正是**最壞的時候**。」\n\n他指向側殿,那裡傳來狂熱的誦唱:「我的門徒{珂黛},帶著『燃燈庭』分裂了出去。她讀了同一部經文,卻讀出了相反的意思——她認為織界者不是把噬淵**關在外面**,而是把它**請進來**當神。」\n\n「她要在今夜的儀式上,**打開聖物匣**——那裡封著第二段歌謠,也封著……某種不該醒來的東西。」",
        choices: [
            { text: "「我幫你阻止她。」", goto: "hymn_03_help" },
            { text: "「聖物匣裡到底是什麼?」", goto: "hymn_03_ask" }
        ]
    };
    nodes.hymn_03_ask = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "安瑟姆的臉色沉下來:「三百年前,教會的創始者從緘默之環帶回一枚『聽石』——它會把靠近的人心裡的低語**放大**。正統派封存它,是為了『看守警告』;珂黛想開啟它,是為了『聆聽神諭』。」\n\n「她不明白,」老人閉上眼,「那不是神諭。那是**噬淵的聲音**。放大它,等於在封印上,親手鑿開一個洞。」\n\n他握住你的手:「歌謠第二段,就刻在聽石的匣壁上。你要它,就得在珂黛打開匣子之前,先到那裡。」",
        choices: [
            { text: "「帶我去聖物匣。」", goto: "hymn_03_help" }
        ]
    };
    nodes.hymn_03_help = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ set: "ch2.hymn_started" }],
        text: "安瑟姆領你穿過側廊,狂熱的誦音越來越近。聖物匣所在的內殿門口,兩名**燃燈庭執燈者**攔住了去路,眼神因狂信而發亮。\n\n「褻瀆者止步。」為首者舉起燃燈杖,「珂黛聖女說了,鑰石的持有者,是『第一個該獻給神的祭品』。」\n\n身後,安瑟姆低聲道:「他們曾是我的孩子……我下不了手。但你——你必須過去。」",
        choices: [
            { text: "亮出正統教義,當眾駁斥他們的異端", show: { origin: "exile" }, tag: "星語逐徒", check: { attr: "CHA", dc: 12, success: "hymn_04_words", fail: "hymn_04_fight" } },
            { text: "以弦引者的共鳴,壓下他們腦中的低語", show: { class: "conductor" }, tag: "弦引者", check: { attr: "WIL", dc: 13, success: "hymn_04_words", fail: "hymn_04_fight" } },
            { text: "試著說服他們退讓", check: { attr: "CHA", dc: 15, success: "hymn_04_words", fail: "hymn_04_fight" } },
            { text: "沒時間廢話——強行突破", goto: "hymn_04_fight" }
        ]
    };
    nodes.hymn_04_words = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ xp: 40 }, { set: "ch2.hymn_peaceful" }],
        text: "你的話語——無論是引經據典,還是直接撫平他們腦中的雜音——像一盆冷水澆在狂熱上。\n\n兩名執燈者的眼神first次出現了動搖、恐懼、然後是清醒。燃燈杖垂了下去。\n\n「我們……我們剛才想做什麼?」為首者踉蹌後退,「那個聲音……它讓我們覺得那是對的……」\n\n他們讓開了路。安瑟姆在你身後低聲祝禱——為了他失而復得的孩子。",
        choices: [
            { text: "進入內殿,趕往聖物匣", goto: "hymn_05" }
        ]
    };
    nodes.hymn_04_fight = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "話語沒有用了。執燈者的燃燈杖亮起危險的紅光,側殿的狂信者聞聲湧來。\n\n{凱菈}拔槍:「安瑟姆,退後!剩下的交給我們。」",
        choices: [
            { text: "戰鬥,殺出一條路", combat: "enc_ch2_zealots" }
        ]
    };
    nodes.ch2_hymn_fight_win = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "最後一名狂信者被擊倒,昏迷前眼裡的紅光褪去,只剩茫然。安瑟姆蹲下身,替他們闔上眼,像個心碎的父親。\n\n「他們不是壞人。」老人的聲音很輕,「只是聽了太久那個聲音。」他站起身,擦掉眼角,「快,珂黛快到聖物匣了。」",
        choices: [
            { text: "衝進內殿", goto: "hymn_05" }
        ]
    };
    nodes.ch2_hymn_fight_lose = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "你在狂信者的圍攻下力竭倒地——但一聲蒼老的怒吼響起,安瑟姆竟親自持杖擋在你身前,替你擋下致命一擊。\n\n「走!」他嘶吼,「聖物匣!別讓珂黛……」\n\n你被{凱菈}拽起,踉蹌著衝進內殿,身後是老祭司孤身面對他失控的孩子們的背影。",
        choices: [
            { text: "衝進內殿", goto: "hymn_05" }
        ]
    };
    nodes.hymn_05 = {
        location: "hymn_cathedral", chapterLabel: CH,
        text: "內殿中央,燃燈者{珂黛}正將雙手按在**聖物匣**上。匣蓋已經開了一道縫,一縷黑霧從縫裡溢出,在她臉上投下扭曲的陰影——她笑著,眼裡卻在流淚。\n\n「你來遲了,鑰石的持有者。」她的聲音裡混著另一個聲音,「聽——它在唱歌。它說,它想我們了。它說,分離了四十萬年,終於可以**團圓**了……」\n\n匣縫裡的黑霧,正朝你掌心的鑰石伸來,像久別的手足。",
        choices: [
            { text: "撲上去,合上聖物匣", check: { attr: "STR", dc: 13, success: "hymn_06_close", fail: "hymn_06_hard" } },
            { text: "用鑰石反向壓制聽石的低語", show: { class: "conductor" }, tag: "弦引者", goto: "hymn_06_conductor" },
            { text: "對珂黛喊話,喚回她的理智", check: { attr: "CHA", dc: 15, success: "hymn_06_talk", fail: "hymn_06_hard" } }
        ]
    };
    nodes.hymn_06_close = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ erosion: 6 }],
        text: "你撲上去,雙手抵住匣蓋,用盡全身力氣往下壓。黑霧在你指縫間掙扎、尖嘯,冰冷刺骨的低語灌進你的顱骨——但你咬牙合上了它。\n\n喀。鎖扣歸位。內殿驟然安靜。\n\n珂黛癱倒在地,黑霧退去後,她臉上的狂熱也隨之潰散,只剩一個精疲力竭的、迷路的女人。",
        choices: [
            { text: "取下匣壁上的歌謠", goto: "hymn_07" }
        ]
    };
    nodes.hymn_06_hard = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ erosion: 10 }, { hp: -8 }],
        text: "黑霧趁隙暴湧,灌進你的口鼻。有那麼一瞬,你聽懂了它的歌——那是一種**甜美的、要你放棄一切的邀請**,幾乎讓你想鬆手。\n\n是{凱菈}的吼聲把你拉了回來。你嘶吼著,連人帶霧撞上匣蓋,用身體的重量把它砸回原位。鎖扣歸位的剎那,你嘗到了血的味道,和某種……**餘味**。\n\n珂黛癱軟在地。而你知道,有一小片那個聲音,已經**留在你心裡了**。",
        choices: [
            { text: "取下匣壁上的歌謠", goto: "hymn_07" }
        ]
    };
    nodes.hymn_06_conductor = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ set: "ch2.hymn_conductor" }, { xp: 30 }],
        text: "你沒有去碰匣子——你舉起鑰石,讓它**唱**。\n\n弦引者的共鳴從你胸腔湧出,鑰石的清音與聽石的黑霧在半空中相撞。兩種頻率激烈地纏鬥,你感覺自己像一根被兩端拉扯的弦——然後,你**贏了**。鑰石的音壓過了聽石,黑霧尖嘯著退回匣中，匣蓋自行闔上。\n\n珂黛瞪大眼睛看著你:「你……你能命令它?你是……**新的看守者**?」她眼中的狂熱,第一次被某種近乎敬畏的清醒取代。",
        choices: [
            { text: "取下匣壁上的歌謠", goto: "hymn_07" }
        ]
    };
    nodes.hymn_06_talk = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [{ set: "ch2.kodai_saved" }, { xp: 40 }],
        text: "「珂黛!」你喊出她的名字,不是異端的頭銜,「妳流淚了。如果那真的是神的愛,妳為什麼在哭?」\n\n她的動作僵住了。\n\n「妳聽見的不是團圓,是**飢餓**。」你放軟聲音,「它想我們?不——它想**吃了**我們。妳心裡那個真正的珂黛,一直都知道。」\n\n淚水終於決堤。她猛地把手從匣子上收回,黑霧失去引導,退回匣中。「我……我做了什麼……」她跪倒在地,聖女的偽裝碎成一個崩潰的信徒。安瑟姆蹣跚上前,抱住了他失而復得的門徒。",
        choices: [
            { text: "取下匣壁上的歌謠", goto: "hymn_07" }
        ]
    };
    nodes.hymn_07 = {
        location: "hymn_cathedral", chapterLabel: CH,
        onEnter: [
            { item: "data_core", qty: 1 },
            { set: "song.church" }, { quest: "q_ch2", op: "advance" }
        ],
        text: "聖物匣的匣壁上,銘刻著第二段歌謠。你讓鑰石貼近——**第二段旋律**烙進了它的記憶。\n\n這一段更加急促、更加不安,{鉚釘}透過通訊器辨識道:「**『警戒調』。用於標記封印張力異常。這段旋律的意思是……『它們正在靠近』。**」\n\n安瑟姆送你到教堂門口。「拿著這個。」他遞給你一枚教會通行徽記,「聖詠的門，從此為你而開。孩子——**替我們守住那道弦。**三百年來,這是我們唯一的職責,而我們幾乎忘了。」",
        choices: [
            { text: "返回迴響號艦橋", goto: "echo_bridge", effects: [{ system: "helios" }] }
        ]
    };

    /* ============================================================
       歌謠三:鐵冠星系(艦船戰 + 達克斯 + 遺跡)
       ============================================================ */
    nodes.arrive_ironcrown = {
        location: "ironcrown_edge", chapterLabel: CH, travel: true,
        text: "鐵冠星系被一層工業廢氣籠罩,恆星在污濁中只剩一團暗紅。這裡沒有中立地帶——每一條航道都掛著黑曜的旗號。\n\n迴響號才剛切出躍遷,一艘黑曜巡邏艦「隼」就咬住了你的尾流,武器艙全開,警告訊號蓋滿了頻道。\n\n{凱菈}冷冷道:「它們不會放我們走。躍遷通道被鎖了——**只能打**。」",
        choices: [
            { text: "迎戰黑曜巡邏艦!", shipCombat: "se_obsidian_patrol" }
        ]
    };
    nodes.ch2_ironrun_lose = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "迴響號的船體警報響成一片,你不得不點燃備用躍遷,狼狽地退回赫利俄斯。黑曜的巡邏艦沒有追擊——它們只是要把你**趕出去**。\n\n{凱菈}擦掉嘴角的血:「船修好再來。鐵冠不是能硬闖的地方。」",
        choices: [
            { text: "返回艦橋,重整旗鼓", goto: "echo_bridge", effects: [{ system: "helios" }] }
        ]
    };
    nodes.ch2_ironrun_win = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "巡邏艦「隼」在一連串爆炸中解體。你抓住短暫的雷達空窗,把迴響號塞進精煉廠外環的廢料帶,關掉一切訊源。\n\n{鉚釘}:「**織界遺跡訊號:精煉廠正下方。深度四百米。黑曜稱之為『深井』。**」\n\n「歌謠第三段在遺跡裡,」{凱菈}盯著掃描圖,「但整座精煉廠都是黑曜的。我們需要一條進去的路——最好,還需要一個**認識路的人**。」",
        choices: [
            { text: "潛入外環,尋找門路", goto: "iron_03" }
        ]
    };
    nodes.iron_03 = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "外環的廢料帶棲息著鐵冠的邊緣人——被黑曜榨乾又丟棄的礦工、走私客、通緝犯。在一間用貨櫃改的酒館裡,一個獨眼男人正把腳翹在桌上擦他的長程狙擊槍,槍身上刻著十七道刻痕。\n\n他頭也不抬:「別站在我的光線裡。除非你是來付錢的——我是{達克斯},人稱『野犬』。這一帶的門路,沒有我不認識的。」\n\n他終於瞥了你一眼,目光掃過你的裝備,忽然瞇起獨眼:「等等……你這張臉。黑曜的通緝令上,新掛的那個。**懸賞夠我退休了。**」",
        choices: [
            { text: "「那筆賞金,黑曜永遠不會付。跟我合作更划算。」", tag: "交涉", check: { attr: "CHA", dc: 13, success: "iron_04_deal", fail: "iron_04_fight" } },
            { text: "「流亡者船團的『舵』歐蕾,是我的朋友。」", show: { origin: "scavenger" }, tag: "拾荒者", goto: "iron_04_ove" },
            { text: "亮出武器:「試試看能不能活著領賞。」", goto: "iron_04_fight" }
        ]
    };
    nodes.iron_04_ove = {
        location: "ironcrown_edge", chapterLabel: CH,
        onEnter: [{ set: "ch2.dax_ove" }],
        text: "達克斯放下了槍。「歐蕾?」他的獨眼閃過一絲複雜,「三年前是她把我從黑曜的礦坑裡撈出來的。我欠船團一條命。」\n\n他嘆了口氣,把腳從桌上放下來:「該死。欠船團的人情,比黑曜的賞金重。」他站起身，「說吧,你要去哪?我警告你——如果是精煉廠底下那個『會唱歌的洞』,那地方**連黑曜自己人都不敢下去**。」",
        choices: [
            { text: "「就是那裡。深井。」", goto: "iron_05" }
        ]
    };
    nodes.iron_04_deal = {
        location: "ironcrown_edge", chapterLabel: CH,
        onEnter: [{ xp: 30 }],
        text: "達克斯盯著你看了很久,然後大笑起來:「黑曜的賞金……你說得對,那幫吸血鬼從沒付清過任何人的錢,包括我的。」\n\n他把長槍往肩上一扛:「我喜歡務實的人。算我一份——不過我的價碼不是錢。」他的獨眼閃著光,「我要親眼看看黑曜藏在地底的秘密。他們毀了鐵冠,總得讓我知道,是為了什麼。」",
        choices: [
            { text: "「跟我來。」", goto: "iron_05" }
        ]
    };
    nodes.iron_04_fight = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "你的挑釁話音未落,酒館後方湧出一小隊真正的黑曜巡邏兵——原來達克斯早把你的行蹤賣了,坐等你們兩敗俱傷。\n\n「別介意,」獨眼男人聳肩,退到一邊,「我先看看你們幾斤幾兩。活下來,再談合作。」",
        choices: [
            { text: "先解決黑曜的巡邏兵", combat: "enc_ch2_hounds" }
        ]
    };
    nodes.ch2_iron_ground_lose = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "你在混戰中被打倒——但槍聲忽然從側面炸響,黑曜巡邏兵一個接一個倒下。達克斯的長槍還在冒煙。\n\n「行了行了,別死。」他嫌棄地把你拽起來,「你們是廢物,但**敢跟黑曜動手的廢物**不多。算我一份。」",
        choices: [
            { text: "喘口氣,商議潛入", goto: "iron_05" }
        ]
    };
    nodes.ch2_iron_ground_win = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "最後一名黑曜兵倒下。達克斯緩緩鼓掌,獨眼裡的算計變成了興味。\n\n「漂亮。」他把長槍扛上肩,「你們過關了。黑曜的賞金我不要了——比起錢,我更想看看他們藏在地底的鬼東西。算我一份。」",
        choices: [
            { text: "商議潛入深井", goto: "iron_05" }
        ]
    };
    nodes.iron_05 = {
        location: "ironcrown_edge", chapterLabel: CH,
        onEnter: [{ party: "dax" }],
        text: "{達克斯}領你們鑽進一條廢棄的礦渣輸送管——黑曜的地圖上不存在的老通道,直通精煉廠地基。\n\n越往下,空氣越冷,那股**弦鳴**越清晰。管壁上開始出現織界者的紋路,與黑曜粗暴的鑽孔痕跡並存,像新傷疊在舊神的身上。\n\n輸送管的盡頭,豁然開朗——你們站在了「**深井**」的邊緣。",
        choices: [
            { text: "俯瞰深井", goto: "iron_06" }
        ]
    };
    nodes.iron_06 = {
        location: "ironcrown_edge", chapterLabel: CH,
        onEnter: [{ erosion: 5 }],
        text: "「深井」不是礦坑——是一座**倒插進地底的織界者神廟**,黑曜在它周身架滿了鷹架、切割機和監測儀,像螞蟻爬滿一具沉睡的神體。\n\n神廟的核心懸浮著一枚巨大的**共鳴體**,黑曜的切割臂正一寸寸地從它身上剝取「樣品」。每剝一次,整座井就發出一聲痛苦的、玻璃般的弦鳴——而每一聲弦鳴,都讓你掌心的鑰石劇烈地發燙。\n\n{達克斯}倒抽一口氣:「原來……原來他們在這裡養了一頭神。」\n\n{鉚釘}的聲音第一次帶著近似憤怒的失真:「**這是主錨點的姊妹結構。他們在肢解它。每一次切割,都在削弱弦網。**第三段歌謠,就銘刻在共鳴體的基座上。」",
        choices: [
            { text: "潛下去,取得歌謠", goto: "iron_07" }
        ]
    };
    nodes.iron_07 = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "你們趁著切割機的噪音掩護,攀下鷹架,潛到共鳴體的基座旁。近距離看,那些「樣品」切口滲出的不是金屬,而是**凝固的音**——黑曜正在把織界者的封印,加工成武器。\n\n基座的銘文近在眼前。就在你伸手的瞬間,一段黑曜的內部廣播在井壁間迴盪:\n\n「**……深井計畫最終階段,琴撥武器化樣品即將移交。感謝卡爾榭執行長的遠見……**」\n\n{凱菈}的呼吸驟然凝固。「卡爾榭。」她一字一句地說,那是她沉了整艘晨星號都要追查的名字,「**是她。**」",
        choices: [
            { text: "先取歌謠,舊帳稍後再算", goto: "iron_08" },
            { text: "拉住凱菈:「不是現在。我們會回來的。」", tag: "羈絆", goto: "iron_08_kaila", effects: [{ affinity: "kaila", val: 1 }] }
        ]
    };
    nodes.iron_08_kaila = {
        location: "ironcrown_edge", chapterLabel: CH,
        text: "你的手按住凱菈緊繃的肩膀。她僵了幾秒,眼裡的殺意慢慢沉澱成更冷、更持久的東西。\n\n「……你說得對。」她深吸一口氣,「一個人衝進去,只會白白送死,還取不到歌謠。」她看你一眼,那目光裡第一次有了近乎信任的重量,「但我記住了。晨星號的每一個船員,我都記著。**總有一天,在弦心,或在她的辦公室——我要親口問她。**」",
        choices: [
            { text: "取得基座上的歌謠", goto: "iron_08" }
        ]
    };
    nodes.iron_08 = {
        location: "ironcrown_edge", chapterLabel: CH,
        onEnter: [
            { item: "data_core", qty: 2 }, { item: "void_shard", qty: 1 },
            { set: "song.relic" }, { set: "ch2.knows_kalshe" }, { quest: "q_ch2", op: "advance" }
        ],
        text: "你將鑰石貼近基座銘文。**第三段旋律**湧入——但這一段幾乎不成調,充滿了斷裂與痛苦,像一個被活活肢解的人發出的、破碎的呻吟。\n\n{鉚釘}艱難地辨識:「**『……錨定調』。用於……固定封印的核心。這段旋律……本體不忍卒聽。他們每切一刀,就毀掉一個音節。**」\n\n三段歌謠,終於在鑰石中匯聚。它們不再是三段殘缺的旋律——合起來,是一句完整的、來自四十萬年前的話。\n\n井底的切割機還在轟鳴。你們帶著三段歌謠和沉重的真相,悄然退回輸送管。**該離開這座活體神廟了。**",
        choices: [
            { text: "撤離鐵冠,返回艦橋", goto: "echo_bridge", effects: [{ system: "helios" }] }
        ]
    };

    /* ============================================================
       匯合:補全座標 → 第三章
       ============================================================ */
    nodes.ch2_converge = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ quest: "q_ch2", op: "advance" }],
        text: "迴響號的艦橋一片寂靜。你把鑰石放上主控台的感應座,三段歌謠——歸巢調、警戒調、錨定調——第一次**完整地**唱響。\n\n銀色的紋路在艦橋的空氣裡編織成型,凝成一幅立體的星圖:所有的音節,最終匯聚成一個清晰的座標。\n\n{鉚釘}的鏡頭亮到極致:「**座標解算完成。緘默之環——主錨點『第一弦』。**」它頓了頓,聲音低下來,「**同時解讀出歌謠的完整訊息。翻譯如下：**」\n\n艦橋的燈光暗了下來。四十萬年前的話,透過一台四百歲機器的口,一字一句地響起:\n\n「**弦斷之處,它在聽。**\n**看守者啊,若你聽見這首歌,說明網已破,而我們……已不在了。**\n**去第一弦。那裡有我們最後的選擇。**」",
        choices: [
            { text: "「織界者……最後的選擇是什麼?」", goto: "ch2_converge2" }
        ]
    };
    nodes.ch2_converge2 = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ unlock: "mutering" }, { chapter: 3 }, { xp: 200 }, { set: "ch2.finished" }],
        text: "沒有人回答得了這個問題。\n\n{凱菈}望向星圖上緘默之環的方向——那裡,黑曜的深井正在肢解弦網;那裡,珂黛聽見的飢餓之聲正越來越響;那裡,有守夜人 VIGIL 沉睡了四十萬年的主錨點。\n\n「不管那是什麼,」她握緊拳頭,「答案在第一弦。」\n\n{塞恩}輕聲哼起歸巢調的最後三個音——那斷掉的三個音,如今在他喉間,第一次接上了。他睜開濕潤的眼:「回家的路……我找到了。」\n\n你將航向鎖定緘默之環。掌心的鑰石不再灼燙,而是安穩地、堅定地搏動著,像終於找到了方向的心跳。\n\n**幽弦星區的真相,就在弦的另一端等著你。**",
        choices: [
            { text: "—— 第二章 完 ——", goto: "ch2_fin" }
        ]
    };
    nodes.ch2_fin = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        text: "感謝遊玩《星淵迴響》第二章〈弦上的低語〉(M3 里程碑)。\n\n本階段內容:科技樹與製造、艦船對戰、夥伴好感與小隊調度、開放式三段歌謠(維薩里/教會/遺跡任意順序)、塞恩與達克斯入隊、深井與卡爾榭陰謀線揭露。\n\n接下來的 M4–M5 里程碑:第三章〈守夜人〉與 VIGIL 對峙、第四章〈裂隙〉災變結盟、第五章〈弦心〉與四種結局。\n\n你可以繼續自由航行探索、調度小隊與研究科技,或重新開始體驗其他出身。",
        choices: [
            { text: "開啟星圖,自由航行", action: "starmap" },
            { text: "建立新角色", action: "newGame" },
            { text: "回到主選單", action: "mainMenu" }
        ]
    };

    /* ============================================================
       夥伴交談節點(小隊面板 → 交談)
       ============================================================ */
    function talk(id, text, choices) {
        nodes["talk_" + id] = {
            location: "echo_bridge", chapterLabel: CH,
            text: text,
            choices: choices || [{ text: "(結束交談)", action: "resume" }]
        };
    }
    talk("kaila",
        "{凱菈}正在保養她的制式手槍——晨星號沉沒後,這是她僅存的舊物。\n\n「別用那種眼神看我。」她沒抬頭,「我還沒準備好講晨星號的事。」她頓了頓,「但……謝謝你在鐵冠拉住我。衝動會害死人,這道理我教過我的船員,自己卻差點忘了。」",
        [
            { text: "「妳準備好的時候,我都在。」", effects: [{ affinity: "kaila", val: 1 }], goto: "talk_kaila_end" },
            { text: "(點頭,結束交談)", action: "resume" }
        ]
    );
    nodes.talk_kaila_end = {
        location: "echo_bridge", chapterLabel: CH,
        text: "凱菈難得地笑了一下,雖然很淡。「……你這人,比外表看起來麻煩。」她把擦好的槍插回槍套,「這是稱讚。去忙吧。」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };
    talk("rivet",
        "{鉚釘}靜靜立在艦橋角落,幽藍的鏡頭望著舷窗外的星海。\n\n「**本體在整理記憶。**」它說,「**四百年的維護日誌。大部分是空白——沒有需要維護的東西,也沒有需要對話的人。**」鏡頭轉向你,「**現在日誌又開始有內容了。本體……不確定該如何歸類這種狀態。人類稱之為什麼?**」",
        [
            { text: "「那叫『不再孤單』。」", effects: [{ affinity: "rivet", val: 1 }], goto: "talk_rivet_end" },
            { text: "「那叫『有伴』。」", effects: [{ affinity: "rivet", val: 1 }], goto: "talk_rivet_end" }
        ]
    );
    nodes.talk_rivet_end = {
        location: "echo_bridge", chapterLabel: CH,
        text: "{鉚釘}的鏡頭光環柔和地閃爍了一下。\n\n「**……已歸類。標記為:優先保護項目。**」它轉回舷窗,「**謝謝你,持有者。本體會記住這個詞。**」",
        choices: [{ text: "(結束交談)", action: "resume" }]
    };
    talk("thane",
        "{塞恩}趴在他的手繪航圖上,如今這些圖攤滿了迴響號的半個艦橋。\n\n「以前族人說我背叛,」他輕聲說,「現在我卻在幫一個外族人找回家的路。」他抬頭看你,「但你知道嗎?歸巢調的最後三個音接上的那一刻,我夢見了我母親。她沒有罵我。她在……**等我回家**。」",
        [
            { text: "「等我們解開這一切,我陪你回船團。」", effects: [{ affinity: "thane", val: 1 }], action: "resume" },
            { text: "「你從來都不是叛徒。」", effects: [{ affinity: "thane", val: 1 }], action: "resume" }
        ]
    );
    talk("dax",
        "{達克斯}在擦他的長槍,槍身上那十七道刻痕在艙燈下泛著冷光。\n\n「知道這些刻痕是什麼嗎?」他頭也不抬,「不是我殺的人。是我沒能救的人。」他難得地沉默了一下,「黑曜毀了鐵冠,毀了我認識的每一個好人。所以別把我當英雄——我跟你走,是因為我想親眼看著那幫吸血鬼**付出代價**。」",
        [
            { text: "「那我們的目標一致。」", effects: [{ affinity: "dax", val: 1 }], action: "resume" },
            { text: "(遞給他一瓶酒,結束交談)", action: "resume" }
        ]
    );

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
