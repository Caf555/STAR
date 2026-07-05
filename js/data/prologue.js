/* ============================================================
   prologue.js — 序章(M1)
   三段出身專屬開場 → 匯合段〈曙光港之夜〉。
   終點:取得迴響號、織界者碎片甦醒、凱菈入隊。
   ============================================================ */
(function () {
    "use strict";
    window.SE = window.SE || { DATA: {} };
    const D = SE.DATA;

    /* ---------- 地點 ---------- */
    Object.assign(D.locations = D.locations || {}, {
        siren_wreckfield: { name: "賽壬殘骸帶", sub: "賽壬星系・第六軌道" },
        freighter_moose: { name: "貨船「駝鹿號」", sub: "賽壬星系・跳躍航道" },
        dawnport_slums: { name: "曙光港・下城區", sub: "賽壬星系・邊境殖民地" },
        dawnport_docks: { name: "曙光港・碼頭區", sub: "賽壬星系・邊境殖民地" },
        echo_ship: { name: "迴響號", sub: "老舊的獨立跳躍艦" }
    });

    /* ---------- 任務 ---------- */
    Object.assign(D.quests = D.quests || {}, {
        pro_case: {
            title: "密封的託付",
            type: "main",
            stages: [
                { objective: "將密封手提箱送到曙光港斷纜酒吧的賈維手中" },
                { objective: "穿過遇襲的曙光港,找到賈維" },
                { objective: "登上迴響號,逃離曙光港" }
            ]
        }
    });

    /* ---------- 遭遇 ---------- */
    Object.assign(D.encounters = D.encounters || {}, {
        enc_scav_drone: {
            title: "哨戒無人機",
            enemies: [{ id: "drone_sentry", row: "front" }],
            victory: "pro_scav_09", defeat: "pro_scav_09d"
        },
        enc_off_boarding: {
            title: "接舷戰",
            enemies: [{ id: "merc_gun", row: "back" }, { id: "merc_blade", row: "front" }],
            guests: ["crew_dep"],
            victory: "pro_off_07", defeat: "pro_off_07d"
        },
        enc_off_boarding_easy: {
            title: "接舷戰(伏擊優勢)",
            enemies: [{ id: "merc_gun", row: "front" }],
            guests: ["crew_dep"],
            victory: "pro_off_07", defeat: "pro_off_07d"
        },
        enc_exile_zealots: {
            title: "燃燈庭的追兵",
            enemies: [{ id: "zealot", row: "front" }, { id: "zealot", row: "front" }],
            victory: "pro_exile_07", defeat: "pro_exile_07d"
        },
        enc_common_hounds: {
            title: "獵犬小隊",
            enemies: [{ id: "merc_gun", row: "back" }, { id: "merc_leader", row: "front" }],
            victory: "pro_common_10", defeat: "pro_common_10d"
        }
    });

    const nodes = {};

    /* ============================================================
       出身一:邊境拾荒者 —— 序章〈殘骸帶的收穫〉
       ============================================================ */
    const SCAV = "序章〈殘骸帶的收穫〉";

    nodes.pro_scav_01 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "賽壬第六軌道的殘骸帶,是六十年來所有沉船的墳場,也是你的獵場。\n\n你的拾荒橇「**鏽燕**」熄了主引擎,靠慣性滑進一片新的殘骸雲——一艘斷成三截的舊聯邦補給艦,船籍塗裝還沒被輻射曬白。新鮮貨。這種等級的殘骸,運氣好能換三個月的氧氣配額。\n\n頭盔裡只有你自己的呼吸聲。在殘骸帶,安靜就是安全。",
        choices: [
            { text: "先用鏽燕的短距掃描儀摸清內部結構", check: { attr: "INT", dc: 10, success: "pro_scav_02a", fail: "pro_scav_02b" } },
            { text: "省點電——直接撬開貨艙外板", check: { attr: "STR", dc: 12, success: "pro_scav_02c", fail: "pro_scav_02d" } }
        ]
    };
    nodes.pro_scav_02a = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        onEnter: [{ item: "data_core", qty: 1 }, { item: "scrap_alloy", qty: 1 }],
        text: "掃描儀在殘骸的第二艙段亮出一個規整的訊號回波——保存完好的航電櫃。你像外科醫生一樣切開艙板,取出一枚**資料核心**和一塊還能用的合金板。\n\n乾淨俐落。老雷德要是還活著,會說你終於出師了。",
        choices: [{ text: "把收穫捆上鏽燕,準備收工", goto: "pro_scav_03" }]
    };
    nodes.pro_scav_02b = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        onEnter: [{ item: "scrap_alloy", qty: 1 }],
        text: "掃描儀的回波糊成一片雪花——這片殘骸的裝甲含鉛量太高。你罵了一句,改用最原始的辦法:切下一塊還算完整的**廢船合金**。\n\n就在你收工的時候,眼角餘光瞥見遠處有什麼東西動了一下。不是漂移。是**機動**。",
        choices: [{ text: "熄掉頭燈,壓低鏽燕的輪廓", goto: "pro_scav_03" }]
    };
    nodes.pro_scav_02c = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        onEnter: [{ item: "scrap_alloy", qty: 2 }],
        text: "撬棍卡進艙板接縫,你借著磁靴的錨定狠狠一扳——整片外板無聲地翻開,像掀開罐頭。裡面是滿滿一格標準合金錠,夠鏽燕跑兩趟。\n\n你哼著跑調的小曲往橇上搬。在殘骸帶,這就算是好日子。",
        choices: [{ text: "把收穫捆上鏽燕,準備收工", goto: "pro_scav_03" }]
    };
    nodes.pro_scav_02d = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        onEnter: [{ hp: -4 }, { item: "scrap_alloy", qty: 1 }],
        text: "撬棍打滑,斷裂的艙板邊緣劃開你的手套——密封膠瞬間噴出來堵住裂口,但刀割一樣的痛還是竄上手臂。\n\n你咬著牙撬完最後一角,只搶下一塊合金。血在手套裡黏糊糊的。今天的運氣不太對勁。",
        choices: [{ text: "包紮好,準備收工", goto: "pro_scav_03" }]
    };
    nodes.pro_scav_03 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "就在你調轉船頭的時候,殘骸帶深處亮起了**引擎光**。\n\n一艘黑曜集團的無標識駁船,正倒退著駛入殘骸雲最濃的地方。貨艙門開著,機械臂把一批批貨櫃**拋進殘骸帶**——沒有回收浮標,沒有登記訊標。他們在丟東西,丟得像在埋屍體。\n\n然後你看見一艘私掠小艇從陰影裡竄出來,朝駁船打出詢問燈號。駁船的回應是一發精準的點防砲。小艇無聲地炸成一朵短暫的花。\n\n你的心跳聲在頭盔裡放大。**滅口。**",
        choices: [
            { text: "熄燈靜默,等駁船離開再說", goto: "pro_scav_04" },
            { text: "拾荒者的直覺:悄悄標記拋貨座標——那是錢", tag: "黑市", goto: "pro_scav_04", effects: [{ set: "pro.scav_marked" }] },
            { text: "這渾水太深,趁沒被發現趕快離開", goto: "pro_scav_04b" }
        ]
    };
    nodes.pro_scav_04b = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "你壓下好奇心,讓鏽燕貼著殘骸的陰影撤退。老雷德的第一課:**看見不該看的東西,眼睛要學會關機。**\n\n但你才滑出兩公里,接收器就炸出一段嘶啞的求救訊號——短距定向波束,精準地打在鏽燕的天線上。有人在拋貨區**指名呼叫你**:\n\n「拾荒者……看得見你的橇……求你……」\n\n是個瀕死的聲音。而瀕死的人,不會說謊。",
        choices: [{ text: "調頭,朝訊號源駛去", goto: "pro_scav_04" }]
    };
    nodes.pro_scav_04 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "駁船的引擎光遠去之後,你滑進拋貨區。大部分貨櫃只是加密軍需——但在貨櫃群邊緣,卡著那艘被擊傷的私掠小艇的**另一半**:駕駛艙還在,應急燈還亮著。\n\n艙裡的女人穿著流亡者船團的舊式壓力服,腹部的密封膠已經滲紅。她看見你,用最後的力氣把一只**軍規密封手提箱**推向氣閘。\n\n「我叫**芮妮**……替人跑單幫的……」她的聲音在雜訊裡碎裂,「這箱子……黑曜的人為了它殺了我全船的人……」",
        choices: [
            { text: "「箱子裡是什麼?」", goto: "pro_scav_05a" },
            { text: "「撐住,我帶妳回曙光港。」", goto: "pro_scav_05b" }
        ]
    };
    nodes.pro_scav_05a = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "「不知道。**知道的人都死了。**」她扯出一個血色的笑,「委託人只說……送到曙光港,斷纜酒吧,交給**賈維**。老頭會付清尾款……」\n\n她的手指在箱面敲了三下,像某種老走私客的暗號。「答應我。錢……歸你。」",
        choices: [{ text: "接過箱子,答應她", goto: "pro_scav_06" }]
    };
    nodes.pro_scav_05b = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "「省省吧,」她搖頭,壓力服的生命維持讀數已經掉進紅區,「我的船員……都沒了。我只剩一件事沒做完。」\n\n「曙光港,斷纜酒吧,找**賈維**。把箱子給他,尾款歸你。」她抓住你的手腕,力氣大得不像瀕死的人,「**別打開它。別讓黑曜拿到它。**」",
        choices: [{ text: "接過箱子,答應她", goto: "pro_scav_06" }]
    };
    nodes.pro_scav_06 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        onEnter: [{ item: "sealed_case", qty: 1 }, { quest: "pro_case", op: "start" }, { set: "pro.courier_named" }],
        text: "芮妮的手垂下去的時候,你正把手提箱固定上鏽燕的貨架。箱子比看起來重,重得**不自然**,像裡面封著一小塊星核。\n\n你還來不及默哀,鏽燕的近距警報就尖叫起來——一架**黑曜哨戒無人機**從貨櫃群後方轉出,探照燈開始呈扇形掃描。駁船留下的看門狗,在清點它主人丟掉的垃圾。\n\n它還沒發現你。還沒。",
        choices: [
            { text: "熄滅一切訊源,躲進殘骸陰影等它過去", check: { attr: "AGI", dc: 12, success: "pro_scav_07a", fail: "pro_scav_07b" } },
            { text: "拋出一塊廢船合金,誘使它追著雷達回波跑", show: { item: "scrap_alloy" }, tag: "消耗:廢船合金", goto: "pro_scav_07c", effects: [{ item: "scrap_alloy", qty: -1 }] },
            { text: "先下手為強——擊落它", combat: "enc_scav_drone" }
        ]
    };
    nodes.pro_scav_07a = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "你讓鏽燕徹底斷電,連呼吸都放慢。無人機的探照燈從你頭頂三公尺處掃過,照亮艙壁上斑駁的舊船名,然後——移開了。\n\n它繞完最後一圈,點燃推進器追駁船去了。你在黑暗裡多等了整整十分鐘,才敢重啟引擎。",
        choices: [{ text: "駛出殘骸帶,返回曙光港", goto: "pro_scav_10" }]
    };
    nodes.pro_scav_07b = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "百密一疏——鏽燕貨架上那只手提箱的表面,反射了一絲探照燈光。\n\n無人機的鏡頭「咔」地轉向你,識別燈從巡邏藍瞬間切成**敵意紅**。",
        choices: [{ text: "應戰!", combat: "enc_scav_drone" }]
    };
    nodes.pro_scav_07c = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "合金板旋轉著飛向殘骸帶深處,劃出一道完美的雷達回波。無人機像獵犬一樣猛地調頭,追著那片「可疑目標」鑽進了殘骸雲。\n\n等它發現上當,你和鏽燕已經是雷達上的一粒塵埃。**在殘骸帶,聰明比勇敢便宜得多。**",
        choices: [{ text: "駛出殘骸帶,返回曙光港", goto: "pro_scav_10" }]
    };
    nodes.pro_scav_09 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "無人機的殘骸在你面前緩緩旋轉,斷裂的鏡頭還在徒勞地變焦。你熟練地掏空它的處理器艙——黑曜的軍規零件,黑市上是硬通貨。\n\n但你心裡清楚:它斷訊之前,八成把你的橇拍了下來。**黑曜的帳本上,現在有你一筆了。**",
        choices: [{ text: "駛出殘骸帶,返回曙光港", goto: "pro_scav_10" }]
    };
    nodes.pro_scav_09d = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "你醒來的時候,鏽燕正拖著你在殘骸帶邊緣漂流,頭盔的裂縫已被應急膠封住,生命維持讀數在紅線邊緣徘徊。\n\n無人機不見了——大概判定你已經死透,回去覆命了。它拿走了你半條命,但沒找到艙底的**手提箱**。\n\n你咳出一口血沫,把鏽燕的船頭轉向曙光港。",
        choices: [{ text: "撐著駛回曙光港", goto: "pro_scav_10" }]
    };
    nodes.pro_scav_10 = {
        location: "siren_wreckfield", chapterLabel: SCAV,
        text: "回程的三個小時,那只箱子就綁在你的視野邊緣,像一句沒說完的遺言。芮妮的聲音在你腦子裡打轉:**別打開它。別讓黑曜拿到它。**\n\n曙光港的輪廓終於從賽壬星的晨昏線上升起。但有什麼不對——\n\n港區上空飄著的不是往常的接駁燈流,而是**三道黑煙**。防衛頻道一片死寂,民用頻道裡全是尖叫。",
        choices: [{ text: "加速——衝進曙光港", goto: "pro_common_01" }]
    };

    /* ============================================================
       出身二:前聯邦軍官 —— 序章〈最後的護航〉
       ============================================================ */
    const OFF = "序章〈最後的護航〉";

    nodes.pro_off_01 = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "貨船「駝鹿號」的貨艙聞起來像機油和廉價咖啡。你檢查完最後一排繫固鎖,在值勤板上簽下名字——**保安顧問**,四個字,是聯邦除役文書留給你唯一能做的工作。\n\n船長{歐嘉}的嗓門從艙口滾進來:「前副長閣下,別把我的貨艙當你的巡防艦擦!」她叼著沒點的煙走過來,把一份艙單拍在你胸口,「倒是幫我看看這個——第七格那票貨,託運人加價三倍,條件是**不准過問、不准掃描、優先卸貨**。」\n\n艙單上,第七格的貨主欄寫著:黑曜集團,轉交曙光港。品名:**工業樣品(密封)**。",
        choices: [
            { text: "「加價三倍的『工業樣品』?我去看一眼。」", tag: "軍旅", check: { attr: "INT", skill: "tactics", dc: 12, success: "pro_off_02a", fail: "pro_off_02b" } },
            { text: "「錢收了就按規矩來——但我會盯著它。」", goto: "pro_off_02c" }
        ]
    };
    nodes.pro_off_02a = {
        location: "freighter_moose", chapterLabel: OFF,
        onEnter: [{ set: "pro.off_inspected" }],
        text: "你沒有碰箱子——你只是**看**。這是巡防艦查緝走私十一年練出來的本事。\n\n軍規密封膠、反掃描襯層、慣性阻尼框架:這不是工業樣品的包裝,是**高價值武裝押運**的包裝。而箱面角落有一行手寫的收件備註,墨跡很新:\n\n「曙光港・斷纜酒吧・**賈維**親啟」。\n\n黑曜的正式貨,不會寫這種備註。這箱貨,是**從黑曜手裡偷出來的**。",
        choices: [{ text: "把判斷埋在心裡,回到崗位", goto: "pro_off_03" }]
    };
    nodes.pro_off_02b = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "你俯身檢視箱面的瞬間,防拆感應器發出一聲刺耳的短鳴。{歐嘉}的吼聲隔著兩層貨架砸過來:「手拿開!加價三倍裡有一倍是**買你別好奇**,前副長!」\n\n你退開一步。但那一眼已經夠了——軍規密封、反掃描襯層。**沒有哪種工業樣品需要這種待遇。**",
        choices: [{ text: "回到崗位,暗自提高警戒", goto: "pro_off_03" }]
    };
    nodes.pro_off_02c = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "「規矩,」{歐嘉}難得露出讚許的表情,「你在軍裡最值錢的就是這兩個字。」\n\n她壓低聲音補了一句:「託運的中間人我認識,曙光港的老走私客,叫**賈維**。他從不碰燙手的貨——這次破例,說明這箱東西**燙得值得**。所以,盯緊點。」",
        choices: [{ text: "接過警戒班,盯著第七格", goto: "pro_off_03" }]
    };
    nodes.pro_off_03 = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "距離曙光港還有四十分鐘航程時,駝鹿號被人**從跳躍航道上硬生生拽了下來**。\n\n慣性把你甩上艙壁。主屏幕裡,一艘塗裝斑駁的攔截艦橫在航道正前方,武器艙全開。通訊頻道裡的聲音懶洋洋的:\n\n「駝鹿號,我們是收過路費的。交出**第七格的貨**,其他一根螺絲都不動你們的。」\n\n你瞇起眼。攔截艦的「斑駁塗裝」下面,是嶄新的軍用複合裝甲;火控雷達的掃描頻率,是黑曜獵犬部隊的制式參數。**這不是海盜。這是穿著海盜皮的正規軍。**",
        choices: [
            { text: "「船長,拖住他們——我來布置接舷伏擊。」", check: { attr: "INT", skill: "tactics", dc: 12, success: "pro_off_04a", fail: "pro_off_04b" } },
            { text: "直接帶人下貨艙,守住第七格", goto: "pro_off_04b" },
            { text: "「他們只要貨。船長,考慮交出去嗎?」", goto: "pro_off_04c" }
        ]
    };
    nodes.pro_off_04a = {
        location: "freighter_moose", chapterLabel: OFF,
        onEnter: [{ set: "pro.off_ambush" }],
        text: "「聽我口令。」十一年的肌肉記憶接管了你的聲音。\n\n歐嘉在頻道裡跟對方討價還價拖時間;你關掉貨艙重力、把裝卸機械臂調到手動、讓船員{戴普}守住唯一的艙口死角。接舷通道的方向,你算得清清楚楚。\n\n氣閘被切開的瞬間,第一個登船的傭兵直接撞進失重的機械臂陣裡——**他到最後都沒搞懂自己是怎麼被打暈的。**剩下的人只能從你選好的射界裡進來。",
        choices: [{ text: "「歡迎登船。」——迎擊!", combat: "enc_off_boarding_easy" }]
    };
    nodes.pro_off_04b = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "你和船員{戴普}背靠第七格貨架架好掩體時,氣閘的切割火花已經亮起。歐嘉在艦橋咒罵著嘗試重啟引擎。\n\n切割線走完一個圓。艙門被踹開,兩名武裝到牙齒的「海盜」魚貫而入——動作乾淨俐落,交替掩護,**正規軍的突入隊形**。",
        choices: [{ text: "開火!", combat: "enc_off_boarding" }]
    };
    nodes.pro_off_04c = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "「交?」{歐嘉}從牙縫裡擠出一聲冷笑,「我跑了三十年船,交過貨的船長活不過三單——**收貨的不想留活口,懂嗎?**他們拿到箱子的下一件事,就是把駝鹿號連人帶船變成航道事故。」\n\n她抄起艙壁上的老式霰彈槍,拋給你一個彈匣:「所以,前副長,替我守住我的船。」\n\n氣閘方向,切割火花已經亮起。",
        choices: [{ text: "架好掩體,迎擊登船者", combat: "enc_off_boarding" }]
    };
    nodes.pro_off_07 = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "最後一名傭兵倒下的同時,攔截艦竟然**主動脫離**了——他們在頻道裡留下一句話:「查清楚你們動的是誰的貨,再決定要不要進曙光港。」\n\n你在硝煙裡回頭,看見{歐嘉}靠著貨架滑坐下去,手按著肋下,血從指縫裡漫出來。流彈。她揮開你的急救包:\n\n「省省……給我聽好。」她把第七格的解鎖卡塞進你手裡,「箱子……送到斷纜酒吧,交給**賈維**。跟他說,歐嘉的最後一單,**貨到了**……尾款讓他拿去給我的船員分。」\n\n她的煙終於從嘴角掉下來。「你這種人……不該爛在貨船上。去吧。」",
        choices: [{ text: "取出密封手提箱,登上救生梭", goto: "pro_off_08" }]
    };
    nodes.pro_off_07d = {
        location: "freighter_moose", chapterLabel: OFF,
        text: "你在劇痛裡恢復意識——{歐嘉}正把你**塞進救生梭**,她自己的半邊船衣已經被血浸透。\n\n「傭兵在撬第七格……撬不開的,解鎖卡在這。」她把卡片和那只**密封手提箱**一起砸在你懷裡,「斷纜酒吧,**賈維**。歐嘉的最後一單,貨到了——去說給他聽。」\n\n「船長——」\n\n「駝鹿號是我的船。」她按下彈射鈕前,最後看了你一眼,「**船長最後離船。滾。**」\n\n彈射的黑暗吞掉你的抗議。等舷窗恢復視野,駝鹿號的輪廓正在遠處無聲地燃燒。",
        choices: [{ text: "設定航向:曙光港", goto: "pro_off_08" }]
    };
    nodes.pro_off_08 = {
        location: "freighter_moose", chapterLabel: OFF,
        onEnter: [{ item: "sealed_case", qty: 1 }, { quest: "pro_case", op: "start" }, { set: "pro.courier_named" }],
        text: "救生梭的導航鎖定曙光港。你把手提箱固定在副座上,像固定一枚啞彈。\n\n箱子比看起來重,重得**不自然**。歐嘉用命護下來的東西、黑曜派正規軍來搶的東西——而收件人只是個邊境酒吧裡的老走私客。\n\n進港航線亮起的時候,你皺起了眉。港區上空沒有接駁燈流,只有**三道黑煙**。防衛頻道一片死寂,民用頻道裡全是尖叫。\n\n**黑曜比你先到了。**",
        choices: [{ text: "強行進港降落", goto: "pro_common_01" }]
    };

    /* ============================================================
       出身三:星語逐徒 —— 序章〈被焚燒的名字〉
       ============================================================ */
    const EXI = "序章〈被焚燒的名字〉";

    nodes.pro_exile_01 = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "下城區的雨永遠是鏽色的——回收水管線和劣質防腐劑的味道。你的房間只有一張桌子,桌上堆著替貨運行翻譯的艙單:這是碑林把你除名之後,「星區最年輕的銘文學者」能找到的全部用途。\n\n午夜,有人敲門。**三短,一長。**碑林的舊暗號。\n\n門外站著{泰奧}——大祭司的文書官,你被逐出去那天,唯一沒有在判決書上簽名的人。他渾身濕透,左肩的僧袍被血黏在身上,懷裡死死抱著一只**軍規密封手提箱**。\n\n「他們燒了你的書,」他喘著說,「但現在,**只有你能讀的東西回來了**。」",
        choices: [
            { text: "把他拉進屋,先處理傷口", goto: "pro_exile_02" },
            { text: "「誰追你?」——先確認街上有沒有尾巴", check: { attr: "AGI", dc: 10, success: "pro_exile_02a", fail: "pro_exile_02" } }
        ]
    };
    nodes.pro_exile_02a = {
        location: "dawnport_slums", chapterLabel: EXI,
        onEnter: [{ set: "pro.exile_watched" }],
        text: "你貼著窗縫往下看。雨幕裡,巷口的暗處站著兩個沒撐傘的人,僧袍下擺露出軍靴——**燃燈庭**的執燈者。他們還沒確定是哪一戶,正在挨門掃描。\n\n有十分鐘,最多十五。你把泰奧拉進屋裡,吹熄了燈。",
        choices: [{ text: "壓低聲音:「說。快說。」", goto: "pro_exile_02" }]
    };
    nodes.pro_exile_02 = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "「珂黛的人在**緘默之環外圍**挖出了東西。」泰奧的聲音抖得厲害,不全是因為失血,「不是聖物,是**活的**——它會回應人。燃燈庭把它獻給黑曜換武器,黑曜的船三天後來取貨。」\n\n「我把它偷出來了。」他拍了拍手提箱,笑得慘白,「大祭司安瑟姆密令:送出星港,交給一個叫**賈維**的走私客——斷纜酒吧。教會的船進不了港了,燃燈庭盯著所有登記航班。」\n\n他從懷裡取出一卷拓片,推到你面前:「這是從它的封存匣上拓下來的。**執燈者讀不懂。我也讀不懂。**」",
        choices: [
            { text: "展開拓片——這是你被燒掉的專業", tag: "教義", check: { attr: "WIL", dc: 12, success: "pro_exile_03a", fail: "pro_exile_03b" } },
            { text: "「先不讀。知道得越多,死得越快。」", goto: "pro_exile_04", effects: [{ set: "pro.exile_unread" }] }
        ]
    };
    nodes.pro_exile_03a = {
        location: "dawnport_slums", chapterLabel: EXI,
        onEnter: [{ erosion: 4 }, { set: "pro.exile_read" }],
        text: "銘文在你眼前排開的瞬間,熟悉的暈眩湧上來——織界者的文字不是用看的,是**用聽的**。\n\n你穩住呼吸,讓音節在腦海裡自行歸位。這是一段**警告詞**,碑林教材裡從未出現過的變體,大意是:\n\n「**弦斷之處,它在聽。勿使歌者甦醒於無網之地。**」\n\n你猛地回神,鼻尖懸著一滴血。泰奧盯著你,眼神一半是敬畏,一半是恐懼:「……你聽見了,對吧。**箱子裡的東西,也一直在這樣對我說話。**」",
        choices: [{ text: "捲起拓片:「我送。把箱子給我。」", goto: "pro_exile_04" }]
    };
    nodes.pro_exile_03b = {
        location: "dawnport_slums", chapterLabel: EXI,
        onEnter: [{ erosion: 8 }, { set: "pro.exile_read" }],
        text: "銘文的音節在你腦海裡歸位到一半,突然**齊聲反噬**。\n\n無數重疊的低語灌進你的顱骨,像四十萬年的合唱在一秒內炸開。你聽清了其中一句——只有一句:\n\n「**弦斷之處,它在聽。**」\n\n回神時你趴在桌上,鼻血染紅了半張拓片。泰奧慌忙扶住你:「夠了、夠了!當年碑林燒你的書,也許……也許不全是因為政治。」",
        choices: [{ text: "擦掉鼻血:「我送。把箱子給我。」", goto: "pro_exile_04" }]
    };
    nodes.pro_exile_04 = {
        location: "dawnport_slums", chapterLabel: EXI,
        onEnter: [{ item: "sealed_case", qty: 1 }, { quest: "pro_case", op: "start" }, { set: "pro.courier_named" }],
        text: "手提箱入手的瞬間,你差點脫手——它比看起來重,重得**不自然**,而且隔著箱壁,你能感覺到一種緩慢的、溫熱的**搏動**。\n\n就在這時,樓下的門被踹開了。\n\n軍靴聲。至少兩人。樓梯間傳來執燈者特有的單調誦音——燃燈庭用它來「淨化」將要動手的空間。\n\n泰奧臉色慘白地抵住房門:「**走窗戶。屋頂。**我拖住他們——」",
        choices: [
            { text: "隔門用正統教義訓斥他們越權(你比他們懂教法)", tag: "教義", check: { attr: "CHA", dc: 12, success: "pro_exile_05a", fail: "pro_exile_05b" } },
            { text: "把泰奧推到身後,翻桌作掩體——他們別想帶走任何人", combat: "enc_exile_zealots" },
            { text: "拉著泰奧翻窗上屋頂", check: { attr: "AGI", dc: 12, success: "pro_exile_05c", fail: "pro_exile_05b" } }
        ]
    };
    nodes.pro_exile_05a = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "你隔著門,用碑林正音一字一句地誦出《巡行法度》第三章——執燈者**無令不得入民居**,違者奪燈三年。\n\n誦音在樓梯間僵住了。燃燈庭最怕的從來不是武力,是**被自己的教法定罪**。門外沉默了十秒,一個聲音硬邦邦地丟下「我們會回來」,軍靴聲退下樓去。\n\n泰奧靠著門滑坐在地,不敢相信地看著你:「……他們居然真的走了。」\n\n「他們會回來,」你已經在收拾拓片,「而我們不會在。」",
        choices: [{ text: "帶著泰奧從後巷撤離", goto: "pro_exile_08" }]
    };
    nodes.pro_exile_05b = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "房門被一腳踹開——兩名執燈者的身影堵住門框,誦音戛然而止。打頭那人的目光掠過你、掠過泰奧,最後釘在手提箱上,瞳孔驟然收縮:\n\n「**聖火的獻禮,在褻瀆者手裡。**」\n\n沒有談判的餘地了。",
        choices: [{ text: "迎戰!", combat: "enc_exile_zealots" }]
    };
    nodes.pro_exile_05c = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "你拽著泰奧翻出窗框的瞬間,房門在身後被踹開。鏽色的雨裡,你們貼著瓦棱狂奔,身後的怒吼被雨聲越拉越遠。\n\n三個街區之後,你們癱在一座水塔的陰影下。泰奧咳著笑出聲:「碑林……應該給你開一門**屋頂遁走學**……」",
        choices: [{ text: "喘口氣,往碼頭區移動", goto: "pro_exile_08" }]
    };
    nodes.pro_exile_07 = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "最後一名執燈者倒下,誦音終於斷了。雨聲重新填滿房間。\n\n泰奧扶著桌角站起來,看著地上的僧袍身影,眼裡是說不出的疲憊:「他們曾經也只是……守夜的人。」他搖搖頭,「燃燈庭很快會派更多人來。**走,趁雨大。**」",
        choices: [{ text: "帶著泰奧從後巷撤離", goto: "pro_exile_08" }]
    };
    nodes.pro_exile_07d = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "執燈者的棍杖把你打跪在地。為首那人俯身去撿手提箱——\n\n箱子**發出了一聲鐘鳴**。\n\n不是透過空氣,是直接在每個人的顱骨裡。兩名執燈者像被燙到一樣踉蹌後退,臉上的狂信瞬間被某種更古老的恐懼取代:「它、它醒著——**聖物拒絕了我們**——」\n\n他們跌跌撞撞地逃下樓去。你趴在地板上,聽著箱子裡的搏動慢慢平息,像什麼都沒發生過。\n\n泰奧用氣音說:「……它**選了你**。」",
        choices: [{ text: "撐起身子,帶著泰奧從後巷撤離", goto: "pro_exile_08" }]
    };
    nodes.pro_exile_08 = {
        location: "dawnport_slums", chapterLabel: EXI,
        text: "通往碼頭區的天橋上,泰奧突然停住腳步。\n\n你順著他的目光望去——港區上空,**三道黑煙**正沖天而起,爆炸的悶響隔著半個城市滾過來。無標識的武裝穿梭機掠過塔吊之間,下城區的方向已經響起了警報。\n\n「黑曜……」泰奧的臉色比雨還冷,「他們沒等三天。**他們直接來取貨了。**」\n\n他把你往碼頭的方向推:「斷纜酒吧就在碼頭區!我去碑林的安全屋通知大祭司——**跑!**」",
        choices: [{ text: "衝進燃燒的碼頭區", goto: "pro_common_01" }]
    };

    /* ============================================================
       匯合段 —— 序章〈曙光港之夜〉
       ============================================================ */
    const COM = "序章〈曙光港之夜〉";

    nodes.pro_common_01 = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ quest: "pro_case", op: "advance" }, { set: "pro.dawnport_attack" }],
        text: "曙光港的碼頭區已經變成一座燃燒的迷宮。\n\n武裝傭兵三人一組地掃過棧橋,沒有旗號、沒有宣告,槍口上的戰術燈像一群移動的冷眼。他們不搶物資、不抓人質——他們在**找東西**,挨著貨棧一間一間地翻。\n\n你懷裡的手提箱,隔著箱壁**發燙**。\n\n斷纜酒吧的霓虹燈牌就在前方三百公尺,半邊已經熄了。",
        choices: [
            { text: "抄最短的路,直奔斷纜酒吧", goto: "pro_common_03" },
            { text: "先把被壓在傾倒貨架下的碼頭工人拉出來", check: { attr: "STR", dc: 12, success: "pro_common_02a", fail: "pro_common_02b" } }
        ]
    };
    nodes.pro_common_02a = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ xp: 20 }, { set: "pro.helped_worker" }],
        text: "你肩膀頂住貨架,合金橫樑在你的怒吼裡抬起十公分——夠了。工人連滾帶爬地脫身,抓著你的手臂喘氣:\n\n「找掩護的話……走**檢修暗道**,棧橋底下,直通酒吧後巷!那些狗雜種還沒摸清碼頭的路!」\n\n他往下城區跑去。你記下了暗道的入口。",
        choices: [{ text: "鑽進檢修暗道,直達酒吧後巷", goto: "pro_common_03" }]
    };
    nodes.pro_common_02b = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ hp: -5 }, { set: "pro.helped_worker" }],
        text: "橫樑比看起來重得多。你抬到一半,上方的貨箱塌了下來——你用背擋住最大的一只,把工人從縫隙裡拽了出來,代價是肩胛一陣火辣辣的劇痛。\n\n「謝、謝了兄弟——」工人頭也不回地逃進煙裡。\n\n你揉著肩膀站起來。做好事,在曙光港從來都不便宜。",
        choices: [{ text: "繼續趕往斷纜酒吧", goto: "pro_common_03" }]
    };
    nodes.pro_common_03 = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "斷纜酒吧的大門被炸開了,吧檯後的酒瓶牆碎了一地。\n\n一個穿舊聯邦飛行夾克的女人正背靠翻倒的桌子,用一把制式手槍和門外的兩名傭兵對射。她的動作**教科書般標準**——三發點放、換彈、變換掩體,一氣呵成。但她只有一個人,彈匣不會說謊。\n\n傭兵的包抄路線已經展開。",
        choices: [
            { text: "從側翼開火,打亂傭兵的包抄", goto: "pro_common_04a" },
            { text: "高喊:「賈維在哪?!」", goto: "pro_common_04b" }
        ]
    };
    nodes.pro_common_04a = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ affinity: "kaila", val: 1 }, { set: "pro.covered_kaila" }],
        text: "你的火力從側翼炸開的瞬間,女人立刻讀懂了戰局——她翻身脫離掩體,和你形成完美的交叉射界。兩名傭兵丟下一具冒煙的動力甲,罵罵咧咧地退進了煙幕。\n\n「漂亮。」她一邊換彈一邊打量你,目光在你懷裡的手提箱上停了半秒,「**你是賈維在等的人。**」\n\n「你認識賈維?」\n\n「他欠我錢,我欠他命,扯平。」她抓起吧檯上的酒瓶灌了一口,「我叫**凱菈**。老頭在碼頭底端的泊位,守著他那艘破船。傭兵也在往那邊收網——**走,帶路費就當他還我了。**」",
        choices: [{ text: "跟凱菈一起殺向碼頭底端", goto: "pro_common_05" }]
    };
    nodes.pro_common_04b = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "「賈維」兩個字像一發訊號彈。女人的槍口瞬間轉向你——又在看清你懷裡的手提箱後移開。\n\n「趴下!」她一個點放逼退探頭的傭兵,「**你是老頭在等的人?**他在碼頭底端的泊位。」她利落地退到你身邊的掩體後,「我叫**凱菈**,他欠我錢,我欠他命。傭兵在往碼頭收網,一個人你走不到底端——**跟緊我。**」",
        choices: [{ text: "跟凱菈一起殺向碼頭底端", goto: "pro_common_05" }]
    };
    nodes.pro_common_05 = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ party: "kaila" }],
        text: "{凱菈}對碼頭的火線嗅覺近乎本能——哪片陰影安全、哪段棧橋會被交叉火力覆蓋,她用手勢告訴你,精準得像在自家艦橋上。\n\n「以前是聯邦的艦長,」她在一段管廊下丟給你一句,像在說別人的事,「**晨星號**。沉了。別問。」\n\n碼頭底端的泊位到了。一艘老舊的獨立跳躍艦趴在泊架上,船身的名字被歲月磨得只剩淺痕——**迴響號**。舷梯下,一個白髮老人正把一支老式霰彈槍架在貨箱上,朝著追兵的方向罵出整條航道最髒的髒話。",
        choices: [{ text: "「賈維?!」——衝過去", goto: "pro_common_06" }]
    };
    nodes.pro_common_06 = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "{賈維}的左腿已經被打穿,靠著貨箱半坐著,臉色灰得像艙底漆。看見你懷裡的箱子,老人渾濁的眼睛裡竟然燒起光來:\n\n「哈……**到了**。真的到了。」他嘶聲笑著,朝你伸出手,「打開。讓我看一眼。我用整條航線的人脈換這一眼——」\n\n你按開芮妮、歐嘉、泰奧們用命換來的鎖扣。\n\n箱子裡,一枚拳頭大的**黑色晶體**躺在減震凝膠中。你湊近的瞬間,它**亮了**:一縷幽藍的光在晶體內部游動,像認出了什麼。\n\n然後你聽見了。不是聲音——是**直接出現在你腦海裡的低語**。",
        choices: [
            { text: "閉上眼,讓低語流進來——你想聽懂它", goto: "pro_common_07a", effects: [{ erosion: 8 }, { set: "pro.listened" }] },
            { text: "咬住舌尖斬斷幻聽,合上箱蓋", goto: "pro_common_07b" }
        ]
    };
    nodes.pro_common_07a = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ item: "weaver_fragment", qty: 1 }, { item: "sealed_case", qty: -1 }],
        text: "低語湧進來的剎那,你看見了不屬於你的畫面:**一張橫跨星海的巨大琴弦之網**,某處斷了一根,斷口正在滲出黑暗。\n\n一個念頭清晰得像烙印:「**弦斷之處,它在聽。**」\n\n你踉蹌著回神,鼻腔裡有血的鐵鏽味。晶體溫順地躺進你掌心——它**認得你了**。\n\n{賈維}死死盯著你,聲音發啞:「四十年……我聽過上百個關於它的傳說,沒有一個說它會**選人**。」",
        choices: [{ text: "「他們來了——」", goto: "pro_common_09" }]
    };
    nodes.pro_common_07b = {
        location: "dawnport_docks", chapterLabel: COM,
        onEnter: [{ item: "weaver_fragment", qty: 1 }, { item: "sealed_case", qty: -1 }, { set: "pro.resisted" }],
        text: "你用疼痛把自己錨在現實裡,一把合上箱蓋。低語像退潮般散去,只留下太陽穴突突的鈍痛。\n\n「聰明,」{賈維}低聲說,眼裡卻有一絲你讀不懂的遺憾,「聽得太久的人,都變得**不太像自己**了。但孩子,記住——**有些門,你遲早得開。**」\n\n他把晶體連凝膠一起塞進一只舊皮袋,拍進你手裡。",
        choices: [{ text: "「他們來了——」", goto: "pro_common_09" }]
    };
    nodes.pro_common_09 = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "探照燈光柱劈開煙幕。一支獵犬小隊踏上泊位棧橋——為首的傭兵隊長把步槍扛在肩上,語氣像在談一筆例行公事:\n\n「箱子放下,三位。黑曜集團**只清點資產,不清點屍體**——今天可以例外。」\n\n{凱菈}拉上槍栓,退到你的側翼:「計畫?」\n\n{賈維}在你們身後嘶聲大笑,霰彈槍上膛:「計畫就是——**別讓我這把老骨頭專美於前!**」",
        choices: [{ text: "迎戰獵犬小隊!", combat: "enc_common_hounds" }]
    };
    nodes.pro_common_10 = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "獵犬小隊長癱倒在棧橋上,增援的燈光卻已經在碼頭另一頭亮起——**打贏一場,打不贏一個集團。**\n\n「夠了,都上船!」{賈維}卻沒有動。他靠著貨箱坐著,腿上的血泊已經漫過艙板接縫。他把一張磨得發亮的**鑰卡**拍進你手心:\n\n「迴響號……跟了我四十年,脾氣比我還老。」他的聲音一句比一句輕,「帶著那塊石頭,去**燈塔站**,找流亡者的**『舵』歐蕾**……她知道下一步。別、別讓黑曜——」\n\n一發流彈打碎他身後的貨箱。{凱菈}一把拽起你:「**他說完了!走!**」\n\n你最後看見的賈維,是他重新架起霰彈槍的側影,和那句混在槍聲裡的:「**替老頭子,看看星區的真相——!**」",
        choices: [{ text: "衝上舷梯,啟動迴響號", goto: "pro_common_11" }]
    };
    nodes.pro_common_10d = {
        location: "dawnport_docks", chapterLabel: COM,
        text: "你在震盪中被{凱菈}拖上舷梯——她的額角淌著血,半拖半扛地把你摔進氣閘。\n\n棧橋上,{賈維}用霰彈槍打光了最後一發,把什麼東西**奮力拋進**正在關閉的艙門——一張磨得發亮的鑰卡,和一只裹著晶體的舊皮袋。\n\n「去燈塔站!找『舵』歐蕾!」老人的吼聲混在槍聲裡,「**替老頭子看看星區的真相——**」\n\n艙門合攏,切斷了之後的一切。",
        choices: [{ text: "掙扎著爬向駕駛艙", goto: "pro_common_11" }]
    };
    nodes.pro_common_11 = {
        location: "echo_ship", chapterLabel: COM,
        onEnter: [{ item: "echo_keycard", qty: 1 }, { quest: "pro_case", op: "advance" }],
        text: "迴響號的駕駛艙聞起來像舊皮革和廉價菸草。鑰卡插入的瞬間,整艘船像老獸甦醒般震顫起來,儀表板的琥珀色燈光次第亮起。\n\n{凱菈}已經滑進副駕:「泊架鎖我來炸。港口彈射軌道還有電——但窗口只有**一次**。」\n\n舷窗外,傭兵的探照燈已經鎖定舷梯。",
        choices: [
            { text: "親手操縱——賭上你所有的反應神經", check: { attr: "AGI", dc: 12, success: "pro_common_12a", fail: "pro_common_12b" } },
            { text: "「凱菈,妳是艦長——船交給妳。」", goto: "pro_common_12c", effects: [{ affinity: "kaila", val: 1 }] }
        ]
    };
    nodes.pro_common_12a = {
        location: "echo_ship", chapterLabel: COM,
        text: "你把推進器推到超載紅線。迴響號掙脫泊架的瞬間,一整面警告燈亮成聖誕樹——你不管,貼著塔吊的縫隙把船**擰**出港區,彈射軌道的電磁波把追擊的穿梭機遠遠甩在身後。\n\n{凱菈}在副駕吹了聲口哨:「晨星號的舵手都沒你這麼野。」\n\n她頓了頓,補上一句:「**這是稱讚。**」",
        choices: [{ text: "衝出大氣層", goto: "pro_common_13" }]
    };
    nodes.pro_common_12b = {
        location: "echo_ship", chapterLabel: COM,
        onEnter: [{ hp: -6 }],
        text: "你高估了老船的響應速度——迴響號擦著塔吊犁出一路火花,一根天線杆撞碎了左舷觀察窗,失壓警報淒厲地叫起來。你的額頭磕在操縱桿上,眼前直冒金星。\n\n{凱菈}一把接管副操縱:「拉高!**拉高!**」\n\n老船呻吟著爬出火線。她瞥了你一眼,沒有嘲笑:「第一次開四十年的老船就敢硬闖彈射軌道——**晨星號會歡迎你這種瘋子。**」",
        choices: [{ text: "衝出大氣層", goto: "pro_common_13" }]
    };
    nodes.pro_common_12c = {
        location: "echo_ship", chapterLabel: COM,
        text: "{凱菈}的手指落上操縱桿的瞬間,整艘迴響號**變了一個靈魂**。\n\n脫離泊架、翻滾規避、切入彈射軌道——一連串機動乾淨得像教學影片,追擊的穿梭機連她的尾焰都咬不住。她全程面無表情,只在衝出港區防空圈的那一刻,極輕地吐出一口氣。\n\n「兩年了,」她說,像在對船說,也像在對自己說,「**我以為我再也不會碰操縱桿了。**」",
        choices: [{ text: "衝出大氣層", goto: "pro_common_13" }]
    };
    nodes.pro_common_13 = {
        location: "echo_ship", chapterLabel: COM,
        onEnter: [
            { quest: "pro_case", op: "complete" },
            { xp: 80 }, { chapter: 1 }, { set: "pro.finished" }
        ],
        text: "賽壬星縮成舷窗裡的一枚藍寶石。曙光港的黑煙,已經細得像一縷祭香。\n\n芮妮、歐嘉、泰奧、賈維——今夜所有名字的重量,都壓進你掌心那枚**織界者碎片**裡。它安靜地搏動著,幽藍的光紋緩慢明滅,像一句沒說完的話。\n\n突然,它亮了一下——光紋在艙頂投出一瞬即逝的**星圖**:一個閃爍的座標,指向赫利俄斯星系。\n\n{凱菈}盯著那片殘光,再看看你:「燈塔站。老頭讓你找的『舵』也在那。」她把手伸過來,「先說好——我不是你的船員,我只是**順路討債**。目的地一樣而已。」\n\n你握住她的手。迴響號的躍遷引擎在腳下開始蓄能,像一頭老獸重新學會了心跳。\n\n**幽弦星區,正在等你。**",
        choices: [{ text: "—— 序章完 ——", goto: "pro_common_14" }]
    };
    nodes.pro_common_14 = {
        location: "echo_ship", chapterLabel: COM,
        text: "—— 序章完 ——\n\n迴響號是你的了。星圖上,賈維留下的最後一條線索指向燈塔站;而掌心的碎片,還藏著沒有說完的話。",
        choices: [
            { text: "▸ 第一章〈墜落的信標〉", goto: "ch1_01" },
            { text: "回到主選單(進度已自動存檔)", action: "mainMenu" }
        ]
    };

    Object.assign(D.nodes = D.nodes || {}, nodes);
})();
