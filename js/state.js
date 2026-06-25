// =========================================================
// STATE.JS: Global Game State
// =========================================================

const state = {
    gameStarted: false,
    paused: false,
    selectedCharacter: "hero",
    godMode: false,

    // Camera & Screen Shake
    freezeFrames: 0,
    shakePower: 0,
    shakeTimer: 0,
    camX: 0,
    targetCamX: 0,

    // Level State
    currentLevel: 1,
    maxLevel: 4,
    levelTheme: "grass",
    levelEnd: 6200,
    groundY: 340,

    // Progression
    score: 0,
    scoreScale: 1.0,
    scoreTimer: 0,
    coinsCount: 0,
    collectedCoins: [],
    lives: 10,
    deaths: 0,
    win: false,
    gameOver: false,
    changingLevel: false,
    
    // Player status
    playerDead: false,
    respawnTimer: 0,

    // UI Messages
    message: "",
    messageTimer: 0,
    flashTimer: 0,

    // Checkpoint
    checkpointIndex: -1,
    checkpoint: { x: 100, y: 290 },

    // Input & Jump mechanics
    jumpBuffer: 0,
    coyoteTime: 0,
    keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false
    },
    prevKeys: {
        jump: false
    },

    // Audio
    musicEnabled: false
};

const player = {
    x: 100,
    y: 290,
    prevX: 100,
    prevY: 290,
    w: 34,
    h: 50,
    dx: 0,
    dy: 0,
    speed: 4.3,
    jumpPower: -11.2,
    gravity: 0.52,
    grounded: false,
    frame: 0,
    idleTimer: 0,
    facing: 1,
    invulnerable: 0,
    jumpCount: 0,
    isFlipping: false,
    flipAngle: 0,
    jetpackFuel: 0,
    jetpackActive: false,
    lifeGlowTimer: 0
};

// Lists of level objects
const lists = {
    blocks: [],
    fakeFloors: [],
    fallingBlocks: [],
    movingPlatforms: [],
    vanishingPlatforms: [],
    brittlePlatforms: [],
    spikePlatforms: [],
    hiddenBlocks: [],
    fallingSpikes: [],
    springboards: [],
    spikes: [],
    crushers: [],
    invisibleWalls: [],
    coins: [],
    enemies: [],
    enemyProjectiles: [],
    checkpoints: [],
    triggers: [],
    lavaPits: [],
    signs: [],
    lasers: [],
    gravityZones: [],
    windZones: [],
    iceZones: [],
    sawBlades: [],
    particles: [],
    ambientParticles: [],
    levelDecorations: []
};

// Boss state
const bossState = {
    iceBoss: null
};

function resetKeys() {
    state.keys.left = false;
    state.keys.right = false;
    state.keys.jump = false;
}

function showMessage(text, time = 100) {
    state.message = text;
    state.messageTimer = time;
    state.messageMaxTime = time;

    const container = document.getElementById("ui-message-container");
    const textEl = document.getElementById("ui-message-text");
    if (container && textEl) {
        textEl.innerText = text;
        container.className = "ui-message-container active " + state.levelTheme;
        
        const ms = time * (1000 / 60);
        if (state.messageTimeout) clearTimeout(state.messageTimeout);
        
        state.messageTimeout = setTimeout(() => {
            container.className = "ui-message-container " + state.levelTheme;
        }, ms);
    }
}

function vibrate(ms = 18) {
    if (navigator.vibrate) navigator.vibrate(ms);
}
