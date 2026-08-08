// ==================== 回声公寓 · 背景音乐系统 ====================
// 使用 Web Audio API 实时合成，无需外部音频文件
// 设计理念：空灵、神秘的氛围感，保留悬疑色彩但减少压迫感

const AudioManager = (function() {
    let audioCtx = null;
    let masterGain = null;
    let musicEnabled = true;
    let currentVolume = 0.6;
    let currentBgm = null;
    let bgmTimer = null;
    let bgmNodes = [];

    function ensureCtx() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            audioCtx = new AC();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = currentVolume;
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function setEnabled(enabled) {
        musicEnabled = enabled;
        if (!enabled) {
            stopBgm();
        }
        try {
            localStorage.setItem('echo_music_enabled', enabled ? '1' : '0');
        } catch (e) {}
        return enabled;
    }

    function isEnabled() {
        return musicEnabled;
    }

    function loadPref() {
        try {
            const saved = localStorage.getItem('echo_music_enabled');
            if (saved === '0') musicEnabled = false;
            const vol = localStorage.getItem('echo_music_volume');
            if (vol) currentVolume = parseFloat(vol);
        } catch (e) {}
    }

    function setVolume(vol) {
        currentVolume = Math.max(0, Math.min(1, vol));
        if (masterGain) masterGain.gain.value = currentVolume;
        try {
            localStorage.setItem('echo_music_volume', String(currentVolume));
        } catch (e) {}
    }

    function getVolume() { return currentVolume; }

    function stopBgm() {
        if (bgmTimer) {
            clearTimeout(bgmTimer);
            clearInterval(bgmTimer);
            bgmTimer = null;
        }
        bgmNodes.forEach(n => {
            try { n.gain && n.gain.cancelScheduledValues && n.gain.cancelScheduledValues(0); } catch (e) {}
            try { n.stop && n.stop(0); } catch (e) {}
            try { n.disconnect && n.disconnect(); } catch (e) {}
        });
        bgmNodes = [];
        currentBgm = null;
    }

    // 创建带混响延迟的音符，并接入主输出
    function noteWithReverb(ctx, freq, startTime, duration, oscType, vol, reverbAmount) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(vol, startTime + 0.04);
        g.gain.setValueAtTime(vol * 0.7, startTime + duration * 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(g);
        g.connect(masterGain);

        // 混响延迟
        if (reverbAmount > 0) {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.32;
            const fb = ctx.createGain();
            fb.gain.value = reverbAmount;
            const dg = ctx.createGain();
            dg.gain.value = reverbAmount;
            g.connect(delay);
            delay.connect(fb);
            fb.connect(delay);
            delay.connect(dg);
            dg.connect(masterGain);
            bgmNodes.push(delay, fb, dg);
        }

        osc.start(startTime);
        osc.stop(startTime + duration);
        bgmNodes.push(osc, g);
        return osc;
    }

    // 创建雨声背景层（白噪声+滤波，营造雨夜氛围）
    function createRain(ctx, vol) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // 高通滤除低频隆隆声，保留雨滴的沙沙质感
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 1000;

        // 低通柔和处理
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 6500;

        const gain = ctx.createGain();
        gain.gain.value = vol;

        // LFO 让雨声有大小变化，更自然
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = vol * 0.4;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        source.connect(hp);
        hp.connect(lp);
        lp.connect(gain);
        gain.connect(masterGain);

        source.start();
        lfo.start();
        bgmNodes.push(source, hp, lp, gain, lfo, lfoGain);
    }

    // ==================== BGM 定义 ====================

    // ------ 1. 标题BGM：神秘而引人入胜的旋律（F大调，温暖中带悬疑） ------
    function playTitleBgm() {
        const ctx = ensureCtx();
        if (!ctx || !musicEnabled) return;
        stopBgm();
        currentBgm = 'title';

        // F大调旋律，温暖流动，大小调色彩交织
        const notes = [
            [349.23, 0.9], [440.00, 0.9], [523.25, 0.9], [440.00, 0.9], // F4 A4 C5 A4
            [392.00, 0.9], [349.23, 0.9], [329.63, 0.9], [349.23, 0.9], // G4 F4 E4 F4
            [440.00, 0.9], [523.25, 0.9], [698.46, 0.9], [659.25, 0.9], // A4 C5 F5 E5
            [587.33, 0.9], [523.25, 0.9], [440.00, 0.9], [392.00, 0.9], // D5 C5 A4 G4
            [349.23, 0.9], [440.00, 0.9], [523.25, 0.9], [440.00, 0.9], // F4 A4 C5 A4
            [466.16, 0.9], [440.00, 0.9], [392.00, 0.9], [349.23, 0.9], // Bb4 A4 G4 F4 (小调色彩)
            [329.63, 0.9], [349.23, 0.9], [392.00, 0.9], [329.63, 0.9], // E4 F4 G4 E4
            [349.23, 1.8], [0, 0.9], [261.63, 0.9],                      // F4(长) _ C4
        ];

        // 流动的低音线（F大调和声进行）
        const bassNotes = [
            [87.31, 3.6],  // F2
            [130.81, 3.6], // C3
            [116.54, 3.6], // Bb2
            [87.31, 3.6],  // F2
            [87.31, 3.6],  // F2
            [130.81, 3.6], // C3
            [98.00, 3.6],  // G2
            [130.81, 3.6], // C3
        ];

        // 高音星光点缀（极轻，像远处星光）
        const sparkles = [
            [1046.50, 0.3],   // C6
            [1396.91, 7.5],   // F6
            [1046.50, 14.7],  // C6
            [1318.51, 21.9],  // E6
        ];

        const beatDur = 0.9;

        function playLoop() {
            if (currentBgm !== 'title') return;
            const start = ctx.currentTime + 0.1;

            // 低音部分（温暖流动）
            let bt = start;
            bassNotes.forEach(([f, d]) => {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                g.gain.setValueAtTime(0, bt);
                g.gain.linearRampToValueAtTime(0.26, bt + 0.2);
                g.gain.setValueAtTime(0.22, bt + d - 0.4);
                g.gain.exponentialRampToValueAtTime(0.0001, bt + d);
                osc.connect(g);
                g.connect(masterGain);
                osc.start(bt);
                osc.stop(bt + d);
                bgmNodes.push(osc, g);
                bt += d;
            });

            // 旋律部分（柔和三角波 + 混响）
            let t = start;
            notes.forEach(([f, d]) => {
                if (f > 0) {
                    noteWithReverb(ctx, f, t, d, 'triangle', 0.2, 0.3);
                }
                t += d;
            });

            // 高音星光点缀
            sparkles.forEach(([f, offset]) => {
                const st = start + offset;
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                g.gain.setValueAtTime(0, st);
                g.gain.linearRampToValueAtTime(0.05, st + 0.15);
                g.gain.exponentialRampToValueAtTime(0.0001, st + 2.8);
                osc.connect(g);
                g.connect(masterGain);
                osc.start(st);
                osc.stop(st + 3);
                bgmNodes.push(osc, g);
            });

            const loopLen = beatDur * notes.length;
            bgmTimer = setTimeout(playLoop, loopLen * 1000 - 100);
        }

        playLoop();
    }

    // ------ 2. 游戏探索BGM：空灵、神秘的氛围（钟声旋律 + 水滴点缀） ------
    function playExploreBgm() {
        const ctx = ensureCtx();
        if (!ctx || !musicEnabled) return;
        stopBgm();
        currentBgm = 'explore';

        // 极轻的低频垫底（营造空间感，不压迫）
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 65.41; // C2，柔和
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.07;
        drone.connect(droneGain);
        droneGain.connect(masterGain);
        drone.start();
        bgmNodes.push(drone, droneGain);

        // 第二层垫底（缓慢呼吸感）
        const drone2 = ctx.createOscillator();
        drone2.type = 'sine';
        drone2.frequency.value = 130.81; // C3
        const droneGain2 = ctx.createGain();
        droneGain2.gain.value = 0.05;
        drone2.connect(droneGain2);
        droneGain2.connect(masterGain);
        drone2.start();
        bgmNodes.push(drone2, droneGain2);

        // LFO 缓慢呼吸（极慢，营造空灵感）
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.025;
        lfo.connect(lfoGain);
        lfoGain.connect(droneGain2.gain);
        lfo.start();
        bgmNodes.push(lfo, lfoGain);

        // 远处钟声般的旋律（D小调五声音阶，空灵悠远）
        const bellNotes = [
            [440.00, 3.5], // A4
            [523.25, 3.5], // C5
            [587.33, 3.5], // D5
            [440.00, 3.5], // A4
            [698.46, 3.5], // F5
            [587.33, 3.5], // D5
            [523.25, 3.5], // C5
            [440.00, 3.5], // A4
        ];

        function playBells() {
            if (currentBgm !== 'explore') return;
            const start = ctx.currentTime + 0.1;
            let t = start;
            bellNotes.forEach(([f, d]) => {
                // 钟声：缓慢渐入，长延音
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = f;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.11, t + 0.4);
                g.gain.linearRampToValueAtTime(0.07, t + d * 0.5);
                g.gain.exponentialRampToValueAtTime(0.0001, t + d);
                osc.connect(g);
                g.connect(masterGain);
                // 钟声混响
                const delay = ctx.createDelay();
                delay.delayTime.value = 0.38;
                const fb = ctx.createGain();
                fb.gain.value = 0.32;
                const dg = ctx.createGain();
                dg.gain.value = 0.3;
                g.connect(delay);
                delay.connect(fb);
                fb.connect(delay);
                delay.connect(dg);
                dg.connect(masterGain);
                osc.start(t);
                osc.stop(t + d);
                bgmNodes.push(osc, g, delay, fb, dg);
                t += d;
            });
            const total = bellNotes.reduce((s, [_, d]) => s + d, 0);
            bgmTimer = setTimeout(playBells, total * 1000 - 100);
        }
        playBells();

        // 偶尔的高音水滴点缀（像水滴/风铃，极轻，空灵）
        function waterDrop() {
            if (currentBgm !== 'explore') return;
            const t = ctx.currentTime;
            // 五声音阶高音，明亮而空灵
            const freqs = [880.00, 1046.50, 1318.51, 1567.98, 1760.00];
            const f = freqs[Math.floor(Math.random() * freqs.length)];
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.045, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(t);
            osc.stop(t + 1.3);
            bgmNodes.push(osc, g);
            const next = 7000 + Math.random() * 8000;
            bgmTimer = setTimeout(waterDrop, next);
        }
        setTimeout(waterDrop, 5000);
    }

    // ------ 3. 恐怖BGM：雨夜氛围 + 低音紧张感（去掉尖叫，用雨声） ------
    function playHorrorBgm() {
        const ctx = ensureCtx();
        if (!ctx || !musicEnabled) return;
        stopBgm();
        currentBgm = 'horror';

        // 雨声背景（持续，契合雨夜氛围，替代刺耳的尖叫/不和谐音）
        createRain(ctx, 0.09);

        // 低音脉冲（保留紧张感，但克制，留出呼吸空间）
        function pulse() {
            if (currentBgm !== 'horror') return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 49.5; // 低沉
            const g = ctx.createGain();
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 220;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.22, t + 0.08);
            g.gain.setValueAtTime(0.19, t + 0.3);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(g);
            g.connect(lp);
            lp.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.55);
            bgmNodes.push(osc, g, lp);
            bgmTimer = setTimeout(pulse, 950); // 间隔加长
        }
        pulse();
    }

    // ------ 4. 结局BGM：舒缓、有情感层次 ------
    function playEndingBgm(kind) {
        const ctx = ensureCtx();
        if (!ctx || !musicEnabled) return;
        stopBgm();
        currentBgm = 'ending_' + kind;

        if (kind === 'good' || kind === 'true') {
            // 美好结局：C大调，明亮温暖，加入和声第二声部
            const melody = [
                [523.25, 1.0], [587.33, 1.0], [659.25, 1.0], [783.99, 1.0], // C5 D5 E5 G5
                [698.46, 1.0], [659.25, 1.0], [587.33, 2.0],                // F5 E5 D5(长)
                [523.25, 1.0], [659.25, 1.0], [783.99, 1.0], [1046.50, 2.0],// C5 E5 G5 C6(长)
                [783.99, 1.0], [698.46, 1.0], [659.25, 1.0], [587.33, 1.0], // G5 F5 E5 D5
                [523.25, 2.0], [0, 1.0],                                     // C5(长)
            ];
            // 和声线（比旋律低三度/五度）
            const harmony = [
                [392.00, 2.0], [440.00, 2.0], [523.25, 2.0], [587.33, 2.0],
                [523.25, 2.0], [440.00, 2.0], [392.00, 3.0], [0, 1.0],
                [392.00, 2.0], [523.25, 2.0], [587.33, 2.0], [783.99, 3.0],
                [587.33, 2.0], [523.25, 2.0], [440.00, 2.0], [392.00, 3.0],
            ];
            playMelodyLoop(ctx, melody, 'sine', 0.22, 0.45, 'ending_' + kind, harmony, 'sine', 0.12);
        } else if (kind === 'bad') {
            // 坏结局：低沉下行，但有旋律感
            const melody = [
                [329.63, 1.0], [293.66, 1.0], [261.63, 1.0], [220.00, 2.0],
                [246.94, 1.0], [220.00, 1.0], [196.00, 2.0],
                [220.00, 1.0], [196.00, 1.0], [174.61, 1.0], [146.83, 3.0],
            ];
            playMelodyLoop(ctx, melody, 'triangle', 0.22, 0.6, 'ending_' + kind);
        } else {
            // 中性结局
            const melody = [
                [293.66, 1.0], [0, 0.5], [329.63, 1.0], [0, 0.5], [293.66, 1.0], [261.63, 2.0],
                [293.66, 1.0], [0, 0.5], [261.63, 1.0], [0, 0.5], [246.94, 1.0], [220.00, 2.0],
            ];
            playMelodyLoop(ctx, melody, 'triangle', 0.18, 0.5, 'ending_' + kind);
        }
    }

    function playMelodyLoop(ctx, melody, oscType, volume, sustain, token, harmony, harmonyType, harmonyVol) {
        function playLoop() {
            if (currentBgm !== token) return;
            const start = ctx.currentTime + 0.05;
            let t = start;
            melody.forEach(([f, d]) => {
                if (f > 0) {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = oscType;
                    osc.frequency.value = f;
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(volume, t + 0.05);
                    g.gain.setValueAtTime(volume * sustain, t + d - 0.1);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
                    // 延迟混响
                    const delay = ctx.createDelay();
                    delay.delayTime.value = 0.3;
                    const fb = ctx.createGain();
                    fb.gain.value = 0.22;
                    const dg = ctx.createGain();
                    dg.gain.value = 0.25;
                    osc.connect(g);
                    g.connect(delay);
                    delay.connect(fb);
                    fb.connect(delay);
                    delay.connect(dg);
                    dg.connect(masterGain);
                    g.connect(masterGain);
                    osc.start(t);
                    osc.stop(t + d);
                    bgmNodes.push(osc, g, delay, fb, dg);
                }
                t += d;
            });

            // 和声第二声部
            if (harmony) {
                let ht = start;
                harmony.forEach(([f, d]) => {
                    if (f > 0) {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.type = harmonyType;
                        osc.frequency.value = f;
                        g.gain.setValueAtTime(0, ht);
                        g.gain.linearRampToValueAtTime(harmonyVol, ht + 0.08);
                        g.gain.setValueAtTime(harmonyVol * sustain, ht + d - 0.1);
                        g.gain.exponentialRampToValueAtTime(0.0001, ht + d);
                        osc.connect(g);
                        g.connect(masterGain);
                        osc.start(ht);
                        osc.stop(ht + d);
                        bgmNodes.push(osc, g);
                    }
                    ht += d;
                });
            }

            let total = melody.reduce((s, [_, d]) => s + d, 0);
            bgmTimer = setTimeout(playLoop, total * 1000 - 50);
        }
        playLoop();
    }

    // ------ 5. 隐藏循环结局BGM：空灵钢琴（减少诡异感，增加轮回感） ------
    function playLoopBgm() {
        const ctx = ensureCtx();
        if (!ctx || !musicEnabled) return;
        stopBgm();
        currentBgm = 'loop';
        // D小调，缓慢轮回的旋律，带空灵感
        const melody = [
            [293.66, 1.2], [349.23, 1.2], [440.00, 1.2], [523.25, 2.4], // D4 F4 A4 C5
            [523.25, 1.2], [440.00, 1.2], [349.23, 1.2], [293.66, 2.4], // C5 A4 F4 D4
        ];
        playMelodyLoop(ctx, melody, 'triangle', 0.18, 0.35, 'loop');
    }

    // ==================== 切换接口 ====================
    const HORROR_SCENES = new Set([
        'elevator', 'hallway_knock', 'hallway_knock_again',
        'escape_attempt', 'living_mirror', 'bedroom_closet',
        'bathroom', 'studio_light', 'studio_painting',
        'painting_repair', 'painting_destroy', 'painting_enter'
    ]);

    function switchForScene(sceneId, isEnding, endingId) {
        if (!musicEnabled) { stopBgm(); return; }

        if (isEnding) {
            // 结局
            if (endingId === 'E' || endingId === 'C') {
                playEndingBgm(endingId === 'E' ? 'true' : 'good');
            } else if (endingId === 'B' || endingId === 'D' || endingId === 'H') {
                playEndingBgm('bad');
            } else {
                playEndingBgm('neutral');
            }
            return;
        }

        if (sceneId === 'start' || !sceneId) {
            playTitleBgm();
            return;
        }

        if (HORROR_SCENES.has(sceneId)) {
            playHorrorBgm();
        } else {
            playExploreBgm();
        }
    }

    function toTitle() {
        if (!musicEnabled) { stopBgm(); return; }
        playTitleBgm();
    }

    function toGameStart() {
        if (!musicEnabled) { stopBgm(); return; }
        playExploreBgm();
    }

    loadPref();

    return {
        ensureCtx,
        setEnabled,
        isEnabled,
        setVolume,
        getVolume,
        stopBgm,
        playTitleBgm,
        playExploreBgm,
        playHorrorBgm,
        playEndingBgm,
        playLoopBgm,
        switchForScene,
        toTitle,
        toGameStart,
    };
})();
