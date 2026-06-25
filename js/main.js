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
    if (state.godMode) return;
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
            document.getElementById("gameOverStats").innerText = `Muertes: ${state.deaths} | Nivel: ${state.currentLevel}`;
            document.getElementById("gameOverScreen").classList.add("active");
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

    const transScreen = document.getElementById('transitionScreen');
    const transOldLevel = document.getElementById('transOldLevel');
    const transNewLevel = document.getElementById('transNewLevel');
    const transMaxLevel = document.getElementById('transMaxLevel');

    transOldLevel.innerText = state.currentLevel;
    transNewLevel.innerText = state.currentLevel + 1;
    transMaxLevel.innerText = state.maxLevel;

    // Reset animations
    transScreen.style.display = "flex";
    transScreen.classList.remove('animate-numbers');
    
    // Trigger fade to black and blur
    setTimeout(() => {
        transScreen.classList.add('active');
    }, 50);

    // Trigger number roll animation
    setTimeout(() => {
        transScreen.classList.add('animate-numbers');
        vibrate(30);
    }, 1100);

    // Actual level load
    setTimeout(() => {
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
    }, 1500);

    // Fade out and return to game
    setTimeout(() => {
        transScreen.classList.remove('active');
        state.changingLevel = false;
        
        setTimeout(() => {
            transScreen.style.display = "none";
        }, 800);
    }, 2800);
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

    // Decay HUD animations
    if (state.scoreTimer > 0) {
        state.scoreTimer--;
        state.scoreScale = 1.0 + (0.5 * (state.scoreTimer / 15));
    } else {
        state.scoreScale = 1.0;
    }
}

let lastTime = 0;
const frameDuration = 1000 / 60; // 60 FPS cap

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let elapsed = timestamp - lastTime;
    
    // Always request the next frame immediately
    requestAnimationFrame(loop);

    // Only update and draw if enough time has passed
    if (elapsed >= frameDuration) {
        // Adjust lastTime to prevent drift, capping at current time
        lastTime = timestamp - (elapsed % frameDuration);

        if (state.freezeFrames > 0) {
            state.freezeFrames--;
            draw(ctx, canvas);
            return;
        }

        update();
        draw(ctx, canvas);
    }
}

window.addEventListener('load', init);
