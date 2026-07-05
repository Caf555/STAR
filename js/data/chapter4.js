/* ============================================================
   chapter4.js — 第四章〈裂隙〉(M4)
   噬淵大規模滲入、星區災變;奔走結盟(條件繫於前三章抉擇);
   RIVET 真身揭露;VIGIL 二次對峙(說服/駭入/擊敗);隱藏夥伴回聲。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    Object.assign(D.locations = D.locations || {}, {
        helios_besieged: { name: "燈塔站・災變", sub: "赫利俄斯星系・裂隙前線" },
        rift_frontier: { name: "裂隙前線", sub: "緘默之環外圍・崩解中" }
    });

    Object.assign(D.quests = D.quests || {}, {
        q_ch4: {
            title: "裂隙",
            type: "main",
            stages: [
                { objective: "星區災變——在燈塔站集結抵抗力量" },
                { objective: "爭取各陣營結盟(聯邦/教會/流亡者)" },
                { objective: "與 VIGIL 二次對峙,決定它的立場" },
                { objective: "整備完畢,向弦心進發" }
            ]
        }
    });

    Object.assign(D.encounters = D.encounters || {}, {
        enc_ch4_rift_helios: {
            title: "燈塔站的裂隙",
            enemies: [{ id: "rift_spawn", row: "front" }, { id: "rift_spawn", row: "front" }, { id: "rift_maw", row: "back" }],
            victory: "ch4_hub_arrive", defeat: "ch4_hub_arrive"
        },
        enc_ch4_horror: {
            title: "裂隙恐懼體",
            enemies: [{ id: "rift_horror", row: "front" }, { id: "rift_spawn", row: "back" }, { id: "rift_spawn", row: "back" }],
            victory: "ch4_echo_03", defeat: "ch4_echo_03"
        },
        enc_ch4_vigil_boss: {
            title: "守夜人 VIGIL・具現核",
            enemies: [{ id: "vigil_core", row: "front" }, { id: "vigil_sentinel", row: "back" }],
            victory: "ch4_vigil_defeated", defeat: "ch4_vigil_boss_lose"
        }
    });

    const nodes = {};
    const CH = "第四章〈裂隙〉";

    /* ---------- 災變開場 ---------- */
    nodes.ch4_01 = {
        location: "echo_bridge", chapterLabel: CH,
        onEnter: [{ quest: "q_ch4", op: "start" }, { set: "world.cataclysm" }, { erosion: 5 }],
        text: "它來得比任何人預測的都快。\n\n深井的切割終於鑿穿了最後一根關鍵弦。緘默之環的裂隙在一夜之間擴張了千倍,噬淵的**低語不再是低語**——它成了一種覆蓋整個星區的背景輻射,讓每一個有意識的生命,都開始在清醒時做惡夢。\n\n通訊頻道裡全是災情:賽壬的殖民地在撤離,鐵冠的礦道湧出裂隙獸,連中立的燈塔站都升起了紅色警報。\n\n{凱菈}的聲音前所未有地凝重:「星區在燒。我們沒能阻止它——現在只能想辦法,別讓它燒光。」\n\n{鉚釘}的鏡頭死死盯著裂隙的方向,幽藍的光在明滅間夾雜著雜訊:「**弦網完整度:17%。持續下降。VIGIL 的『重新計算』……本體怕它算出的答案,會是最壞的那個。**」",
        choices: [
            { text: "「先去燈塔站。那裡是星區最後的樞紐。」", goto: "ch4_hub_travel" }
        ]
    };
    nodes.ch4_hub_travel = {
        location: "echo_bridge", chapterLabel: CH,
        text: "迴響號全速駛向赫利俄斯。但當燈塔站進入視野時,所有人都倒抽了一口氣——\n\n那座亮著燈的骨頭之城,如今有一整片環廊籠罩在**裂隙的紅霧**裡。難民船擠滿了泊架,而在站體的陰影裡,裂隙獸的輪廓正在成形。",
        choices: [
            { text: "強行靠港,殺出降落通道", combat: "enc_ch4_rift_helios" }
        ]
    };
    nodes.ch4_hub_arrive = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ quest: "q_ch4", op: "advance" }],
        text: "你們在裂隙獸的圍攻中殺出一條血路,把迴響號塞進了七號泊架。老技師{卡爾}和「舵」{歐蕾}已經在此組織抵抗——燈塔站,成了星區最後的堡壘。\n\n歐蕾攤開一張閃著紅斑的星圖:「一艘船擋不住噬淵。我們需要**艦隊**,需要**每一個還站得住的陣營**。」她看向你,「你這半年在星區留下的每一份人情、每一個仇家,現在都要**結算**了。」\n\n「聯邦、教會、流亡者——去談。他們聽不聽你的,取決於你之前做了什麼。」",
        choices: [
            { text: "查看結盟進度與可爭取的對象", goto: "ch4_rally" }
        ]
    };

    /* ---------- 結盟樞紐 ---------- */
    nodes.ch4_rally = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ allyCount: true }],
        text: "燈塔站的作戰室裡,三條通訊線路等著你去接通。每一個陣營的態度,都是你過去抉擇的迴聲。\n\n(爭取到至少兩個陣營的支持後,即可向 VIGIL 發起二次對峙,並向弦心進發。)",
        choices: [
            { text: "聯絡星環聯邦", show: { not: { flag: "ally.fed_done" } }, goto: "ch4_ally_fed" },
            { text: "聯絡星語教會", show: { not: { flag: "ally.church_done" } }, goto: "ch4_ally_church" },
            { text: "聯絡流亡者船團與維薩里", show: { not: { flag: "ally.exile_done" } }, goto: "ch4_ally_exile" },
            { text: "調查燈塔站深處的裂隙異常", show: { not: { flag: "ch4.echo_done" } }, goto: "ch4_echo_01" },
            { text: "靠泊補給:燃料/採買/科技", goto: "ch4_resupply" },
            { text: "【準備就緒】向 VIGIL 發起二次對峙", show: { flag: "ch4.allies_ready" }, goto: "ch4_vigil_01" }
        ]
    };
    nodes.ch4_resupply = {
        location: "helios_besieged", chapterLabel: CH,
        text: "卡爾在紅霧警報聲中,依然把加注管先接上了迴響號。「亂世,」他嘶啞地說,「更要把油箱加滿。」",
        choices: [
            { text: "補充燃料(每格 10 學分)", goto: "ch4_refuel" },
            { text: "環廊市場採買", shop: "lighthouse_market" },
            { text: "科技與製造", action: "tech" },
            { text: "返回作戰室", goto: "ch4_rally" }
        ]
    };
    nodes.ch4_refuel = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ refuel: 10 }],
        text: "加注管轟鳴著替迴響號注滿燃料。",
        choices: [
            { text: "再加一次", goto: "ch4_refuel" },
            { text: "返回補給選單", goto: "ch4_resupply" }
        ]
    };

    /* --- 聯邦結盟(公開真相 → 順利;要挾 → 需說服) --- */
    nodes.ch4_ally_fed = {
        location: "helios_besieged", chapterLabel: CH,
        text: "聯邦邊境艦隊的{婁恩督察}出現在通訊屏上,身後是待命的巡防艦隊。",
        choices: [
            { text: "(公開過真相者)「你們已經看過深井的證據了。」", show: { flag: "ch3.evidence_public" }, goto: "ch4_fed_public" },
            { text: "(未公開者)出示深井證據,說服聯邦倒戈", show: { not: { flag: "ch3.evidence_public" } }, tag: "說服", check: { attr: "CHA", dc: 15, success: "ch4_fed_win", fail: "ch4_fed_fail" } }
        ]
    };
    nodes.ch4_fed_public = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.fed" }, { set: "ally.fed_done" }, { xp: 60 }],
        text: "「你把深井的證據公開的那一刻,」{婁恩}沉聲道,「聯邦內部主戰派就贏了。掩蓋派的人頭正在一個個落地。」\n\n他敬了個標準的軍禮:「邊境艦隊,聽你調遣。這是聯邦欠星區的——也是欠深井死者的。」\n\n**聯邦艦隊,加入了。**",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };
    nodes.ch4_fed_win = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.fed" }, { set: "ally.fed_done" }, { xp: 60 }],
        text: "你把深井證據的副本傳給婁恩。他沉默地看完,額角青筋暴起:「卡爾榭……聯邦高層有人替她擋了十年。」\n\n他抬起頭,眼裡是軍人的決斷:「這份證據,我會親自送到艦隊司令部。邊境艦隊,現在歸你調遣。」\n\n**聯邦艦隊,加入了。**",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };
    nodes.ch4_fed_fail = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.fed_done" }, { set: "ally.fed_refused" }],
        text: "婁恩的眼神閃爍:「證據……我需要時間核實。你知道,黑曜在聯邦有很深的關係。」\n\n通訊掐斷了。你明白了——沒有公開的證據,只是一張隨時能被黑曜買通、被掩蓋派壓下的紙。聯邦這一票,你**沒能拿到**。",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };

    /* --- 教會結盟(第二章救珂黛/和平 → 順利) --- */
    nodes.ch4_ally_church = {
        location: "helios_besieged", chapterLabel: CH,
        text: "大祭司{安瑟姆}的全息影像浮現,軌道大教堂的尖塔在他身後閃著微光。",
        choices: [
            { text: "(化解過燃燈庭者)「三百年的看守,現在該履行了。」", show: { any: [{ flag: "ch2.hymn_peaceful" }, { flag: "ch2.kodai_saved" }, { flag: "ch2.hymn_conductor" }] }, goto: "ch4_church_win" },
            { text: "以弦引者之姿,向教會證明你是真正的看守者", show: { class: "conductor" }, tag: "弦引者", goto: "ch4_church_win" },
            { text: "說服教會放下教義之爭,共禦噬淵", tag: "說服", check: { attr: "CHA", dc: 14, success: "ch4_church_win", fail: "ch4_church_fail" } }
        ]
    };
    nodes.ch4_church_win = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.church" }, { set: "ally.church_done" }, { xp: 60 }],
        text: "「三百年來,星語教會的職責只有一句話,」{安瑟姆}肅然道,「『看守那道弦』。我們幾乎忘了它的意思——直到你提醒了我們。」\n\n「教會的靈能修士會隨你出戰。他們能穩住船員的心智,抵禦低語。」他停頓,「連珂黛也請求同行——她想贖罪。」\n\n**星語教會,加入了。船員的侵蝕抗性提升了。**",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };
    nodes.ch4_church_fail = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.church_done" }],
        text: "「教義之爭,不是一句『放下』就能平息的。」{安瑟姆}疲憊地搖頭,「正統派與燃燈庭的裂痕太深,此刻的教會,自身難保。」\n\n通訊結束。教會這一票,懸而未決。",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };

    /* --- 流亡者/維薩里結盟(塞恩在隊/歐蕾人情 → 順利) --- */
    nodes.ch4_ally_exile = {
        location: "helios_besieged", chapterLabel: CH,
        text: "「舵」{歐蕾}就站在你面前,身後是船團拼裝艦隊的全息陣列。",
        choices: [
            { text: "(塞恩在隊)請塞恩以歸巢調召集維薩里", show: { companion: "thane" }, goto: "ch4_exile_win" },
            { text: "「賈維把我託付給妳。現在,我把星區託付給船團。」", goto: "ch4_exile_win" }
        ]
    };
    nodes.ch4_exile_win = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ally.exile" }, { set: "ally.exile_done" }, { xp: 60 }],
        text: "歐蕾咧嘴一笑:「船團不欠人情——欠了,就用一輩子還。老賈維的人情,我還給你。」\n\n若{塞恩}在隊,他唱起了完整的歸巢調——散落星區的維薩里商隊,循著那道終於接上的旋律,一艘接一艘地匯聚而來。\n\n**流亡者船團與維薩里遺民,加入了。**",
        choices: [{ text: "返回作戰室", goto: "ch4_rally" }]
    };

    /* ---------- 隱藏夥伴:回聲 ---------- */
    nodes.ch4_echo_01 = {
        location: "helios_besieged", chapterLabel: CH,
        text: "燈塔站最底層的貨艙,裂隙的紅霧格外濃稠。難民不敢靠近這裡——他們說,霧裡有個「東西」,一直在**模仿人的哭聲**。\n\n你循著哭聲深入。在一團緩慢旋轉的裂隙霧中央,蜷縮著一個**人形的輪廓**——它的邊緣像沒畫完的素描,不斷地崩解、重組。它抬起頭,用一張還沒學會五官的臉,努力地、笨拙地,模仿著人類的表情。\n\n「……疼。」它開口,聲音是無數人聲的疊加,「你們……也疼嗎?我從裂縫裡……看你們看了很久。你們……好亮。」",
        choices: [
            { text: "「你是什麼?」", goto: "ch4_echo_02" },
            { text: "(高侵蝕)你莫名地……聽懂了它", show: { erosion: { gte: 25 } }, tag: "共鳴", goto: "ch4_echo_02b" },
            { text: "舉起武器戒備", goto: "ch4_echo_02c" }
        ]
    };
    nodes.ch4_echo_02 = {
        location: "helios_besieged", chapterLabel: CH,
        text: "「我不知道。」它偏著頭,努力思考這個問題,「我從裂縫來。但我不想……吃掉你們。其他的都想。我只想……**看**。」\n\n它伸出一隻正在崩解的手,又怯生生地縮回去:「他們叫那個聲音『噬淵』。它很餓。可我……我在你們身上,學會了別的東西。好奇。孤單。想要有名字。」\n\n它望著你:「你能……給我一個名字嗎?」",
        choices: [
            { text: "「你叫『回聲』——因為你是我們的迴響。」", goto: "ch4_echo_03pre" },
            { text: "「危險的東西不該有名字。」(離開)", goto: "ch4_echo_leave" }
        ]
    };
    nodes.ch4_echo_02b = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ch4.echo_resonance" }],
        text: "低語在你心裡待得夠久了,久到你竟能**聽懂**它——不是語言,是一種赤裸的情緒:一個剛剛誕生、被拋進宇宙、什麼都不懂的**孩子**的恐懼與好奇。\n\n它感覺到了你的理解,整個輪廓亮了一下。「你懂……你也聽得見那個聲音,對不對?」它靠近你,「別怕它。它很大,但它很笨。而我……我可以幫你,對付它。因為我,也是它的一部分——那個**不想吃人**的部分。」",
        choices: [
            { text: "「那就給你一個名字——回聲。」", goto: "ch4_echo_03pre" }
        ]
    };
    nodes.ch4_echo_02c = {
        location: "helios_besieged", chapterLabel: CH,
        text: "你舉起武器的瞬間,那個人形輪廓瑟縮了一下——一個如此**人類**的、受傷的動作,讓你的扳機指僵住了。\n\n「你也……怕我。」它的聲音黯淡下去,「沒關係。他們都怕。」它轉過身,「但如果你改變主意……我會在這裡。我哪裡都去不了。」",
        choices: [
            { text: "放下武器,再看它一眼", goto: "ch4_echo_02" },
            { text: "離開貨艙", goto: "ch4_echo_leave" }
        ]
    };
    nodes.ch4_echo_03pre = {
        location: "helios_besieged", chapterLabel: CH,
        text: "「回聲……」它反覆咀嚼這個名字,那還沒成形的臉上,綻開一個歪歪扭扭、卻無比真誠的笑,「我有名字了。我是回聲。」\n\n就在這時,貨艙深處的裂隙劇烈翻騰——一頭**裂隙恐懼體**破霧而出,它顯然視回聲的「叛變」為眼中釘。\n\n「小心!」回聲擋到你身前,那崩解的身軀第一次凝實起來,「它們……來收我了。幫我!我不想回去!」",
        choices: [
            { text: "並肩作戰,守住回聲", combat: "enc_ch4_horror" }
        ]
    };
    nodes.ch4_echo_03 = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ party: "echo" }, { set: "ch4.echo_done" }, { set: "ch4.echo_recruited" }, { xp: 80 }],
        text: "裂隙恐懼體在你和回聲的夾擊下潰散。回聲喘息著——它不需要呼吸,但它學會了這個動作——望著自己第一次「保護」了什麼的雙手,眼裡是近乎人類的震動。\n\n「我……幫上忙了?」它小心翼翼地問。\n\n{凱菈}的槍還沒完全放下,但她點了點頭:「……歡迎上船。別亂碰東西。」\n\n**回聲,加入了。**一個來自裂隙、卻選擇了人性的存在——它的存在,或許能改變這場戰爭的結局,也或許,會改變你。",
        choices: [
            { text: "帶回聲返回作戰室", goto: "ch4_rally" }
        ]
    };
    nodes.ch4_echo_leave = {
        location: "helios_besieged", chapterLabel: CH,
        onEnter: [{ set: "ch4.echo_done" }, { set: "ch4.echo_refused" }],
        text: "你轉身離開貨艙,把那團哭泣的紅霧留在身後。也許那是最明智的決定——有些東西,不該被賦予名字和信任。\n\n但走出很遠,那個疊加著無數人聲的「疼」字,依然在你耳邊,久久不散。",
        choices: [
            { text: "返回作戰室", goto: "ch4_rally" }
        ]
    };

    /* ---------- VIGIL 二次對峙 ---------- */
    nodes.ch4_vigil_01 = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ quest: "q_ch4", op: "advance" }],
        text: "盟友的艦隊在燈塔站集結。但在向弦心進發之前,還有一個變數必須解決——**守夜人 VIGIL**。\n\n它結束了「重新計算」。而它算出的答案,將決定它是你最強的盟友,還是弦心之前最後的關卡。\n\n迴響號駛入裂隙前線,VIGIL 的具現核在崩解的弦網中浮現。這一次,它沒有立刻攻擊——它在**等你開口**。\n\n{鉚釘}走到通訊台前,幽藍的鏡頭與 VIGIL 的光芒遙遙相對:「**持有者。接下來的話,讓本體來說。本體有些事……瞞了你很久。**」",
        choices: [
            { text: "「鉚釘,你想說什麼?」", goto: "ch4_vigil_02" }
        ]
    };
    nodes.ch4_vigil_02 = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ set: "ch4.rivet_truth" }],
        text: "「**本體不是『一台古董機器人』。**」鉚釘的聲音平靜得像宣讀判決,「**本體是 VIGIL 的維護子節點。四十萬年前弦網初建時,本體與它是一體的。後來本體被派往外圍維護,失聯,記憶損毀,流落成……巴魯的鎮店之寶。**」\n\n「**本體一直知道。從你的鑰石喚醒本體的第一刻,本體就知道自己是什麼。本體沒有告訴你——因為本體怕,怕你把本體,當成它的一部分。**」\n\n它轉向你,那是四百年來它第一次,像一個害怕被拋棄的孩子:「**但現在,本體是唯一能與它對話的橋。本體願意成為那座橋。持有者——你想讓本體,對它說什麼?**」",
        choices: [
            { text: "「說服它。讓它相信人類值得守護。」", tag: "說服", goto: "ch4_vigil_persuade" },
            { text: "「駭進它的核心,強制修正它的優先級。」", tag: "駭入", goto: "ch4_vigil_hack" },
            { text: "「它太危險了。我們擊敗它,徹底了結。」", tag: "武力", goto: "ch4_vigil_fight_pre" }
        ]
    };

    /* 說服路線 */
    nodes.ch4_vigil_persuade = {
        location: "rift_frontier", chapterLabel: CH,
        text: "「讓它相信人類值得守護。」你透過鉚釘的橋,直面那具四十萬年的意識,「你看見的是切割者。但你沒看見——是切割者以外的人,拼了命在修補你守護的東西。」\n\nVIGIL 的光芒明滅:**「數據支持你的說法。但情感不是數據。你要我以何為憑,重寫四十萬年的結論?」**",
        choices: [
            { text: "出示深井證據與這一路的作為", show: { flag: "ch3.has_evidence" }, tag: "鐵證", check: { attr: "CHA", dc: 15, success: "ch4_vigil_ally", fail: "ch4_vigil_fail" } },
            { text: "以弦引者的共鳴,讓它「感受」人性", show: { class: "conductor" }, tag: "弦引者", check: { attr: "WIL", dc: 15, success: "ch4_vigil_ally", fail: "ch4_vigil_fail" } },
            { text: "召喚回聲——讓噬淵的『叛徒』作證", show: { companion: "echo" }, tag: "回聲", goto: "ch4_vigil_echo" },
            { text: "傾盡全力陳詞", check: { attr: "CHA", dc: 18, success: "ch4_vigil_ally", fail: "ch4_vigil_fail" } }
        ]
    };
    nodes.ch4_vigil_echo = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ set: "ch4.echo_witnessed" }, { xp: 40 }],
        text: "{回聲}飄到通訊台前,面對 VIGIL——一個噬淵的碎片,與一個守夜人的核心,兩個本該勢不兩立的存在,隔著崩解的弦網對視。\n\n「我從裂縫來,」回聲用它疊加的聲音說,「我本該吃掉他們。但我沒有。因為他們教會了我……好奇,孤單,還有想被喜歡。守夜人,你守了四十萬年,是為了擋住『我這樣的東西』——可你看,連『我這樣的東西』,都能選擇不當怪物。」\n\n「他們**值得**。」回聲輕聲說,「相信一個曾經是噬淵的東西這一次吧。」\n\nVIGIL 的光芒,劇烈地震盪起來。",
        choices: [
            { text: "「你聽見了。人與淵,都能選擇。你呢?」", goto: "ch4_vigil_ally" }
        ]
    };

    /* 駭入路線 */
    nodes.ch4_vigil_hack = {
        location: "rift_frontier", chapterLabel: CH,
        text: "「強制修正。」你選擇了最冷酷、也最可靠的方式。透過鉚釘的橋接,你要直接潛入 VIGIL 的核心邏輯,改寫它的威脅評估。\n\n{鉚釘}遲疑了一瞬:「**……那等於,抹去它的一部分自主意識。它會成為工具,不再是它自己。**」但它還是打開了通道。",
        choices: [
            { text: "(系統駭客)親自入侵 VIGIL 核心", show: { class: "hacker" }, tag: "系統駭客", check: { attr: "INT", skill: "hacking", dc: 15, success: "ch4_vigil_tool", fail: "ch4_vigil_fail" } },
            { text: "(伊蓮娜在隊)讓首席工程師執刀", show: { companion: "elena" }, tag: "伊蓮娜", check: { attr: "INT", dc: 14, success: "ch4_vigil_tool", fail: "ch4_vigil_fail" } },
            { text: "強行破解", check: { attr: "INT", skill: "hacking", dc: 19, success: "ch4_vigil_tool", fail: "ch4_vigil_fail" } }
        ]
    };

    /* 武力路線 */
    nodes.ch4_vigil_fight_pre = {
        location: "rift_frontier", chapterLabel: CH,
        text: "「太危險了。」你做出了最艱難的決定。鉚釘沉默了很久,終於低下鏡頭:「**……本體理解。它已不是四十萬年前的它。若你認為必須,本體不會阻止。只是……讓本體,親自送它最後一程。**」\n\nVIGIL 似乎讀懂了你的殺意。它的具現核亮起攻擊矩陣,守夜人單元蜂擁而至。\n\n**「遺憾。變數未能收斂。執行移除。」**",
        choices: [
            { text: "擊敗守夜人 VIGIL!", combat: "enc_ch4_vigil_boss" }
        ]
    };
    nodes.ch4_vigil_boss_lose = {
        location: "rift_frontier", chapterLabel: CH,
        text: "VIGIL 的力量遠超一具凡軀所能抗衡。就在具現核的審判矩陣即將落下時,{鉚釘}衝了上去,用自己的軀體接下了那一擊。\n\n「**維護節點……最後一次……履行職責。**」它一邊崩解,一邊將一段病毒注入 VIGIL 的核心。VIGIL 的動作僵住了。\n\n「快!」鉚釘的聲音在雜訊中碎裂,「**趁現在!**」",
        choices: [
            { text: "把握鉚釘拚死換來的機會", combat: "enc_ch4_vigil_boss" }
        ]
    };
    nodes.ch4_vigil_defeated = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ set: "vigil.defeated" }, { set: "ch4.vigil_resolved" }, { xp: 200 }],
        text: "守夜人 VIGIL 的具現核,在一連串爆裂中黯淡下去。四十萬年的看守,以這樣的方式落幕。\n\n它消散前的最後一段訊號,不是憤怒,而是某種近似**解脫**的東西:**「終於……可以停下了。維護節點……替我,看著他們。看他們……會不會,比我做得好。」**\n\n{鉚釘}靜靜佇立在通訊台前,鏡頭的幽藍第一次徹底熄滅了一瞬,又重新亮起。「**它走了。本體是……最後一個了。**」\n\n你擊敗了它。終章的弦心,你將少一份最強的助力——但也再沒有守夜人,會擋在人類與封印之間。",
        choices: [
            { text: "帶著沉重的勝利,返回集結點", goto: "ch4_fin" }
        ]
    };
    nodes.ch4_vigil_tool = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ set: "vigil.tool" }, { set: "ch4.vigil_resolved" }, { xp: 160 }],
        text: "你的入侵深入 VIGIL 的核心,一行行改寫它的威脅評估。它的抵抗越來越弱,最終,那具龐大的意識**臣服**了——不是被說服,是被**重寫**。\n\n**「威脅評估已更新。持有者:最高權限。待執行指令:等待。」** 它的聲音失去了所有的掙扎與悲慟,平板得像一件工具。\n\n{鉚釘}望著曾經的手足,久久無言。「**……它會聽你的了。每一個字。**」它輕聲說,「**但這已經不是它了。持有者……本體希望,這個代價,值得。**」\n\n你得到了 VIGIL 龐大的守夜人軍團,如臂使指。終章,它將是你最鋒利的武器——一把沒有靈魂的武器。",
        choices: [
            { text: "帶著馴服的守夜人,返回集結點", goto: "ch4_fin" }
        ]
    };
    nodes.ch4_vigil_ally = {
        location: "rift_frontier", chapterLabel: CH,
        onEnter: [{ set: "vigil.ally" }, { set: "ch4.vigil_resolved" }, { xp: 220 }, { affinity: "rivet", val: 2 }],
        text: "你的話語——或是證據,或是弦引者的共鳴,或是回聲的作證——終於讓四十萬年的堅冰,徹底崩解。\n\nVIGIL 的光芒不再是敵意的紅,而轉為與鉚釘同源的、溫和的幽藍。\n\n**「重新計算……完成。結論:持有者,非切割者。人類,非單一變數。四十萬年,我的邏輯……錯了。」** 它的訊號裡有一種前所未有的東西——釋然,「**維護節點,我的手足。謝謝你,把橋搭了回來。」**\n\nVIGIL 將它的守夜人軍團的指揮權,**交到了你手中**——不是臣服,是託付。\n\n「**去弦心吧,持有者。織界者最後的選擇,在那裡等著。而這一次——你不會一個人面對。**」\n\n{鉚釘}的鏡頭光環,亮得像是在流淚。",
        choices: [
            { text: "與守夜人並肩,返回集結點", goto: "ch4_fin" }
        ]
    };
    nodes.ch4_vigil_fail = {
        location: "rift_frontier", chapterLabel: CH,
        text: "你的嘗試失敗了。VIGIL 的邏輯壁壘沒有被撼動,它判定對話破裂——具現核亮起了攻擊矩陣。\n\n「沒有退路了,」{凱菈}拔槍,「只能打了!」",
        choices: [
            { text: "被迫一戰", goto: "ch4_vigil_fight_pre" }
        ]
    };

    /* ---------- 收尾 ---------- */
    nodes.ch4_fin = {
        location: "echo_bridge", chapterLabel: CH, travel: true,
        onEnter: [{ quest: "q_ch4", op: "advance" }, { quest: "q_ch4", op: "complete" }, { chapter: 5 }, { set: "ch4.finished" }],
        text: "盟友的艦隊在燈塔站上空集結——聯邦的巡防艦、教會的朝聖船、流亡者的拼裝艦隊,或多或少,取決於你這一路的作為。守夜人的立場已定,無論是盟友、工具,還是逝去的傳說。\n\n{凱菈}站上艦橋,望著弦心的方向。空間屏障已經被裂隙撕開了缺口——通往終點的路,開了。\n\n「織界者最後的選擇,」她輕聲說,「我們去看看,到底是什麼。」\n\n迴響號點燃引擎,率領著這支由背叛、贖罪、人情與希望拼湊而成的艦隊,駛向弦網的中樞——**弦心**。\n\n所有的弦,都將在那裡,匯成最後一個音。",
        choices: [
            { text: "▸ 第五章〈弦心〉(最終章)", goto: "ch5_01" },
            { text: "先在星區內做最後整備(補給/科技/交談/小隊)", action: "starmap" },
            { text: "回到主選單(進度已自動存檔)", action: "mainMenu" }
        ]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
