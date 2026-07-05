/* ============================================================
   chapter1.js — 第一章〈墜落的信標〉(M2)
   燈塔站樞紐(歐蕾/巴魯與 RIVET/酒吧/市場/船塢)→
   重返賽壬・信標遺址 → 裂隙獸首戰 →「封印在漏」。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    /* ---------- 地點 ---------- */
    Object.assign(D.locations = D.locations || {}, {
        helios_lighthouse: { name: "燈塔站・環廊", sub: "赫利俄斯星系・中立空間站" },
        siren_beacon: { name: "墜毀信標遺址", sub: "賽壬星系・無人峽谷" }
    });

    /* ---------- 任務 ---------- */
    Object.assign(D.quests = D.quests || {}, {
        q_ch1: {
            title: "墜落的信標",
            type: "main",
            stages: [
                { objective: "前往燈塔站,找到賈維口中的「舵」歐蕾" },
                { objective: "尋找能解讀織界者機械的人(舊貨攤)" },
                { objective: "返回迴響號,啟程前往賽壬星系" },
                { objective: "調查墜毀信標遺址" },
                { objective: "帶著真相活著離開" }
            ]
        },
        q_side_meds: {
            title: "環廊的藥箱",
            type: "side",
            stages: [
                { objective: "把蘿希的藥箱送到船塢的卡爾手上" }
            ]
        }
    });

    /* ---------- 遭遇 ---------- */
    Object.assign(D.encounters = D.encounters || {}, {
        enc_ch1_drones: {
            title: "沉睡的警戒圈",
            enemies: [{ id: "drone_sentry", row: "front" }, { id: "drone_sentry", row: "back" }],
            victory: "ch1_site_03", defeat: "ch1_site_03d"
        },
        enc_ch1_rift: {
            title: "裂隙獸",
            enemies: [{ id: "rift_spawn", row: "front" }, { id: "rift_maw", row: "front" }, { id: "rift_spawn", row: "back" }],
            victory: "ch1_site_08", defeat: "ch1_site_08d"
        }
    });

    const nodes = {};
    const CH = "第一章〈墜落的信標〉";

    /* ============================================================
       抵達節點(星圖跳躍入口)
       ============================================================ */
    nodes.arrive_helios = {
        location: "helios_lighthouse", chapterLabel: CH, travel: true,
        text: "燈塔站懸在赫利俄斯的恆星風裡,像一座用亮著燈的骨頭搭成的城市——三十層環廊繞著古老的聚變核旋轉,數百艘船隻進進出出,不問來歷。\n\n**在幽弦星區,所有航線都經過燈塔站;所有秘密,也是。**",
        choices: [
            { text: "進入環廊", goto: "ch1_hub" },
            { text: "開啟星圖,前往其他星系", action: "starmap" }
        ]
    };
    nodes.arrive_siren = {
        location: "siren_dawnport", chapterLabel: CH, travel: true,
        text: "賽壬星在舷窗裡緩緩轉動。曙光港的方向依然瀰漫著薄煙——黑曜的「清理行動」之後,港區進入了戒嚴。**你暫時回不去了。**\n\n但迴響號的感應器捕捉到另一個座標的微弱回波:峽谷深處,那座墜毀的信標,正以與你口袋裡的碎片**相同的頻率**低鳴。",
        choices: [
            { text: "降落信標遺址", show: { quest: { id: "q_ch1", gte: 3, done: false } }, goto: "ch1_site_01" },
            { text: "遺址已經靜默,再看一眼", show: { quest: { id: "q_ch1", done: true } }, goto: "ch1_site_revisit" },
            { text: "開啟星圖,前往其他星系", action: "starmap" }
        ]
    };

    /* ============================================================
       第一章開場(承接序章)
       ============================================================ */
    nodes.ch1_01 = {
        location: "echo_ship", chapterLabel: CH,
        onEnter: [{ quest: "q_ch1", op: "start" }],
        text: "迴響號的躍遷引擎穩定下來之後,你才有空看清這艘船:艙壁上貼滿褪色的航線圖,置物櫃裡塞著半瓶沒喝完的烈酒,駕駛座的皮革被同一雙手磨出了四十年的凹痕。\n\n{凱菈}在副駕調出星圖:「賈維說的『舵』歐蕾——流亡者船團在燈塔站的話事人。老頭用最後一口氣把你交給她,**她就是下一條線索**。」\n\n她的手指停在赫利俄斯星系上:「跳一次,燃料兩格。這船的油箱就這麼點大,以後**每一格都要精打細算**。」",
        choices: [
            { text: "躍遷:赫利俄斯星系(燃料 −2)", goto: "ch1_02", effects: [{ fuel: -2 }, { system: "helios" }] }
        ]
    };
    nodes.ch1_02 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "躍遷的光尾散去,燈塔站撞進你的視野——三十層環廊像亮著燈的年輪,包裹著一顆六百年前的殖民聚變核。接駁頻道裡混著十幾種語言的討價還價。\n\n{凱菈}熟練地報上一個假船籍。「燈塔站不問來歷,」她說,「但**記性很好**。我們動作快點。」\n\n迴響號滑入七號泊架。環廊的氣味隔著氣閘湧進來:香料、機油、和人多的地方特有的、活著的味道。",
        choices: [{ text: "踏上環廊", goto: "ch1_hub" }]
    };

    /* ============================================================
       燈塔站樞紐
       ============================================================ */
    nodes.ch1_hub = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "燈塔站第七環廊。攤販的燈牌層層疊疊,賞金獵人的告示屏和教會的佈道彩窗掛在同一面牆上。流亡者的孩子從你腳邊追逐跑過,一名黑曜制服的採購員在對面攤位驗貨——**沒有人多看誰一眼,這就是燈塔站的規矩。**\n\n你要去哪?",
        choices: [
            { text: "找「舵」歐蕾——賈維留下的線索", show: { quest: { id: "q_ch1", gte: 1, lte: 1 } }, goto: "ch1_ove_01" },
            { text: "舊貨攤「巴魯的寶庫」——歐蕾說的解讀者", show: { quest: { id: "q_ch1", gte: 2, lte: 2 } }, goto: "ch1_riv_01" },
            { text: "返回迴響號,啟程賽壬", show: { quest: { id: "q_ch1", gte: 3, done: false } }, goto: "echo_dock" },
            { text: "斷骨酒吧——打聽情報", goto: "ch1_bar" },
            { text: "環廊市場——採買補給", shop: "lighthouse_market" },
            { text: "船塢與燃料補給", goto: "ch1_dock" },
            { text: "返回迴響號", show: { quest: { id: "q_ch1", done: true } }, goto: "echo_dock" }
        ]
    };

    /* ---------- 「舵」歐蕾 ---------- */
    nodes.ch1_ove_01 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "「舵」的辦公室藏在第七環廊背面,門口沒有招牌,只掛著一截船團傳統的**斷纜結**。\n\n{歐蕾}比你想像的年輕,但她看人的眼神像看了一百年的航線。聽到賈維的名字,她沉默了很久,久到你以為她要趕人。\n\n「老賈維……」她終於開口,替你們倒了三杯船團的私釀,「他欠我兩批貨和一次命。現在人死了,**帳算到你頭上**——說吧,他讓你帶什麼來?」",
        choices: [
            { text: "把織界者碎片放到桌上", goto: "ch1_ove_02" },
            { text: "先問清楚:「妳跟賈維到底什麼關係?」", goto: "ch1_ove_01b" }
        ]
    };
    nodes.ch1_ove_01b = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "「二十年前,聯邦掃蕩走私航線,我全家的船被扣在曙光港。」{歐蕾}轉著杯子,「賈維把我們一家七口藏在他的貨艙夾層裡,運出封鎖線。**沒收錢。**」\n\n「船團的人不欠人情——欠了,就用一輩子還。」她抬眼看你,「所以老頭讓你來找我,你在我這裡的信用,就是他的信用。**別浪費。**」",
        choices: [{ text: "把織界者碎片放到桌上", goto: "ch1_ove_02" }]
    };
    nodes.ch1_ove_02 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "碎片一離開皮袋,{歐蕾}辦公室的燈**齊齊閃了一下**。\n\n她的表情第一次出現裂縫。「……收起來。快。」她起身拉下窗簾,壓低聲音:「船團的老歌謠裡叫這種東西『**鑰石**』——織界者的遺物,整個星區挖出來的不超過五枚,**每一枚都讓碰過它的人死得很難看**。」\n\n「黑曜為它血洗曙光港,我不意外。」她盯著你的皮袋,「我不懂它。但這站上有個人,收了一輩子織界者的破爛——環廊底層,舊貨攤『巴魯的寶庫』。**去找他,別提我的名字。**」",
        choices: [
            { text: "「賈維最後說,要我『看看星區的真相』。」", goto: "ch1_ove_03" }
        ]
    };
    nodes.ch1_ove_03 = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ quest: "q_ch1", op: "advance" }, { set: "ch1.met_ove" }],
        text: "「真相?」{歐蕾}笑了一聲,不太像笑,「老頭到死都是這樣。」\n\n她從抽屜取出一枚舊式訊標,拋給你:「船團的求援頻率。你替賈維把事情查到底,船團就是你的港口——**任何一座**。」\n\n「還有,」她在你出門前補了一句,「幾年前賽壬的峽谷裡**墜過一座『星星』**,墜下來之前,整個星區的躍遷航道抖了三天。黑曜第一時間封鎖了現場。你手裡那枚鑰石在往哪裡拉你,自己感覺得到吧?」",
        choices: [{ text: "回到環廊", goto: "ch1_hub" }]
    };

    /* ---------- 巴魯與 RIVET ---------- */
    nodes.ch1_riv_01 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "「巴魯的寶庫」塞在環廊底層兩根冷卻管之間,與其說是店,不如說是一場**有標價的坍方**:斷裂的銘文碑、氧化的合金環、真假難辨的「織界者聖物」堆到天花板。\n\n店主{巴魯}是個圓滾滾的老頭,正在給一尊半人高的**古董機器人**除鏽。那機器人的樣式你從沒見過——太優雅,不像人類的工業品;太結實,不像裝飾品。機殼上,某任前主人用油漆潦草地寫了兩個字:**鉚釘**。\n\n「隨便看!」巴魯頭也不抬,「除了這台鐵疙瘩,都能賣!它是我的鎮店之寶,躺了四百年,**沒醒過**。」",
        choices: [{ text: "走近那台機器人", goto: "ch1_riv_02" }]
    };
    nodes.ch1_riv_02 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "你在機器人面前站定的瞬間,皮袋裡的碎片**燙了起來**。\n\n喀。\n\n一聲輕響,像四百年的鎖鬆開了。機器人的光學鏡頭依次亮起——不是人類機械的紅或藍,而是一種你在信標碎片裡見過的**幽藍**。它緩緩抬頭,鏡頭聚焦在你的皮袋上。\n\n「**調諧鑰・第七序列・迴響體。**」它開口了,聲音像老舊管風琴,「**確認持有者。確認……錨點失聯。錨點失聯。錨點失聯——**」\n\n{巴魯}手裡的除鏽刷「哐啷」掉在地上。",
        choices: [
            { text: "「你認得這塊碎片?」", goto: "ch1_riv_03" },
            { text: "後退一步,手按上武器", goto: "ch1_riv_02b" }
        ]
    };
    nodes.ch1_riv_02b = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "機器人注意到你的戒備,鏡頭光圈**縮小成溫和的細環**——一個刻意為之的、表達無害的動作。\n\n「**本體職能:維護與修復。本體不具備攻擊協議。**」它攤開雙手,掌心的工具介面向上,像一種古老的投降姿勢,「**四百年來,本體只是……找不到需要維護的東西了。**」\n\n不知為何,這句話聽起來**孤獨得不像機器**。",
        choices: [{ text: "「你認得這塊碎片?」", goto: "ch1_riv_03" }]
    };
    nodes.ch1_riv_03 = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "「**認得。它是『鑰』,本體是『匠』。**」機器人的鏡頭轉向你,「**鑰在呼叫它的鎖。座標:此星域第三行星,你們稱之『賽壬』。信標墜落之地。**」\n\n「**警告:鑰離鎖太久,鎖已開始遺忘。遺忘的鎖,會讓不該進來的東西……**」它停頓了很久,像在四百年的記憶裡翻找一個詞,「**……聽見。**」\n\n{凱菈}與你交換了一個眼神。{巴魯}在一旁掰著手指,顯然在心算這台「鎮店之寶」現在值多少錢。",
        choices: [
            { text: "「跟我們走。帶我們去信標。」", goto: "ch1_riv_04" },
            { text: "先跟巴魯談價錢", goto: "ch1_riv_03b" }
        ]
    };
    nodes.ch1_riv_03b = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "{巴魯}的開價高得離譜,然後在機器人自己站起來、拍掉身上四百年的灰、逕自走向你的那一刻,**跌成了零**。\n\n「它、它自己要走?!」老頭目瞪口呆,「四十年!我給它上油上了四十年!」\n\n「**感謝維護。**」機器人向他鄭重地一躬身,「**帳單將以服務抵付:本體已修復閣下店內十七件標示錯誤的贗品。清單已傳送。祝生意興隆。**」\n\n巴魯看著清單,臉色由紅轉白——那十七件是他標價最高的「真品」。",
        choices: [{ text: "帶著鉚釘離開舊貨攤", goto: "ch1_riv_04" }]
    };
    nodes.ch1_riv_04 = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ party: "rivet" }, { quest: "q_ch1", op: "advance" }, { set: "ch1.rivet_joined" }],
        text: "機器人——**鉚釘**,它接受了這個名字,「**前任維護者的命名權應予尊重**」——邁著四百年不曾生鏽的步伐,跟上了你。\n\n「**本體職能:維護、修復、解讀。**」它向你正式報到,「**目標:護送鑰返回鎖。然後……**」鏡頭的幽藍光環閃爍了一下,「**……本體希望知道,錨點為何失聯。四百年,無人應答。**」\n\n{凱菈}低聲對你說:「一台會說『希望』的四百年機器。**我不知道該覺得可靠,還是該覺得毛骨悚然。**」",
        choices: [{ text: "回到環廊,準備啟程", goto: "ch1_hub" }]
    };

    /* ---------- 斷骨酒吧(情報與支線) ---------- */
    nodes.ch1_bar = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "斷骨酒吧的招牌是一根真的肋骨——據說來自某隻撞穿過站體的深空生物。吧檯後,{蘿希}一邊擦杯子一邊同時跟三桌客人吵架,精準得像多線程處理器。\n\n「新面孔,」她瞥你一眼,「喝的還是問的?**問的比較貴。**」",
        choices: [
            { text: "「最近星區有什麼風聲?」", goto: "ch1_bar_news" },
            { text: "「黑曜集團在忙什麼?」", goto: "ch1_bar_obsidian" },
            { text: "「有活可以接嗎?」", show: { not: { flag: "ch1.meds_taken" } }, goto: "ch1_bar_meds" },
            { text: "回到環廊", goto: "ch1_hub" }
        ]
    };
    nodes.ch1_bar_news = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ set: "ch1.heard_news" }],
        text: "「風聲?」{蘿希}嗤了一聲,「躍遷航道這半年抖得像老人的手,聯邦說是恆星風。**放屁。**跑霧海的船團老手都說,星雲深處這幾個月一直有『歌聲』——聲納聽得到、儀器錄不下來的那種。」\n\n「還有,」她壓低聲音,「上個月起,**做惡夢的人變多了**。夢的內容都一樣:一根斷掉的弦。你說怪不怪?」\n\n你口袋裡的碎片,輕輕震了一下。",
        choices: [{ text: "繼續打聽", goto: "ch1_bar" }]
    };
    nodes.ch1_bar_obsidian = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ set: "ch1.heard_obsidian" }],
        text: "{蘿希}的目光快速掃過周圍,才開口:「黑曜這半年**瘋了一樣**在買兩種東西:深空探測器,和『古物』。鐵冠的礦道聽說挖穿了什麼不得了的東西,整個星系的安檢等級翻了三倍。」\n\n「曙光港的事聽說了吧?官方口徑是『海盜』。」她冷笑,「**海盜開著黑曜的巡邏艦?**這年頭連謊都懶得編圓了。」",
        choices: [{ text: "繼續打聽", goto: "ch1_bar" }]
    };
    nodes.ch1_bar_meds = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ quest: "q_side_meds", op: "start" }, { item: "med_crate", qty: 1 }, { set: "ch1.meds_taken" }],
        text: "「有。」{蘿希}從吧檯下拖出一只貼著醫療標誌的合金箱,「船塢的老卡爾,女兒在下環廊發燒三天了,站醫的藥貴得像搶劫。這是我私下調的一批——**替我送去,他在七號泊架的燃料站。**」\n\n她多倒了一杯酒推給你:「跑腿費卡爾會給。這杯算我的——**燈塔站不常有願意跑腿的新面孔。**」",
        choices: [{ text: "收下藥箱", goto: "ch1_bar" }]
    };

    /* ---------- 船塢 ---------- */
    nodes.ch1_dock = {
        location: "helios_lighthouse", chapterLabel: CH,
        text: "七號泊架的燃料站永遠排著隊。迴響號趴在泊架上,舷梯旁的加注管像老藤一樣垂著。\n\n站長{卡爾}是個佝僂的老技師,正對著一張處方單發呆。",
        choices: [
            { text: "把蘿希的藥箱交給卡爾", show: { item: "med_crate" }, goto: "ch1_dock_meds" },
            { text: "補充燃料(每格 10 學分)", goto: "ch1_dock_fuel" },
            { text: "回到環廊", goto: "ch1_hub" }
        ]
    };
    nodes.ch1_dock_meds = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [
            { item: "med_crate", qty: -1 },
            { quest: "q_side_meds", op: "complete" },
            { credits: 60 }, { xp: 30 }, { set: "ch1.meds_done" }
        ],
        text: "{卡爾}打開藥箱的手在發抖。他數出六十學分硬塞給你,又從工具櫃裡摸出一張皺巴巴的優惠憑證:\n\n「蘿希那丫頭……替我謝謝她。」老人抹了把臉,「以後你的船進七號泊架,**加注管永遠先接你的。**」\n\n消息傳得很快——當晚,環廊裡至少有三個攤販主動對你點了頭。**在燈塔站,信用比學分值錢。**",
        choices: [{ text: "回到船塢", goto: "ch1_dock" }]
    };
    nodes.ch1_dock_fuel = {
        location: "helios_lighthouse", chapterLabel: CH,
        onEnter: [{ refuel: 10 }],
        text: "加注管接上迴響號的側舷,老舊的流量表開始轉動。{卡爾}靠在泵旁,順口告訴你一句船塢的老話:\n\n「**油箱半滿的船長活得久**——因為他永遠在想著下一站。」",
        choices: [
            { text: "再加一次", goto: "ch1_dock_fuel" },
            { text: "回到船塢", goto: "ch1_dock" }
        ]
    };

    /* ---------- 返回迴響號 / 啟程 ---------- */
    nodes.echo_dock = {
        location: "echo_ship", chapterLabel: CH, travel: true,
        text: "迴響號的艙門在你身後合攏,環廊的喧囂被隔成遙遠的低鳴。\n\n{凱菈}已經在副駕跑完了航前檢查;{鉚釘}——如果它在隊上——正安靜地站在貨艙角落,幽藍的鏡頭望著舷窗外的星海,像在數一件你看不見的東西。\n\n星圖在主控台上展開,等待你的航向。",
        choices: [
            { text: "開啟星圖,設定航向", action: "starmap" },
            { text: "回到環廊", goto: "ch1_hub" }
        ]
    };

    /* ============================================================
       信標遺址(賽壬)
       ============================================================ */
    nodes.ch1_site_01 = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ quest: "q_ch1", op: "advance" }],
        text: "峽谷像一道被巨斧劈開的傷口。迴響號降落在谷口,你們沿著多年前那場墜落犁出的溝壑步行深入——溝壑的盡頭,**信標**斜插在岩層裡。\n\n它有半座塔樓那麼高,通體是與碎片相同的黑色材質,表面流動著早已黯淡的紋路。即使折斷、傾頹、埋了半截,它依然讓人想到一個詞:**神像**。\n\n{鉚釘}的鏡頭光環縮到最細:「**錨點通報器・第七序列。損毀狀態:嚴重。損毀原因:**」它停頓了一下,「**……外部武器射擊。高軌道。精確瞄準。**」\n\n谷底散落著人類的預製板房——一座被匆匆廢棄的營地,黑曜的標誌被風沙磨得半淡。",
        choices: [
            { text: "先搜索黑曜營地", goto: "ch1_site_02" },
            { text: "直接前往信標的裂口", goto: "ch1_site_04" }
        ]
    };
    nodes.ch1_site_02 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "營地至少廢棄了兩三年:桌上的合成咖啡杯還立著,人員名牌散落一地,撤離得**倉皇而徹底**。營地中央的主控終端還連著備用電源,螢幕上黑曜的標誌緩慢旋轉。\n\n幾架哨戒無人機癱在充電樁上,積著厚灰——**看起來**已經斷電很久了。",
        choices: [
            { text: "駭入主控終端,調出營地日誌", check: { attr: "INT", skill: "hacking", dc: 12, success: "ch1_site_02a", fail: "ch1_site_02b" } },
            { text: "翻找營地的剩餘物資", goto: "ch1_site_02c" },
            { text: "不節外生枝,前往信標裂口", goto: "ch1_site_04" }
        ]
    };
    nodes.ch1_site_02a = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ item: "data_core", qty: 2 }, { set: "ch1.knows_obsidian" }, { xp: 30 }],
        text: "終端的加密是軍規的,但維護密碼還是出廠預設——黑曜的承包商永遠在這種地方省錢。日誌在你眼前展開:\n\n「**D-17:樣品切割完成。第七信標的核心組件今日運離,目的地:鐵冠,深井設施。**」\n「**D-19:切割面出現異常聲學現象。三名工人報告『夢見弦』。醫療隔離。**」\n「**D-22:總部命令:立即撤離,現場封存。理由等級:黑。**」\n\n最後一條日誌是手動輸入的,沒有署名:「**我們不該碰它。它斷掉之後,夜裡的天空在響。**」\n\n你抽出兩枚還插在讀取槽裡的資料核心。",
        choices: [{ text: "前往信標裂口", goto: "ch1_site_04" }]
    };
    nodes.ch1_site_02b = {
        location: "siren_beacon", chapterLabel: CH,
        text: "你的入侵觸發了一道你沒料到的防線——**營地的警戒協議根本沒有關閉,只是在沉睡。**\n\n充電樁上的「積灰殘骸」同時亮起紅色識別燈,抖落灰塵,懸浮而起。",
        choices: [{ text: "迎戰甦醒的警戒圈!", combat: "enc_ch1_drones" }]
    };
    nodes.ch1_site_02c = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ item: "scrap_alloy", qty: 2 }, { item: "stim_patch", qty: 1 }],
        text: "你在板房裡翻出兩塊完好的合金板和一片沒過期的急救貼片。\n\n但當你搬開最後一只置物箱時,箱底的震動感應器發出一聲**遲鈍的蜂鳴**——充電樁方向,積灰的無人機殘骸裡,有什麼東西亮起了紅燈。",
        choices: [
            { text: "壓低身形,緩慢退出感應範圍", check: { attr: "AGI", dc: 12, success: "ch1_site_02e", fail: "ch1_site_02d" } },
            { text: "趁它們還沒完全啟動,先發制人", combat: "enc_ch1_drones" }
        ]
    };
    nodes.ch1_site_02d = {
        location: "siren_beacon", chapterLabel: CH,
        text: "你退到一半,腳跟碾碎了一塊風化的板材——脆響在死寂的峽谷裡像一聲槍響。\n\n兩架哨戒無人機同時完成啟動自檢,升空,鎖定。",
        choices: [{ text: "迎戰!", combat: "enc_ch1_drones" }]
    };
    nodes.ch1_site_02e = {
        location: "siren_beacon", chapterLabel: CH,
        text: "你們像退潮一樣無聲地滑出感應圈。紅燈閃爍了十幾秒,終究沒有等到第二個觸發訊號,悻悻地暗了下去。\n\n{凱菈}在安全距離外吐出一口氣:「**沉睡三年還在站崗。**黑曜對這地方到底有多不放心?」",
        choices: [{ text: "前往信標裂口", goto: "ch1_site_04" }]
    };
    nodes.ch1_site_03 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "最後一架無人機拖著黑煙栽進沙地。{鉚釘}俯身拆下它們的識別模組,鏡頭光環轉了半圈——它的某種情緒表達方式,你開始學著讀懂了。\n\n「**警戒單元的最後接收指令,時間戳:三年前。指令內容:攔截一切接近信標核心的目標。**」它抬起頭,「**包括黑曜自己的員工。**」\n\n他們封存的不是營地。**是他們自己捅出來的洞。**",
        choices: [{ text: "前往信標裂口", goto: "ch1_site_04" }]
    };
    nodes.ch1_site_03d = {
        location: "siren_beacon", chapterLabel: CH,
        text: "你在耳鳴中醒來,{凱菈}正把你拖進一塊岩簷的陰影裡,她自己的護甲也焦了一片。\n\n「無人機打完彈藥就返航充電了,」她把最後一片急救貼片拍在你身上,「**老式警戒協議的漏洞——它們的火力配額比我們的命短。**」\n\n你們在陰影裡喘勻了氣,繞開充電樁,朝信標逼近。",
        choices: [{ text: "前往信標裂口", goto: "ch1_site_04" }]
    };
    nodes.ch1_site_04 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "信標的基座上有一道**人為切割**的裂口——黑曜取走「樣品」的地方,切割面光滑得像鏡子。裂口通向信標內部,但深處被一道**依然完好的內層艙門**封著,門面上流動的紋路與你的碎片同源。\n\n你靠近的瞬間,碎片在皮袋裡劇烈地發起熱來——**它到家了。**",
        choices: [
            { text: "以弦引者的共鳴,順著紋路「撥」開它", show: { class: "conductor" }, tag: "弦引者", goto: "ch1_site_05a" },
            { text: "讀出門上的織界者銘文", show: { origin: "exile" }, tag: "星語逐徒", goto: "ch1_site_05a" },
            { text: "讓鉚釘對接門禁協議,你來旁路加密", check: { attr: "INT", skill: "hacking", dc: 14, success: "ch1_site_05a", fail: "ch1_site_05b" } },
            { text: "沿著切割裂口硬撬出一條通道", check: { attr: "STR", dc: 14, success: "ch1_site_05a", fail: "ch1_site_05b" } }
        ]
    };
    nodes.ch1_site_05a = {
        location: "siren_beacon", chapterLabel: CH,
        text: "艙門無聲地向兩側收攏,像一雙讓開的手。\n\n{鉚釘}的鏡頭光環亮得前所未有:「**四百年。本體四百年沒有聽過『歡迎』協議了。**」",
        choices: [{ text: "走進信標內部", goto: "ch1_site_05" }]
    };
    nodes.ch1_site_05b = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ hp: -5 }, { set: "ch1.noisy_entry" }],
        text: "艙門對粗暴的手段做出了粗暴的回應——一道防禦脈衝把你掀翻在地,掌心焦麻。\n\n但門終究是老了。第二次嘗試,它呻吟著讓出一道僅容一人的縫隙。{凱菈}把你拉起來:「**下次,先讓機器人試。**」",
        choices: [{ text: "側身擠進信標內部", goto: "ch1_site_05" }]
    };
    nodes.ch1_site_05 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "信標內部沒有走廊,沒有階梯——只有一個**教堂般的空腔**,四壁流動著銀灰色的紋路,像凝固的樂譜。你們的腳步聲被某種力量溫柔地吸掉了,整個空間安靜得像在**屏息**。\n\n空腔中央懸著信標的核心結構:一組同心圓環,其中一環上有一道**猙獰的空缺**——黑曜切走「樣品」的位置。整組圓環因此微微失衡地旋轉著,像一顆缺了瓣膜的心臟。\n\n{鉚釘}的聲音第一次出現雜訊:「**錨點・第七序列。職能:監聽弦網張力,異常時向主錨點通報。現況:通報功能,永久靜默。**」\n\n「所以三年前它墜落之前,」{凱菈}緩緩接上,「**它是想通報什麼。而有人不想讓它說完。**」",
        choices: [{ text: "走向核心圓環", goto: "ch1_site_06" }]
    };
    nodes.ch1_site_06 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "圓環的內側,有一個**拳頭大的凹槽**。形狀你再熟悉不過——你口袋裡那枚碎片,就是從這裡誕生的。\n\n碎片已經燙得像一顆小太陽。它想回去。**哪怕只是一瞬間。**\n\n{鉚釘}:「**警告:對接將喚醒殘存記錄。訊息量……不可預估。**」",
        choices: [
            { text: "放入碎片,敞開心神傾聽一切", goto: "ch1_site_06a", effects: [{ erosion: 8 }, { set: "ch1.listened" }] },
            { text: "放入碎片,同時死死守住自己的意識", check: { attr: "WIL", dc: 12, success: "ch1_site_06b", fail: "ch1_site_06c" } }
        ]
    };
    nodes.ch1_site_06a = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ set: "ch1.vision_full" }, { xp: 40 }],
        text: "碎片落槽的剎那,整座信標**醒了**一秒。\n\n一秒鐘裡,你看見了一切:**橫跨整個星區的弦網**,億萬條光弦在星系之間繃緊、震顫、歌唱;八個巨大的錨點像心臟一樣搏動——然後你看見其中一個,在**緘默之環**的方向,弦線一根、一根、一根地**斷開**;看見斷口滲出的黑暗裡,有什麼東西把「耳朵」貼了上來——\n\n**它在聽。它聽了很久了。**\n\n幻象斷開。你跪在地上,七竅裡都是弦鳴的餘音。碎片彈回你的掌心,溫馴,且**更亮了**。\n\n{凱菈}扶住你:「你消失了整整十秒。**你看見什麼了?**」",
        choices: [{ text: "「緘默之環。封印在斷。」", goto: "ch1_site_07" }]
    };
    nodes.ch1_site_06b = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ set: "ch1.vision_brief" }, { xp: 40 }],
        text: "你像握住高壓線一樣握住自己的意識,只容許幻象**流過**,不容許它**駐留**。\n\n畫面因此只有殘章:一張橫跨星區的**弦之網**;一個方向的弦在斷——{鉚釘}事後根據你的描述比對星圖,座標指向**緘默之環**;以及一個感覺,與其說是看見不如說是被看見:\n\n**弦斷之處,有什麼東西在聽。**\n\n碎片彈回你的掌心。你站得穩穩的,只是指尖在微微發抖。",
        choices: [{ text: "「緘默之環。封印在斷。」", goto: "ch1_site_07" }]
    };
    nodes.ch1_site_06c = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ erosion: 5 }, { set: "ch1.vision_brief" }, { xp: 40 }],
        text: "你想守住意識的堤防,但幻象是**海**。\n\n斷續的畫面硬灌進來:弦網、斷弦、緘默之環的方向、以及貼在黑暗彼端的、無法名狀的**注意力**——你在某個瞬間清晰地感覺到,**它注意到你了**,像深水裡的什麼東西循著手電筒的光束回望。\n\n你踉蹌著抽回手,鼻血滴在信標的地面上,被銀灰的紋路悄無聲息地吸收了。\n\n{鉚釘}的鏡頭光環第一次轉成警戒的窄縫:「**建議:立即離開。『注意』是雙向的。**」",
        choices: [{ text: "「緘默之環。封印在斷……快走。」", goto: "ch1_site_07" }]
    };
    nodes.ch1_site_07 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "話音未落,信標深處傳來一聲**玻璃碎裂般的脆響**——但碎的不是玻璃,是**空間本身**。\n\n空腔的一角,空氣裂開一道懸浮的傷口,傷口的邊緣像燒焦的底片一樣捲曲。從那個**不應該存在的角度**裡,有什麼東西擠了出來:先是一條肢體,再是一團輪廓不斷變化的軀體,像一幅每一幀都畫錯的動畫。\n\n{鉚釘}的警告聲第一次帶上了近似恐懼的失真:「**裂隙生物。弦網未涵蓋之物。攻擊協議……本體很抱歉,本體需要臨時編寫攻擊協議——**」\n\n{凱菈}已經開了保險:「**編快點!**」",
        choices: [{ text: "戰鬥!守住信標空腔!", combat: "enc_ch1_rift" }]
    };
    nodes.ch1_site_08 = {
        location: "siren_beacon", chapterLabel: CH,
        text: "最後一隻裂隙獸在你們的火力下**散開**——不是死亡,更像一段錯誤的旋律被強行按停。空間的裂口失去支撐,像傷口般緩慢地癒合了。\n\n寂靜落回空腔。然後你們聽見了**咳嗽聲**。\n\n信標的角落,一堆保溫毯和空水袋之間,躺著一個瘦得脫形的男人,穿著褪色的黑曜技師服。他至少在這裡**藏了三年**。\n\n「你們……打贏了它們……」他的眼睛因長期黑暗而畏光,卻死死抓住你的袖子,「聽著、聽著——**封印在漏**。我們鑿的洞……在鐵冠,在『深井』……樣品會唱歌,他們還在切、還在切——**它們順著歌聲找過來了……**」",
        choices: [
            { text: "「你是誰?『深井』是什麼?」", goto: "ch1_site_08b" },
            { text: "先給他急救貼片", goto: "ch1_site_08c" }
        ]
    };
    nodes.ch1_site_08d = {
        location: "siren_beacon", chapterLabel: CH,
        text: "你被那團錯誤的輪廓掀飛,意識沉入黑暗——\n\n然後,**弦鳴**。\n\n你掌心的碎片爆發出一聲貫穿顱骨的清音。裂隙獸像被燙到的手一樣**整團縮回**裂口,空間的傷口在鳴響中強行癒合。{凱菈}把你從地上拖起來,臉色慘白:「它們**怕**這塊石頭……不,不對——」\n\n{鉚釘}替她說完:「**它們不被允許傷害『鑰』的持有者。目前還不被允許。**」\n\n角落裡,傳來一陣虛弱的咳嗽聲——有人在這座信標裡,藏了很久。",
        choices: [{ text: "循聲走去", goto: "ch1_site_08" }]
    };
    nodes.ch1_site_08b = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ set: "ch1.wade_named" }],
        text: "「沃德。切割組……前切割組組長。」他慘笑,「撤離那天,我看到了運輸艦的**真正艙單**——樣品的目的地不是研究所,是**武器實驗室**。我跑了。跑進這座他們最不敢回來的信標裡。」\n\n「三年,我聽著它每天晚上**漏氣一樣地響**。」他指著核心圓環上那道空缺,手抖得不成樣子,「深井在鐵冠,礦都的地下。他們管樣品叫**『琴撥』**。孩子,他們不是在研究它——**他們在學怎麼撥斷剩下的弦。**」",
        choices: [{ text: "帶沃德離開信標", goto: "ch1_site_09" }]
    };
    nodes.ch1_site_08c = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [{ item: "stim_patch", qty: -1 }, { affinity: "kaila", val: 1 }, { set: "ch1.wade_helped" }],
        text: "急救貼片的凝膠滲進皮膚,男人的呼吸終於平穩了些。{凱菈}看你的眼神柔和了一瞬——在這條見慣了棄子的航線上,**先救人再問話**的人不多了。\n\n「沃德,」他緩過氣來,自報家門,「黑曜前切割組組長。你想知道的,我路上全告訴你們——只求一件事,**帶我離開這座會響的墳墓。**」",
        choices: [{ text: "帶沃德離開信標", goto: "ch1_site_09" }]
    };
    nodes.ch1_site_09 = {
        location: "siren_beacon", chapterLabel: CH,
        onEnter: [
            { quest: "q_ch1", op: "advance" }, { quest: "q_ch1", op: "complete" },
            { xp: 150 }, { credits: 50 }, { chapter: 2 }, { set: "ch1.finished" }
        ],
        text: "迴響號爬升,信標的峽谷在舷窗裡縮成一道疤。\n\n沃德蜷在貨艙的毯子裡沉沉睡去——三年來第一次不用聽著「漏氣的弦」入眠。{鉚釘}把新編寫的「攻擊協議 v1.0」默默歸檔,備註欄寫著:「**希望永不再用。**」\n\n{凱菈}在星圖前站了很久。緘默之環的座標懸在那裡,像一枚沒有引信的炸彈;鐵冠的方向,「深井」兩個字底下是黑曜的整支艦隊。\n\n「賈維要你看的**真相**,」她終於開口,「比老頭自己想的還要大。」\n\n你握緊掌心的調諧鑰。它安靜地搏動著,與你的心跳漸漸同步——**弦斷之處,它在聽。而現在,你也在聽了。**",
        choices: [{ text: "—— 第一章 完 ——", goto: "ch1_fin" }]
    };
    nodes.ch1_fin = {
        location: "echo_ship", chapterLabel: CH, travel: true,
        text: "第一章的塵埃落定。沃德的證詞、信標的幻象、掌心的調諧鑰——所有線索都指向同一個方向:**緘默之環**,以及埋在鐵冠地底的「深井」。\n\n但緘默之環的座標並不完整。要補齊它,{凱菈}說,你需要找到那些**還記得織界者的人**。",
        choices: [
            { text: "▸ 第二章〈弦上的低語〉", goto: "ch2_01" },
            { text: "回到主選單(進度已自動存檔)", action: "mainMenu" }
        ]
    };
    nodes.ch1_site_revisit = {
        location: "siren_beacon", chapterLabel: CH, travel: true,
        text: "信標靜靜地插在峽谷裡。核心空腔的圓環依然缺著一角,依然失衡地旋轉,但那道空間的傷口沒有再裂開——**暫時**。\n\n{鉚釘}對著它靜立了很久,像在守一場沒有人聽得見的靈。",
        choices: [
            { text: "返回軌道,開啟星圖", action: "starmap" }
        ]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
