// =========================================================
// AUDIO.JS: Web Audio API synth
// =========================================================


let audioCtx = null;
let musicTimer = null;
let musicGain = null;
let bassGain = null;
let musicStep = 0;

const melodies = {
    grass:   [392,440,523,440,392,330,392,440,523,587,523,440],
    cave:    [220,262,330,262,196,220,262,330,392,330,262,220],
    factory: [165,196,247,196,165,147,165,196,247,294,247,196],
    ice:     [330,392,494,587,494,392,330,294,330,392,440,392],
    boss:    [220, 233, 261, 220, 293, 220, 329, 293, 261, 233, 220, 164]
};

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    musicGain = audioCtx.createGain();
    bassGain = audioCtx.createGain();

    musicGain.gain.value = 0.045;
    bassGain.gain.value = 0.032;

    musicGain.connect(audioCtx.destination);
    bassGain.connect(audioCtx.destination);
}

function startMusic() {
    if (state.musicEnabled) return;
    initAudio();

    state.musicEnabled = true;
    scheduleMusic();
}

function playTone(freq, dur, type = "square", gainNode = musicGain, detune = 0) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);

    osc.connect(g);
    g.connect(gainNode);

    osc.start();
    osc.stop(audioCtx.currentTime + dur + 0.02);
}

function playVictoryMusic() {
    if (!audioCtx) return;
    const notes = [
        {f: 440, d: 0.15}, {f: 440, d: 0.15}, {f: 440, d: 0.15}, 
        {f: 587, d: 0.4}, {f: 523, d: 0.2}, {f: 587, d: 0.6}
    ];
    let time = audioCtx.currentTime;
    notes.forEach(n => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.value = n.f;
        g.gain.setValueAtTime(0.04, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + n.d);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + n.d);
        time += n.d;
    });
}

function scheduleMusic() {
    if (musicTimer) clearInterval(musicTimer);

    musicTimer = setInterval(() => {
        if (!state.musicEnabled || state.paused || !state.gameStarted || state.gameOver || state.win) return;

        let arr = melodies[state.levelTheme] || melodies.grass;
        let isBoss = state.currentLevel === 4 && typeof bossState !== "undefined" && bossState.iceBoss && bossState.iceBoss.active && !bossState.iceBoss.defeated;
        if (isBoss) arr = melodies.boss;

        const note = arr[musicStep % arr.length];
        const bass = note / 2;

        playTone(
            note,
            isBoss ? 0.15 : 0.22,
            state.levelTheme === "factory" || isBoss ? "sawtooth" : "square",
            musicGain,
            state.levelTheme === "cave" ? -8 : 0
        );

        if (musicStep % 2 === 0) {
            playTone(bass, 0.35, "triangle", bassGain);
        }

        if (musicStep % 4 === 0) {
            playTone(note * 1.5, 0.12, "triangle", musicGain);
        }

        musicStep++;
    }, 260);
}
