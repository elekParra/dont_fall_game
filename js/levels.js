// =========================================================
// LEVELS.JS: Level generation and object factories
// =========================================================


function addGround(x, w, h = 60) {
    lists.blocks.push({ x, y: state.groundY, w, h, type: "solid" });
}

function addPlatform(x, y, w, h = 22) {
    lists.blocks.push({ x, y, w, h, type: "solid" });
}

function addLava(x, w, h = 60) {
    lists.lavaPits.push({ x, y: state.groundY, w, h });
}

function addFakeFloor(x, w, h = 60) {
    lists.fakeFloors.push({
        x, y: state.groundY, w, h,
        active: true, triggered: false, alpha: 1, type: "fake"
    });
}

function addFallingBlock(x, y, w, delay = 180) {
    lists.fallingBlocks.push({
        x, y, w, h: 22,
        vy: 0, falling: false, used: false, delay, type: "falling"
    });
}

function addMovingPlatform(x, y, w, startX, endX, speed = 2) {
    lists.movingPlatforms.push({
        x, y, w, h: 20, startX, endX, dir: 1, speed, moveX: 0, type: "moving"
    });
}

function addVanishingPlatform(x, y, w) {
    lists.vanishingPlatforms.push({
        x, y, w, h: 20, active: true, alpha: 1, touched: false, type: "vanish"
    });
}

function addBrittlePlatform(x, y, w) {
    lists.brittlePlatforms.push({
        x, y, w, h: 20, active: true, cracking: false, crackTimer: 0, alpha: 1, type: "brittle"
    });
}

function addSpike(x, hidden = false, variant = "normal") {
    lists.spikes.push({
        x, y: hidden ? state.groundY : state.groundY - 28,
        w: 36, h: 28, active: !hidden, hidden, rising: false, targetY: state.groundY - 28, variant
    });
}

function addEnemy(x, minX, maxX, type = "blob", dir = 1) {
    const size = type === "robot" ? 36 : type === "bat" ? 34 : 32;
    lists.enemies.push({
        x, y: state.groundY - size, w: size, h: size, dir, minX, maxX, alive: true, type
    });
}

function addShooterEnemy(x, y, minX, maxX, dir = -1, fireRate = 120) {
    lists.enemies.push({
        x, y, w: 36, h: 36, dir, minX, maxX, alive: true, type: "shooter", fireCooldown: fireRate, fireRate
    });
}

function addEnemyProjectile(x, y, vx, vy = 0, type = "ice") {
    lists.enemyProjectiles.push({
        x, y, w: type === "boss" ? 18 : 12, h: type === "boss" ? 12 : 8,
        vx, vy, life: 260, type
    });
}

function addCheckpoint(x) {
    lists.checkpoints.push({
        x, y: state.groundY - 50, w: 20, h: 50, active: false
    });
}

function addSign(x, y, text) {
    lists.signs.push({ x, y, text });
}

function addTrigger(x, action) {
    lists.triggers.push({
        x, y: 0, w: 40, h: 400, done: false, action
    });
}

function addSaw(x, y, minX, maxX, speed = 3, size = 42, dir = 1) {
    lists.sawBlades.push({
        x, y, w: size, h: size, minX, maxX, dir, speed, angle: 0
    });
}

function addLaser(x, y, h, timer = 0) {
    lists.lasers.push({
        x, y, w: 12, h, active: true, timer
    });
}

function addCrusher(x, y, w, h, active = false) {
    lists.crushers.push({
        x, y, w, h, vy: 0, active, dropping: active
    });
}

function addInvisibleWall(x, y = 160, h = 180) {
    lists.invisibleWalls.push({
        x, y, w: 18, h, active: false
    });
}

function addIceZone(x, w) {
    lists.iceZones.push({
        x, y: state.groundY - 8, w, h: 12
    });
}

function addWindZone(x, y, w, h, force, label = "VIENTO") {
    lists.windZones.push({
        x, y, w, h, force, label
    });
}

