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

    // Fullscreen buttons – bind click for user‑gesture
    var lastFsTrigger = 0;
    function handleFsTrigger(e) {
        const now = Date.now();
        if (now - lastFsTrigger < 350) return;
        lastFsTrigger = now;
        initAudio();
        playTone(660, 0.05, "sine");
        toggleFullscreen();
    }

    const btnFullscreen = document.getElementById('btnFullscreen');
    if (btnFullscreen) btnFullscreen.addEventListener('click', handleFsTrigger);
    const btnHudFs = document.getElementById('btnHudFullscreen');
    if (btnHudFs) btnHudFs.addEventListener('click', handleFsTrigger);
    const btnPauseFs = document.getElementById('btnPauseFullscreen');
    if (btnPauseFs) btnPauseFs.addEventListener('click', handleFsTrigger);

    // Fullscreen change events
    document.addEventListener("fullscreenchange", updateFullscreenButtons);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButtons);
    document.addEventListener("mozfullscreenchange", updateFullscreenButtons);
    document.addEventListener("MSFullscreenChange", updateFullscreenButtons);

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

    // Canvas pointer events (god mode, etc.) – simplified for brevity
    let clickCount = 0;
    let lastClickTime = 0;
    let isDraggingPlayer = false;
    canvas.addEventListener("pointerdown", e => {
        if (!state.gameStarted || state.paused || state.gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = 900 / rect.width;
        const scaleY = 400 / rect.height;
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
            const scaleX = 900 / rect.width;
            const scaleY = 400 / rect.height;
            player.x = (e.clientX - rect.left) * scaleX + state.camX - player.w / 2;
            player.y = (e.clientY - rect.top) * scaleY - player.h / 2;
            player.dy = 0;
            player.dx = 0;
        }
    });
    canvas.addEventListener("pointerup", () => isDraggingPlayer = false);
    canvas.addEventListener("pointercancel", () => isDraggingPlayer = false);

    // Touch move prevention when menu is visible
    document.addEventListener("touchmove", e => {
        const menu = document.getElementById("characterMenu");
        if (menu && !menu.classList.contains("hidden")) return;
        e.preventDefault();
    }, { passive: false });

    // Touchend debounce
    let lastTouchEnd = 0;
    document.addEventListener("touchend", e => {
        if (e.target && e.target.closest("button, .character-card, a, input")) return;
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });

    // Restart & menu buttons
    document.getElementById("btnRetry").addEventListener("click", () => {
        document.getElementById("gameOverScreen").classList.remove("active");
        resetGameState();
    });
    document.getElementById("btnMenu").addEventListener("click", () => location.reload());

    // Pause menu buttons
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
        buildLevel(900, 400);
        player.x = 100; player.y = 290; player.prevX = 100; player.prevY = 290;
        player.dx = 0; player.dy = 0; player.invulnerable = 100;
        resetKeys();
        state.playerDead = false; state.respawnTimer = 0;
    });
    document.getElementById("btnPauseMenu").addEventListener("click", () => location.reload());
    document.getElementById("btnVictoryMenu").addEventListener("click", () => location.reload());

    // Disable context menu on mobile
    document.addEventListener("contextmenu", e => e.preventDefault());

    bindMobileButtons();
    startMenuLoop();
}

function resetGameState() {
    state.gameOver = false;
    state.lives = state.selectedCharacter === "hero" ? 10 : 6;
    state.deaths = 0;
    state.score = 0;
    state.levelTimer = 0;
    state.totalTimer = 0;
    state.collectedGems = [];
    state.currentGems = [false, false, false];
    state.chaseWall = null;
    state.playerInCannon = null;
    state.currentLevel = 1;
    state.checkpointIndex = -1;
    state.checkpoint = { x: 100, y: 290 };
    buildLevel(900, 400);
    player.x = 100; player.y = 290; player.prevX = 100; player.prevY = 290;
    player.dx = 0; player.dy = 0; player.invulnerable = 100;
    resetKeys();
    state.playerDead = false;
    state.respawnTimer = 0;
}

