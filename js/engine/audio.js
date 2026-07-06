/* ============================================================
   audio.js — 生成式配樂與分層音效(Web Audio 即時合成,零音檔)
   - 音樂:前瞻排程器驅動的生成式配樂。每種情境有自己的調性、
     和弦進行、配器與節奏;旋律逐小節隨機生成,永不重複。
   - 音效:多層合成(衝擊層+質感層+尾音)+ 隨機音高微調。
   - 音訊圖:master ← musicBus / sfxBus;另設共用合成殘響。
   ============================================================ */
(function () {
    "use strict";

    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const Audio = {
        ctx: null,
        master: null,
        musicBus: null,
        sfxBus: null,
        mood: null,
        _noiseBuffer: null,

        /* ================= 初始化與音訊圖 ================= */
        ensure() {
            if (Audio.ctx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            const ctx = Audio.ctx = new AC();

            Audio.master = ctx.createGain();
            Audio.master.gain.value = 1;
            Audio.master.connect(ctx.destination);

            Audio.musicBus = ctx.createGain();
            Audio.sfxBus = ctx.createGain();
            Audio.musicBus.connect(Audio.master);
            Audio.sfxBus.connect(Audio.master);

            // 合成殘響:指數衰減雜訊脈衝響應,給聲音空間感
            const rvLen = ctx.sampleRate * 1.8;
            const impulse = ctx.createBuffer(2, rvLen, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const d = impulse.getChannelData(ch);
                for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.6);
            }
            const convolver = ctx.createConvolver();
            convolver.buffer = impulse;
            const rvOut = ctx.createGain();
            rvOut.gain.value = 0.55;
            convolver.connect(rvOut);
            rvOut.connect(Audio.master);

            const sendM = ctx.createGain(); sendM.gain.value = 0.32;
            const sendS = ctx.createGain(); sendS.gain.value = 0.16;
            Audio.musicBus.connect(sendM); sendM.connect(convolver);
            Audio.sfxBus.connect(sendS); sendS.connect(convolver);

            Audio._applyVolumes();
        },

        resume() {
            Audio.ensure();
            if (Audio.ctx && Audio.ctx.state === "suspended") Audio.ctx.resume();
        },

        /* ================= 音量(音樂/音效分離) ================= */
        _applyVolumes() {
            if (!Audio.ctx) return;
            const st = SE.settings || {};
            const mv = st.musicOn === false ? 0 : (st.musicVol != null ? st.musicVol : 0.5);
            const sv = st.sfxOn === false ? 0 : (st.sfxVol != null ? st.sfxVol : 0.8);
            const t = Audio.ctx.currentTime;
            Audio.musicBus.gain.setTargetAtTime(mv, t, 0.05);
            Audio.sfxBus.gain.setTargetAtTime(sv, t, 0.05);
        },
        setMusicVol(v) { SE.settings.musicVol = v; Audio._applyVolumes(); },
        setSfxVol(v) { SE.settings.sfxVol = v; Audio._applyVolumes(); },
        setSfxOn(on) { SE.settings.sfxOn = on; Audio._applyVolumes(); },
        setMusicOn(on) {
            SE.settings.musicOn = on;
            Audio._applyVolumes();
            if (on && Audio.mood && !Audio._run) Audio._startRun(Audio.mood);
        },

        noiseBuffer() {
            if (Audio._noiseBuffer) return Audio._noiseBuffer;
            const len = Audio.ctx.sampleRate * 1;
            const buf = Audio.ctx.createBuffer(1, len, Audio.ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            Audio._noiseBuffer = buf;
            return buf;
        },

        /* ================= 低階合成元件 ================= */
        /** 單振盪器音符(dest 預設 sfxBus) */
        tone(t0, freq, dur, o) {
            o = o || {};
            const ctx = Audio.ctx;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = o.type || "sine";
            osc.frequency.setValueAtTime(Math.max(1, freq), t0);
            if (o.sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.sweepTo), t0 + dur);
            if (o.detune) osc.detune.setValueAtTime(o.detune, t0);
            const peak = o.gain != null ? o.gain : 0.2;
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t0 + (o.attack || 0.008));
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            let head = osc;
            if (o.filter) {
                const f = ctx.createBiquadFilter();
                f.type = o.filter.type || "lowpass";
                f.frequency.setValueAtTime(o.filter.freq || 1200, t0);
                if (o.filter.sweepTo) f.frequency.exponentialRampToValueAtTime(o.filter.sweepTo, t0 + dur);
                f.Q.value = o.filter.q || 0.8;
                osc.connect(f); head = f;
            }
            head.connect(g);
            g.connect(o.dest || Audio.sfxBus);
            osc.start(t0); osc.stop(t0 + dur + 0.03);
        },

        /** 濾波雜訊爆發 */
        noiseBurst(t0, dur, o) {
            o = o || {};
            const ctx = Audio.ctx;
            const src = ctx.createBufferSource();
            src.buffer = Audio.noiseBuffer();
            src.loop = true;
            const f = ctx.createBiquadFilter();
            f.type = o.filterType || "bandpass";
            f.frequency.setValueAtTime(o.freq || 1200, t0);
            if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.sweepTo), t0 + dur);
            f.Q.value = o.q || 1;
            const g = ctx.createGain();
            const nPeak = Math.max(0.0006, o.gain != null ? o.gain : 0.16);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(nPeak, t0 + (o.attack || 0.006));
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            src.connect(f); f.connect(g); g.connect(o.dest || Audio.sfxBus);
            src.start(t0); src.stop(t0 + dur + 0.03);
        },

        /** FM 鐘音(旋律用,泛音乾淨) */
        bell(t0, freq, dur, o) {
            o = o || {};
            const ctx = Audio.ctx;
            const car = ctx.createOscillator();
            const mod = ctx.createOscillator();
            const mg = ctx.createGain();
            const g = ctx.createGain();
            car.frequency.value = freq;
            mod.frequency.value = freq * (o.ratio || 2.01);
            mg.gain.setValueAtTime(freq * (o.fm || 1.4), t0);
            mg.gain.exponentialRampToValueAtTime(freq * 0.05, t0 + dur * 0.8);
            mod.connect(mg); mg.connect(car.frequency);
            const peak = Math.max(0.0006, o.gain != null ? o.gain : 0.14);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            car.connect(g); g.connect(o.dest || Audio.sfxBus);
            car.start(t0); mod.start(t0);
            car.stop(t0 + dur + 0.05); mod.stop(t0 + dur + 0.05);
        },

        /** 撥弦(琶音/短音) */
        pluck(t0, freq, dur, o) {
            o = o || {};
            Audio.tone(t0, freq, dur, {
                type: o.type || "triangle", gain: o.gain != null ? o.gain : 0.14,
                attack: 0.004, dest: o.dest,
                filter: { type: "lowpass", freq: freq * 5, sweepTo: freq * 1.5, q: 0.7 }
            });
        },

        /* ---- 打擊樂 ---- */
        kick(t0, o) {
            o = o || {};
            Audio.tone(t0, o.hi || 130, o.dur || 0.16, { type: "sine", sweepTo: o.lo || 44, gain: o.gain != null ? o.gain : 0.5, attack: 0.004, dest: o.dest });
            Audio.noiseBurst(t0, 0.02, { freq: 3500, filterType: "highpass", gain: 0.06, dest: o.dest });
        },
        snare(t0, o) {
            o = o || {};
            Audio.noiseBurst(t0, 0.16, { freq: 1900, q: 0.9, gain: o.gain != null ? o.gain : 0.2, dest: o.dest });
            Audio.tone(t0, 195, 0.07, { type: "triangle", gain: 0.12, dest: o.dest });
        },
        hat(t0, o) {
            o = o || {};
            Audio.noiseBurst(t0, o.open ? 0.14 : 0.035, { freq: 7500, filterType: "highpass", gain: o.gain != null ? o.gain : 0.07, dest: o.dest });
        },
        tomLow(t0, o) {
            o = o || {};
            Audio.tone(t0, 100, 0.35, { type: "sine", sweepTo: 52, gain: o.gain != null ? o.gain : 0.42, attack: 0.005, dest: o.dest });
        },

        /* ================= 生成式配樂引擎 ================= */
        /*
           每種情境(mood)一份樂譜規格:調性、BPM、和弦進行與配器。
           排程器每 16 分音符走一步:小節首拍換和弦(pad/stab)、
           低音與打擊照 pattern、琶音照型態、旋律逐小節隨機生成。
        */
        SCALES: {
            minor: [0, 2, 3, 5, 7, 8, 10],
            major: [0, 2, 4, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10]
        },

        MOODS: {
            /* 主選單:神秘、緩慢的序曲 */
            menu: {
                bpm: 58, root: 45, scale: "minor", prog: [0, 5, 2, 6], barsPerChord: 2,
                pad: { gain: 0.11, cutoff: 750 },
                bass: { steps: [0], oct: 0, gain: 0.16, dur: 3.4 },
                melody: { inst: "bell", density: 0.45, oct: 2, gain: 0.09, dur: 2.2 }
            },
            /* 探索:廣袤星海,溫和流動 */
            explore: {
                bpm: 74, root: 50, scale: "dorian", prog: [0, 3, 4, 3], barsPerChord: 1,
                pad: { gain: 0.09, cutoff: 900 },
                bass: { steps: [0, 8], oct: 0, gain: 0.15, dur: 1.5 },
                arp: { rate: 2, mode: "up", oct: 1, gain: 0.055, inst: "pluck", dur: 0.5 },
                melody: { inst: "bell", density: 0.3, oct: 2, gain: 0.075, dur: 1.6 },
                hatProb: 0.12
            },
            /* 樞紐站:熱鬧、有生氣的律動 */
            hub: {
                bpm: 104, root: 53, scale: "major", prog: [0, 3, 4, 0], barsPerChord: 1,
                pad: { gain: 0.06, cutoff: 1100 },
                bass: { steps: [0, 6, 8, 14], oct: 0, gain: 0.17, dur: 0.32, alt: 7 },
                arp: { rate: 2, mode: "updown", oct: 1, gain: 0.075, inst: "pluck", dur: 0.28 },
                melody: { inst: "pluck", density: 0.5, oct: 2, gain: 0.09, dur: 0.5 },
                perc: { kick: [0, 8], hatEvery: 2, hatGain: 0.05 }
            },
            /* 地面戰:急促緊張的驅動節奏 */
            combat: {
                bpm: 132, root: 48, scale: "minor", prog: [0, 0, 5, 6], barsPerChord: 1,
                pad: { gain: 0.05, cutoff: 800 },
                bass: { steps: [0, 2, 4, 6, 8, 10, 12, 14], oct: 0, gain: 0.16, dur: 0.14, type: "sawtooth" },
                arp: { rate: 1, mode: "random", oct: 1, gain: 0.06, inst: "pluck", type: "square", dur: 0.12 },
                melody: { inst: "lead", density: 0.22, oct: 2, gain: 0.07, dur: 0.5 },
                perc: { kick: [0, 4, 8, 12], snare: [4, 12], hatEvery: 1, hatGain: 0.055 },
                stab: { gain: 0.1, dur: 0.3 }
            },
            /* 艦戰:磅礴壯闊、厚重的史詩感 */
            shipcombat: {
                bpm: 100, root: 40, scale: "minor", prog: [0, 5, 2, 6], barsPerChord: 1,
                pad: { gain: 0.12, cutoff: 950 },
                bass: { steps: [0, 8], oct: 0, gain: 0.2, dur: 1.1 },
                melody: { inst: "lead", density: 0.28, oct: 2, gain: 0.08, dur: 0.9 },
                perc: { kick: [0, 8], snare: [12], tom: [7, 14], hatEvery: 4, hatGain: 0.04, kickGain: 0.55 },
                stab: { gain: 0.16, dur: 0.7 }
            },
            /* 災變:陰暗、不安、失序 */
            cataclysm: {
                bpm: 62, root: 36, scale: "phrygian", prog: [0, 1, 0, 6], barsPerChord: 2,
                pad: { gain: 0.11, cutoff: 620, dissonant: true },
                bass: { steps: [0, 11], oct: 0, gain: 0.2, dur: 2.2 },
                melody: { inst: "bell", density: 0.22, oct: 2, gain: 0.06, dur: 2.6, dark: true },
                thudProb: 0.1
            },
            /* 終章/結局:情感漸強,層層堆疊 */
            finale: {
                bpm: 78, root: 45, scale: "minor", prog: [0, 5, 2, 6], barsPerChord: 1,
                pad: { gain: 0.1, cutoff: 1050 },
                bass: { steps: [0, 8], oct: 0, gain: 0.17, dur: 1.4 },
                arp: { rate: 2, mode: "up", oct: 1, gain: 0.07, inst: "pluck", dur: 0.45 },
                melody: { inst: "bell", density: 0.55, oct: 2, gain: 0.1, dur: 1.4 },
                perc: { kick: [0, 8], hatEvery: 4, hatGain: 0.035, kickGain: 0.3 },
                build: true   // 隨小節數逐層加入配器
            }
        },

        _run: null,

        degMidi(spec, deg, oct) {
            const sc = Audio.SCALES[spec.scale];
            const idx = ((deg % sc.length) + sc.length) % sc.length;
            const wrap = Math.floor(deg / sc.length);
            return spec.root + sc[idx] + 12 * (wrap + (oct || 0));
        },
        chordTones(spec, chordDeg) {
            return [chordDeg, chordDeg + 2, chordDeg + 4];
        },

        startAmbient(mood) {
            Audio.mood = mood;
            if (!SE.settings || SE.settings.musicOn === false) { Audio._stopRun(0.3); return; }
            Audio.ensure();
            if (!Audio.ctx) return;
            if (Audio._run && Audio._run.mood === mood) return;   // 同情境不重啟
            Audio._startRun(mood);
        },

        _startRun(mood) {
            const spec = Audio.MOODS[mood] || Audio.MOODS.explore;
            Audio._stopRun(1.4);
            const ctx = Audio.ctx;

            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.8);
            g.connect(Audio.musicBus);

            const run = {
                mood: mood, spec: spec, dest: g,
                step: 0, bar: 0,
                stepDur: 60 / spec.bpm / 4,
                nextTime: ctx.currentTime + 0.1,
                melodyPlan: null, lastMelDeg: 7,
                timer: null
            };
            run.timer = setInterval(function () { Audio._tick(run); }, 90);
            Audio._run = run;
        },

        _stopRun(fade) {
            const run = Audio._run;
            if (!run) return;
            Audio._run = null;
            clearInterval(run.timer);
            const ctx = Audio.ctx;
            try {
                run.dest.gain.cancelScheduledValues(ctx.currentTime);
                run.dest.gain.setValueAtTime(run.dest.gain.value || 1, ctx.currentTime);
                run.dest.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (fade || 1));
                setTimeout(function () { try { run.dest.disconnect(); } catch (e) {} }, (fade || 1) * 1000 + 200);
            } catch (e) { /* 節點可能已釋放 */ }
        },

        stopAmbient() { Audio._stopRun(0.6); },

        _tick(run) {
            if (Audio._run !== run || !Audio.ctx) return;
            const ctx = Audio.ctx;
            while (run.nextTime < ctx.currentTime + 0.35) {
                Audio._scheduleStep(run, run.nextTime);
                run.nextTime += run.stepDur;
                run.step++;
                if (run.step % 16 === 0) run.bar++;
            }
        },

        _scheduleStep(run, t) {
            const spec = run.spec, dest = run.dest;
            const stepInBar = run.step % 16;
            const chordIdx = Math.floor(run.bar / (spec.barsPerChord || 1)) % spec.prog.length;
            const chordDeg = spec.prog[chordIdx];
            const tones = Audio.chordTones(spec, chordDeg);
            // 終章漸強:0→1 隨小節堆疊配器
            const build = spec.build ? Math.min(1, run.bar / 12) : 1;

            /* 和弦墊音 + 銅管式 stab:換和弦的小節首拍 */
            if (stepInBar === 0 && run.bar % (spec.barsPerChord || 1) === 0) {
                if (spec.pad) Audio._pad(run, t, tones, build);
                if (spec.stab) Audio._stab(run, t, tones);
                run.melodyPlan = Audio._planMelody(run, tones);
            }

            /* 低音 */
            const bass = spec.bass;
            if (bass && bass.steps.indexOf(stepInBar) !== -1 && !(spec.build && build < 0.45)) {
                let deg = chordDeg;
                if (bass.alt != null && bass.steps.indexOf(stepInBar) % 2 === 1) deg = chordDeg + 4; // 交替五音
                const f = mtof(Audio.degMidi(spec, deg, -1));
                Audio.tone(t, f, bass.dur, { type: bass.type || "triangle", gain: bass.gain * build, attack: 0.01, dest: dest, filter: { type: "lowpass", freq: 500 } });
                Audio.tone(t, f / 2, bass.dur, { type: "sine", gain: bass.gain * 0.7 * build, attack: 0.01, dest: dest });
            }

            /* 琶音 */
            const arp = spec.arp;
            if (arp && stepInBar % arp.rate === 0 && !(spec.build && build < 0.3)) {
                const seq = stepInBar / arp.rate;
                let deg;
                if (arp.mode === "up") deg = tones[seq % 3] + (seq % 6 >= 3 ? 7 : 0);
                else if (arp.mode === "updown") deg = tones[[0, 1, 2, 1][seq % 4]];
                else deg = pick(tones) + pick([0, 0, 7]);
                const f = mtof(Audio.degMidi(spec, deg, arp.oct)) * rnd(0.999, 1.001);
                Audio.pluck(t, f, arp.dur, { gain: arp.gain * build, type: arp.type, dest: dest });
            }

            /* 旋律(逐小節隨機生成) */
            if (run.melodyPlan && run.melodyPlan[stepInBar] != null) {
                const m = spec.melody;
                const f = mtof(Audio.degMidi(spec, run.melodyPlan[stepInBar], m.oct)) * rnd(0.998, 1.002);
                if (m.inst === "bell") Audio.bell(t, f, m.dur, { gain: m.gain * build, dest: dest, ratio: m.dark ? 2.76 : 2.01 });
                else if (m.inst === "lead") Audio.tone(t, f, m.dur, { type: "sawtooth", gain: m.gain * build, attack: 0.03, dest: dest, filter: { type: "lowpass", freq: 2200, sweepTo: 900 } });
                else Audio.pluck(t, f, m.dur, { gain: m.gain * build, dest: dest });
            }

            /* 打擊樂 */
            const perc = spec.perc;
            if (perc && !(spec.build && build < 0.6)) {
                if (perc.kick && perc.kick.indexOf(stepInBar) !== -1) Audio.kick(t, { dest: dest, gain: (perc.kickGain || 0.42) * build });
                if (perc.snare && perc.snare.indexOf(stepInBar) !== -1) Audio.snare(t, { dest: dest, gain: 0.16 * build });
                if (perc.tom && perc.tom.indexOf(stepInBar) !== -1) Audio.tomLow(t, { dest: dest });
                if (perc.hatEvery && stepInBar % perc.hatEvery === 0 && Math.random() < 0.92)
                    Audio.hat(t, { dest: dest, gain: perc.hatGain || 0.05, open: stepInBar % 8 === 6 });
            }
            if (spec.hatProb && Math.random() < spec.hatProb) Audio.hat(t, { dest: dest, gain: 0.03 });
            if (spec.thudProb && Math.random() < spec.thudProb) Audio.tomLow(t, { dest: dest, gain: 0.3 });
        },

        /** 每小節規劃旋律:和弦內音為錨的隨機漫步,密度控制留白 */
        _planMelody(run, tones) {
            const m = run.spec.melody;
            if (!m || Math.random() > (m.density * 1.6)) return null;
            const plan = {};
            let deg = run.lastMelDeg;
            const anchors = tones.map(x => x + 7); // 高一個八度區
            for (let s = 0; s < 16; s += 2) {
                if (Math.random() > m.density) continue;
                if (s === 0 || Math.random() < 0.45) deg = pick(anchors);
                else deg += pick([-1, 1, -2, 2]);
                plan[s] = deg;
            }
            run.lastMelDeg = deg;
            return plan;
        },

        _pad(run, t, tones, build) {
            const spec = run.spec, pad = spec.pad;
            const ctx = Audio.ctx;
            const dur = run.stepDur * 16 * (spec.barsPerChord || 1) + 0.6;
            const notes = tones.slice();
            if (pad.dissonant) notes.push(tones[0] + 1);   // 災變:小二度摩擦
            notes.forEach(function (deg) {
                const f = mtof(Audio.degMidi(spec, deg, 0));
                [-6, 6].forEach(function (cents) {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    const filt = ctx.createBiquadFilter();
                    osc.type = "sawtooth";
                    osc.frequency.value = f;
                    osc.detune.value = cents;
                    filt.type = "lowpass";
                    filt.frequency.value = pad.cutoff;
                    const peak = (pad.gain / notes.length) * build;
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t + 0.9);
                    g.gain.setValueAtTime(Math.max(0.001, peak), t + dur - 1.2);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                    osc.connect(filt); filt.connect(g); g.connect(run.dest);
                    osc.start(t); osc.stop(t + dur + 0.05);
                });
            });
        },

        _stab(run, t, tones) {
            const spec = run.spec;
            tones.forEach(function (deg) {
                const f = mtof(Audio.degMidi(spec, deg, 0));
                Audio.tone(t, f, spec.stab.dur, { type: "sawtooth", gain: spec.stab.gain / 3, attack: 0.015, dest: run.dest, filter: { type: "lowpass", freq: 1400, sweepTo: 500 } });
            });
        },

        /* ================= 情境判定與切換 ================= */
        sceneMood() {
            const S = SE.State;
            if (!S || !S.data) return "menu";
            const loc = S.data.location || "";
            if (loc.indexOf("chordheart") === 0 || S.getFlag("game.finished")) return "finale";
            if (S.getFlag("world.cataclysm")) return "cataclysm";
            if (loc === "helios_lighthouse" || loc === "mist_anchorage") return "hub";
            return "explore";
        },

        /** 依當前遊戲狀態切換情境音樂(同情境時不重啟) */
        updateMood() { Audio.startAmbient(Audio.sceneMood()); },

        enterCombatMood(kind) { Audio.startAmbient(kind === "ship" ? "shipcombat" : "combat"); },
        exitCombatMood() { Audio.updateMood(); },

        /* ================= 分層音效(SFX) ================= */
        /* 設計:衝擊層(低頻/快攻擊)+ 質感層(中頻特徵音)+ 尾音層,
           搭配 ±3% 隨機音高,連續觸發不機械。 */
        _sfx: {
            click(t, v) { Audio.tone(t, 950 * v, 0.04, { type: "sine", gain: 0.08 }); Audio.noiseBurst(t, 0.012, { freq: 4200, filterType: "highpass", gain: 0.03 }); },
            select(t, v) { Audio.pluck(t, 520 * v, 0.12, { gain: 0.11 }); Audio.pluck(t + 0.06, 780 * v, 0.16, { gain: 0.1 }); },

            checkOk(t, v) { [523, 659, 784].forEach((f, i) => Audio.pluck(t + i * 0.06, f * v, 0.22, { gain: 0.13 })); },
            checkFail(t, v) {
                Audio.tone(t, 240 * v, 0.2, { type: "sawtooth", sweepTo: 150 * v, gain: 0.1, filter: { type: "lowpass", freq: 900 } });
                Audio.tone(t + 0.02, 60, 0.14, { type: "sine", gain: 0.16 });
            },
            critSuccess(t, v) {
                [659, 784, 988, 1318].forEach((f, i) => Audio.bell(t + i * 0.07, f * v, 0.4, { gain: 0.12 }));
                Audio.noiseBurst(t + 0.2, 0.35, { freq: 8000, filterType: "highpass", gain: 0.04, attack: 0.05 });
            },
            critFail(t, v) {
                Audio.tone(t, 170 * v, 0.34, { type: "square", sweepTo: 60, gain: 0.12, filter: { type: "lowpass", freq: 700 } });
                Audio.kick(t + 0.1, { hi: 90, lo: 35, gain: 0.4 });
            },

            hit_kin(t, v) {
                Audio.kick(t, { hi: 150 * v, lo: 42, gain: 0.42, dur: 0.12 });
                Audio.noiseBurst(t, 0.06, { freq: 900 * v, sweepTo: 250, gain: 0.14 });
                Audio.noiseBurst(t + 0.015, 0.1, { freq: 3000, filterType: "highpass", gain: 0.05 });
            },
            hit_en(t, v) {
                Audio.tone(t, 900 * v, 0.1, { type: "square", sweepTo: 180, gain: 0.12, filter: { type: "bandpass", freq: 1300, q: 2 } });
                Audio.tone(t, 1805 * v, 0.06, { type: "sawtooth", sweepTo: 400, gain: 0.06 });
                Audio.noiseBurst(t + 0.03, 0.09, { freq: 2600, gain: 0.05 });
            },
            hit_psi(t, v) {
                Audio.tone(t, 420 * v, 0.24, { type: "sine", detune: 30, gain: 0.11 });
                Audio.tone(t, 428 * v, 0.24, { type: "sine", detune: -30, gain: 0.11 });
                Audio.tone(t + 0.02, 55, 0.18, { type: "sine", gain: 0.14 });
                Audio.bell(t + 0.05, 840 * v, 0.3, { gain: 0.05, ratio: 2.76 });
            },
            miss(t, v) { Audio.noiseBurst(t, 0.16, { freq: 2600 * v, sweepTo: 700, gain: 0.07, filterType: "bandpass", q: 2, attack: 0.02 }); },
            status(t, v) { Audio.tone(t, 320 * v, 0.14, { type: "square", sweepTo: 560 * v, gain: 0.08, filter: { type: "lowpass", freq: 1500 } }); },
            heal(t, v) {
                [392, 523, 659].forEach((f, i) => Audio.pluck(t + i * 0.07, f * v, 0.3, { gain: 0.1 }));
                Audio.bell(t + 0.22, 1046 * v, 0.5, { gain: 0.06 });
            },
            shield(t, v) {
                Audio.bell(t, 1150 * v, 0.35, { gain: 0.1, ratio: 3.53, fm: 2.2 });
                Audio.tone(t, 190 * v, 0.3, { type: "triangle", gain: 0.08, attack: 0.03 });
            },

            victory(t, v) {
                [523, 659, 784, 1046].forEach((f, i) => Audio.pluck(t + i * 0.09, f * v, 0.35, { gain: 0.14 }));
                [523, 659, 784].forEach(f => Audio.tone(t + 0.36, f * v, 0.7, { type: "triangle", gain: 0.06, attack: 0.02 }));
                Audio.noiseBurst(t + 0.36, 0.5, { freq: 9000, filterType: "highpass", gain: 0.04, attack: 0.03 });
            },
            defeat(t, v) {
                [392, 330, 262].forEach((f, i) => Audio.tone(t + i * 0.16, f * v, 0.4, { type: "triangle", gain: 0.11 }));
                Audio.tomLow(t + 0.5, { gain: 0.35 });
            },

            shipFire(t, v) {
                Audio.tone(t, 1900 * v, 0.16, { type: "sawtooth", sweepTo: 220, gain: 0.11, filter: { type: "lowpass", freq: 2800, sweepTo: 500 } });
                Audio.tone(t, 90, 0.12, { type: "sine", sweepTo: 50, gain: 0.22 });
                Audio.noiseBurst(t + 0.04, 0.12, { freq: 1800, sweepTo: 500, gain: 0.05 });
            },
            shipHit(t, v) {
                Audio.kick(t, { hi: 110, lo: 30, gain: 0.5, dur: 0.3 });
                Audio.noiseBurst(t, 0.4, { freq: 700 * v, sweepTo: 120, gain: 0.18, filterType: "lowpass" });
                Audio.noiseBurst(t + 0.12, 0.2, { freq: 4200, filterType: "highpass", gain: 0.04 });
                Audio.bell(t + 0.18, 620 * v, 0.25, { gain: 0.04, ratio: 3.9 });
            },

            levelUp(t, v) {
                [392, 494, 587, 784, 988].forEach((f, i) => Audio.pluck(t + i * 0.07, f * v, 0.3, { gain: 0.13 }));
                Audio.bell(t + 0.38, 1175 * v, 0.7, { gain: 0.08 });
            },
            pickup(t, v) { Audio.tone(t, 880 * v, 0.06, { type: "sine", gain: 0.09 }); Audio.tone(t + 0.055, 1175 * v, 0.1, { type: "sine", gain: 0.09 }); },
            unlock(t, v) { [523, 784, 1046].forEach((f, i) => Audio.bell(t + i * 0.11, f * v, 0.45, { gain: 0.09 })); },
            questComplete(t, v) {
                [659, 880, 1046].forEach((f, i) => Audio.pluck(t + i * 0.09, f * v, 0.3, { gain: 0.12 }));
                Audio.bell(t + 0.3, 1318 * v, 0.6, { gain: 0.07 });
            },
            erosion(t, v) {
                Audio.tone(t, 160 * v, 0.5, { type: "sine", detune: 14, gain: 0.08, attack: 0.08 });
                Audio.tone(t, 163 * v, 0.5, { type: "sine", detune: -14, gain: 0.08, attack: 0.08 });
                Audio.noiseBurst(t + 0.1, 0.4, { freq: 500, q: 3, gain: 0.04, attack: 0.1 });
                Audio.bell(t + 0.15, 233 * v, 0.5, { gain: 0.04, ratio: 3.1 });
            },
            deny(t, v) { Audio.tone(t, 200 * v, 0.07, { type: "square", gain: 0.09 }); Audio.tone(t + 0.09, 155 * v, 0.1, { type: "square", gain: 0.09 }); }
        },

        play(name) {
            if (!SE.settings || SE.settings.sfxOn === false) return;
            Audio.ensure();
            if (!Audio.ctx) return;
            if (Audio.ctx.state === "suspended") Audio.ctx.resume();
            const fn = Audio._sfx[name];
            if (!fn) return;
            try { fn(Audio.ctx.currentTime, rnd(0.97, 1.03)); }   // v = 隨機音高倍率
            catch (e) { /* 音效非關鍵路徑,靜默失敗 */ }
        }
    };

    window.SE = window.SE || {};
    SE.Audio = Audio;
})();
