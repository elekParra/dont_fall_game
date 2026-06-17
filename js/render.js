// =========================================================
// RENDER.JS: All drawing and canvas manipulation
// =========================================================


function draw(ctx, canvas) {
    let sx = 0;
    let sy = 0;

    if (state.shakeTimer > 0) {
        sx = (Math.random() - 0.5) * state.shakePower;
        sy = (Math.random() - 0.5) * state.shakePower;
        applyBloom(ctx, canvas);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(sx, sy);

    drawBackground(ctx, canvas);
    drawAmbientParticles(ctx);

    ctx.save();
    ctx.translate(-state.camX, 0);

    drawLevelDecorations(ctx, canvas);
    lists.gravityZones.forEach(g => drawGravityZone(ctx, g));
    lists.windZones.forEach(w => drawWindZone(ctx, w));
    lists.iceZones.forEach(z => drawIceZone(ctx, z));

    lists.blocks.forEach(b => drawBlock(ctx, b));
    lists.lavaPits.forEach(p => drawLavaPit(ctx, p));
    lists.fakeFloors.forEach(f => drawFakeFloor(ctx, f));
    lists.movingPlatforms.forEach(m => drawMovingPlatform(ctx, m));
    lists.vanishingPlatforms.forEach(v => drawVanishingPlatform(ctx, v));
    lists.brittlePlatforms.forEach(b => drawBrittlePlatform(ctx, b));
    lists.fallingBlocks.forEach(b => drawFallingBlock(ctx, b, canvas));
    lists.invisibleWalls.forEach(w => drawInvisibleWall(ctx, w));
    lists.crushers.forEach(c => drawCrusher(ctx, c));
    lists.lasers.forEach(l => drawLaser(ctx, l));
    lists.sawBlades.forEach(s => drawSawBlade(ctx, s));
    lists.spikes.forEach(s => drawSpike(ctx, s));
    lists.coins.forEach(c => drawCoin(ctx, c));
    lists.enemyProjectiles.forEach(p => drawEnemyProjectile(ctx, p));
    lists.enemies.forEach(e => drawEnemy(ctx, e));

    drawIceBoss(ctx);

    lists.checkpoints.forEach(cp => drawCheckpoint(ctx, cp));
    lists.signs.forEach(s => drawSign(ctx, s));

    drawCastle(ctx);
    drawFlag(ctx);
    drawParticles(ctx);
    drawPlayer(ctx);

    ctx.restore();

    drawHUD(ctx, canvas);

    if (state.messageTimer > 0) {
        let alpha = Math.min(1, state.messageTimer / 40);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(canvas.width / 2 - 260, 30, 520, 70);
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.textAlign = "center";
        let lines = state.message.split("\n");
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, 60 + i * 28);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    if (state.paused) {
        ctx.fillStyle = "rgba(0,0,0,0.58)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 42px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "18px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.fillText("Pulsa ▶ para continuar", canvas.width / 2, canvas.height / 2 + 28);
        ctx.textAlign = "left";
    }

    if (state.flashTimer > 0) {
        ctx.fillStyle = "rgba(255,0,0," + (state.flashTimer / 45) + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.restore();
}

function applyBloom(ctx, canvas) {
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
}

function drawBackground(ctx, canvas) {
    const t = Date.now() * 0.001;

    if (state.levelTheme === "grass") {
        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, "#6ecbff");
        sky.addColorStop(0.58, "#b8f1ff");
        sky.addColorStop(1, "#eaffdd");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGlowScreen(ctx, 760 - state.camX * 0.04, 72, 95, "rgba(255,245,160,0.32)");
        ctx.fillStyle = "rgba(255,246,165,0.75)";
        ctx.beginPath();
        ctx.arc(760 - state.camX * 0.04, 72, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(85,150,120,0.34)";
        for (let i = -1; i < 7; i++) {
            let x = i * 310 - (state.camX * 0.10 % 310);
            ctx.beginPath();
            ctx.moveTo(x, 340);
            ctx.lineTo(x + 155, 185);
            ctx.lineTo(x + 320, 340);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "#67bd56";
        for (let i = -1; i < 8; i++) {
            let x = i * 420 - (state.camX * 0.18 % 420);
            ctx.beginPath();
            ctx.arc(x + 160, 365, 125, Math.PI, 0);
            ctx.fill();
        }

        ctx.fillStyle = "rgba(255,255,255,0.88)";
        for (let i = 0; i < 9; i++) {
            let x = (i * 520 - state.camX * 0.28 + Math.sin(t + i) * 8) % 1500;
            if (x < -220) x += 1500;
            let y = 70 + (i % 3) * 38;
            ctx.beginPath();
            ctx.arc(x + 42, y + 14, 23, 0, Math.PI * 2);
            ctx.arc(x + 72, y + 4, 31, 0, Math.PI * 2);
            ctx.arc(x + 107, y + 16, 24, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (state.levelTheme === "cave") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#12002b");
        g.addColorStop(0.5, "#092b45");
        g.addColorStop(1, "#010712");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0,0,0,0.22)";
        for (let i = -1; i < 9; i++) {
            let x = i * 180 - (state.camX * 0.12 % 180);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 70, 165);
            ctx.lineTo(x + 140, 0);
            ctx.closePath();
            ctx.fill();
        }

        for (let i = 0; i < 26; i++) {
            let x = (i * 190 - state.camX * 0.20) % 1200;
            if (x < -80) x += 1200;
            let y = 80 + (i * 47) % 245;
            drawGlowScreen(ctx, x + 18, y + 24, 42, i % 2 ? "rgba(168,85,255,0.25)" : "rgba(93,252,255,0.25)");
            ctx.fillStyle = i % 2 ? "#a855ff" : "#5dfcff";
            ctx.beginPath();
            ctx.moveTo(x, y + 55);
            ctx.lineTo(x + 18, y);
            ctx.lineTo(x + 36, y + 55);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "rgba(0,255,255,0.06)";
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc((i * 240 - state.camX * 0.07) % 1100, 280, 140, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (state.levelTheme === "factory") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#232323");
        g.addColorStop(0.58, "#361d1d");
        g.addColorStop(1, "#4b1d1d");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,120,40,0.18)";
        ctx.lineWidth = 2;
        for (let x = -200; x < canvas.width + 200; x += 80) {
            let xx = x - (state.camX * 0.25 % 80);
            ctx.beginPath();
            ctx.moveTo(xx, 0);
            ctx.lineTo(xx, canvas.height);
            ctx.stroke();
        }
        for (let y = 40; y < canvas.height; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        for (let i = 0; i < 8; i++) {
            let x = (i * 210 - state.camX * 0.16) % 1200;
            if (x < -120) x += 1200;
            ctx.fillStyle = "rgba(70,70,70,0.7)";
            ctx.fillRect(x, 45, 42, 300);
            ctx.fillStyle = "rgba(255,90,40,0.35)";
            ctx.fillRect(x + 7, 65 + (i % 4) * 34, 28, 10);
        }

        for (let i = 0; i < 7; i++) {
            let x = (i * 260 - state.camX * 0.22) % 1300;
            let alpha = 0.25 + Math.sin(t * 3 + i) * 0.18;
            drawGlowScreen(ctx, x, 105, 70, `rgba(255,70,20,${alpha})`);
        }
    }

    if (state.levelTheme === "ice") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#e8fdff");
        g.addColorStop(0.48, "#9ee8ff");
        g.addColorStop(1, "#244b77");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.18)";
        for (let i = -1; i < 7; i++) {
            let x = i * 260 - (state.camX * 0.10 % 260);
            ctx.beginPath();
            ctx.moveTo(x, 350);
            ctx.lineTo(x + 120, 175);
            ctx.lineTo(x + 245, 350);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "rgba(185,250,255,0.18)";
        for (let i = 0; i < 8; i++) {
            let x = (i * 180 - state.camX * 0.18) % 1200;
            if (x < -80) x += 1200;
            ctx.beginPath();
            ctx.moveTo(x, 360);
            ctx.lineTo(x + 35, 110 + (i % 3) * 30);
            ctx.lineTo(x + 78, 360);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "rgba(255,255,255,0.65)";
        for (let i = 0; i < 55; i++) {
            let x = (i * 97 - state.camX * 0.22 + Math.sin(t + i) * 18) % 1000;
            let y = (20 + (i * 53) % 360 + t * 20) % 390;
            ctx.fillRect(x, y, 2, 2);
        }
    }
}

function drawBlock(ctx, b) {
    let body, top, edge, detail;
    if (state.levelTheme === "grass") {
        body = "#247a18"; top = "#53c33f"; edge = "rgba(0,0,0,0.25)"; detail = "rgba(70,35,12,0.28)";
    } else if (state.levelTheme === "cave") {
        body = "#2d1b4e"; top = "#9b6cff"; edge = "rgba(0,255,255,0.20)"; detail = "rgba(0,255,255,0.14)";
    } else if (state.levelTheme === "factory") {
        body = "#454545"; top = "#999"; edge = "rgba(0,0,0,0.45)"; detail = "rgba(15,15,15,0.75)";
    } else {
        body = "#7edfff"; top = "#e6ffff"; edge = "rgba(255,255,255,0.55)"; detail = "rgba(255,255,255,0.28)";
        let index = lists.blocks.indexOf(b);
        let type = getTileType(index, lists.blocks);
        if (type === "inicio") ctx.fillStyle = "#aef";
        if (type === "fin") ctx.fillStyle = "#cdf";
    }

    ctx.fillStyle = body;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = top;
    ctx.fillRect(b.x, b.y, b.w, 8);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(b.x, b.y + b.h - 10, b.w, 10);

    for (let x = b.x + 10; x < b.x + b.w; x += 32) {
        ctx.fillStyle = detail;
        if (state.levelTheme === "factory") {
            ctx.fillRect(x, b.y + 18, 12, 10);
            ctx.fillStyle = "rgba(255,120,50,0.25)";
            ctx.fillRect(x + 3, b.y + 21, 6, 3);
        } else if (state.levelTheme === "ice") {
            ctx.fillRect(x, b.y + 16, 20, 3);
            ctx.strokeStyle = "rgba(255,255,255,0.36)";
            ctx.beginPath();
            ctx.moveTo(x, b.y + 30);
            ctx.lineTo(x + 18, b.y + 38);
            ctx.stroke();
        } else if (state.levelTheme === "grass") {
            ctx.fillRect(x, b.y + 20, 16, 4);
            ctx.fillStyle = "rgba(25,100,20,0.32)";
            ctx.fillRect(x + 3, b.y + 9, 4, 9);
        } else {
            ctx.fillRect(x, b.y + 18, 18, 3);
        }
    }

    ctx.strokeStyle = edge;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
}

function drawFakeFloor(ctx, f) {
    if (!f.active) return;
    ctx.save();
    ctx.globalAlpha = f.alpha;
    drawBlock(ctx, f);
    ctx.restore();
}

function drawShadowDynamic(ctx, x, y, base) {
    const height = Math.max(0, state.groundY - (player.y + player.h));
    const stretch = 1 + Math.min(height * 0.01, 0.10);
    const blur = Math.min(12, height * 0.15);
    const alpha = Math.max(0.08, 0.25 - height * 0.002);

    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, base * stretch, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawShadow(ctx, x, y, r, alpha = 0.25) {
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGlow(ctx, x, y, r, color) {
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
}

function drawGlowScreen(ctx, x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw methods for all game objects...
function drawMovingPlatform(ctx, p) {
    drawShadow(ctx, p.x + p.w / 2, p.y + p.h + 6, p.w / 2, 0.18);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff8a1f" : state.levelTheme === "cave" ? "#00d4ff" : state.levelTheme === "ice" ? "#d9ffff" : "#8844cc";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, true);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(p.x + 8, p.y + 4, p.w - 16, 4);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, false);
}

function drawVanishingPlatform(ctx, p) {
    if (!p.active) return;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    drawShadow(ctx, p.x + p.w / 2, p.y + p.h + 6, p.w / 2, 0.16);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff3333" : state.levelTheme === "cave" ? "#00ffaa" : state.levelTheme === "ice" ? "#aef7ff" : "#00aaff";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, true);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(p.x + 8, p.y + 4, p.w - 16, 4);
    ctx.restore();
}

function drawBrittlePlatform(ctx, b) {
    if (!b.active) return;
    ctx.save();
    ctx.globalAlpha = b.alpha;
    drawShadow(ctx, b.x + b.w / 2, b.y + b.h + 6, b.w / 2, 0.16);
    ctx.fillStyle = "#bfffff";
    roundRect(ctx, b.x, b.y, b.w, b.h, 6, true);
    ctx.strokeStyle = "#ffffff";
    roundRect(ctx, b.x, b.y, b.w, b.h, 6, false);
    ctx.strokeStyle = b.cracking ? "#004466" : "#62cfe8";
    for (let x = b.x + 10; x < b.x + b.w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, b.y + 2);
        ctx.lineTo(x + 12, b.y + b.h - 3);
        ctx.stroke();
    }
    if (b.cracking) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * 0.2, b.y + 3);
        ctx.lineTo(b.x + b.w * 0.46, b.y + b.h - 3);
        ctx.lineTo(b.x + b.w * 0.78, b.y + 4);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    ctx.restore();
}

function drawFallingBlock(ctx, b, canvas) {
    if (b.y > canvas.height + 200) return;
    drawShadow(ctx, b.x + b.w / 2, b.y + b.h + 6, b.w / 2, 0.18);
    ctx.fillStyle = b.used ? "#642313" : state.levelTheme === "factory" ? "#aa2c2c" : state.levelTheme === "ice" ? "#bfffff" : "#aa4a24";
    roundRect(ctx, b.x, b.y, b.w, b.h, 5, true);
    ctx.strokeStyle = "#111";
    roundRect(ctx, b.x, b.y, b.w, b.h, 5, false);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(b.x + 6, b.y + 4, b.w - 12, 4);
}

function drawSpike(ctx, s) {
    if (!s.active) return;
    if (s.variant === "ice") {
        ctx.fillStyle = "#bfffff";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.h);
        ctx.lineTo(s.x + s.w * 0.22, s.y + 8);
        ctx.lineTo(s.x + s.w * 0.5, s.y - 12);
        ctx.lineTo(s.x + s.w * 0.78, s.y + 8);
        ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        return;
    }
    if (s.variant === "crystal") {
        ctx.fillStyle = "#4dfcff";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.h);
        ctx.lineTo(s.x + s.w * 0.25, s.y + 8);
        ctx.lineTo(s.x + s.w * 0.5, s.y - 10);
        ctx.lineTo(s.x + s.w * 0.75, s.y + 8);
        ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#bfffff";
        ctx.stroke();
        return;
    }
    if (s.variant === "metal") {
        ctx.fillStyle = "#b8b8b8";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.h);
        ctx.lineTo(s.x + s.w * 0.2, s.y + 10);
        ctx.lineTo(s.x + s.w * 0.5, s.y - 6);
        ctx.lineTo(s.x + s.w * 0.8, s.y + 10);
        ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff3a1f";
        ctx.fillRect(s.x + 13, s.y + 13, 8, 8);
        return;
    }
    ctx.fillStyle = "#e6e6e6";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.25, s.y + 9);
    ctx.lineTo(s.x + s.w * 0.5, s.y);
    ctx.lineTo(s.x + s.w * 0.75, s.y + 9);
    ctx.lineTo(s.x + s.w, s.y + s.h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#777";
    ctx.stroke();
}

function drawCrusher(ctx, c) {
    if (!c.active) return;
    ctx.fillStyle = state.levelTheme === "factory" ? "#222" : "#555";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff3a1f" : "#999";
    ctx.fillRect(c.x + 5, c.y + 5, c.w - 10, 6);
    ctx.fillStyle = "#111";
    ctx.fillRect(c.x + 5, c.y + c.h - 5, c.w - 10, 5);
}

function drawInvisibleWall(ctx, w) {
    if (!w.active) return;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(w.x, w.y, w.w, w.h);
}

function drawLavaPit(ctx, p) {
    ctx.fillStyle = state.levelTheme === "cave" ? "#00ffee" : state.levelTheme === "factory" ? "#ff2a00" : state.levelTheme === "ice" ? "#73e8ff" : "#ff4500";
    ctx.fillRect(p.x, p.y + 15, p.w, p.h);
    ctx.fillStyle = state.levelTheme === "ice" ? "#ffffff" : state.levelTheme === "cave" ? "#bfffff" : "#ffcc00";
    for (let x = p.x; x < p.x + p.w; x += 22) {
        ctx.beginPath();
        ctx.arc(x, p.y + 18 + Math.sin(Date.now() / 120 + x) * 4, 8, 0, Math.PI);
        ctx.fill();
    }
}

function drawLaser(ctx, l) {
    if (!l.active) return;
    ctx.fillStyle = state.levelTheme === "factory" ? "rgba(255,0,0,0.85)" : "rgba(0,255,255,0.85)";
    ctx.fillRect(l.x, l.y, l.w, l.h);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(l.x + 3, l.y, 3, l.h);
}

function drawGravityZone(ctx, g) {
    if (!g.active) return;
    ctx.fillStyle = "rgba(140,80,255,0.12)";
    ctx.fillRect(g.x, g.y, g.w, g.h);
    ctx.strokeStyle = "rgba(180,140,255,0.35)";
    ctx.strokeRect(g.x, g.y, g.w, g.h);
}

function drawWindZone(ctx, w) {
    ctx.fillStyle = "rgba(180,240,255,0.10)";
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = "rgba(220,255,255,0.32)";
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = "rgba(220,255,255,0.65)";
    ctx.font = "13px Arial";
    ctx.fillText(w.label, w.x + 10, w.y + 22);
    ctx.strokeStyle = "rgba(220,255,255,0.65)";
    for (let i = 0; i < 6; i++) {
        const yy = w.y + 45 + i * 32;
        const offset = (Date.now() / 20 + i * 40) % w.w;
        ctx.beginPath();
        ctx.moveTo(w.x + offset, yy);
        ctx.lineTo(w.x + offset + 35 * Math.sign(w.force), yy);
        ctx.stroke();
    }
}

function drawIceZone(ctx, z) {
    ctx.fillStyle = "rgba(180,245,255,0.55)";
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    for (let x = z.x; x < z.x + z.w; x += 28) {
        ctx.moveTo(x, z.y + 2);
        ctx.lineTo(x + 18, z.y + z.h - 2);
    }
    ctx.stroke();
}

function drawSawBlade(ctx, s) {
    ctx.save();
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    ctx.rotate(s.angle);
    ctx.fillStyle = "#ccc";
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0, -s.h / 2);
        ctx.lineTo(6, -s.h / 2 + 12);
        ctx.lineTo(-6, -s.h / 2 + 12);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawCoin(ctx, c) {
    if (c.taken) return;
    const y = c.y + Math.sin(c.anim) * 4;
    ctx.fillStyle = c.trap ? "#ff3333" : "#ffdf00";
    ctx.beginPath();
    ctx.ellipse(c.x, y, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.trap ? "#770000" : "#b8860b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff28a";
    ctx.fillRect(c.x - 2, y - 7, 3, 14);
}

function drawEnemyProjectile(ctx, p) {
    ctx.fillStyle = p.type === "boss" ? "#ffffff" : "#bfffff";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#73e8ff";
    ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 2);
}

function drawEnemy(ctx, e) {
    if (!e.alive) return;
    drawShadow(ctx, e.x + e.w / 2, e.y + e.h + 4, e.w / 2, 0.22);
    if (e.type === "shooter") {
        ctx.fillStyle = "#d9ffff";
        ctx.fillRect(e.x, e.y + 4, e.w, e.h - 4);
        ctx.fillStyle = "#5bc7e8";
        ctx.fillRect(e.x + 4, e.y + 10, e.w - 8, 14);
        ctx.fillStyle = "#003344";
        ctx.fillRect(e.x + 8, e.y + 14, 6, 5);
        ctx.fillRect(e.x + 22, e.y + 14, 6, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(e.x + 12, e.y - 4, 12, 8);
        ctx.fillStyle = "#73e8ff";
        ctx.fillRect(e.x + 2, e.y + 26, e.w - 4, 6);
        return;
    }
    if (e.type === "bat") {
        ctx.fillStyle = "#9d4edd";
        ctx.beginPath();
        ctx.arc(e.x + 17, e.y + 18, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5a189a";
        ctx.beginPath();
        ctx.moveTo(e.x + 4, e.y + 18);
        ctx.lineTo(e.x - 16, e.y + 7);
        ctx.lineTo(e.x - 4, e.y + 27);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(e.x + 30, e.y + 18);
        ctx.lineTo(e.x + 50, e.y + 7);
        ctx.lineTo(e.x + 38, e.y + 27);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillRect(e.x + 10, e.y + 13, 5, 5);
        ctx.fillRect(e.x + 20, e.y + 13, 5, 5);
        ctx.fillStyle = "black";
        ctx.fillRect(e.x + 12, e.y + 15, 2, 2);
        ctx.fillRect(e.x + 22, e.y + 15, 2, 2);
        return;
    }
    if (e.type === "robot") {
        ctx.fillStyle = "#777";
        ctx.fillRect(e.x, e.y + 6, e.w, e.h - 6);
        ctx.fillStyle = "#222";
        ctx.fillRect(e.x + 5, e.y + 12, e.w - 10, 12);
        ctx.fillStyle = "#ff2a00";
        ctx.fillRect(e.x + 9, e.y + 15, 5, 5);
        ctx.fillRect(e.x + 22, e.y + 15, 5, 5);
        ctx.fillStyle = "#333";
        ctx.fillRect(e.x + 3, e.y + e.h - 4, 10, 5);
        ctx.fillRect(e.x + 23, e.y + e.h - 4, 10, 5);
        ctx.fillStyle = "#00ff99";
        ctx.fillRect(e.x + 12, e.y + 5, 10, 4);
        return;
    }
    ctx.fillStyle = "#7a3b16";
    ctx.beginPath();
    ctx.arc(e.x + 16, e.y + 18, 17, Math.PI, 0);
    ctx.lineTo(e.x + 33, e.y + 32);
    ctx.lineTo(e.x, e.y + 32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#9b5524";
    ctx.fillRect(e.x + 3, e.y + 14, 26, 16);
    ctx.fillStyle = "white";
    ctx.fillRect(e.x + 7, e.y + 13, 6, 7);
    ctx.fillRect(e.x + 19, e.y + 13, 6, 7);
    ctx.fillStyle = "black";
    ctx.fillRect(e.x + 9, e.y + 15, 3, 3);
    ctx.fillRect(e.x + 21, e.y + 15, 3, 3);
}

function drawIceBoss(ctx) {
    const b = bossState.iceBoss;
    if (!b || b.defeated || !b.active) return;
    const phase2 = b.hp <= Math.ceil(b.maxHp / 2);
    const pulse = 0.45 + Math.sin(Date.now() / 120) * 0.18;
    
    if (phase2) {
        drawGlow(ctx, b.x + b.w/2, b.y + b.h/2, 140, "rgba(120,245,255,0.45)");
        state.shakePower = 4;
    }

    drawShadow(ctx, b.x + b.w / 2, b.y + b.h + 8, 54, 0.32);
    drawGlow(ctx, b.x + b.w / 2, b.y + b.h / 2, phase2 ? 115 : 85, phase2 ? `rgba(120,245,255,${pulse * 0.45})` : `rgba(180,255,255,${pulse * 0.28})`);

    ctx.save();
    if (b.hurtTimer > 0 && Math.floor(b.hurtTimer / 4) % 2 === 0) ctx.globalAlpha = 0.55;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(b.x + 18, b.y + 28);
    ctx.lineTo(b.x + 8, b.y - 18);
    ctx.lineTo(b.x + 35, b.y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.x + 74, b.y + 28);
    ctx.lineTo(b.x + 84, b.y - 18);
    ctx.lineTo(b.x + 57, b.y + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = phase2 ? "#a8f6ff" : "#d9ffff";
    roundRect(ctx, b.x, b.y + 20, b.w, b.h - 20, 10, true);
    ctx.fillStyle = phase2 ? "#2cecff" : "#73e8ff";
    ctx.fillRect(b.x + 8, b.y + 35, b.w - 16, 34);

    ctx.fillStyle = "#bfffff";
    roundRect(ctx, b.x - 16, b.y + 58, 16, 34, 5, true);
    roundRect(ctx, b.x + b.w, b.y + 58, 16, 34, 5, true);

    ctx.fillStyle = phase2 ? "#ff3a76" : "#003344";
    ctx.fillRect(b.x + 24, b.y + 49, 10, 8);
    ctx.fillRect(b.x + 58, b.y + 49, 10, 8);

    if (phase2) {
        ctx.strokeStyle = "#005577";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + 32, b.y + 75);
        ctx.lineTo(b.x + 45, b.y + 93);
        ctx.lineTo(b.x + 38, b.y + 115);
        ctx.moveTo(b.x + 64, b.y + 72);
        ctx.lineTo(b.x + 55, b.y + 96);
        ctx.lineTo(b.x + 68, b.y + 122);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    ctx.fillStyle = "#ffffff";
    roundRect(ctx, b.x + 18, b.y + b.h - 8, 22, 13, 5, true);
    roundRect(ctx, b.x + 52, b.y + b.h - 8, 22, 13, 5, true);
    ctx.restore();

    ctx.fillStyle = "rgba(0,0,0,0.72)";
    roundRect(ctx, b.x - 32, b.y - 30, b.w + 64, 16, 7, true);
    const ratio = Math.max(0, b.hp / b.maxHp);
    ctx.fillStyle = phase2 ? "#ff3a76" : "#73e8ff";
    roundRect(ctx, b.x - 28, b.y - 26, (b.w + 56) * ratio, 8, 4, true);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    roundRect(ctx, b.x - 32, b.y - 30, b.w + 64, 16, 7, false);
}

function drawMiniCharacter(g, type, x, y, run = false, frame = 0) {
    if (type === "hero") {
        g.fillStyle = "#d71920";
        g.fillRect(x + 7, y, 20, 7);
        g.fillRect(x + 4, y + 6, 26, 5);
        g.fillStyle = "#ffd0a0";
        g.fillRect(x + 9, y + 10, 18, 14);
        g.fillStyle = "black";
        g.fillRect(x + 22, y + 14, 3, 3);
        g.fillStyle = "#fff";
        g.fillRect(x + 7, y + 25, 20, 16);
        g.fillStyle = "#ffd0a0";
        g.fillRect(x + 2, y + 27, 6, 12);
        g.fillRect(x + 26, y + 27, 6, 12);
        g.fillStyle = "#d71920";
        g.fillRect(x + 8, y + 38, 8, 12);
        g.fillRect(x + 18, y + 38, 8, 12);
        if (run && Math.floor(frame) % 2 === 0) {
            g.fillRect(x + 5, y + 43, 8, 7);
            g.fillRect(x + 21, y + 43, 8, 7);
        }
    }
    if (type === "ninja") {
        g.fillStyle = "#070707";
        g.fillRect(x + 6, y, 24, 12);
        g.fillStyle = "#181818";
        g.fillRect(x + 7, y + 10, 22, 16);
        g.fillStyle = "#00ffff";
        g.fillRect(x + 11, y + 15, 16, 4);
        g.fillStyle = "#101010";
        g.fillRect(x + 6, y + 26, 24, 18);
        g.fillStyle = "#2b2b2b";
        g.fillRect(x + 1, y + 28, 6, 13);
        g.fillRect(x + 29, y + 28, 6, 13);
        g.fillStyle = "#050505";
        g.fillRect(x + 8, y + 42, 8, 13);
        g.fillRect(x + 20, y + 42, 8, 13);
        g.fillStyle = "#00ffff";
        g.fillRect(x + 7, y + 33, 22, 3);
        if (run) {
            g.fillStyle = "rgba(0,255,255,0.35)";
            g.fillRect(x - 8, y + 18, 6, 20);
        }
    }
    if (type === "robot") {
        g.fillStyle = "#777";
        g.fillRect(x + 7, y, 22, 18);
        g.fillStyle = "#222";
        g.fillRect(x + 10, y + 6, 16, 7);
        g.fillStyle = "#ff3a1f";
        g.fillRect(x + 12, y + 8, 4, 3);
        g.fillRect(x + 21, y + 8, 4, 3);
        g.fillStyle = "#999";
        g.fillRect(x + 5, y + 22, 26, 22);
        g.fillStyle = "#444";
        g.fillRect(x, y + 25, 7, 16);
        g.fillRect(x + 31, y + 25, 7, 16);
        g.fillStyle = "#555";
        g.fillRect(x + 8, y + 44, 8, 13);
        g.fillRect(x + 21, y + 44, 8, 13);
        g.fillStyle = "#00ff99";
        g.fillRect(x + 12, y + 28, 14, 5);
        g.fillStyle = "#aaa";
        g.fillRect(x + 17, y - 6, 3, 6);
        g.fillStyle = "#00ff99";
        g.fillRect(x + 15, y - 10, 7, 5);
    }
}

function drawPlayer(ctx) {
    if (state.playerDead) return;
    drawShadowDynamic(ctx, player.x + player.w/2, player.y + player.h + 4, 18);
    if (player.invulnerable > 0 && Math.floor(player.invulnerable / 5) % 2 === 0) return;

    ctx.save();
    if (player.facing === -1) {
        ctx.translate(player.x + player.w, player.y);
        ctx.scale(-1, 1);
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame);
    } else {
        ctx.translate(player.x, player.y);
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame);
    }
    ctx.restore();
}

function drawCheckpoint(ctx, cp) {
    ctx.fillStyle = cp.active ? "#00ff99" : "#fff";
    ctx.fillRect(cp.x, cp.y, 5, cp.h);
    ctx.fillStyle = cp.active ? "#00cc77" : "#ffcc00";
    ctx.fillRect(cp.x + 5, cp.y, 35, 22);
}

function drawSign(ctx, s) {
    let bg = state.levelTheme === "ice" ? "rgba(180,240,255,0.2)" : "rgba(0,0,0,0.6)";
    let border = state.levelTheme === "ice" ? "#bfffff" : "#ffffff";

    ctx.save();
    let floatY = Math.sin(Date.now() / 400 + s.x) * 4;
    let padding = 10;
    ctx.font = "14px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    let width = ctx.measureText(s.text).width;
    
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8;
    ctx.fillStyle = bg;
    ctx.fillRect(s.x - padding, s.y - 22 + floatY, width + padding * 2, 26);
    
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x - padding, s.y - 22 + floatY, width + padding * 2, 26);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(s.text, s.x, s.y + floatY);
    ctx.restore();
}

function drawCastle(ctx) {
    const x = state.levelEnd - 230;
    const y = state.groundY - 80;
    ctx.fillStyle = state.levelTheme === "grass" ? "#777" : state.levelTheme === "cave" ? "#2d1b4e" : state.levelTheme === "ice" ? "#d9ffff" : "#333";
    ctx.fillRect(x, y, 90, 80);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff3a1f" : state.levelTheme === "ice" ? "#73e8ff" : "#555";
    ctx.fillRect(x + 10, y - 25, 20, 25);
    ctx.fillRect(x + 60, y - 25, 20, 25);
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 36, y + 35, 18, 45);
}

function drawFlag(ctx) {
    const poleX = state.levelEnd - 90;
    ctx.fillStyle = "white";
    ctx.fillRect(poleX, 230, 6, 110);
    ctx.fillStyle = state.currentLevel === 1 ? "#d71920" : state.currentLevel === 2 ? "#00ffee" : state.currentLevel === 3 ? "#ff7a00" : "#73e8ff";
    ctx.fillRect(poleX + 6, 230, 42, 28);
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(poleX + 3, 225, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawLevelDecorations(ctx, canvas) {
    lists.levelDecorations.forEach(d => {
        if (d.x < state.camX - 160 || d.x > state.camX + canvas.width + 160) return;
        if (d.type === "tree") {
            ctx.fillStyle = "#6b3b19";
            ctx.fillRect(d.x, state.groundY - d.h, 10, d.h);
            ctx.fillStyle = "#2f9e44";
            ctx.beginPath();
            ctx.arc(d.x + 5, state.groundY - d.h, 23, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillRect(d.x - 4, state.groundY - d.h - 10, 12, 4);
        }
        if (d.type === "crystal") {
            drawGlow(ctx, d.x + 18, d.y + d.s / 2, 38, "rgba(93,252,255,0.25)");
            ctx.fillStyle = "rgba(80,255,255,0.45)";
            ctx.beginPath();
            ctx.moveTo(d.x, d.y + d.s);
            ctx.lineTo(d.x + 18, d.y);
            ctx.lineTo(d.x + 36, d.y + d.s);
            ctx.closePath();
            ctx.fill();
        }
        if (d.type === "pipe") {
            ctx.fillStyle = "rgba(70,70,70,0.72)";
            ctx.fillRect(d.x, state.groundY - d.h, 36, d.h);
            ctx.fillStyle = "rgba(255,90,40,0.35)";
            ctx.fillRect(d.x + 6, state.groundY - d.h + 12, 24, 8);
        }
        if (d.type === "icePeak") {
            ctx.fillStyle = "rgba(255,255,255,0.28)";
            ctx.beginPath();
            ctx.moveTo(d.x, state.groundY);
            ctx.lineTo(d.x + 48, state.groundY - d.h);
            ctx.lineTo(d.x + 95, state.groundY);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function drawAmbientParticles(ctx) {
    lists.ambientParticles.forEach(p => {
        if (state.levelTheme === "grass") ctx.fillStyle = `rgba(120,190,80,${p.alpha})`;
        if (state.levelTheme === "cave") ctx.fillStyle = `rgba(93,252,255,${p.alpha})`;
        if (state.levelTheme === "factory") ctx.fillStyle = `rgba(255,120,40,${p.alpha})`;
        if (state.levelTheme === "ice") ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
}

function drawParticles(ctx) {
    lists.particles.forEach(p => {
        const a = Math.max(0, p.life / p.max);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
    });
}

function drawHUD(ctx, canvas) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 15px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText("Nivel: " + state.currentLevel + "/" + state.maxLevel, 14, 24);
    ctx.fillText("Score: " + state.score, 14, 44);
    ctx.fillText("Vidas: " + state.lives, 14, 64);
    ctx.fillText("Muertes: " + state.deaths, 14, 84);
}
