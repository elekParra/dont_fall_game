// =========================================================
// MAIN.JS: Core game loop and initialization
// =========================================================


let canvas, ctx;

function init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    setupUI();
    
    // Initial build for preview (not playing yet)
    buildLevel(canvas.width, canvas.height);
}

function startGameLoop() {
    loop();
}

function resetAfterDeath() {
    buildLevel(canvas.width, canvas.height);

    player.x = state.checkpoint.x;
    player.y = state.checkpoint.y;
    player.prevX = player.x;
    player.prevY = player.y;
    player.dx = 0;
    player.dy = 0;
    player.grounded = false;
    player.invulnerable = 100;

    state.playerDead = false;
    state.respawnTimer = 0;

    resetKeys();
}

function killPlayer(reason = "Has muerto", kind = "generic") {
    if (player.invulnerable > 0 || state.gameOver || state.win || state.changingLevel || state.playerDead) return;

    state.lives--;
    state.deaths++;
    state.playerDead = true;
    state.respawnTimer = 45;

    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    if (kind === "spike") addBlood(cx, cy, 42);
    else if (kind === "lava") addExplosion(cx, cy, "#ff5a00", 45);
    else if (kind === "laser") addExplosion(cx, cy, "#00ffff", 38);
    else if (kind === "crush") addExplosion(cx, cy, "#bbbbbb", 45);
    else addExplosion(cx, cy, "#ffcc00", 32);

    state.freezeFrames = 4;
    state.shakePower = 8;
    state.shakeTimer = 20;

    showMessage(reason, 90);
    vibrate(55);

    if (state.lives <= 0) {
        state.gameOver = true;

        setTimeout(() => {
            alert("GAME OVER. Muertes: " + state.deaths + " | Nivel alcanzado: " + state.currentLevel);
            location.reload();
        }, 500);
    }
}

function nextLevel() {
    state.changingLevel = true;

    if (state.currentLevel >= state.maxLevel) {
        state.win = true;
        setTimeout(() => {
            alert("🏆 JUEGO COMPLETADO | Muertes: " + state.deaths + " | Score: " + state.score);
            location.reload();
        }, 300);
        return;
    }

    state.currentLevel++;
    state.checkpointIndex = -1;
    state.checkpoint = { x: 100, y: 290 };

    player.x = 100;
    player.y = 290;
    player.prevX = 100;
    player.prevY = 290;
    player.dx = 0;
    player.dy = 0;
    player.invulnerable = 120;

    resetKeys();
    buildLevel(canvas.width, canvas.height);

    showMessage("Nivel " + state.currentLevel + " desbloqueado", 140);

    setTimeout(() => {
        state.changingLevel = false;
    }, 700);
}

function update() {
    updateParticles();
    updateAmbientParticles(canvas.width, canvas.height);

    if (!state.gameStarted) return;
    if (state.paused) return;
    if (state.gameOver || state.win) return;

    if (state.playerDead) {
        state.respawnTimer--;
        if (state.respawnTimer <= 0 && state.lives > 0) resetAfterDeath();
        if (state.messageTimer > 0) state.messageTimer--;
        if (state.shakeTimer > 0) state.shakeTimer--;
        else state.shakePower = 0;
        return;
    }

    updateTraps(killPlayer);
    updatePlayer(killPlayer);
    updateEnemies(killPlayer);

    // Death fall checking
    if (player.y > canvas.height + 80) {
        killPlayer("Caíste al vacío", "generic");
    }

    // Level completion checking
    if (!state.changingLevel && player.x > state.levelEnd - 130) {
        if (state.currentLevel === 4 && bossState.iceBoss && !bossState.iceBoss.defeated) {
            showMessage("Derrota al guardián", 60);
        } else {
            showMessage("Nivel superado", 80);
            nextLevel();
        }
    }

    // Smooth Camera Follow
    let target = player.x - 260 + player.facing * 40;
    let diff = target - state.camX;

    if (Math.abs(diff) > 30) {
        state.camX += diff * 0.04;
    } else {
        state.camX += diff * 0.015;
    }

    state.camX = Math.max(0, Math.min(state.camX, state.levelEnd - canvas.width));

    if (state.messageTimer > 0) state.messageTimer--;
    if (state.flashTimer > 0) state.flashTimer--;
    if (state.shakeTimer > 0) state.shakeTimer--;
}

function loop() {
    if (state.freezeFrames > 0) {
        state.freezeFrames--;
        draw(ctx, canvas);
        requestAnimationFrame(loop);
        return;
    }

    update();
    draw(ctx, canvas);
    requestAnimationFrame(loop);
}

window.addEventListener('load', init);