function createCoins(start, end, step, y) {
    for (let i = start; i < end; i += step) {
        lists.coins.push({
            x: i, y, r: 9, taken: false, anim: Math.random() * 10, trap: false
        });
    }
}

function addTrapCoin(x, y, spikeX) {
    lists.coins.push({
        x, y, r: 10, taken: false, anim: 0, trap: true, spikeX
    });
}

function revealSpikeAt(x) {
    const spike = lists.spikes.find(sp => Math.abs(sp.x - x) < 10);
    if (!spike) return;

    spike.active = true;
    spike.rising = true;
    spike.y = state.groundY;
    spike.targetY = state.groundY - 28;
}

function createIceBoss() {
    bossState.iceBoss = {
        x: 8050, y: state.groundY - 112, w: 92, h: 112,
        hp: 14, maxHp: 14, active: false, defeated: false,
        hurtTimer: 0, fireCooldown: 90, jumpCooldown: 180, stompCooldown: 120, shieldTimer: 0
    };
}

function clearLevelObjects() {
    lists.blocks = [];
    lists.fakeFloors = [];
    lists.fallingBlocks = [];
    lists.movingPlatforms = [];
    lists.vanishingPlatforms = [];
    lists.brittlePlatforms = [];
    lists.spikes = [];
    lists.crushers = [];
    lists.invisibleWalls = [];
    lists.coins = [];
    lists.enemies = [];
    lists.enemyProjectiles = [];
    lists.checkpoints = [];
    lists.triggers = [];
    lists.lavaPits = [];
    lists.signs = [];
    lists.lasers = [];
    lists.gravityZones = [];
    lists.windZones = [];
    lists.iceZones = [];
    lists.sawBlades = [];
    bossState.iceBoss = null;
    lists.ambientParticles = [];
    lists.levelDecorations = [];
}

function restoreReachedCheckpoints() {
    for (let i = 0; i <= state.checkpointIndex; i++) {
        if (lists.checkpoints[i]) lists.checkpoints[i].active = true;
    }
}

function setLevel(theme, end, ground) {
    state.levelTheme = theme;
    state.levelEnd = end;
    state.groundY = ground;
}

function seedLevelDecorations() {
    lists.levelDecorations = [];
    if (state.levelTheme === "grass") {
        for (let i = 0; i < 55; i++) lists.levelDecorations.push({type:"tree", x:i*150+60, h:35+Math.random()*42});
    }
    if (state.levelTheme === "cave") {
        for (let i = 0; i < 70; i++) lists.levelDecorations.push({type:"crystal", x:i*125+40, y:135+(i*47)%180, s:26+Math.random()*32});
    }
    if (state.levelTheme === "factory") {
        for (let i = 0; i < 55; i++) lists.levelDecorations.push({type:"pipe", x:i*170+20, h:80+Math.random()*160});
    }
    if (state.levelTheme === "ice") {
        for (let i = 0; i < 72; i++) lists.levelDecorations.push({type:"icePeak", x:i*140+35, h:45+Math.random()*130});
    }
}

function buildLevel(canvasWidth, canvasHeight) {
    clearLevelObjects();

    if (state.currentLevel === 1) buildLevelOne();
    if (state.currentLevel === 2) buildLevelTwo();
    if (state.currentLevel === 3) buildLevelThree();
    if (state.currentLevel === 4) buildLevelFour();

    restoreReachedCheckpoints();
    seedLevelDecorations();
    seedAmbientParticles(canvasWidth, canvasHeight);
}

// ---------------------------------------------------------
// LEVEL DESIGNS
// ---------------------------------------------------------