let lastMenuTime = 0;
function startMenuLoop(timestamp) {
    if (state.gameStarted) return;
    if (!lastMenuTime) lastMenuTime = timestamp;
    const elapsed = timestamp - lastMenuTime;
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
    setTimeout(() => { menu.style.display = "none"; }, 400);

    // Set lives based on character
    state.lives = (state.selectedCharacter === "ninja" || state.selectedCharacter === "robot") ? 6 : 10;
    document.body.classList.add("game-running");
    state.gameStarted = true;
    state.levelTimer = 0;
    state.totalTimer = 0;
    state.collectedGems = [];
    state.currentGems = [false, false, false];
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
    button.addEventListener("lostpointercapture", () => releaseMobileButton(button, key));
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
    drawMiniCharacter(pctx, type, 0, 0, false, 0, menuTimer,
        state.selectedCharacter === type ? { jetpackActive: true } : null);
    pctx.restore();
}
function drawAllPreviews() {
    drawCharacterPreview("preview-hero", "hero");
    drawCharacterPreview("preview-ninja", "ninja");
    drawCharacterPreview("preview-robot", "robot");
}

/* =========================================================
   FULLSCREEN CONTROLLER (Cross‑browser + Mobile Orientation)
   ========================================================= */
function isFullscreen() {
    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ) || document.documentElement.classList.contains("is-fullscreen-manual");
}
function _syncFullscreenClass() {
    const realFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
    if (realFs || document.documentElement.classList.contains("is-fullscreen-manual")) {
        document.documentElement.classList.add("is-fullscreen");
    } else {
        document.documentElement.classList.remove("is-fullscreen");
    }
}
function updateFullscreenButtons() {
    const isFs = isFullscreen();
    _syncFullscreenClass();
    const btnMenu = document.getElementById("btnFullscreen");
    const btnHud = document.getElementById("btnHudFullscreen");
    const btnPauseFs = document.getElementById("btnPauseFullscreen");
    if (btnMenu) {
        const iconSpan = btnMenu.querySelector(".fs-icon");
        const textSpan = btnMenu.querySelector(".fs-text");
        if (isFs) {
            btnMenu.classList.add("is-fullscreen");
            if (iconSpan) iconSpan.textContent = "\u25A3";
            if (textSpan) textSpan.textContent = "SALIR PANTALLA COMPLETA";
        } else {
            btnMenu.classList.remove("is-fullscreen");
            if (iconSpan) iconSpan.textContent = "\u26F6";
            if (textSpan) textSpan.textContent = "PANTALLA COMPLETA";
        }
    }
    if (btnHud) {
        btnHud.textContent = isFs ? "\u25A3" : "\u26F6";
        btnHud.title = isFs ? "Salir Pantalla Completa" : "Pantalla Completa";
    }
    if (btnPauseFs) {
        btnPauseFs.textContent = isFs ? "\u25A3 Salir Pantalla Completa" : "\u26F6 Pantalla Completa";
    }
}
function _getRequestFS() {
    const doc = document.documentElement;
    const fallback = typeof canvas !== "undefined" && canvas ? canvas : document.getElementById("game");
    if (doc) {
        if (doc.requestFullscreen) return opts => doc.requestFullscreen(opts);
        if (doc.webkitRequestFullscreen) return () => doc.webkitRequestFullscreen();
        if (doc.mozRequestFullScreen) return () => doc.mozRequestFullScreen();
        if (doc.msRequestFullscreen) return () => doc.msRequestFullscreen();
    }
    if (fallback) {
        if (fallback.requestFullscreen) return opts => fallback.requestFullscreen(opts);
        if (fallback.webkitRequestFullscreen) return () => fallback.webkitRequestFullscreen();
        if (fallback.mozRequestFullScreen) return () => fallback.mozRequestFullScreen();
    }
    return null;
}
function _getExitFS() {
    if (document.exitFullscreen) return () => document.exitFullscreen();
    if (document.webkitExitFullscreen) return () => document.webkitExitFullscreen();
    if (document.mozCancelFullScreen) return () => document.mozCancelFullScreen();
    if (document.msExitFullscreen) return () => document.msExitFullscreen();
    return null;
}
function toggleFullscreen() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
        showInstallOverlay();
        return;
    }
    const requestFn = _getRequestFS();
    const exitFn = _getExitFS();
    if (!isFullscreen()) {
        // ENTER
        if (requestFn) {
            let result;
            try { result = requestFn({ navigationUI: "hide" }); }
            catch (e) { try { result = requestFn(); } catch (e2) { console.warn("FS request fallback failed", e2); } }
            if (result && typeof result.then === "function") {
                result.then(() => { _lockOrientation(); _syncFullscreenClass(); updateFullscreenButtons(); })
                      .catch(err => { console.warn("FS promise rejected", err); _manualFullscreen(true); });
            } else { _lockOrientation(); _syncFullscreenClass(); updateFullscreenButtons(); }
        } else { _manualFullscreen(true); }
    } else {
        // EXIT
        if (document.documentElement.classList.contains("is-fullscreen-manual")) {
            _manualFullscreen(false);
        }
        if (exitFn) {
            let exitResult;
            try { exitResult = exitFn(); } catch (e) { console.warn("Exit FS threw", e); }
            if (exitResult && typeof exitResult.then === "function") {
                exitResult.then(() => { _unlockOrientation(); _syncFullscreenClass(); updateFullscreenButtons(); })
                           .catch(() => _manualFullscreen(false));
            } else { _unlockOrientation(); _syncFullscreenClass(); updateFullscreenButtons(); }
        } else { _manualFullscreen(false); }
    }
}
function showInstallOverlay() {
    let overlay = document.getElementById('installOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'installOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0; overlay.style.left = 0;
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.color = '#fff';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 10000;
        overlay.style.textAlign = 'center';
        overlay.style.padding = '1rem';
        overlay.innerHTML = `
            <h2 style="margin-bottom:0.5rem;">Añadir a la pantalla de inicio</h2>
            <p>Para disfrutar del juego en pantalla completa en iOS, añade la página a la <strong>Pantalla de inicio</strong>:</p>
            <ol style="text-align:left; max-width:300px; margin:auto;">
                <li>Pulsa el botón <strong>Compartir</strong> (cuadrado con flecha ↑) en la barra inferior del navegador.</li>
                <li>Selecciona <strong>Añadir a pantalla de inicio</strong>.</li>
                <li>Confirma y abre el juego desde el icono recién creado.</li>
            </ol>
            <p style="margin-top:1rem; font-size:0.9em;">Toca cualquier parte de la pantalla para cerrar.</p>
        `;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    }
}
function _lockOrientation() {
    try {
        if (screen.orientation && screen.orientation.lock) { screen.orientation.lock("landscape").catch(() => {}); }
        else if (screen.lockOrientation) screen.lockOrientation("landscape");
        else if (screen.webkitLockOrientation) screen.webkitLockOrientation("landscape");
        else if (screen.mozLockOrientation) screen.mozLockOrientation("landscape");
    } catch (e) {}
}
function _unlockOrientation() {
    try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        else if (screen.unlockOrientation) screen.unlockOrientation();
        else if (screen.webkitUnlockOrientation) screen.webkitUnlockOrientation();
    } catch (e) {}
}
function _manualFullscreen(enter) {
    if (enter) {
        document.documentElement.classList.add("is-fullscreen-manual");
        document.documentElement.classList.add("is-fullscreen");
        _lockOrientation();
        try { window.scrollTo(0, 1); setTimeout(() => window.scrollTo(0, 0), 50); } catch (e) {}
    } else {
        document.documentElement.classList.remove("is-fullscreen-manual");
        document.documentElement.classList.remove("is-fullscreen");
        _unlockOrientation();
    }
    updateFullscreenButtons();
}
