// =========================================================
// UI.JS: DOM manipulations, menus, inputs
// =========================================================


let menuTimer = 0;
let menuLoopId = null;

function setupUI() {
    // Character selection logic
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            initAudio();
            playTone(880, 0.05, "sine");
            const type = card.getAttribute('data-type');
            state.selectedCharacter = type;
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', startGame);

    // Keyboard bindings
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") state.keys.left = true;
        if (e.key === "ArrowRight") state.keys.right = true;
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") state.keys.up = true;
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") state.keys.down = true;
        if (e.key === " ") state.keys.jump = true;
    });

    document.addEventListener("keyup", e => {
        if (e.key === "ArrowLeft") state.keys.left = false;
        if (e.key === "ArrowRight") state.keys.right = false;
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") state.keys.up = false;
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") state.keys.down = false;
        if (e.key === " ") state.keys.jump = false;
    });

    let clickCount = 0;
    let lastClickTime = 0;
    let isDraggingPlayer = false;

    canvas.addEventListener("pointerdown", e => {
        if (!state.gameStarted || state.paused || state.gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX + state.camX;
        const y = (e.clientY - rect.top) * scaleY;

        if (x >= player.x - 20 && x <= player.x + player.w + 20 && 
            y >= player.y - 20 && y <= player.y + player.h + 20) {
            
            if (state.godMode) {
                isDraggingPlayer = true;
                canvas.setPointerCapture(e.pointerId);
            }

            const now = Date.now();
            if (now - lastClickTime < 500) {
                clickCount++;
            } else {
                clickCount = 1;
            }
            lastClickTime = now;
            
            if (clickCount >= 3) {
                clickCount = 0;
                state.godMode = !state.godMode;
                player.dy = 0;
                player.dx = 0;
                showMessage(state.godMode ? "MODO DIOS: VOLANDO" : "MODO DIOS: DESACTIVADO", 90);
            }
        }
    });

    canvas.addEventListener("pointermove", e => {
        if (isDraggingPlayer && state.godMode) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            player.x = (e.clientX - rect.left) * scaleX + state.camX - player.w / 2;
            player.y = (e.clientY - rect.top) * scaleY - player.h / 2;
            player.dy = 0;
            player.dx = 0;
        }
    });

    canvas.addEventListener("pointerup", () => isDraggingPlayer = false);
    canvas.addEventListener("pointercancel", () => isDraggingPlayer = false);

    // Touch events for preventing defaults
    document.addEventListener("touchmove", e => {
        const menu = document.getElementById("characterMenu");
        if (menu && !menu.classList.contains("hidden")) return;
        e.preventDefault();
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener("touchend", e => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Restart buttons
    document.getElementById("btnRetry").addEventListener("click", () => {
        document.getElementById("gameOverScreen").classList.remove("active");
        
        // Reset full game state
        state.gameOver = false;
        state.lives = state.selectedCharacter === "hero" ? 10 : 6;
        state.deaths = 0;
        state.score = 0;
        state.currentLevel = 1;
        state.checkpointIndex = -1;
        state.checkpoint = { x: 100, y: 290 };
        
        buildLevel(canvas.width, canvas.height);
        
        player.x = 100;
        player.y = 290;
        player.prevX = 100;
        player.prevY = 290;
        player.dx = 0;
        player.dy = 0;
        player.invulnerable = 100;
        resetKeys();
        
        state.playerDead = false;
        state.respawnTimer = 0;
    });

    document.getElementById("btnMenu").addEventListener("click", () => {
        location.reload();
    });

    // Pause Menu Buttons
    document.getElementById("btnPauseResume").addEventListener("click", () => {
        initAudio(); playTone(600, 0.08, "square");
        state.paused = false;
        document.getElementById("pauseMenuScreen").classList.remove("active");
    });

    document.getElementById("btnPauseRestart").addEventListener("click", () => {
        initAudio(); playTone(600, 0.08, "square");
        document.getElementById("pauseMenuScreen").classList.remove("active");
        state.paused = false;
        state.deaths++;
        state.checkpointIndex = -1;
        state.checkpoint = { x: 100, y: 290 };
        buildLevel(canvas.width, canvas.height);
        player.x = 100;
        player.y = 290;
        player.prevX = 100;
        player.prevY = 290;
        player.dx = 0;
        player.dy = 0;
        player.invulnerable = 100;
        resetKeys();
        state.playerDead = false;
        state.respawnTimer = 0;
    });

    document.getElementById("btnPauseMenu").addEventListener("click", () => {
        initAudio(); playTone(600, 0.08, "square");
        location.reload();
    });

    document.getElementById("btnVictoryMenu").addEventListener("click", () => {
        location.reload();
    });

    // Disable context menu on mobile
    document.addEventListener("contextmenu", e => e.preventDefault());

    bindMobileButtons();
    startMenuLoop();
}

let lastMenuTime = 0;

function startMenuLoop(timestamp) {
    if (state.gameStarted) return;
    
    if (!lastMenuTime) lastMenuTime = timestamp;
    let elapsed = timestamp - lastMenuTime;
    
    menuLoopId = requestAnimationFrame(startMenuLoop);

    if (elapsed >= 1000 / 60) {
        lastMenuTime = timestamp - (elapsed % (1000 / 60));
        menuTimer++;
        drawAllPreviews();
    }
}

function startGame() {
    initAudio();
    playTone(440, 0.1, "square");
    setTimeout(() => playTone(660, 0.1, "square"), 100);
    setTimeout(() => playTone(880, 0.3, "square"), 200);

    if (menuLoopId) cancelAnimationFrame(menuLoopId);

    const menu = document.getElementById("characterMenu");
    menu.classList.add("hidden");
    setTimeout(() => {
        menu.style.display = "none";
    }, 400);

    // Set lives based on character
    if (state.selectedCharacter === "ninja" || state.selectedCharacter === "robot") {
        state.lives = 6;
    } else {
        state.lives = 10;
    }

    document.body.classList.add("game-running");
    state.gameStarted = true;
    startMusic();
    showMessage("PRADERA TROLL\nNo todo es lo que parece...", 140);
    startGameLoop();
}

function pressMobileButton(button, key) {
    state.keys[key] = true;
    button.classList.add("pressed");
    vibrate(12);
}

function releaseMobileButton(button, key) {
    state.keys[key] = false;
    button.classList.remove("pressed");
}

function bindButton(id, key) {
    const button = document.getElementById(id);
    if (!button) return;

    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        pressMobileButton(button, key);
    });

    button.addEventListener("pointerup", e => {
        e.preventDefault();
        releaseMobileButton(button, key);
    });

    button.addEventListener("pointercancel", e => {
        e.preventDefault();
        releaseMobileButton(button, key);
    });

    button.addEventListener("lostpointercapture", () => {
        releaseMobileButton(button, key);
    });

    button.addEventListener("contextmenu", e => e.preventDefault());
}