function buildLevelOne() {
    setLevel("grass", 6200, 340);

    [[0, 850], [980, 500], [1650, 600], [2450, 500], [3200, 650], [4100, 650], [5000, 1150]].forEach(([x, w]) => addGround(x, w));
    [[850, 130], [1480, 170], [2250, 200], [2950, 250], [3850, 250], [4750, 250]].forEach(([x, w]) => addLava(x, w));

    addPlatform(520, 265, 100);
    addPlatform(1180, 250, 110);
    addPlatform(1850, 250, 120);
    addPlatform(3420, 250, 120);
    addPlatform(5300, 240, 120);

    addFakeFloor(690, 160);
    addFakeFloor(1480, 170);
    addFakeFloor(2950, 250);
    addFakeFloor(4750, 250);

    addFallingBlock(900, 255, 95, 250);
    addFallingBlock(2100, 240, 100, 180);
    addFallingBlock(2750, 220, 120, 130);
    addFallingBlock(4450, 240, 110, 200);

    addMovingPlatform(1320, 235, 100, 1320, 1560, 1.9);
    addMovingPlatform(2350, 245, 100, 2350, 2600, 2.2);
    addMovingPlatform(3920, 245, 110, 3920, 4200, 2.3);

    addVanishingPlatform(3150, 210, 110);
    addVanishingPlatform(3650, 210, 110);
    addVanishingPlatform(4900, 230, 120);

    [430, 1120, 1740, 3330, 5120].forEach(x => addSpike(x, false, "grass"));
    [610, 1260, 1990, 2860, 3580, 4610, 5450].forEach(x => addSpike(x, true, "grass"));

    addCrusher(1600, 80, 70, 30, false);
    addCrusher(4260, 70, 80, 35, false);

    addInvisibleWall(2580);
    addInvisibleWall(5200);

    addEnemy(360, 300, 520, "blob", 1);
    addEnemy(1200, 1050, 1400, "blob", -1);
    addEnemy(1980, 1780, 2150, "blob", 1);
    addEnemy(3480, 3300, 3760, "blob", -1);
    addEnemy(5200, 5050, 5600, "blob", 1);

    addSaw(2600, 302, 2550, 2750, 2, 38);
    createCoins(250, 6000, 190, 210);

    addTrapCoin(600, 205, 610);
    addTrapCoin(1260, 205, 1260);
    addTrapCoin(2860, 180, 2860);
    addTrapCoin(5450, 190, 5450);

    addCheckpoint(1700);
    addCheckpoint(3400);
    addCheckpoint(5050);

    addSign(500, 350, "SIGUE RECTO...\nSI CONFÍAS");
    addSign(1400, 285, "Este salto es fácil");
    addSign(2520, 145, "Nada invisible aquí");
    addSign(3140, 180, "Confía");
    addSign(5400, 285, "Último tramo seguro");

    addTrigger(560, () => { revealSpikeAt(610); showMessage("¡Pinchos sorpresa!", 80); });
    addTrigger(1540, () => { lists.crushers[0].active = true; lists.crushers[0].dropping = true; showMessage("Mira arriba.", 75); });
    addTrigger(2480, () => { lists.invisibleWalls[0].active = true; revealSpikeAt(2860); showMessage("Pared invisible activada", 80); });
    addTrigger(3520, () => { revealSpikeAt(3580); if (lists.vanishingPlatforms[1]) lists.vanishingPlatforms[1].touched = true; showMessage("Ahora desaparece", 80); });
    addTrigger(4200, () => { lists.crushers[1].active = true; lists.crushers[1].dropping = true; showMessage("No corras... o sí", 75); });
    addTrigger(5350, () => { lists.invisibleWalls[1].active = true; revealSpikeAt(5450); showMessage("La meta también miente", 90); });
}

