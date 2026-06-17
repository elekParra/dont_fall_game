// =========================================================
// UI.JS: DOM manipulations, menus, inputs
// =========================================================


function setupUI() {
    // Character selection logic
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
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
        if (e.key === " ") state.keys.jump = true;
    });

    document.addEventListener("keyup", e => {
        if (e.key === "ArrowLeft") state.keys.left = false;
        if (e.key === "ArrowRight") state.keys.right = false;
        if (e.key === " ") state.keys.jump = false;
    });

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

    document.addEventListener("contextmenu", e => e.preventDefault());

    bindMobileButtons();
    drawAllPreviews();
}

function startGame() {
    const menu = document.getElementById("characterMenu");
    menu.classList.add("hidden");
    setTimeout(() => {
        menu.style.display = "none";
    }, 400);

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

        state.paused = !state.paused;
        button.textContent = state.paused ? "▶" : "⏸";
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
    pctx.translate(23, 18);
    drawMiniCharacter(pctx, type, 0, 0, false, 0);
    pctx.restore();
}

function drawAllPreviews() {
    drawCharacterPreview("preview-hero", "hero");
    drawCharacterPreview("preview-ninja", "ninja");
    drawCharacterPreview("preview-robot", "robot");
}