function bindPauseButton() {
    const button = document.getElementById("btnPause");
    if (!button) return;

    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (!state.gameStarted || state.gameOver || state.win) return;

        initAudio(); playTone(150, 0.1, "sawtooth");
        state.paused = true;
        document.getElementById("pauseMenuScreen").classList.add("active");
        
        button.classList.add("pressed");
        vibrate(22);

        setTimeout(() => button.classList.remove("pressed"), 120);
    });

    button.addEventListener("contextmenu", e => e.preventDefault());
}

function bindMobileButtons() {
    bindButton("btnLeft", "left");
    bindButton("btnRight", "right");
    bindButton("btnJump", "jump");
    bindPauseButton();
}

function drawCharacterPreview(id, type) {
    const previewCanvas = document.getElementById(id);
    if (!previewCanvas) return;
    const pctx = previewCanvas.getContext("2d");

    pctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    pctx.save();
    pctx.translate(33, 28);
    drawMiniCharacter(pctx, type, 0, 0, false, 0, menuTimer, state.selectedCharacter === type ? {jetpackActive: true} : null);
    pctx.restore();
}

function drawAllPreviews() {
    drawCharacterPreview("preview-hero", "hero");
    drawCharacterPreview("preview-ninja", "ninja");
    drawCharacterPreview("preview-robot", "robot");
}