function buildLevelTwo() {
    setLevel("cave", 6800, 345);

    [[0, 750], [880, 650], [1700, 550], [2400, 650], [3250, 650], [4100, 550], [4850, 700], [5700, 1050]].forEach(([x, w]) => addGround(x, w, 55));
    [[750, 130], [1530, 170], [2250, 150], [3050, 200], [3900, 200], [4650, 200], [5550, 150]].forEach(([x, w]) => addLava(x, w, 55));

    addMovingPlatform(760, 255, 110, 760, 1030, 2.8);
    addMovingPlatform(1600, 235, 100, 1600, 1880, 2.6);
    addMovingPlatform(3100, 230, 110, 3100, 3370, 3);
    addMovingPlatform(4620, 220, 100, 4620, 4920, 3.2);

    addFallingBlock(1250, 240, 110, 120);
    addFallingBlock(2600, 230, 120, 120);
    addFallingBlock(5200, 230, 130, 100);

    addVanishingPlatform(2050, 210, 120);
    addVanishingPlatform(3700, 200, 120);
    addVanishingPlatform(5900, 230, 120);

    addFakeFloor(880, 140, 55);
    addFakeFloor(3350, 180, 55);
    addFakeFloor(6000, 200, 55);

    [1050, 1820, 3500, 5050].forEach(x => addSpike(x, false, "crystal"));
    [920, 2750, 3980, 6100].forEach(x => addSpike(x, true, "crystal"));

    addEnemy(1200, 1050, 1450, "bat", 1);
    addEnemy(2650, 2500, 2950, "bat", -1);
    addEnemy(4300, 4150, 4550, "bat", 1);
    addEnemy(5950, 5750, 6300, "bat", -1);

    addLaser(1450, 120, 220, 0);
    addLaser(2900, 90, 250, 60);
    addLaser(4450, 110, 235, 120);
    addLaser(6250, 90, 255, 180);

    lists.gravityZones.push({ x: 2150, y: 0, w: 200, h: 400, active: true });
    lists.gravityZones.push({ x: 5300, y: 0, w: 220, h: 400, active: true });

    addSaw(3400, 305, 3300, 3650, 3, 42);
    addSaw(5750, 305, 5700, 6200, 3.2, 42, -1);

    createCoins(300, 6500, 180, 200);
    addTrapCoin(900, 200, 920);
    addTrapCoin(2750, 190, 2750);
    addTrapCoin(6100, 180, 6100);

    addCheckpoint(1900);
    addCheckpoint(3900);
    addCheckpoint(5600);

    addSign(720, 190, "Las luces parpadean por algo");
    addSign(2100, 185, "Aquí pesas menos");
    addSign(3650, 175, "Plataforma estable, seguro");
    addSign(6000, 285, "Última cueva tranquila");

    addTrigger(860, () => { revealSpikeAt(920); showMessage("Cristales emergentes", 80); });
    addTrigger(2100, () => { showMessage("Gravedad rara", 90); });
    addTrigger(3650, () => { if (lists.vanishingPlatforms[1]) lists.vanishingPlatforms[1].touched = true; showMessage("Nunca confíes", 80); });
    addTrigger(6000, () => { revealSpikeAt(6100); showMessage("La cueva muerde", 80); });
}

