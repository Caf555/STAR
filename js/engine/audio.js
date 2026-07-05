/* ============================================================
   audio.js — 音效與氛圍音樂(Web Audio 即時合成,零音檔)
   所有聲音皆由振盪器/雜訊緩衝區程式化產生,離線可玩、零依賴。
   ============================================================ */
(function () {
    "use strict";

    const Audio = {
        ctx: null,
        master: null,
        _ambient: null,      // 目前氛圍音樂的節點群組
        mood: null,          // "menu" | "explore" | "combat"
        _savedMood: null,    // 進入戰鬥前的氛圍,供戰後恢復
        _noiseBuffer: null,

        /* ---------- 初始化 ---------- */
        ensure() {
            if (Audio.ctx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            Audio.ctx = new AC();
            Audio.master = Audio.ctx.createGain();
            Audio.master.gain.value = Audio._targetVol();
            Audio.master.connect(Audio.ctx.destination);
        },

        /** 瀏覽器要求使用者手勢才能播放音訊;於任何點擊時呼叫皆安全(重複呼叫無副作用) */
        resume() {
            Audio.ensure();
            if (Audio.ctx && Audio.ctx.state === "suspended") Audio.ctx.resume();
        },

        _targetVol() {
            const st = SE.settings || {};
            if (st.sfxOn === false) return 0;
            return st.volume != null ? st.volume : 0.6;
        },

        setVolume(v) {
            SE.settings.volume = v;
            if (Audio.master) Audio.master.gain.setTargetAtTime(Audio._targetVol(), Audio.ctx.currentTime, 0.05);
        },
        setSfxOn(on) {
            SE.settings.sfxOn = on;
            if (Audio.master) Audio.master.gain.setTargetAtTime(Audio._targetVol(), Audio.ctx.currentTime, 0.05);
        },
        setMusicOn(on) {
            SE.settings.musicOn = on;
            if (!on) Audio.stopAmbient();
            else if (Audio.mood) Audio.startAmbient(Audio.mood);
        },

        /* ---------- 合成工具 ---------- */
        noiseBuffer() {
            if (Audio._noiseBuffer) return Audio._noiseBuffer;
            const len = Audio.ctx.sampleRate * 0.5;
            const buf = Audio.ctx.createBuffer(1, len, Audio.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
            Audio._noiseBuffer = buf;
            return buf;
        },

        /** 單一振盪器音符,含 ADSR 式包絡與可選頻率滑移 */
        tone(t0, freq, dur, opt) {
            opt = opt || {};
            const ctx = Audio.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = opt.type || "sine";
            osc.frequency.setValueAtTime(freq, t0);
            if (opt.sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opt.sweepTo), t0 + dur);
            if (opt.detune) osc.detune.setValueAtTime(opt.detune, t0);
            const peak = opt.gain != null ? opt.gain : 0.22;
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(peak, t0 + (opt.attack || 0.01));
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain);
            gain.connect(Audio.master);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
            return { osc, gain };
        },

        /** 濾波雜訊爆發(用於未命中的氣音、爆炸的悶響) */
        noiseBurst(t0, dur, opt) {
            opt = opt || {};
            const ctx = Audio.ctx;
            const src = ctx.createBufferSource();
            src.buffer = Audio.noiseBuffer();
            const filt = ctx.createBiquadFilter();
            filt.type = opt.filterType || "bandpass";
            filt.frequency.setValueAtTime(opt.freq || 1200, t0);
            if (opt.sweepTo) filt.frequency.exponentialRampToValueAtTime(opt.sweepTo, t0 + dur);
            filt.Q.value = opt.q || 1;
            const gain = ctx.createGain();
            const peak = opt.gain != null ? opt.gain : 0.18;
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(peak, t0 + (opt.attack || 0.01));
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            src.connect(filt);
            filt.connect(gain);
            gain.connect(Audio.master);
            src.start(t0);
            src.stop(t0 + dur + 0.02);
        },

        /* ---------- SFX 目錄 ---------- */
        _sfx: {
            click(t) { Audio.tone(t, 720, 0.045, { type: "sine", gain: 0.10 }); },
            select(t) { Audio.tone(t, 520, 0.09, { type: "triangle", sweepTo: 880, gain: 0.14 }); },

            checkOk(t) { Audio.tone(t, 523, 0.10, { type: "triangle", gain: 0.16 }); Audio.tone(t + 0.08, 659, 0.14, { type: "triangle", gain: 0.16 }); },
            checkFail(t) { Audio.tone(t, 220, 0.22, { type: "sawtooth", sweepTo: 140, gain: 0.14 }); },
            critSuccess(t) { [784, 988, 1318].forEach((f, i) => Audio.tone(t + i * 0.07, f, 0.16, { type: "triangle", gain: 0.18 })); },
            critFail(t) { Audio.tone(t, 180, 0.3, { type: "square", sweepTo: 70, gain: 0.16 }); },

            hit_kin(t) { Audio.tone(t, 110, 0.09, { type: "sine", gain: 0.20 }); Audio.noiseBurst(t, 0.08, { freq: 600, sweepTo: 200, gain: 0.12 }); },
            hit_en(t) { Audio.tone(t, 660, 0.07, { type: "square", sweepTo: 220, gain: 0.14 }); },
            hit_psi(t) { Audio.tone(t, 440, 0.16, { type: "sine", detune: 25, gain: 0.13 }); Audio.tone(t, 446, 0.16, { type: "sine", detune: -25, gain: 0.13 }); },
            miss(t) { Audio.noiseBurst(t, 0.14, { freq: 2200, sweepTo: 900, gain: 0.09, filterType: "highpass" }); },
            status(t) { Audio.tone(t, 300, 0.12, { type: "square", sweepTo: 500, gain: 0.10 }); },
            heal(t) { Audio.tone(t, 440, 0.14, { type: "sine", gain: 0.14 }); Audio.tone(t + 0.09, 660, 0.18, { type: "sine", gain: 0.14 }); },
            shield(t) { Audio.tone(t, 900, 0.12, { type: "triangle", detune: 15, gain: 0.13 }); Audio.tone(t, 905, 0.12, { type: "triangle", detune: -15, gain: 0.13 }); },

            victory(t) { [523, 659, 784, 1046].forEach((f, i) => Audio.tone(t + i * 0.09, f, 0.2, { type: "triangle", gain: 0.17 })); },
            defeat(t) { [392, 349, 293].forEach((f, i) => Audio.tone(t + i * 0.12, f, 0.28, { type: "sawtooth", gain: 0.13 })); },

            shipFire(t) { Audio.tone(t, 1400, 0.12, { type: "sawtooth", sweepTo: 300, gain: 0.13 }); },
            shipHit(t) { Audio.tone(t, 90, 0.22, { type: "sine", gain: 0.20 }); Audio.noiseBurst(t, 0.2, { freq: 500, sweepTo: 120, gain: 0.14 }); },

            levelUp(t) { [392, 523, 659, 784, 1046].forEach((f, i) => Audio.tone(t + i * 0.06, f, 0.16, { type: "triangle", gain: 0.16 })); },
            pickup(t) { Audio.tone(t, 880, 0.06, { type: "sine", gain: 0.10 }); Audio.tone(t + 0.05, 1100, 0.08, { type: "sine", gain: 0.10 }); },
            unlock(t) { Audio.tone(t, 440, 0.12, { type: "triangle", gain: 0.14 }); Audio.tone(t + 0.1, 660, 0.2, { type: "triangle", gain: 0.14 }); },
            questComplete(t) { [659, 880, 1046].forEach((f, i) => Audio.tone(t + i * 0.08, f, 0.18, { type: "triangle", gain: 0.16 })); },
            erosion(t) { Audio.tone(t, 160, 0.3, { type: "sine", detune: 12, gain: 0.09 }); Audio.tone(t, 163, 0.3, { type: "sine", detune: -12, gain: 0.09 }); },
            deny(t) { Audio.tone(t, 200, 0.08, { type: "square", gain: 0.10 }); Audio.tone(t + 0.09, 160, 0.1, { type: "square", gain: 0.10 }); }
        },

        play(name) {
            if (!SE.settings || SE.settings.sfxOn === false) return;
            Audio.ensure();
            if (!Audio.ctx) return;
            if (Audio.ctx.state === "suspended") Audio.ctx.resume();
            const fn = Audio._sfx[name];
            if (!fn) return;
            try { fn(Audio.ctx.currentTime); } catch (e) { /* 靜默失敗,音效非關鍵路徑 */ }
        },

        /* ---------- 氛圍音樂(生成式循環墊音) ---------- */
        _moodParams: {
            menu: { freqs: [110, 165, 220], filt: 900, lfo: 0.06, gain: 0.05 },
            explore: { freqs: [130, 196, 261], filt: 1400, lfo: 0.1, gain: 0.045 },
            combat: { freqs: [98, 147, 220], filt: 2000, lfo: 0.35, gain: 0.055 }
        },

        startAmbient(mood) {
            Audio.mood = mood;
            if (!SE.settings || SE.settings.musicOn === false) return;
            Audio.ensure();
            if (!Audio.ctx) return;
            Audio.stopAmbient();
            const p = Audio._moodParams[mood] || Audio._moodParams.explore;
            const ctx = Audio.ctx;
            const bus = ctx.createGain();
            bus.gain.value = 0;
            bus.connect(Audio.master);
            bus.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 1.2);

            const filt = ctx.createBiquadFilter();
            filt.type = "lowpass";
            filt.frequency.value = p.filt;
            filt.connect(bus);

            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = p.lfo;
            lfoGain.gain.value = p.filt * 0.25;
            lfo.connect(lfoGain);
            lfoGain.connect(filt.frequency);
            lfo.start();

            const oscs = p.freqs.map(function (f) {
                const o = ctx.createOscillator();
                o.type = "sawtooth";
                o.frequency.value = f;
                o.connect(filt);
                o.start();
                return o;
            });

            Audio._ambient = { bus, filt, lfo, oscs };
        },

        stopAmbient() {
            if (!Audio._ambient) return;
            const a = Audio._ambient;
            const ctx = Audio.ctx;
            try {
                a.bus.gain.cancelScheduledValues(ctx.currentTime);
                a.bus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
                setTimeout(function () {
                    a.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
                    try { a.lfo.stop(); } catch (e) {}
                }, 450);
            } catch (e) { /* 忽略:節點可能已釋放 */ }
            Audio._ambient = null;
        },

        /** 戰鬥開始/結束時暫時切換氛圍,結束後恢復原本情境音樂 */
        enterCombatMood() {
            Audio._savedMood = Audio.mood || "explore";
            Audio.startAmbient("combat");
        },
        exitCombatMood() {
            Audio.startAmbient(Audio._savedMood || "explore");
        }
    };

    window.SE = window.SE || {};
    SE.Audio = Audio;
})();