function buildLevelThree() {
    setLevel("factory", 7600, 345);

    [[0, 700], [850, 600], [1650, 550], [2400, 650], [3250, 550], [4000, 600], [4800, 600], [5600, 600], [6400, 1150]].forEach(([x, w]) => addGround(x, w, 55));
    [[700, 150], [1450, 200], [2200, 200], [3050, 200], [3800, 200], [4600, 200], [5400, 200], [6200, 200]].forEach(([x, w]) => addLava(x, w, 55));

    addMovingPlatform(700, 245, 100, 700, 1000, 3.3);
    addMovingPlatform(1500, 235, 100, 1500, 1800, 3.4);
    addMovingPlatform(3050, 225, 100, 3050, 3350, 3.7);
    addMovingPlatform(4650, 225, 100, 4650, 5000, 3.8);
    addMovingPlatform(6250, 220, 120, 6250, 6600, 4);

    addFallingBlock(1100, 240, 100, 80);
    addFallingBlock(2600, 225, 120, 80);
    addFallingBlock(4300, 225, 120, 70);
    addFallingBlock(5900, 215, 130, 60);

    addVanishingPlatform(1950, 205, 120);
    addVanishingPlatform(3600, 205, 120);
    addVanishingPlatform(5200, 205, 120);
    addVanishingPlatform(6900, 205, 120);

    [500, 1750, 3400, 5000, 6600].forEach(x => addSpike(x, false, "metal"));
    [1150, 2750, 4400, 6000, 7100].forEach(x => addSpike(x, true, "metal"));

    addCrusher(1250, 60, 90, 38, true);
    addCrusher(2850, 60, 90, 38, true);
    addCrusher(4450, 60, 90, 38, true);
    addCrusher(6050, 60, 90, 38, true);

    addLaser(2100, 80, 265, 0);
    addLaser(3750, 80, 265, 80);
    addLaser(5350, 80, 265, 160);
    addLaser(7000, 80, 265, 240);

    addInvisibleWall(2350);
    addInvisibleWall(5550);
    addInvisibleWall(7200);

    addEnemy(900, 870, 1300, "robot", 1);
    addEnemy(2500, 2450, 2950, "robot", -1);
    addEnemy(4100, 4050, 4550, "robot", 1);
    addEnemy(5700, 5650, 6150, "robot", -1);
    addEnemy(6900, 6600, 7350, "robot", 1);

    addSaw(1850, 305, 1700, 2150, 3.8, 46);
    addSaw(3550, 305, 3300, 3750, 4, 46, -1);
    addSaw(5200, 305, 5000, 5350, 4.2, 46);

    createCoins(250, 7300, 170, 190);

    addTrapCoin(1150, 190, 1150);
    addTrapCoin(2750, 180, 2750);
    addTrapCoin(4400, 180, 4400);
    addTrapCoin(6000, 170, 6000);
    addTrapCoin(7100, 170, 7100);

    addCheckpoint(1800);
    addCheckpoint(3600);
    addCheckpoint(5400);

    addSign(900, 285, "La fábrica no perdona");
    addSign(2300, 145, "Hay paredes que no se ven");
    addSign(4300, 180, "La máquina aprende");
    addSign(6800, 180, "Final verdadero... quizá");

    addTrigger(1100, () => { revealSpikeAt(1150); showMessage("Sistema anti-jugador", 80); });
    addTrigger(2300, () => { lists.invisibleWalls[0].active = true; showMessage("Bloqueo invisible", 75); });
    addTrigger(4300, () => { revealSpikeAt(4400); showMessage("Trampa industrial", 80); });
    addTrigger(5550, () => { lists.invisibleWalls[1].active = true; revealSpikeAt(6000); showMessage("No mires atrás", 80); });
    addTrigger(7050, () => { lists.invisibleWalls[2].active = true; revealSpikeAt(7100); showMessage("Última humillación", 90); });
}

function buildLevelFour() {
    setLevel("ice", 9000, 345);

    [[0, 720], [900, 620], [1700, 580], [2500, 620], [3350, 640], [4200, 520], [4950, 680], [5900, 680], [6850, 2050]].forEach(([x, w]) => addGround(x, w, 55));
    [[720, 180], [1520, 180], [2280, 220], [3120, 230], [3990, 210], [4720, 230], [5630, 270], [6580, 270]].forEach(([x, w]) => addLava(x, w, 55));

    addIceZone(60, 620);
    addIceZone(980, 480);
    addIceZone(1760, 430);
    addIceZone(3440, 470);
    addIceZone(5000, 560);
    addIceZone(6950, 1200);

    addPlatform(420, 255, 110);
    addPlatform(1180, 245, 110);
    addPlatform(1900, 235, 120);
    addPlatform(2850, 230, 120);
    addPlatform(4420, 225, 120);
    addPlatform(6150, 230, 140);
    addPlatform(7350, 220, 140);

    addMovingPlatform(760, 250, 110, 760, 980, 2.4);
    addMovingPlatform(1580, 235, 110, 1580, 1840, 2.7);
    addMovingPlatform(3180, 225, 120, 3180, 3480, 3.0);
    addMovingPlatform(5650, 220, 120, 5650, 6000, 3.2);
    addMovingPlatform(6600, 215, 120, 6600, 7000, 3.4);

    addBrittlePlatform(1380, 210, 110);
    addBrittlePlatform(2360, 205, 120);
    addBrittlePlatform(3750, 205, 120);
    addBrittlePlatform(5250, 205, 120);
    addBrittlePlatform(7100, 205, 130);
    addBrittlePlatform(7680, 205, 130);

    addVanishingPlatform(2050, 190, 120);
    addVanishingPlatform(4550, 190, 120);
    addVanishingPlatform(6350, 190, 120);

    addFallingBlock(1050, 220, 110, 100);
    addFallingBlock(2700, 215, 120, 90);
    addFallingBlock(4900, 215, 120, 80);
    addFallingBlock(7450, 205, 120, 70);

    addWindZone(2300, 40, 420, 300, 1.15, "VIENTO →");
    addWindZone(4050, 40, 440, 300, -1.2, "← VIENTO");
    addWindZone(6100, 40, 480, 300, 1.35, "VIENTO →");

    [520, 1120, 1850, 3520, 5060, 7040].forEach(x => addSpike(x, false, "ice"));
    [980, 2160, 2960, 4300, 5480, 7280, 7900].forEach(x => addSpike(x, true, "ice"));

    addSaw(1800, 306, 1720, 2150, 2.8, 42);
    addSaw(3650, 306, 3400, 3900, 3.2, 42, -1);
    addSaw(7050, 306, 6900, 7600, 3.6, 46);

    addEnemy(1100, 980, 1450, "blob", -1);
    addEnemy(3500, 3400, 3900, "bat", 1);
    addEnemy(5200, 5000, 5550, "bat", -1);

    addShooterEnemy(2050, state.groundY - 36, 1950, 2200, -1, 100);
    addShooterEnemy(4550, state.groundY - 36, 4300, 4650, -1, 90);
    addShooterEnemy(6200, state.groundY - 36, 6000, 6450, -1, 85);
    addShooterEnemy(7600, state.groundY - 36, 7350, 8000, -1, 75);

    createCoins(250, 8400, 175, 185);

    addTrapCoin(980, 185, 980);
    addTrapCoin(2160, 175, 2160);
    addTrapCoin(4300, 170, 4300);
    addTrapCoin(5480, 170, 5480);
    addTrapCoin(7900, 165, 7900);

    addCheckpoint(1900);
    addCheckpoint(4200);
    addCheckpoint(6500);

    addSign(320, 285, "El suelo resbala");
    addSign(2250, 80, "El viento decide por ti");
    addSign(3700, 180, "El hielo no aguanta mucho");
    addSign(5950, 80, "Corre con el viento");
    addSign(7500, 180, "El templo dispara");
    addSign(8050, 180, "Guardián del hielo");

    createIceBoss();

    addTrigger(900, () => { revealSpikeAt(980); showMessage("El hielo también pincha", 80); });
    addTrigger(2100, () => { revealSpikeAt(2160); showMessage("Mira tus pies", 80); });
    addTrigger(2920, () => { revealSpikeAt(2960); showMessage("Demasiado fácil, ¿no?", 80); });
    addTrigger(4250, () => { revealSpikeAt(4300); showMessage("El templo despierta", 80); });
    addTrigger(5400, () => { revealSpikeAt(5480); showMessage("No frenes ahora", 80); });
    addTrigger(7250, () => { revealSpikeAt(7280); showMessage("Última ventisca", 90); });
    addTrigger(7850, () => { revealSpikeAt(7900); if (bossState.iceBoss) bossState.iceBoss.active = true; showMessage("¡Mini jefe: Guardián del Hielo!", 120); });
}
