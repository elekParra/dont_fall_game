// =========================================================
// RENDER.JS: All drawing and canvas manipulation
// =========================================================


function draw(ctx, canvas) {
    const VIRTUAL_W = 900;
    const VIRTUAL_H = 400;
    const scaleX = canvas.width / VIRTUAL_W;
    const scaleY = canvas.height / VIRTUAL_H;

    // Clear entire physical buffer (e.g. 1800x800)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // HD 2X Native Scaling: All logical (900x400) coordinates render at ultra-crisp resolution
    ctx.scale(scaleX, scaleY);

    let sx = 0;
    let sy = 0;

    if (state.shakeTimer > 0) {
        sx = (Math.random() - 0.5) * state.shakePower;
        sy = (Math.random() - 0.5) * state.shakePower;
        applyBloom(ctx, { width: VIRTUAL_W, height: VIRTUAL_H });
    }

    ctx.save();
    ctx.translate(sx, sy);

    const vCanvas = { width: VIRTUAL_W, height: VIRTUAL_H };

    drawBackground(ctx, vCanvas);
    drawAmbientParticles(ctx, vCanvas);
    drawBgShips(ctx, vCanvas);

    ctx.save();
    ctx.translate(-Math.round(state.camX), 0);

    drawLevelDecorations(ctx, vCanvas);
    lists.gravityZones.forEach(g => drawGravityZone(ctx, g));
    lists.windZones.forEach(w => drawWindZone(ctx, w));
    lists.iceZones.forEach(z => drawIceZone(ctx, z));

    // Frustum culling bounds
    const leftEdge = state.camX - 200;
    const rightEdge = state.camX + VIRTUAL_W + 200;

    lists.signs.forEach(s => drawSign(ctx, s));
    lists.blocks.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawBlock(ctx, b); });
    lists.lavaPits.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawLavaPit(ctx, p); });
    lists.fakeFloors.forEach(f => { if (f.x + f.w > leftEdge && f.x < rightEdge) drawFakeFloor(ctx, f); });
    lists.movingPlatforms.forEach(m => { if (m.x + m.w > leftEdge && m.x < rightEdge) drawMovingPlatform(ctx, m); });
    lists.vanishingPlatforms.forEach(v => { if (v.x + v.w > leftEdge && v.x < rightEdge) drawVanishingPlatform(ctx, v); });
    lists.brittlePlatforms.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawBrittlePlatform(ctx, b); });
    lists.fallingBlocks.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawFallingBlock(ctx, b, vCanvas); });
    lists.invisibleWalls.forEach(w => { if (w.x + w.w > leftEdge && w.x < rightEdge) drawInvisibleWall(ctx, w); });
    lists.crushers.forEach(c => { if (c.x + c.w > leftEdge && c.x < rightEdge) drawCrusher(ctx, c); });
    lists.lasers.forEach(l => { if (l.x + l.w > leftEdge && l.x < rightEdge) drawLaser(ctx, l); });
    lists.sawBlades.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawSawBlade(ctx, s); });
    lists.spikePlatforms.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawSpikePlatform(ctx, p); });
    lists.hiddenBlocks.forEach(h => { if (h.x + h.w > leftEdge && h.x < rightEdge) drawHiddenBlock(ctx, h); });
    lists.fallingSpikes.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawFallingSpike(ctx, s); });
    lists.springboards.forEach(sb => { if (sb.x + sb.w > leftEdge && sb.x < rightEdge) drawSpringboard(ctx, sb); });
    lists.switchBlocks.forEach(sb => { if (sb.x + sb.w > leftEdge && sb.x < rightEdge) drawSwitchBlock(ctx, sb); });
    lists.cannons.forEach(cn => { if (cn.x + cn.w > leftEdge && cn.x < rightEdge) drawCannon(ctx, cn); });
    lists.trollCoins.forEach(tc => { if (tc.x + 30 > leftEdge && tc.x - 30 < rightEdge) drawTrollCoin(ctx, tc); });
    lists.gems.forEach(gm => { if (gm.x + 30 > leftEdge && gm.x - 30 < rightEdge) drawGem(ctx, gm); });
    lists.fakeCheckpoints.forEach(fcp => { if (fcp.x + 40 > leftEdge && fcp.x - 40 < rightEdge) drawFakeCheckpoint(ctx, fcp); });
    lists.runawayCastles.forEach(rc => { if (rc.x + rc.runX + 100 > leftEdge && rc.x + rc.runX - 100 < rightEdge) drawRunawayCastle(ctx, rc); });
    if (state.chaseWall && state.chaseWall.active) drawChaseWall(ctx, state.chaseWall);
    lists.spikes.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawSpike(ctx, s); });
    lists.coins.forEach(c => { if (c.x + 20 > leftEdge && c.x - 20 < rightEdge) drawCoin(ctx, c); });
    lists.enemyProjectiles.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawEnemyProjectile(ctx, p); });
    lists.enemies.forEach(e => { if (e.x + e.w > leftEdge && e.x < rightEdge) drawEnemy(ctx, e); });

    drawIceBoss(ctx);

    lists.checkpoints.forEach(cp => drawCheckpoint(ctx, cp));

    drawCastle(ctx);
    drawFlag(ctx);
    drawParticles(ctx, vCanvas);
    drawPlayer(ctx);

    ctx.restore(); // camera translate

    if (state.inDarkZone) {
        drawDarkZone(ctx);
    }

    drawHUD(ctx, vCanvas);

    if (state.messageTimer > 0) {
        // Message is now handled via HTML overlay in showMessage
    }

    if (state.paused) {
        ctx.fillStyle = "rgba(0,0,0,0.58)";
        ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
        ctx.fillStyle = "white";
        ctx.font = "bold 42px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PAUSA", VIRTUAL_W / 2, VIRTUAL_H / 2 - 10);
        ctx.font = "18px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.fillText("Pulsa ▶ para continuar", VIRTUAL_W / 2, VIRTUAL_H / 2 + 28);
        ctx.textAlign = "left";
    }

    if (state.flashTimer > 0) {
        ctx.fillStyle = "rgba(255,0,0," + (state.flashTimer / 45) + ")";
        ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
    }

    ctx.restore(); // screen shake translate
    ctx.restore(); // HD scale
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
        sky.addColorStop(0, "#4ab8ff");
        sky.addColorStop(0.5, "#93e0ff");
        sky.addColorStop(1, "#dfffff");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sun with glow
        drawGlowScreen(ctx, 760 - state.camX * 0.04, 90, 150, "rgba(255,245,160,0.6)");
        ctx.fillStyle = "#fffce6";
        ctx.beginPath();
        ctx.arc(760 - state.camX * 0.04, 90, 36, 0, Math.PI * 2);
        ctx.fill();

        // Distant mountains (Darker, less saturated)
        ctx.fillStyle = "rgba(100,160,180,0.4)";
        for (let i = -1; i < 7; i++) {
            let x = i * 310 - (state.camX * 0.3 % 310);
            ctx.beginPath();
            ctx.moveTo(x, 380);
            ctx.lineTo(x + 155, 150);
            ctx.lineTo(x + 320, 380);
            ctx.closePath();
            ctx.fill();
            // Highlight side
            ctx.fillStyle = "rgba(150,210,230,0.2)";
            ctx.beginPath();
            ctx.moveTo(x, 380);
            ctx.lineTo(x + 155, 150);
            ctx.lineTo(x + 155, 380);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(100,160,180,0.4)";
        }

        // Foreground hills (Greener) - gradient hoisted out of loop
        const hillG = ctx.createLinearGradient(0, 240, 0, 400);
        hillG.addColorStop(0, "#67bd56");
        hillG.addColorStop(1, "#267318");
        ctx.fillStyle = hillG;
        for (let i = -1; i < 8; i++) {
            let x = i * 420 - (state.camX * 0.6 % 420);
            ctx.beginPath();
            ctx.arc(x + 160, 420, 150, Math.PI, 0);
            ctx.fill();
        }

        // Volumetric clouds (optimized)
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        for (let i = 0; i < 9; i++) {
            let x = (i * 520 - state.camX * 0.85 + Math.sin(t + i) * 8) % 1500;
            if (x < -220) x += 1500;
            let y = 70 + (i % 3) * 38;
            
            // Draw a slightly darker under-layer for shadow without using expensive shadowBlur
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath();
            ctx.arc(x + 42, y + 18, 28, 0, Math.PI * 2);
            ctx.arc(x + 76, y + 8, 38, 0, Math.PI * 2);
            ctx.arc(x + 118, y + 20, 30, 0, Math.PI * 2);
            ctx.fill();

            // Draw white cloud
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.beginPath();
            ctx.arc(x + 42, y + 14, 28, 0, Math.PI * 2);
            ctx.arc(x + 76, y + 4, 38, 0, Math.PI * 2);
            ctx.arc(x + 118, y + 16, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (state.levelTheme === "cave") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#070014");
        g.addColorStop(0.5, "#0b1c33");
        g.addColorStop(1, "#010712");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant stalagmites with gradient - hoisted out of loop
        const mGrad = ctx.createLinearGradient(0, 0, 0, 250);
        mGrad.addColorStop(0, "rgba(0,0,0,0)");
        mGrad.addColorStop(1, "rgba(0,20,40,0.7)");
        ctx.fillStyle = mGrad;
        for (let i = -1; i < 12; i++) {
            let x = i * 160 - (state.camX * 0.3 % 160);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 80, 250);
            ctx.lineTo(x + 160, 0);
            ctx.closePath();
            ctx.fill();
        }

        // Glowing crystals
        for (let i = 0; i < 26; i++) {
            let x = (i * 190 - state.camX * 0.5) % 1200;
            if (x < -80) x += 1200;
            if (x < -50 || x > canvas.width + 50) continue; // Cull off-screen
            let y = 80 + (i * 47) % 245;
            let color = i % 2 ? "rgba(168,85,255,0.6)" : "rgba(93,252,255,0.6)";
            let core = i % 2 ? "#e2c2ff" : "#c2feff";
            
            drawGlowScreen(ctx, x + 18, y + 24, 60 + Math.sin(t*2+i)*10, color);
            
            ctx.fillStyle = i % 2 ? "#a855ff" : "#5dfcff";
            ctx.beginPath();
            ctx.moveTo(x, y + 55);
            ctx.lineTo(x + 18, y);
            ctx.lineTo(x + 36, y + 55);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.moveTo(x+10, y + 45);
            ctx.lineTo(x + 18, y+10);
            ctx.lineTo(x + 26, y + 45);
            ctx.closePath();
            ctx.fill();
        }

        // Deep cave fog
        ctx.fillStyle = "rgba(0,100,150,0.08)";
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc((i * 240 - state.camX * 0.7) % 1100, 320, 180, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (state.levelTheme === "factory") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#1c1c1c");
        g.addColorStop(0.6, "#2e1515");
        g.addColorStop(1, "#360d0d");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant industrial grid
        ctx.strokeStyle = "rgba(255,80,20,0.12)";
        ctx.lineWidth = 2;
        for (let x = -200; x < canvas.width + 200; x += 80) {
            let xx = x - (state.camX * 0.4 % 80);
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

        // Massive pipes - hoisted gradient
        const pipeG = ctx.createLinearGradient(0, 0, 42, 0);
        pipeG.addColorStop(0, "rgba(20,20,20,0.8)");
        pipeG.addColorStop(0.5, "rgba(80,80,80,0.8)");
        pipeG.addColorStop(1, "rgba(10,10,10,0.8)");
        ctx.fillStyle = pipeG;

        for (let i = 0; i < 8; i++) {
            let x = (i * 210 - state.camX * 0.7) % 1200;
            if (x < -120) x += 1200;
            if (x < -60 || x > canvas.width + 60) continue;
            
            ctx.fillStyle = pipeG;
            ctx.fillRect(x, 45, 42, 350);
            
            // Pipe rings
            ctx.fillStyle = "rgba(15,15,15,0.9)";
            ctx.fillRect(x - 4, 100 + (i % 4) * 34, 50, 14);
            ctx.fillStyle = "rgba(255,90,40,0.5)";
            ctx.fillRect(x, 102 + (i % 4) * 34, 42, 2);
        }

        // Smog/glow at the bottom
        for (let i = 0; i < 7; i++) {
            let x = (i * 260 - state.camX * 0.9) % 1300;
            let alpha = 0.3 + Math.sin(t * 2 + i) * 0.2;
            drawGlowScreen(ctx, x, 350, 180, `rgba(255,50,0,${alpha})`);
        }
    }

    if (state.levelTheme === "ice") {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#d1f6ff");
        g.addColorStop(0.5, "#7accff");
        g.addColorStop(1, "#173b61");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant mountains - hoisted gradient
        const mG = ctx.createLinearGradient(0, 150, 0, 400);
        mG.addColorStop(0, "rgba(255,255,255,0.6)");
        mG.addColorStop(1, "rgba(100,180,255,0.1)");
        ctx.fillStyle = mG;
        for (let i = -1; i < 7; i++) {
            let x = i * 260 - (state.camX * 0.3 % 260);
            ctx.beginPath();
            ctx.moveTo(x, 400);
            ctx.lineTo(x + 120, 150);
            ctx.lineTo(x + 245, 400);
            ctx.closePath();
            ctx.fill();
        }

        // Foreground ice shards - hoisted gradient
        const sG = ctx.createLinearGradient(0, 80, 0, 400);
        sG.addColorStop(0, "rgba(255,255,255,0.8)");
        sG.addColorStop(1, "rgba(50,150,200,0.3)");
        ctx.fillStyle = sG;
        for (let i = 0; i < 8; i++) {
            let x = (i * 180 - state.camX * 0.2) % 1200;
            if (x < -80) x += 1200;
            ctx.beginPath();
            ctx.moveTo(x, 400);
            ctx.lineTo(x + 35, 80 + (i % 3) * 30);
            ctx.lineTo(x + 78, 400);
            ctx.closePath();
            ctx.fill();
        }

        // Dynamic snow
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (let i = 0; i < 70; i++) {
            let depth = (i % 3) + 1; // 1 to 3
            let x = (i * 87 - state.camX * (0.15 * depth) + Math.sin(t + i) * 20) % 1000;
            let y = (20 + (i * 43) % 400 + t * (15 * depth)) % 400;
            if (x < 0) x += 1000;
            ctx.beginPath();
            ctx.arc(x, y, depth * 1.2, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function drawBlock(ctx, b) {
    let body, top, edge, detail, lightEdge, darkEdge;
    if (state.levelTheme === "grass") {
        body = "#2d8a20"; top = "#5edc45"; edge = "rgba(0,50,0,0.6)"; detail = "rgba(0,0,0,0.2)";
        lightEdge = "#41b531"; darkEdge = "#1f5c15";
    } else if (state.levelTheme === "cave") {
        body = "#2d1b4e"; top = "#a67bff"; edge = "rgba(20,0,50,0.8)"; detail = "rgba(0,0,0,0.3)";
        lightEdge = "#452b75"; darkEdge = "#1b1030";
    } else if (state.levelTheme === "factory") {
        body = "#4a4a4a"; top = "#a6a6a6"; edge = "rgba(0,0,0,0.8)"; detail = "rgba(0,0,0,0.4)";
        lightEdge = "#666666"; darkEdge = "#2d2d2d";
    } else {
        body = "#5ccdf2"; top = "#ffffff"; edge = "rgba(0,100,150,0.5)"; detail = "rgba(255,255,255,0.4)";
        lightEdge = "#96e3ff"; darkEdge = "#3aaad1";
        if (!b.tileType) {
            let index = lists.blocks.indexOf(b);
            b.tileType = index > -1 ? getTileType(index, lists.blocks) : "centro";
        }
        if (b.tileType === "inicio") ctx.fillStyle = "#aef";
        if (b.tileType === "fin") ctx.fillStyle = "#cdf";
    }

    // Base body
    ctx.fillStyle = body;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // Textures/Patterns
    ctx.fillStyle = detail;
    if (state.levelTheme === "factory") {
        // Riveted metal plates
        ctx.fillRect(b.x + 4, b.y + 12, b.w - 8, b.h - 16);
        ctx.fillStyle = body;
        ctx.fillRect(b.x + 6, b.y + 14, b.w - 12, b.h - 20);
        // Rivets
        ctx.fillStyle = darkEdge;
        ctx.fillRect(b.x + 8, b.y + 16, 2, 2);
        ctx.fillRect(b.x + b.w - 10, b.y + 16, 2, 2);
        ctx.fillRect(b.x + 8, b.y + b.h - 10, 2, 2);
        ctx.fillRect(b.x + b.w - 10, b.y + b.h - 10, 2, 2);
    } else if (state.levelTheme === "ice") {
        // Cracked ice lines
        for (let x = b.x + 10; x < b.x + b.w; x += 30) {
            ctx.fillRect(x, b.y + 14, 2, 10);
            ctx.fillRect(x - 5, b.y + 24, 10, 2);
        }
    } else {
        for (let y = b.y + 14; y < b.y + b.h; y += 14) {
            ctx.fillRect(b.x, y, b.w, 2); // Horizontal lines
            let offset = ((y - b.y) / 14 % 2 === 0) ? 0 : 16;
            let vHeight = Math.min(14, b.y + b.h - y);
            for (let x = b.x + offset; x < b.x + b.w; x += 32) {
                ctx.fillRect(x, y, 2, vHeight); // Vertical lines
            }
        }
    }

    // 3D Bevels
    // Left highlight
    ctx.fillStyle = lightEdge;
    ctx.fillRect(b.x, b.y, 4, b.h);
    // Right shadow
    ctx.fillStyle = darkEdge;
    ctx.fillRect(b.x + b.w - 4, b.y, 4, b.h);
    // Bottom shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(b.x, b.y + b.h - 6, b.w, 6);

    // Top edge (Grass/Snow/Platform top)
    ctx.fillStyle = top;
    ctx.fillRect(b.x, b.y, b.w, 8);
    // Highlight on top edge
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(b.x, b.y, b.w, 2);

    // Outline
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
}

function drawFakeFloor(ctx, f) {
    if (!f.active) return;
    ctx.save();
    ctx.globalAlpha = f.alpha;
    drawBlock(ctx, f);
    ctx.restore();
}

function drawContactShadow(ctx, x, y, radius, alpha = 0.2) {
    if (radius <= 0) return;
    ctx.fillStyle = `rgba(25, 40, 60, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, Math.max(2, radius * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatformShadow(ctx, x, y, width, height) {
    ctx.fillStyle = "rgba(25, 40, 60, 0.16)";
    ctx.fillRect(x + 4, y + height, width - 8, 6);
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
    drawPlatformShadow(ctx, p.x, p.y, p.w, p.h);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff8a1f" : state.levelTheme === "cave" ? "#00d4ff" : state.levelTheme === "ice" ? "#d9ffff" : "#8844cc";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, true);
    // Inner shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    roundRect(ctx, p.x, p.y + p.h - 8, p.w, 8, 6, true);
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(p.x + 8, p.y + 4, p.w - 16, 4);
    // Border
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, false);
}

function drawVanishingPlatform(ctx, p) {
    if (!p.active) return;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    drawPlatformShadow(ctx, p.x, p.y, p.w, p.h);
    ctx.fillStyle = state.levelTheme === "factory" ? "#ff3333" : state.levelTheme === "cave" ? "#00ffaa" : state.levelTheme === "ice" ? "#aef7ff" : "#00aaff";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, true);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    roundRect(ctx, p.x, p.y + p.h - 8, p.w, 8, 6, true);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(p.x + 8, p.y + 4, p.w - 16, 4);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, false);
    ctx.restore();
}

function drawBrittlePlatform(ctx, b) {
    if (!b.active) return;
    ctx.save();
    ctx.globalAlpha = b.alpha;
    drawPlatformShadow(ctx, b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#a8f2f2";
    roundRect(ctx, b.x, b.y, b.w, b.h, 6, true);
    ctx.fillStyle = "rgba(0,100,150,0.15)";
    roundRect(ctx, b.x, b.y + b.h - 8, b.w, 8, 6, true);
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
    
    if (b.visualType === "grass") {
        drawBlock(ctx, b);
        return;
    }
    
    drawPlatformShadow(ctx, b.x, b.y, b.w, b.h);
    ctx.fillStyle = b.used ? "#4a170a" : state.levelTheme === "factory" ? "#8a1c1c" : state.levelTheme === "ice" ? "#96e3ff" : "#8a3a14";
    roundRect(ctx, b.x, b.y, b.w, b.h, 5, true);
    // Inner shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    roundRect(ctx, b.x, b.y + b.h - 6, b.w, 6, 5, true);
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(b.x + 4, b.y, b.w - 8, 4);
    // Border
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    roundRect(ctx, b.x, b.y, b.w, b.h, 5, false);
    ctx.lineWidth = 1;
}

function drawSpike(ctx, s) {
    if (!s.active) return;
    
    // Optimización: No dibujar si está fuera de pantalla
    if (s.x < state.camX - 100 || s.x > state.camX + 900) return;
    
    let leftColor, rightColor, frontColor, tipColor;
    
    if (s.variant === "ice") {
        leftColor = "#bfffff"; rightColor = "#7aa3a3"; frontColor = "#dfffff"; tipColor = "#ffffff";
    } else if (s.variant === "crystal") {
        leftColor = "#4dfcff"; rightColor = "#2b8f8f"; frontColor = "#b3fdff"; tipColor = "#ffffff";
    } else if (s.variant === "metal") {
        leftColor = "#b8b8b8"; rightColor = "#707070"; frontColor = "#dbdbdb"; tipColor = "#ff3a1f";
    } else {
        leftColor = "#e6e6e6"; rightColor = "#8a8a8a"; frontColor = "#ffffff"; tipColor = "#777777";
    }

    // Shadow
    ctx.fillStyle = "rgba(25, 40, 60, 0.3)";
    ctx.beginPath();
    ctx.moveTo(s.x + 4, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.5, s.y);
    ctx.lineTo(s.x + s.w, s.y + s.h + 4);
    ctx.fill();

    // Left Facet
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.25, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.5, s.y);
    ctx.closePath();
    ctx.fill();

    // Right Facet
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(s.x + s.w * 0.25, s.y + s.h);
    ctx.lineTo(s.x + s.w, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.5, s.y);
    ctx.closePath();
    ctx.fill();
    
    // Front Edge Highlight
    ctx.strokeStyle = frontColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x + s.w * 0.25, s.y + s.h);
    ctx.lineTo(s.x + s.w * 0.5, s.y);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Tip/Core
    if (s.variant === "metal") {
        drawGlow(ctx, s.x + s.w*0.5, s.y + s.h*0.6, 6, "rgba(255, 58, 31, 0.6)");
        ctx.fillStyle = tipColor;
        ctx.beginPath();
        ctx.arc(s.x + s.w*0.5, s.y + s.h*0.6, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCrusher(ctx, c) {
    if (!c.active) return;
    
    if (c.isSpikyCeiling) {
        // Ominous dark massive ceiling
        ctx.fillStyle = "#110022";
        ctx.fillRect(c.x, c.y, c.w, c.h);
        
        ctx.fillStyle = "#2a003a";
        ctx.fillRect(c.x, c.y + c.h - 12, c.w, 12);
        
        ctx.fillStyle = "#3d0054";
        ctx.fillRect(c.x, c.y + c.h - 4, c.w, 4);

        // Hanging crystal spikes
        for (let i = 0; i < c.w; i += 32) {
            let sx = c.x + i;
            let sy = c.y + c.h;
            let sw = 28;
            let sh = 42; // Spikes hanging down
            
            // Left Facet
            ctx.fillStyle = "#4dfcff";
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + sw * 0.25, sy);
            ctx.lineTo(sx + sw * 0.5, sy + sh);
            ctx.fill();

            // Right Facet
            ctx.fillStyle = "#2b8f8f";
            ctx.beginPath();
            ctx.moveTo(sx + sw * 0.25, sy);
            ctx.lineTo(sx + sw, sy);
            ctx.lineTo(sx + sw * 0.5, sy + sh);
            ctx.fill();
            
            // Front Edge Highlight
            ctx.strokeStyle = "#b3fdff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx + sw * 0.25, sy);
            ctx.lineTo(sx + sw * 0.5, sy + sh);
            ctx.stroke();
            ctx.lineWidth = 1;
        }
        return;
    }
    
    // Soft drop shadow
    drawContactShadow(ctx, c.x + c.w / 2, c.y + c.h, c.w * 0.6, 0.25);
    
    ctx.fillStyle = state.levelTheme === "factory" ? "#222" : "#3b3b3b";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    
    // Highlight
    ctx.fillStyle = state.levelTheme === "factory" ? "#333" : "#555";
    ctx.fillRect(c.x, c.y, c.w, 6);
    ctx.fillRect(c.x, c.y, 6, c.h);
    
    // Texture / details
    ctx.fillStyle = "#111";
    ctx.fillRect(c.x + 8, c.y + 12, c.w - 16, c.h - 32);
    
    // Glowing or warning strip
    if (state.levelTheme === "factory") {
        // Red glowing core
        drawGlow(ctx, c.x + c.w/2, c.y + c.h/2, c.w/2, "rgba(255, 58, 31, 0.5)");
        ctx.fillStyle = "#ff3a1f";
        ctx.fillRect(c.x + 12, c.y + 16, c.w - 24, c.h - 40);
        ctx.fillStyle = "#ff8573";
        ctx.fillRect(c.x + 16, c.y + 20, c.w - 32, 6);
    } else {
        ctx.fillStyle = "#555";
        ctx.fillRect(c.x + 12, c.y + 16, c.w - 24, c.h - 40);
    }
    
    // Hazard stripes at bottom edge
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(c.x, c.y + c.h - 16, c.w, 16);
    ctx.fillStyle = "#000000";
    for(let i=0; i<c.w; i+=12) {
        ctx.beginPath();
        ctx.moveTo(c.x + i, c.y + c.h - 16);
        ctx.lineTo(c.x + i + 8, c.y + c.h - 16);
        ctx.lineTo(c.x + i - 2, c.y + c.h);
        ctx.lineTo(c.x + i - 10, c.y + c.h);
        ctx.fill();
    }
}

function drawSpikePlatform(ctx, p) {
    // Sombra proyectada
    drawPlatformShadow(ctx, p.x, p.y, p.w, p.h);
    
    // Base metálica de la plataforma
    ctx.fillStyle = "#3a3a4a"; // Gris oscuro azulado
    roundRect(ctx, p.x, p.y, p.w, p.h, 4, true);
    
    // Borde inferior oscuro (3D)
    ctx.fillStyle = "#222230";
    roundRect(ctx, p.x, p.y + p.h - 6, p.w, 6, 4, true);
    
    // Placa superior de metal
    ctx.fillStyle = "#555566";
    ctx.fillRect(p.x + 2, p.y, p.w - 4, 8);
    
    // Panel central con textura de rejilla
    ctx.fillStyle = "#2a2a35";
    ctx.fillRect(p.x + 6, p.y + 10, p.w - 12, p.h - 18);
    
    // Rejillas horizontales
    ctx.fillStyle = "#1a1a25";
    for(let y = p.y + 12; y < p.y + p.h - 10; y += 4) {
        ctx.fillRect(p.x + 8, y, p.w - 16, 2);
    }
    
    // Luces de advertencia LED
    let ledColor = "#00ffcc"; // Estado normal (seguro)
    let glowColor = "rgba(0, 255, 204, 0.4)";
    
    if (p.triggered) {
        if (p.timer > 0 && p.timer % 10 < 5) {
            ledColor = "#ff2200"; // Parpadeo rojo peligro
            glowColor = "rgba(255, 34, 0, 0.6)";
        } else if (p.timer > 0) {
            ledColor = "#550000"; // Rojo oscuro
            glowColor = "rgba(0, 0, 0, 0)";
        }
        if (p.popped) {
            ledColor = "#ff0000"; // Rojo fijo cuando salieron
            glowColor = "rgba(255, 0, 0, 0.5)";
        }
    }
    
    // Dibujar los LEDs a los lados
    drawGlow(ctx, p.x + 6, p.y + 6, 8, glowColor);
    drawGlow(ctx, p.x + p.w - 6, p.y + 6, 8, glowColor);
    ctx.fillStyle = ledColor;
    ctx.fillRect(p.x + 4, p.y + 4, 4, 4);
    ctx.fillRect(p.x + p.w - 8, p.y + 4, 4, 4);

    // Pinchos cuando salen
    if (p.popped) {
        for (let i = 2; i < p.w - 8; i += 16) {
            let sx = p.x + i;
            let sy = p.y - 18;
            
            // Pinchos metálicos afilados (estilo drawSpike metal)
            ctx.fillStyle = "#b8b8b8";
            ctx.beginPath();
            ctx.moveTo(sx, sy + 18);
            ctx.lineTo(sx + 4, sy + 18);
            ctx.lineTo(sx + 6, sy);
            ctx.fill();
            
            ctx.fillStyle = "#707070";
            ctx.beginPath();
            ctx.moveTo(sx + 4, sy + 18);
            ctx.lineTo(sx + 10, sy + 18);
            ctx.lineTo(sx + 6, sy);
            ctx.fill();
            
            // Brillo
            ctx.strokeStyle = "#dbdbdb";
            ctx.beginPath();
            ctx.moveTo(sx + 4, sy + 18);
            ctx.lineTo(sx + 6, sy);
            ctx.stroke();
            
            // Base del pincho rota
            ctx.fillStyle = "#111";
            ctx.fillRect(sx, p.y, 10, 2);
        }
    }
}

function drawHiddenBlock(ctx, h) {
    if (!h.active && !h.revealed) {
        // Very subtle hint
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.strokeRect(h.x, h.y, h.w, h.h);
    } else if (h.revealed) {
        ctx.fillStyle = "#d4af37"; // Gold color
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.fillStyle = "#ffdf73";
        ctx.fillRect(h.x, h.y, h.w, 4);
        ctx.fillRect(h.x, h.y, 4, h.h);
        // Exclamation mark
        ctx.fillStyle = "#8a6d1c";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("!", h.x + h.w/2, h.y + 28);
        ctx.textAlign = "left";
    }
}

function drawFallingSpike(ctx, s) {
    if (!s.active) return;
    
    let t = Date.now() / 400 + s.x;
    // Ligero balanceo visual (no afecta la colisión real que sigue siendo recta)
    let sway = s.falling ? 0 : Math.sin(t) * 3;
    
    // Coordenadas con balanceo
    let cx = s.x + sway;
    let cy = s.y;
    
    // Dibujar la cadena hacia arriba
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Alternar eslabones de la cadena
    let chainTop = s.startY - 300; // Cadena sube hasta perderse en el cielo
    for(let y = cy; y > chainTop; y -= 12) {
        // Oscilación de la cadena más suave arriba
        let factor = (y - chainTop) / (cy - chainTop);
        let chainX = s.x + sway * factor + s.w/2;
        
        ctx.beginPath();
        if (Math.round(y/12) % 2 === 0) {
            ctx.ellipse(chainX, y, 4, 6, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(chainX, y, 2, 8, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
    }
    
    // Anclaje metálico del pincho a la cadena
    ctx.fillStyle = "#333";
    ctx.fillRect(cx + s.w/2 - 6, cy - 4, 12, 8);
    ctx.fillStyle = "#666";
    ctx.fillRect(cx + s.w/2 - 4, cy - 2, 8, 4);

    // Cuerpo del pincho cayendo (Estalactita de metal pesado)
    // Left facet
    ctx.fillStyle = "#778899";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + s.w/2, cy);
    ctx.lineTo(cx + s.w/2, cy + s.h);
    ctx.fill();
    
    // Right facet
    ctx.fillStyle = "#556677";
    ctx.beginPath();
    ctx.moveTo(cx + s.w/2, cy);
    ctx.lineTo(cx + s.w, cy);
    ctx.lineTo(cx + s.w/2, cy + s.h);
    ctx.fill();
    
    // Highlights and details
    ctx.strokeStyle = "#aaccff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + s.w/2, cy);
    ctx.lineTo(cx + s.w/2, cy + s.h);
    ctx.stroke();
    ctx.lineWidth = 1;
    
    // Ranuras horizontales mecánicas
    ctx.fillStyle = "#223344";
    ctx.fillRect(cx + 4, cy + 8, s.w - 8, 2);
    ctx.fillRect(cx + 6, cy + 18, s.w - 12, 2);
    ctx.fillRect(cx + 8, cy + 28, s.w - 16, 2);
    
    // Ojos rojos brillantes si está cayendo
    if (s.falling) {
        drawGlow(ctx, cx + s.w/2, cy + s.h*0.7, 10, "rgba(255, 0, 0, 0.6)");
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(cx + s.w/2, cy + s.h*0.7, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSpringboard(ctx, sb) {
    // Base
    ctx.fillStyle = "#333";
    ctx.fillRect(sb.x + 2, sb.y + sb.h - 4, sb.w - 4, 4);
    
    let squish = sb.animTimer > 0 ? 8 : 0;
    let topY = sb.y + squish;
    
    // Coils (Zig-Zag)
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    
    let coilW = sb.w - 16;
    let cx = sb.x + 8;
    let botY = sb.y + sb.h - 4;
    let diff = botY - (topY + 6);
    
    ctx.beginPath();
    ctx.moveTo(cx + coilW/2, botY);
    ctx.lineTo(cx + coilW, botY - diff * 0.25);
    ctx.lineTo(cx, botY - diff * 0.5);
    ctx.lineTo(cx + coilW, botY - diff * 0.75);
    ctx.lineTo(cx + coilW/2, topY + 6);
    ctx.stroke();
    
    // Top Pad
    ctx.fillStyle = "#e63900"; // Deep orange red
    ctx.fillRect(sb.x, topY, sb.w, 8);
    
    // Highlight
    ctx.fillStyle = "#ff9900";
    ctx.fillRect(sb.x + 2, topY + 1, sb.w - 4, 2);
}

function drawInvisibleWall(ctx, w) {
    if (!w.active) return;
    
    if (w.animProgress === undefined) w.animProgress = 1;
    if (w.animProgress < 1) w.animProgress += 0.05;
    if (w.animProgress > 1) w.animProgress = 1;
    
    let t = Date.now() / 200;
    let isHit = w.hitTimer > 0;
    
    // Si acaba de ser golpeado, brilla mucho más
    let alpha = isHit ? 0.6 : 0.15 + Math.sin(t * 3) * 0.05;
    let colorBase = isHit ? "255, 50, 50" : "0, 255, 204"; // Rojo si golpea, cian normal
    
    // Posiciones animadas de los generadores
    let topY = w.y - 10 * w.animProgress;
    let botY = w.y + w.h + 10 * (1 - w.animProgress);
    
    // 1. Dibujar generadores metálicos arriba y abajo
    ctx.fillStyle = "#2a2a35";
    ctx.fillRect(w.x - 4, topY, w.w + 8, 10); // Generador superior
    ctx.fillRect(w.x - 4, botY, w.w + 8, 10); // Generador inferior
    
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(w.x - 2, topY, w.w + 4, 10);
    ctx.fillRect(w.x - 2, botY, w.w + 4, 10);
    
    // Luces/Diodos del generador
    let glowColor = `rgba(${colorBase}, ${alpha * 3})`;
    drawGlow(ctx, w.x + w.w/2, topY + 5, 8, glowColor);
    drawGlow(ctx, w.x + w.w/2, botY + 5, 8, glowColor);
    
    ctx.fillStyle = `rgb(${colorBase})`;
    ctx.fillRect(w.x + w.w/2 - 2, topY + 3, 4, 4);
    ctx.fillRect(w.x + w.w/2 - 2, botY + 3, 4, 4);

    if (w.animProgress > 0.1) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        
        let fieldH = w.h * w.animProgress;
        let fieldY = botY - fieldH;
        
        // Fondo del campo de fuerza
        ctx.fillStyle = `rgba(${colorBase}, ${alpha * 0.3})`;
        ctx.fillRect(w.x, fieldY, w.w, fieldH);
        
        // Bordes brillantes
        ctx.strokeStyle = `rgba(${colorBase}, ${alpha * 2})`;
        ctx.lineWidth = isHit ? 3 : 1;
        ctx.strokeRect(w.x, fieldY, w.w, fieldH);
        
        // Líneas de energía escaneando (holograma)
        ctx.strokeStyle = `rgba(${colorBase}, ${alpha * 1.5})`;
        ctx.lineWidth = 1;
        for (let y = fieldY + (t * 20) % 20; y < fieldY + fieldH; y += 20) {
            ctx.beginPath();
            ctx.moveTo(w.x, y);
            ctx.lineTo(w.x + w.w, y);
            ctx.stroke();
        }
        
        // Destello adicional si golpeado
        if (isHit) {
            let hitFactor = w.hitTimer / 30; // 1 to 0
            drawGlowScreen(ctx, w.x + w.w/2, w.y + w.h/2, w.w * 3 * hitFactor, `rgba(255, 50, 50, ${hitFactor * 0.6})`);
        }
        
        ctx.restore();
    }
}

function drawLavaPit(ctx, p) {
    let t = Date.now() / 150;
    
    // Deep liquid layer
    ctx.fillStyle = state.levelTheme === "cave" ? "#006b6b" : state.levelTheme === "factory" ? "#8a1100" : state.levelTheme === "ice" ? "#1e5c6b" : "#9e2800";
    ctx.fillRect(p.x, p.y + 15, p.w, p.h);
    
    // Bright surface layer
    ctx.fillStyle = state.levelTheme === "cave" ? "#00ffee" : state.levelTheme === "factory" ? "#ff2a00" : state.levelTheme === "ice" ? "#73e8ff" : "#ff4500";
    ctx.fillRect(p.x, p.y + 15, p.w, 8);
    
    // Glow at the top edge
    drawGlowScreen(ctx, p.x + p.w/2, p.y + 15, p.w/2, state.levelTheme === "cave" ? "rgba(0, 255, 238, 0.4)" : state.levelTheme === "factory" ? "rgba(255, 42, 0, 0.4)" : state.levelTheme === "ice" ? "rgba(115, 232, 255, 0.4)" : "rgba(255, 69, 0, 0.4)");

    // Animated bubbles
    ctx.fillStyle = state.levelTheme === "ice" ? "#ffffff" : state.levelTheme === "cave" ? "#bfffff" : "#ffcc00";
    for (let x = p.x; x < p.x + p.w; x += 15) {
        let yWave = Math.sin(t + x * 0.1) * 5;
        let size = 3 + Math.sin(t * 1.5 + x) * 2;
        ctx.beginPath();
        ctx.arc(x + 5, p.y + 18 + yWave, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright spot for 3D bubble look
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + 5 - size/3, p.y + 18 + yWave - size/3, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = state.levelTheme === "ice" ? "#ffffff" : state.levelTheme === "cave" ? "#bfffff" : "#ffcc00";
    }
}

function drawLaser(ctx, l) {
    let baseColor = state.levelTheme === "factory" ? "255, 30, 30" : "0, 255, 255";
    
    // Emitter base (always visible)
    ctx.fillStyle = "#222";
    ctx.fillRect(l.x - 4, l.y, l.w + 8, 12);
    ctx.fillStyle = "#555";
    ctx.fillRect(l.x - 2, l.y, l.w + 4, 6);
    
    // Tiny glowing diode on emitter
    ctx.fillStyle = (l.state === "warning" || l.state === "firing") ? `rgba(${baseColor}, 0.8)` : "#111";
    ctx.fillRect(l.x + l.w/2 - 2, l.y + 6, 4, 4);
    
    if (l.state === "off" || !l.state) return;
    
    let isWarning = l.state === "warning";
    
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    
    if (isWarning) {
        // Red warning thread
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.4 + Math.sin(Date.now() / 50) * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Skip the emitter body
        ctx.moveTo(l.x + l.w / 2, l.y + 12);
        ctx.lineTo(l.x + l.w / 2, l.y + l.h);
        ctx.stroke();
        
        // Small target dot at the bottom
        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.arc(l.x + l.w/2, l.y + l.h, 3, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Firing state
        let intensity = Math.random() * 0.2 + 0.8; // Flicker
        
        // Glow passes
        ctx.fillStyle = `rgba(${baseColor}, ${0.2 * intensity})`;
        ctx.fillRect(l.x - 12, l.y + 12, l.w + 24, l.h - 12);
        
        ctx.fillStyle = `rgba(${baseColor}, ${0.5 * intensity})`;
        ctx.fillRect(l.x - 4, l.y + 12, l.w + 8, l.h - 12);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * intensity})`;
        ctx.fillRect(l.x + 2, l.y + 12, l.w - 4, l.h - 12);
        
        // Electrical sparks
        ctx.strokeStyle = `rgba(${baseColor}, 0.8)`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            let sparkY = l.y + 12 + Math.random() * (l.h - 12);
            ctx.beginPath();
            ctx.moveTo(l.x + l.w/2, sparkY);
            ctx.lineTo(l.x + l.w/2 + (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 14), sparkY + (Math.random()-0.5) * 10);
            ctx.stroke();
        }
    }
    
    ctx.restore();
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
    drawContactShadow(ctx, s.x + s.w / 2, s.y + s.h + 4, s.w / 2, 0.2);
    ctx.save();
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    
    let speed = Math.abs(s.dir * s.speed);
    ctx.rotate(s.angle);
    
    // Saw blade body gradient (metallic sheen)
    const grad = ctx.createConicGradient ? ctx.createConicGradient(s.angle, 0, 0) : ctx.createLinearGradient(-s.w/2, -s.h/2, s.w/2, s.h/2);
    grad.addColorStop(0, "#e6e6e6");
    grad.addColorStop(0.25, "#808080");
    grad.addColorStop(0.5, "#333333");
    grad.addColorStop(0.75, "#999999");
    grad.addColorStop(1, "#e6e6e6");
    
    // Outer edge (teeth)
    ctx.fillStyle = grad;
    ctx.beginPath();
    let numTeeth = 14;
    let outerR = s.w/2;
    let innerR = s.w/2.4;
    for (let i = 0; i < numTeeth * 2; i++) {
        let a = (i * Math.PI) / numTeeth;
        let r = (i % 2 === 0) ? outerR : innerR;
        if (i % 2 === 0) {
            ctx.lineTo(Math.cos(a + 0.15) * r, Math.sin(a + 0.15) * r);
        } else {
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Central metallic disc
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 2.8, 0, Math.PI * 2);
    ctx.fill();
    
    const innerGrad = ctx.createLinearGradient(-s.w/4, -s.h/4, s.w/4, s.h/4);
    innerGrad.addColorStop(0, "#222");
    innerGrad.addColorStop(1, "#888");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 3.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Core bolt
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff3a1f"; // Warning color bolt
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Motion blur rings
    if (speed > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, s.w / 2.6, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(0, 0, s.w / 3.2, Math.PI, Math.PI * 2.5);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawCoin(ctx, c) {
    if (c.taken) return;
    
    // Frustum culling
    if (c.x < state.camX - 50 || c.x > state.camX + 900 + 50) return;
    
    // Smooth HD spin animation
    let t = Date.now() / 180 + c.x * 0.08;
    let cos = Math.cos(t);
    let spinWidth = Math.max(0.12, Math.abs(cos));
    let dir = Math.sign(cos) || 1;
    const y = c.y + Math.sin(c.anim) * 4;

    // Contact soft ground shadow
    ctx.fillStyle = "rgba(10, 18, 30, 0.18)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 16, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle ambient golden aura (pulsing)
    let auraPulse = 0.14 + Math.sin(t * 1.5) * 0.07;
    ctx.fillStyle = c.trap ? `rgba(255, 30, 80, ${auraPulse * 1.3})` : `rgba(255, 215, 0, ${auraPulse})`;
    ctx.beginPath();
    ctx.arc(c.x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(c.x, y);

    // 3D edge thickness when coin is turned at an angle
    let edgeW = (1 - spinWidth) * 3.2;
    if (edgeW > 0.4) {
        ctx.fillStyle = c.trap ? "#4a0d1b" : "#8a5800";
        ctx.beginPath();
        ctx.ellipse(-dir * edgeW * 0.5, 0, 9.5 * spinWidth + edgeW * 0.5, 12.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Outer coin rim
    ctx.scale(spinWidth, 1);
    
    let rimColor = c.trap ? "#80142b" : "#8a5800";
    let bodyColor = c.trap ? "#d42046" : "#f7be25";
    let innerColor = c.trap ? "#ff4068" : "#ffe052";
    let highlightColor = c.trap ? "#ffa8b8" : "#fff8a8";

    // Outer dark border
    ctx.fillStyle = rimColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main face bevel
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8.5, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner lustrous coin face
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stamped symbol on face (Star insignia or crack for trap)
    if (c.trap) {
        ctx.strokeStyle = "#4a0011";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-1, -6);
        ctx.lineTo(2, -1);
        ctx.lineTo(-2, 2);
        ctx.lineTo(1, 6);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-1, -2, 2, 2);
    } else {
        // Embossed Star stamp (★)
        ctx.fillStyle = "#c78600";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(1.5, -1.5);
        ctx.lineTo(4.5, -1);
        ctx.lineTo(2, 1.5);
        ctx.lineTo(3, 5);
        ctx.lineTo(0, 3);
        ctx.lineTo(-3, 5);
        ctx.lineTo(-2, 1.5);
        ctx.lineTo(-4.5, -1);
        ctx.lineTo(-1.5, -1.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(1, -1);
        ctx.lineTo(3, -0.5);
        ctx.lineTo(1.2, 1);
        ctx.lineTo(2, 3.5);
        ctx.lineTo(0, 2);
        ctx.lineTo(-2, 3.5);
        ctx.lineTo(-1.2, 1);
        ctx.lineTo(-3, -0.5);
        ctx.lineTo(-1, -1);
        ctx.closePath();
        ctx.fill();
    }

    // Specular diagonal glint reflection across coin
    let glintProgress = ((t * 0.75) % 3);
    if (glintProgress < 1.0) {
        let gx = (glintProgress - 0.5) * 16;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(gx, 0, 2, 8, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawEnemyProjectile(ctx, p) {
    let t = Date.now() / 100;
    let isBoss = p.type === "boss";
    let colorCore = isBoss ? "#ffffff" : "#e0ffff";
    let colorGlow = isBoss ? "rgba(115, 232, 255, 0.6)" : "rgba(0, 255, 255, 0.5)";
    let colorTrail = isBoss ? "rgba(115, 232, 255, 0.2)" : "rgba(0, 255, 255, 0.2)";
    
    ctx.save();
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    
    // Direction angle (assuming it moves horizontally mostly, or we just draw it round)
    let vx = p.vx || -4; // Guessing direction
    
    ctx.globalCompositeOperation = "lighter";
    
    // Trail
    ctx.fillStyle = colorTrail;
    ctx.beginPath();
    ctx.arc(-Math.sign(vx) * 8, 0, p.w * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-Math.sign(vx) * 16, 0, p.w * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow
    drawGlow(ctx, 0, 0, p.w * 1.5, colorGlow);
    
    // Core
    ctx.fillStyle = colorCore;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w/2 + Math.random(), p.h/2 + Math.random(), 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawEnemy(ctx, e) {
    if (!e.alive) return;
    drawContactShadow(ctx, e.x + e.w / 2, e.y + e.h, e.w / 2 + 4, 0.25);
    
    let t = Date.now() / 100;
    
    if (e.type === "shooter") {
        ctx.fillStyle = "#8dc1d1"; // Highlighted base
        roundRect(ctx, e.x, e.y + 4, e.w, e.h - 4, 3, true);
        ctx.fillStyle = "#4a94a8"; // Base body
        roundRect(ctx, e.x, e.y + 12, e.w, e.h - 12, 3, true);
        ctx.fillStyle = "#2d6373"; // Shadow body
        ctx.fillRect(e.x + 4, e.y + 10, e.w - 8, 14);
        
        // Cannon barrel
        ctx.fillStyle = "#1b3f4a";
        ctx.fillRect(e.x + 8, e.y + 14, 6, 8);
        ctx.fillRect(e.x + 22, e.y + 14, 6, 8);
        ctx.fillStyle = "#112229";
        ctx.fillRect(e.x + 9, e.y + 16, 4, 6);
        ctx.fillRect(e.x + 23, e.y + 16, 4, 6);
        
        // Glowing core
        drawGlow(ctx, e.x + e.w/2, e.y + 6, 15, "rgba(115, 232, 255, 0.4)");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(e.x + 12, e.y - 4, 12, 8);
        ctx.fillStyle = "#73e8ff";
        ctx.fillRect(e.x + 14, e.y - 2, 8, 4);
        
        // Hazard stripes at bottom
        ctx.fillStyle = "#000000";
        ctx.fillRect(e.x, e.y + 26, e.w, 6);
        ctx.fillStyle = "#ffcc00";
        for (let i = 0; i < e.w; i += 8) {
            ctx.beginPath();
            ctx.moveTo(e.x + i, e.y + 26);
            ctx.lineTo(e.x + i + 4, e.y + 26);
            ctx.lineTo(e.x + i - 2, e.y + 32);
            ctx.lineTo(e.x + i - 6, e.y + 32);
            ctx.fill();
        }
        return;
    }
    if (e.type === "bat") {
        let flap = Math.sin(t * 3) * 6;
        let bob = Math.sin(t * 1.5) * 4;
        
        ctx.save();
        ctx.translate(e.x + e.w/2, e.y + e.h/2 + bob);
        
        // Wing gradients
        let wGrad = ctx.createLinearGradient(0, 0, 0, 10);
        wGrad.addColorStop(0, "#702cb3");
        wGrad.addColorStop(1, "#2d0b50");
        
        // Wings
        ctx.fillStyle = wGrad;
        ctx.beginPath();
        // Left
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(-18, -15 + flap, -32, -8 + flap);
        ctx.quadraticCurveTo(-20, 10 + flap*0.5, -12, 10 + flap*0.2);
        ctx.closePath();
        ctx.fill();
        // Right
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.quadraticCurveTo(18, -15 + flap, 32, -8 + flap);
        ctx.quadraticCurveTo(20, 10 + flap*0.5, 12, 10 + flap*0.2);
        ctx.closePath();
        ctx.fill();

        // Body
        let bGrad = ctx.createRadialGradient(0, -2, 0, 0, 0, 12);
        bGrad.addColorStop(0, "#a45ce3");
        bGrad.addColorStop(1, "#40136e");
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = "#40136e";
        ctx.beginPath();
        ctx.moveTo(-5, -8); ctx.lineTo(-10, -18); ctx.lineTo(-1, -10);
        ctx.moveTo(5, -8); ctx.lineTo(10, -18); ctx.lineTo(1, -10);
        ctx.fill();
        
        // Glowing Eyes & Trails
        ctx.globalCompositeOperation = "lighter";
        // Trail
        if (e.dy && e.dy > 0) { // If swooping down
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fillRect(-6, -2 - e.dy * 2, 4, e.dy * 2);
            ctx.fillRect(2, -2 - e.dy * 2, 4, e.dy * 2);
        }
        
        ctx.fillStyle = "#ff1100";
        ctx.fillRect(-6, -2, 4, 4);
        ctx.fillRect(2, -2, 4, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-5, -1, 2, 2);
        ctx.fillRect(3, -1, 2, 2);
        ctx.globalCompositeOperation = "source-over";
        
        // Fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-3, 4); ctx.lineTo(-1, 8); ctx.lineTo(-1, 4);
        ctx.moveTo(3, 4); ctx.lineTo(1, 8); ctx.lineTo(1, 4);
        ctx.fill();
        
        ctx.restore();

        return;
    }
    if (e.type === "robot") {
        let walkBob = Math.abs(Math.sin(e.x * 0.1)) * 3;
        
        ctx.fillStyle = "#a8a8a8"; // Highlight
        roundRect(ctx, e.x, e.y + 6 - walkBob, e.w, e.h - 6, 4, true);
        ctx.fillStyle = "#5c5c5c"; // Main body
        roundRect(ctx, e.x, e.y + 12 - walkBob, e.w, e.h - 12, 4, true);
        
        ctx.fillStyle = "#222"; // Screen
        roundRect(ctx, e.x + 5, e.y + 12 - walkBob, e.w - 10, 12, 2, true);
        
        // Glowing eyes
        drawGlow(ctx, e.x + 11, e.y + 17 - walkBob, 8, "rgba(255, 42, 0, 0.4)");
        drawGlow(ctx, e.x + 24, e.y + 17 - walkBob, 8, "rgba(255, 42, 0, 0.4)");
        ctx.fillStyle = "#ff2a00";
        ctx.fillRect(e.x + 9, e.y + 15 - walkBob, 5, 5);
        ctx.fillRect(e.x + 22, e.y + 15 - walkBob, 5, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(e.x + 10, e.y + 16 - walkBob, 2, 2);
        ctx.fillRect(e.x + 23, e.y + 16 - walkBob, 2, 2);
        
        // Treads
        ctx.fillStyle = "#222";
        ctx.fillRect(e.x + 2, e.y + e.h - 6, 12, 6);
        ctx.fillRect(e.x + 22, e.y + e.h - 6, 12, 6);
        ctx.fillStyle = "#444";
        for (let i = 0; i < 12; i += 4) {
            let offset = (e.x * 0.5) % 4;
            ctx.fillRect(e.x + 2 + i - offset, e.y + e.h - 6, 2, 6);
            ctx.fillRect(e.x + 22 + i - offset, e.y + e.h - 6, 2, 6);
        }
        
        ctx.fillStyle = "#00ff99"; // Antenna/light
        ctx.fillRect(e.x + 12, e.y + 3 - walkBob, 10, 5);
        return;
    }
    
    // Default Goomba-like enemy
    let bounce = Math.abs(Math.sin(e.x * 0.15)) * 4;
    let squishW = bounce * 0.5;
    
    ctx.save();
    ctx.translate(e.x + e.w/2, e.y + e.h);
    
    // Shadow under mushroom
    ctx.fillStyle = "#4a1902";
    ctx.beginPath();
    ctx.arc(0, -14 + bounce, 16 + squishW, Math.PI, 0);
    ctx.lineTo(16 + squishW, 0);
    ctx.lineTo(-16 - squishW, 0);
    ctx.fill();
    
    // Main mushroom cap
    ctx.fillStyle = "#8a350a";
    ctx.beginPath();
    ctx.arc(0, -14 + bounce, 16 + squishW, Math.PI, 0);
    ctx.lineTo(16 + squishW, 0);
    ctx.lineTo(-16 - squishW, 0);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = "#ba531e";
    ctx.beginPath();
    ctx.arc(-4, -14 + bounce, 10 + squishW*0.5, Math.PI, 0);
    ctx.fill();
    
    // Face area
    ctx.fillStyle = "#e0aa79";
    roundRect(ctx, -12, -18 + bounce, 24, 12, 4, true);
    ctx.fillStyle = "#b57d4a";
    roundRect(ctx, -12, -10 + bounce, 24, 4, 2, true); // Shadow under face
    
    // Eyes
    ctx.fillStyle = "white";
    roundRect(ctx, -8 - squishW*0.2, -16 + bounce, 6, 7, 2, true);
    roundRect(ctx, 2 + squishW*0.2, -16 + bounce, 6, 7, 2, true);
    ctx.fillStyle = "black";
    roundRect(ctx, -6 - squishW*0.2, -14 + bounce, 3, 4, 1, true);
    roundRect(ctx, 4 + squishW*0.2, -14 + bounce, 3, 4, 1, true);
    
    // Angry eyebrows
    ctx.fillStyle = "#4a1902";
    ctx.beginPath();
    ctx.moveTo(-10, -18 + bounce); ctx.lineTo(-2, -15 + bounce); ctx.lineTo(-2, -17 + bounce);
    ctx.moveTo(10, -18 + bounce); ctx.lineTo(2, -15 + bounce); ctx.lineTo(2, -17 + bounce);
    ctx.fill();
    
    // Feet
    let walkPhase = Math.sin(e.x * 0.15);
    ctx.fillStyle = "#1a0800";
    roundRect(ctx, -14, 0, 10, 4 + walkPhase * 2, 2.5, true);
    roundRect(ctx, 4, 0, 10, 4 - walkPhase * 2, 2.5, true);
    
    ctx.restore();
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

    drawContactShadow(ctx, b.x + b.w / 2, b.y + b.h, 54, 0.32);
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

function drawMiniCharacter(g, type, x, y, run = false, frame = 0, idleTimer = 0, playerObj = null) {
    if (type === "hero") {
        let breathe = (!run && idleTimer) ? Math.sin(idleTimer * 0.1) * 1.5 : 0;
        let walkY = run ? Math.abs(Math.sin(frame * 0.6)) * 2 : 0;
        
        let py = y + breathe - walkY;
        let baseY = y - walkY; // Anchor for feet
        
        // Sombra de los pies
        drawContactShadow(g, x + 17, y + 48, 14 - walkY, 0.25);

        let armRot = run ? Math.sin(frame * 0.6) * 0.6 : (!run && idleTimer ? Math.sin(idleTimer * 0.1) * 0.05 : 0);
        let legRot = run ? Math.sin(frame * 0.6) * 0.7 : 0;

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#555555"; // Manga trasera suave
        roundRect(g, -4, 0, 8, 11, 3, true);
        g.fillStyle = "#dddddd"; // Guante/Mano
        roundRect(g, -5, 10, 10, 8, 3.5, true);
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#2e2e2e"; // Pantalón oscuro trasero
        roundRect(g, -4, -breathe, 8, 8 + breathe, 2.5, true); 
        g.fillStyle = "#1e1e1e"; // Zapato oscuro
        roundRect(g, -5, 8, 10, 6, 3, true);
        g.restore();

        // --- CUERPO ---
        g.fillStyle = "#8c8c8c"; // Sudadera gris con esquinas suaves
        roundRect(g, x + 9, py + 22, 16, 12, 3.5, true);
        
        g.fillStyle = "#4a4a4a"; // Pantalones
        roundRect(g, x + 10, py + 30, 14, 11, 2.5, true);
        
        // Cintas sudadera redondeadas
        g.fillStyle = "#ffffff";
        roundRect(g, x + 11, py + 24, 2, 6, 1, true);
        roundRect(g, x + 20, py + 24, 2, 6, 1, true);

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#4a4a4a"; // Pantalón frontal
        roundRect(g, -4, -breathe, 8, 8 + breathe, 2.5, true);
        g.fillStyle = "#333333"; // Zapato
        roundRect(g, -4, 8, 11, 6, 3, true);
        g.restore();

        // --- CABEZA ---
        let headY = py + 8 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.1) * 0.5);
        
        // Piel con bordes suaves
        g.fillStyle = "#ffd0a0"; 
        roundRect(g, x + 9, headY, 18, 15, 3.5, true);
        
        // Nariz redondeada
        g.fillStyle = "#ffb370"; 
        roundRect(g, x + 23, headY + 5, 7, 6, 2.5, true);

        // Ojo
        g.fillStyle = "#111111";
        roundRect(g, x + 20, headY + 2, 3, 6, 1.5, true);

        // Bigote y cabello suave
        g.fillStyle = "#2b1807"; 
        roundRect(g, x + 18, headY + 11, 13, 4, 2, true); // Bigote curvado
        roundRect(g, x + 7, headY + 3, 4, 9, 2, true);    // Cabello atrás

        // Capucha / Gorra curvada
        g.fillStyle = "#8c8c8c"; 
        roundRect(g, x + 7, headY - 8, 19, 11, 4.5, true); // Cúpula
        roundRect(g, x + 5, headY - 1, 5, 11, 2.5, true);  // Borde nuca
        
        // Sombra suave de capucha
        g.fillStyle = "#6b6b6b";
        roundRect(g, x + 7, headY - 1, 18, 2, 1, true);

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#8c8c8c"; // Manga gris
        roundRect(g, -4, 0, 8, 11, 3, true);
        g.fillStyle = "#ffffff"; // Guante
        roundRect(g, -5, 10, 10, 8, 3.5, true);
        g.fillStyle = "#cccccc"; // Detalle muñeca
        roundRect(g, -5, 16, 10, 2, 1, true);
        g.restore();
    }
    if (type === "ninja") {
        let breathe = (!run && idleTimer) ? Math.sin(idleTimer * 0.1) * 1.5 : 0;
        let walkY = run ? Math.abs(Math.sin(frame * 0.6)) * 2 : 0;
        let py = y + breathe - walkY;
        let baseY = y - walkY;
        
        drawContactShadow(g, x + 17, y + 48, 14 - walkY, 0.25);

        let armRot = run ? Math.sin(frame * 0.6) * 0.6 : (!run && idleTimer ? Math.sin(idleTimer * 0.1) * 0.05 : 0);
        let legRot = run ? Math.sin(frame * 0.6) * 0.7 : 0;

        if (playerObj && playerObj.isFlipping) {
            armRot = 1.8;   // Arms reach down towards knees
            legRot = -2.0;  // Legs tuck up tightly
        }

        // Scarf trailing suavemente curvada
        let scarfWind = Math.sin(Date.now() / 150) * 4;
        g.fillStyle = "#00bfff";
        g.beginPath();
        g.moveTo(x + 12, py + 18);
        g.quadraticCurveTo(x + 2, py + 20 + scarfWind * 0.5, x - 9 + (run ? -12 : 0), py + 22 + scarfWind);
        g.lineTo(x - 7 + (run ? -12 : 0), py + 28 + scarfWind * 0.5);
        g.quadraticCurveTo(x + 2, py + 24, x + 12, py + 24);
        g.closePath();
        g.fill();

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#111111"; // Manga trasera
        roundRect(g, -4, 0, 8, 11, 3, true);
        g.fillStyle = "#222222"; // Guante
        roundRect(g, -5, 10, 10, 8, 3.5, true);
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#111111"; // Pantalón trasero
        roundRect(g, -4, -breathe, 8, 8 + breathe, 2.5, true);
        g.fillStyle = "#080808"; // Zapato trasero
        roundRect(g, -5, 8, 10, 6, 3, true);
        g.restore();

        // --- CUERPO ---
        g.fillStyle = "#1a1a1a"; 
        roundRect(g, x + 9, py + 22, 16, 18, 3.5, true);
        g.fillStyle = "#00bfff"; // Cinturón suave
        roundRect(g, x + 8, py + 34, 18, 3.5, 1.5, true);

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#222222"; 
        roundRect(g, -4, -breathe, 8, 8 + breathe, 2.5, true);
        g.fillStyle = "#111111"; 
        roundRect(g, -4, 8, 11, 6, 3, true);
        g.restore();

        // --- CABEZA ---
        let headY = py + 8 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.1) * 0.5);
        g.fillStyle = "#111111"; // Capucha ninja redondeada
        roundRect(g, x + 7, headY - 5, 20, 20, 5, true);
        
        // Piel visible (ojos)
        g.fillStyle = "#ffd0a0"; 
        roundRect(g, x + 12, headY + 3, 14, 6, 2.5, true);
        
        // Ojos ninja
        g.fillStyle = "white";
        roundRect(g, x + 16, headY + 4, 4, 3, 1.2, true);
        roundRect(g, x + 23, headY + 4, 4, 3, 1.2, true);
        g.fillStyle = "#00bfff"; // Pupila cian
        roundRect(g, x + 18, headY + 4, 2, 2, 0.8, true);
        roundRect(g, x + 25, headY + 4, 2, 2, 0.8, true);

        // Diadema con brillo metálico
        g.fillStyle = "#00bfff";
        roundRect(g, x + 6, headY - 1, 22, 4, 2, true);
        g.fillStyle = "rgba(255,255,255,0.45)";
        roundRect(g, x + 10, headY, 10, 1.5, 0.7, true);

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#222222"; 
        roundRect(g, -4, 0, 8, 11, 3, true);
        g.fillStyle = "#333333"; // Guante frontal
        roundRect(g, -5, 10, 10, 8, 3.5, true);
        g.fillStyle = "#00bfff"; // Pulsera
        roundRect(g, -4, 9, 8, 2.5, 1, true);
        g.restore();
    }
    if (type === "robot") {
        let breathe = (!run && idleTimer) ? Math.sin(idleTimer * 0.2) * 1 : 0;
        let walkY = run ? Math.abs(Math.sin(frame * 0.6)) * 2 : 0;
        let py = y + breathe - walkY;
        let baseY = y - walkY;
        
        drawContactShadow(g, x + 17, y + 48, 14 - walkY, 0.25);

        let armRot = run ? Math.sin(frame * 0.6) * 0.6 : (!run && idleTimer ? Math.sin(idleTimer * 0.2) * 0.05 : 0);
        let legRot = run ? Math.sin(frame * 0.6) * 0.7 : 0;

        // Fuego del Jetpack
        if (playerObj && playerObj.jetpackActive) {
            g.fillStyle = "#00ffcc";
            g.beginPath();
            g.moveTo(x, py + 30);
            g.lineTo(x + 8, py + 30);
            g.lineTo(x + 4, py + 50 + Math.random() * 15);
            g.fill();
        }

        // Mochila Jetpack suave
        g.fillStyle = "#555555";
        roundRect(g, x - 3, py + 18, 12, 16, 3, true);
        g.fillStyle = "#00ffcc";
        roundRect(g, x - 2, py + 22, 4, 8, 1.5, true);

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#444444"; 
        roundRect(g, -3, 0, 6, 11, 2.5, true);
        g.fillStyle = "#666666"; 
        g.beginPath(); g.arc(0, 12, 5, 0, Math.PI*2); g.fill(); // Pinza
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#444444"; 
        roundRect(g, -3, -breathe, 6, 10 + breathe, 2, true);
        g.fillStyle = "#2d2d2d"; 
        roundRect(g, -5, 8, 10, 5, 2.5, true);
        g.restore();

        // --- CUERPO ---
        g.fillStyle = "#999999"; 
        roundRect(g, x + 8, py + 20, 18, 18, 4, true);
        // Detalles pecho
        g.fillStyle = "#ff3a1f";
        roundRect(g, x + 11, py + 24, 4, 3, 1, true);
        g.fillStyle = "#00ffcc";
        roundRect(g, x + 18, py + 24, 4, 3, 1, true);
        g.fillStyle = "#555555";
        roundRect(g, x + 11, py + 30, 12, 6, 2, true); // Rejilla

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#777777"; 
        roundRect(g, -3, -breathe, 6, 10 + breathe, 2, true);
        g.fillStyle = "#444444"; 
        roundRect(g, -4, 8, 11, 5, 2.5, true);
        g.restore();

        // --- CABEZA ---
        let headY = py + 4 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.2) * 0.5);
        
        g.fillStyle = "#888888"; // Cabeza con bordes biselados suaves
        roundRect(g, x + 6, headY, 22, 16, 4.5, true);
        
        // Visor
        g.fillStyle = "#222222"; 
        roundRect(g, x + 9, headY + 4, 17, 7, 3, true);
        g.fillStyle = "#00ffcc"; // Ojos luz
        roundRect(g, x + 11, headY + 5, 13, 5, 2, true);

        // Antena
        g.fillStyle = "#666666";
        roundRect(g, x + 15, headY - 6, 3, 7, 1, true);
        g.fillStyle = "#ff3a1f";
        let antGlow = Math.abs(Math.sin(Date.now()/200));
        g.globalAlpha = 0.5 + antGlow * 0.5;
        g.beginPath(); g.arc(x + 16.5, headY - 7, 3.5, 0, Math.PI*2); g.fill();
        g.globalAlpha = 1.0;

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#aaaaaa"; 
        roundRect(g, -3, 0, 6, 11, 2.5, true);
        g.fillStyle = "#cccccc"; 
        g.beginPath(); g.arc(0, 12, 5, 0, Math.PI*2); g.fill(); // Pinza
        g.fillStyle = "#444444";
        g.beginPath(); g.arc(0, 12, 2.5, 0, Math.PI*2); g.fill(); // Agujero pinza
        g.restore();
    }
}

function drawPlayer(ctx) {
    if (state.playerDead) return;
    drawContactShadow(ctx, player.x + player.w/2, state.groundY, 18, 0.25);
    if (player.invulnerable > 0 && Math.floor(player.invulnerable / 5) % 2 === 0) return;

    ctx.save();
    
    if (player.lifeGlowTimer > 0) {
        player.lifeGlowTimer--;
        
        // Cycle colors from Green to Yellow/Gold
        const t = Date.now() / 150;
        const r = Math.floor(100 + 155 * Math.abs(Math.sin(t)));
        const g = 255;
        const b = Math.floor(50 * Math.abs(Math.cos(t)));
        
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 15 + Math.abs(Math.sin(t * 2)) * 10;
        
        if (Math.random() < 0.2) {
            addExplosion(player.x + Math.random() * player.w, player.y + Math.random() * player.h, `rgb(${r}, ${g}, ${b})`, 1);
        }
    }

    // Apply Squash & Stretch centered on player's feet base
    const feetX = player.x + player.w / 2;
    const feetY = player.y + player.h;
    ctx.translate(feetX, feetY);
    ctx.scale(player.squashX || 1.0, player.squashY || 1.0);
    ctx.translate(-feetX, -feetY);

    // Apply flip rotation if flipping (Ninja Double Jump)
    if (player.isFlipping) {
        player.flipAngle += (player.facing === 1 ? 0.38 : -0.38);
        ctx.translate(player.x + player.w/2, player.y + player.h/2);
        ctx.rotate(player.flipAngle);
        ctx.translate(-(player.x + player.w/2), -(player.y + player.h/2));
    }

    if (player.facing === -1) {
        ctx.translate(player.x + player.w, player.y);
        ctx.scale(-1, 1);
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame, player.idleTimer, player);
    } else {
        ctx.translate(player.x, player.y);
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame, player.idleTimer, player);
    }
    ctx.restore();

        // Draw Jetpack Fuel Bar for Robot
    if (state.selectedCharacter === "robot") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(player.x - 2, player.y - 12, 38, 6);
        
        if (player.jetpackFuel > 15) ctx.fillStyle = "#00ffcc";
        else if (player.jetpackFuel > 6) ctx.fillStyle = "#ffaa00";
        else ctx.fillStyle = "#ff3a1f";
        
        let fillWidth = (player.jetpackFuel / 30) * 36;
        ctx.fillRect(player.x - 1, player.y - 11, Math.max(0, fillWidth), 4);
    }
}

function drawCheckpoint(ctx, cp) {
    ctx.fillStyle = cp.active ? "#00ff99" : "#fff";
    ctx.fillRect(cp.x, cp.y, 5, cp.h);
    ctx.fillStyle = cp.active ? "#00cc77" : "#ffcc00";
    ctx.fillRect(cp.x + 5, cp.y, 35, 22);
}

function drawCartoonBanner(ctx, text, x, y, alpha, scale, theme, isSign = false) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Animate scale
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Choose colors based on theme
    let bg, border, textColor;
    if (theme === "grass") {
        bg = "#FFF6D9"; border = "#7A5C4A"; textColor = "#4A3022";
    } else if (theme === "cave") {
        bg = "#1A1A3A"; border = "#00FFFF"; textColor = "#E0FFFF";
    } else if (theme === "factory") {
        bg = "#FFD54F"; border = "#37474F"; textColor = "#B71C1C";
    } else if (theme === "ice") {
        bg = "#E0F7FA"; border = "#00B8D4"; textColor = "#01579B";
    } else {
        bg = "#FFF6D9"; border = "#7A5C4A"; textColor = "#4A3022";
    }

    // Font
    let fontSize = isSign ? 14 : 28;
    ctx.font = `bold ${fontSize}px "Fredoka", "Varela Round", "Arial Rounded MT Bold", sans-serif`;
    
    // Measure text
    let lines = text.split("\n");
    let maxWidth = 0;
    lines.forEach(l => {
        let w = ctx.measureText(l).width;
        if (w > maxWidth) maxWidth = w;
    });
    
    let paddingX = isSign ? 12 : 48;
    let paddingY = isSign ? 8 : 24;
    let boxWidth = maxWidth + paddingX * 2;
    let boxHeight = (fontSize * lines.length) + ((lines.length - 1) * 8) + paddingY * 2;
    let r = isSign ? 10 : 28;
    let bx = -boxWidth/2, by = -boxHeight/2;
    
    // Fast crisp Drop Shadow (avoids compositor stalls from shadowBlur)
    ctx.fillStyle = "rgba(15, 25, 40, 0.22)";
    roundRect(ctx, bx + 2, by + (isSign ? 4 : 8), boxWidth, boxHeight, r, true, false);
    
    // Base Box
    ctx.fillStyle = bg;
    roundRect(ctx, bx, by, boxWidth, boxHeight, r, true, false);
    
    // Highlight / Glossy top half
    ctx.fillStyle = theme === "cave" ? "rgba(0, 255, 255, 0.12)" : "rgba(255,255,255,0.28)";
    roundRect(ctx, bx + 2, by + 2, boxWidth - 4, boxHeight * 0.42, Math.max(2, r - 2), true, false);

    // Border
    ctx.strokeStyle = border;
    ctx.lineWidth = isSign ? 4 : 6;
    roundRect(ctx, bx, by, boxWidth, boxHeight, r, false, true);

    // Decorative thematic flourishes
    if (theme === "grass") {
        ctx.fillStyle = "#4CAF50";
        ctx.beginPath(); ctx.arc(bx + 12, by + 12, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + boxWidth - 12, by + boxHeight - 12, 6, 0, Math.PI*2); ctx.fill();
    } else if (theme === "factory") {
        ctx.fillStyle = "#90A4AE";
        [ [bx+12, by+12], [bx+boxWidth-12, by+12], [bx+12, by+boxHeight-12], [bx+boxWidth-12, by+boxHeight-12] ].forEach(pos => {
            ctx.beginPath(); ctx.arc(pos[0], pos[1], 4, 0, Math.PI*2); ctx.fill();
        });
    } else if (theme === "ice") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx + r, by - 2, boxWidth - r*2, 6);
    } else if (theme === "cave") {
        ctx.fillStyle = "#00FFFF";
        ctx.beginPath(); ctx.moveTo(bx + 8, by + 14); ctx.lineTo(bx + 14, by + 8); ctx.lineTo(bx + 20, by + 14); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx + boxWidth - 20, by + boxHeight - 14); ctx.lineTo(bx + boxWidth - 14, by + boxHeight - 8); ctx.lineTo(bx + boxWidth - 8, by + boxHeight - 14); ctx.fill();
    }

    // Text
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < lines.length; i++) {
        // Centered vertically
        let totalTextHeight = (lines.length * fontSize) + ((lines.length - 1) * 8);
        let startYOffset = -totalTextHeight / 2 + (fontSize / 2);
        let ty = startYOffset + i * (fontSize + 8);
        ctx.fillText(lines[i], 0, ty);
    }
    
    ctx.restore();
}

function drawSign(ctx, s) {
    let dist = Math.abs(player.x - s.x);
    if (dist > 400) return; // Completely hide when far away to save rendering cost
    
    let alpha = 1.0;
    if (dist > 250) {
        alpha = Math.max(0, 1.0 - ((dist - 250) / 150));
    }
    
    let floatY = Math.sin(Date.now() / 400 + s.x) * 4;
    // Animate scale gently for signs (breathing) and pop-in based on distance
    let baseScale = 1.0 + Math.sin(Date.now() / 600 + s.x) * 0.02;
    let scale = dist > 250 ? baseScale * alpha : baseScale;
    
    drawCartoonBanner(ctx, s.text, s.x, s.y - 10 + floatY, alpha, Math.max(0.01, scale), state.levelTheme, true);
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
            // Wind animation factor
            let wind = Math.sin(Date.now() / 1000 + d.x * 0.05) * 5;
            
            // Trunk with shadow and highlight
            ctx.fillStyle = "#381a0b";
            ctx.beginPath();
            ctx.moveTo(d.x - 4, state.groundY);
            ctx.lineTo(d.x + 14, state.groundY);
            ctx.lineTo(d.x + 8 + wind*0.2, state.groundY - d.h);
            ctx.lineTo(d.x + 2 + wind*0.2, state.groundY - d.h);
            ctx.fill();
            
            // Trunk highlight
            ctx.fillStyle = "#5c2f16";
            ctx.beginPath();
            ctx.moveTo(d.x - 1, state.groundY);
            ctx.lineTo(d.x + 6, state.groundY);
            ctx.lineTo(d.x + 5 + wind*0.2, state.groundY - d.h);
            ctx.lineTo(d.x + 2 + wind*0.2, state.groundY - d.h);
            ctx.fill();

            // Leaves base position
            let lx = d.x + 5 + wind;
            let ly = state.groundY - d.h + Math.sin(Date.now() / 800 + d.x) * 2; // Slight vertical bob

            function drawLeaf(x, y, r, color) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Shadow under leaves
            drawLeaf(lx, ly + 8, 28, "rgba(0,40,0,0.8)");

            // Main dark leaves
            drawLeaf(lx - 12, ly + 2, 22, "#1e5c12");
            drawLeaf(lx + 12, ly + 4, 24, "#1e5c12");
            drawLeaf(lx, ly - 12, 26, "#1e5c12");
            
            // Midtone leaves
            drawLeaf(lx - 14, ly - 2, 18, "#2d8a20");
            drawLeaf(lx + 10, ly, 20, "#2d8a20");
            drawLeaf(lx, ly - 16, 22, "#2d8a20");

            // Highlight leaves (3D volume)
            drawLeaf(lx - 10, ly - 6, 10, "#5edc45");
            drawLeaf(lx + 8, ly - 4, 12, "#5edc45");
            drawLeaf(lx, ly - 20, 14, "#5edc45");
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

function drawAmbientParticles(ctx, canvas) {
    const leftEdge = state.camX - 50;
    const rightEdge = state.camX + canvas.width + 50;
    
    // Set colors once per theme rather than per particle
    if (state.levelTheme === "grass") ctx.fillStyle = "rgba(120,190,80,1)";
    else if (state.levelTheme === "cave") ctx.fillStyle = "rgba(93,252,255,1)";
    else if (state.levelTheme === "factory") ctx.fillStyle = "rgba(255,120,40,1)";
    else if (state.levelTheme === "ice") ctx.fillStyle = "rgba(255,255,255,1)";
    
    lists.ambientParticles.forEach(p => {
        if (p.x < leftEdge || p.x > rightEdge) return;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
}

function drawBgShips(ctx, canvas) {
    if (!lists.bgShips) return;
    
    // Frustum culling loosely based on cam
    const leftEdge = state.camX - 300;
    const rightEdge = state.camX + canvas.width + 300;
    
    lists.bgShips.forEach(s => {
        if (s.x < leftEdge || s.x > rightEdge) return;
        
        // Draw lasers
        if (s.isLaser) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
            ctx.stroke();
            return;
        }

        // Draw ships (silhouettes in background)
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.5;
        
        ctx.save();
        ctx.translate(s.x, s.y);
        if (s.dir === -1) ctx.scale(-1, 1);
        
        // Simple ship shape
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-6, -2, 2, 4);
        drawGlow(ctx, -5, 0, 6, "rgba(0, 255, 255, 0.8)");
        
        ctx.restore();
        ctx.globalAlpha = 1.0;
    });
}

function drawParticles(ctx, canvas) {
    const leftEdge = state.camX - 50;
    const rightEdge = state.camX + canvas.width + 50;
    
    lists.particles.forEach(p => {
        if (!p.active) return;
        if (p.x < leftEdge || p.x > rightEdge) return;
        const a = Math.max(0, p.life / p.max);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;

        if (p.type === "dust") {
            // Discrete subtle smoke puff
            ctx.globalAlpha = a * 0.38;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        if (p.type === "fire") {
            ctx.globalAlpha = a;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        if (p.type === "floatText") {
            ctx.globalAlpha = a;
            ctx.font = 'bold 9px "Press Start 2P", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Crisp drop shadow
            ctx.fillStyle = "#000000";
            ctx.fillText(p.text, p.x + 1, p.y + 1);
            // Main text
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
            return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.spin) ctx.rotate(p.spin);

        if (p.type === "sparkle") {
            // Draw little cross/star
            ctx.fillRect(-p.size/2, -p.size/8, p.size, p.size/4);
            ctx.fillRect(-p.size/8, -p.size/2, p.size/4, p.size);
            // Core
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(0, 0, p.size/3, 0, Math.PI*2); ctx.fill();
        } else if (p.type === "blood") {
            // Tear drop / splatter
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI);
            ctx.lineTo(0, -p.size * 2);
            ctx.closePath();
            ctx.fill();
        } else if (p.type === "explosion") {
            // Polygon/shard
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size*0.8, p.size*0.4);
            ctx.lineTo(-p.size*0.8, p.size*0.4);
            ctx.closePath();
            ctx.fill();
        } else {
            // Fallback square
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;
}

// =========================================================
// MODERN HD PIXEL ART HUD SYSTEM
// =========================================================

function drawPixelHeart(ctx, x, y, scale = 1.3, pulse = false) {
    ctx.save();
    ctx.translate(x, y);
    if (pulse) {
        let p = 1.0 + Math.sin(Date.now() / 110) * 0.18;
        ctx.scale(p, p);
    }
    const s = scale;
    const ox = -5 * s;
    const oy = -4.5 * s;

    // 1. Dark outer silhouette (#1c0007)
    ctx.fillStyle = "#1c0007";
    ctx.fillRect(ox + 1*s, oy + 0*s, 3*s, 1*s);
    ctx.fillRect(ox + 6*s, oy + 0*s, 3*s, 1*s);
    ctx.fillRect(ox + 0*s, oy + 1*s, 1*s, 3*s);
    ctx.fillRect(ox + 4*s, oy + 1*s, 2*s, 1*s);
    ctx.fillRect(ox + 9*s, oy + 1*s, 1*s, 3*s);
    ctx.fillRect(ox + 0*s, oy + 4*s, 1*s, 1*s);
    ctx.fillRect(ox + 9*s, oy + 4*s, 1*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 5*s, 1*s, 1*s);
    ctx.fillRect(ox + 8*s, oy + 5*s, 1*s, 1*s);
    ctx.fillRect(ox + 2*s, oy + 6*s, 1*s, 1*s);
    ctx.fillRect(ox + 7*s, oy + 6*s, 1*s, 1*s);
    ctx.fillRect(ox + 3*s, oy + 7*s, 1*s, 1*s);
    ctx.fillRect(ox + 6*s, oy + 7*s, 1*s, 1*s);
    ctx.fillRect(ox + 4*s, oy + 8*s, 2*s, 1*s);

    // 2. Base vibrant ruby red (#e6123e)
    ctx.fillStyle = "#e6123e";
    ctx.fillRect(ox + 1*s, oy + 1*s, 3*s, 4*s);
    ctx.fillRect(ox + 6*s, oy + 1*s, 3*s, 4*s);
    ctx.fillRect(ox + 4*s, oy + 2*s, 2*s, 5*s);
    ctx.fillRect(ox + 2*s, oy + 5*s, 6*s, 1*s);
    ctx.fillRect(ox + 3*s, oy + 6*s, 4*s, 1*s);

    // 3. Deep shadow (#8a0422)
    ctx.fillStyle = "#8a0422";
    ctx.fillRect(ox + 8*s, oy + 2*s, 1*s, 3*s);
    ctx.fillRect(ox + 7*s, oy + 5*s, 1*s, 1*s);
    ctx.fillRect(ox + 5*s, oy + 6*s, 2*s, 1*s);
    ctx.fillRect(ox + 4*s, oy + 7*s, 2*s, 1*s);

    // 4. Specular highlight (#ffffff & #ff94a8)
    ctx.fillStyle = "#ff94a8";
    ctx.fillRect(ox + 1*s, oy + 1*s, 3*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 2*s, 1*s, 2*s);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ox + 2*s, oy + 1*s, 1*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 2*s, 1*s, 1*s);

    ctx.restore();
}

function drawPixelSkull(ctx, x, y, scale = 1.1) {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;
    const ox = -4.5 * s;
    const oy = -4.5 * s;

    // Outline
    ctx.fillStyle = "#10141d";
    ctx.fillRect(ox + 2*s, oy + 0*s, 5*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 1*s, 7*s, 1*s);
    ctx.fillRect(ox + 0*s, oy + 2*s, 9*s, 4*s);
    ctx.fillRect(ox + 1*s, oy + 6*s, 7*s, 1*s);
    ctx.fillRect(ox + 2*s, oy + 7*s, 5*s, 2*s);

    // Bone shaded
    ctx.fillStyle = "#e2e6ed";
    ctx.fillRect(ox + 2*s, oy + 1*s, 5*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 2*s, 7*s, 4*s);
    ctx.fillRect(ox + 2*s, oy + 6*s, 5*s, 1*s);
    ctx.fillRect(ox + 3*s, oy + 7*s, 3*s, 1*s);

    // Bone highlight
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ox + 2*s, oy + 1*s, 2*s, 1*s);
    ctx.fillRect(ox + 1*s, oy + 2*s, 1*s, 2*s);

    // Hollow eye sockets & nose
    ctx.fillStyle = "#141924";
    ctx.fillRect(ox + 2*s, oy + 3*s, 2*s, 2*s);
    ctx.fillRect(ox + 5*s, oy + 3*s, 2*s, 2*s);
    ctx.fillRect(ox + 4*s, oy + 5*s, 1*s, 1*s);

    // Teeth gap
    ctx.fillRect(ox + 3*s, oy + 8*s, 1*s, 1*s);
    ctx.fillRect(ox + 5*s, oy + 8*s, 1*s, 1*s);

    ctx.restore();
}

function drawHUDCoin(ctx, x, y, scale = 1.1) {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;
    const t = Date.now() / 220;
    const spin = Math.max(0.18, Math.abs(Math.cos(t)));
    ctx.scale(spin, 1);

    // Outer dark rim
    ctx.fillStyle = "#663b00";
    ctx.beginPath();
    ctx.arc(0, 0, 6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Burnished gold
    ctx.fillStyle = "#f5be18";
    ctx.beginPath();
    ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Lustrous face
    ctx.fillStyle = "#ffe666";
    ctx.beginPath();
    ctx.arc(0, 0, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();

    // Embossed star
    ctx.fillStyle = "#945c00";
    ctx.fillRect(-1 * s, -2.5 * s, 2 * s, 5 * s);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-0.5 * s, -1.5 * s, 1 * s, 3 * s);

    ctx.restore();
}

// =========================================================
// ENGAGING MECHANICS RENDERING
// =========================================================

function drawSwitchBlock(ctx, sb) {
    const isActive = sb.color === state.switchState;
    const isRed = sb.color === "red";
    const mainColor = isRed ? "#ff2a55" : "#00a2ff";
    const darkEdge = isRed ? "#8a0020" : "#005599";

    ctx.save();
    if (isActive) {
        drawPlatformShadow(ctx, sb.x, sb.y, sb.w, sb.h);

        // Active solid glowing block
        ctx.fillStyle = mainColor;
        roundRect(ctx, sb.x, sb.y, sb.w, sb.h, 4, true);

        // 3D bottom bevel
        ctx.fillStyle = darkEdge;
        roundRect(ctx, sb.x, sb.y + sb.h - 5, sb.w, 5, 4, true);

        // Top glossy highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(sb.x + 3, sb.y + 2, sb.w - 6, 3);

        // Outer neon border
        ctx.strokeStyle = isRed ? "#ff88a3" : "#80d0ff";
        ctx.lineWidth = 1.5;
        roundRect(ctx, sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, 4, false);

        // Center jewel icon
        ctx.fillStyle = "#ffffff";
        const cx = sb.x + sb.w / 2;
        const cy = sb.y + sb.h / 2 - 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 4, cy);
        ctx.closePath();
        ctx.fill();
    } else {
        // Inactive ghost outline block
        ctx.fillStyle = isRed ? "rgba(255, 42, 85, 0.12)" : "rgba(0, 162, 255, 0.12)";
        roundRect(ctx, sb.x, sb.y, sb.w, sb.h, 4, true);

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = isRed ? "rgba(255, 42, 85, 0.5)" : "rgba(0, 162, 255, 0.5)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, 4, false);
        ctx.setLineDash([]);

        ctx.fillStyle = isRed ? "rgba(255, 42, 85, 0.3)" : "rgba(0, 162, 255, 0.3)";
        const cx = sb.x + sb.w / 2;
        const cy = sb.y + sb.h / 2;
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }
    ctx.restore();
}

function drawCannon(ctx, c) {
    ctx.save();
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;

    // Cannon Base (Mount)
    ctx.fillStyle = "#22252c";
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 14, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#434857";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pivot bolt
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Barrel
    ctx.translate(cx, cy);
    ctx.rotate(c.angle);

    const recoil = c.anim > 0 ? -6 * (c.anim / 16) : 0;

    // Barrel body
    ctx.fillStyle = "#353b48";
    roundRect(ctx, -8 + recoil, -10, 24, 20, 4, true);

    // Barrel highlights & metallic bands
    ctx.fillStyle = "#f5be18";
    ctx.fillRect(2 + recoil, -10, 4, 20);
    ctx.fillStyle = "#1e222b";
    ctx.fillRect(14 + recoil, -11, 4, 22);

    // Muzzle hole
    ctx.fillStyle = "#0c0e12";
    ctx.beginPath();
    ctx.ellipse(17 + recoil, 0, 3, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawTrollCoin(ctx, tc) {
    if (tc.taken) return;
    ctx.save();

    if (tc.fleeing) {
        ctx.strokeStyle = "#4a2c00";
        ctx.lineWidth = 2;
        const step = Math.sin(tc.legsAnim);

        // Leg 1
        ctx.beginPath();
        ctx.moveTo(tc.x - 3, tc.y + 6);
        ctx.lineTo(tc.x - 5 + step * 5, tc.y + 14);
        ctx.stroke();

        ctx.fillStyle = "#ff3333";
        ctx.fillRect(tc.x - 7 + step * 5, tc.y + 13, 5, 3);

        // Leg 2
        ctx.beginPath();
        ctx.moveTo(tc.x + 3, tc.y + 6);
        ctx.lineTo(tc.x + 5 - step * 5, tc.y + 14);
        ctx.stroke();

        ctx.fillStyle = "#ff3333";
        ctx.fillRect(tc.x + 3 - step * 5, tc.y + 13, 5, 3);

        // Panic sweat drop
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(tc.x + 9, tc.y - 7, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHUDCoin(ctx, tc.x, tc.y, 1.25);
    ctx.restore();
}

function drawGem(ctx, g) {
    if (g.taken) return;
    ctx.save();
    const y = g.y + g.floatY;

    const glow = g.type === "ruby" ? "rgba(255, 40, 80, 0.45)" : g.type === "sapphire" ? "rgba(0, 180, 255, 0.45)" : "rgba(0, 255, 120, 0.45)";
    drawGlow(ctx, g.x, y, 16, glow);

    let topColor = "#ff738e", midColor = "#ff1f4b", darkColor = "#8a0020";
    if (g.type === "sapphire") {
        topColor = "#8fe0ff"; midColor = "#00a2ff"; darkColor = "#004780";
    } else if (g.type === "emerald") {
        topColor = "#80ffb0"; midColor = "#00e660"; darkColor = "#00662a";
    }

    const r = 9;
    ctx.fillStyle = midColor;
    ctx.beginPath();
    ctx.moveTo(g.x - r, y);
    ctx.lineTo(g.x, y - r);
    ctx.lineTo(g.x + r, y);
    ctx.lineTo(g.x, y + r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(g.x, y - r);
    ctx.lineTo(g.x + r, y);
    ctx.lineTo(g.x, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(g.x - r, y);
    ctx.lineTo(g.x, y + r);
    ctx.lineTo(g.x, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(g.x - 2, y - 4, 3, 3);

    ctx.restore();
}

function drawChaseWall(ctx, cw) {
    if (!cw || !cw.active) return;
    ctx.save();

    const isFactory = cw.type === "factory";
    const wallX = cw.x;

    ctx.fillStyle = isFactory ? "#181a20" : "#d8f2ff";
    ctx.fillRect(wallX - 300, 0, 300, 400);

    const stripeW = 16;
    for (let y = 0; y < 400; y += stripeW * 2) {
        ctx.fillStyle = isFactory ? "#ffcc00" : "#70c8ff";
        ctx.beginPath();
        ctx.moveTo(wallX - 18, y);
        ctx.lineTo(wallX, y + stripeW);
        ctx.lineTo(wallX, y + stripeW * 2);
        ctx.lineTo(wallX - 18, y + stripeW);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = isFactory ? "#b8b8b8" : "#ffffff";
    for (let y = 10; y < 390; y += 22) {
        ctx.beginPath();
        ctx.moveTo(wallX, y);
        ctx.lineTo(wallX + 18, y + 11);
        ctx.lineTo(wallX, y + 22);
        ctx.closePath();
        ctx.fill();
    }

    const alarmGlow = Math.sin(Date.now() / 100) > 0 ? "rgba(255, 0, 0, 0.8)" : "rgba(255, 0, 0, 0.2)";
    drawGlow(ctx, wallX - 8, 40, 35, alarmGlow);
    ctx.fillStyle = "#ff0033";
    ctx.fillRect(wallX - 14, 34, 12, 12);

    ctx.restore();
}

function drawDarkZone(ctx) {
    ctx.save();
    const px = player.x + player.w / 2 - state.camX;
    const py = player.y + player.h / 2;

    const lanternRadius = 145;
    const grad = ctx.createRadialGradient(px, py, 25, px, py, lanternRadius);
    grad.addColorStop(0, "rgba(255, 230, 160, 0.0)");
    grad.addColorStop(0.55, "rgba(5, 10, 22, 0.65)");
    grad.addColorStop(1, "rgba(4, 7, 16, 0.97)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 400);

    ctx.strokeStyle = "rgba(255, 210, 110, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawRunawayCastle(ctx, rc) {
    ctx.save();
    const x = rc.x + rc.runX;
    const y = rc.y;

    ctx.fillStyle = "#555566";
    ctx.fillRect(x, y + 20, 80, 50);

    for (let bx = 0; bx < 80; bx += 20) {
        ctx.fillRect(x + bx, y + 10, 12, 10);
    }

    ctx.fillStyle = "#1e1e24";
    ctx.beginPath();
    ctx.arc(x + 40, y + 50, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 26, y + 50, 28, 20);

    ctx.fillStyle = "#8b4513";
    ctx.fillRect(x + 38, y - 20, 4, 30);
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.moveTo(x + 42, y - 20);
    ctx.lineTo(x + 65 + (rc.triggered ? -Math.sin(rc.legsAnim) * 5 : 0), y - 12);
    ctx.lineTo(x + 42, y - 4);
    ctx.closePath();
    ctx.fill();

    if (rc.triggered && rc.runX < 480) {
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 3;
        const step = Math.sin(rc.legsAnim);

        ctx.beginPath();
        ctx.moveTo(x + 20, y + 70);
        ctx.lineTo(x + 18 + step * 10, y + 84);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 60, y + 70);
        ctx.lineTo(x + 58 - step * 10, y + 84);
        ctx.stroke();

        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x + 82, y + 16, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawFakeCheckpoint(ctx, fcp) {
    ctx.save();
    ctx.globalAlpha = fcp.alpha;

    if (!fcp.triggered) {
        ctx.fillStyle = "#888899";
        ctx.fillRect(fcp.x, fcp.y, 4, 50);
        ctx.fillStyle = "#00ffcc";
        ctx.beginPath();
        ctx.moveTo(fcp.x + 4, fcp.y);
        ctx.lineTo(fcp.x + 26, fcp.y + 10);
        ctx.lineTo(fcp.x + 4, fcp.y + 20);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillStyle = "#ff2244";
        ctx.beginPath();
        ctx.arc(fcp.x + 10, fcp.y + 10, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cc1133";
        ctx.fillRect(fcp.x + 8, fcp.y + 24, 4, 3);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fcp.x + 10, fcp.y + 27);
        ctx.quadraticCurveTo(fcp.x + 6, fcp.y + 36, fcp.x + 12, fcp.y + 44);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fcp.x + 6, fcp.y + 7, 2, 0, Math.PI * 2);
        ctx.arc(fcp.x + 14, fcp.y + 7, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fcp.x + 10, fcp.y + 11, 4, 0, Math.PI);
        ctx.stroke();
    }

    ctx.restore();
}

function drawHUD(ctx, canvas) {
    ctx.save();

    const panelX = 14;
    const panelY = 12;
    const panelW = 345;
    const panelH = 68;

    // Theme border color accent
    let accentBorder = "#ffd700";
    let themeBadgeBg = "#153319";
    let themeBadgeText = "#55f77a";
    let themeName = `LVL ${state.currentLevel} PRADERA`;

    if (state.levelTheme === "grass") {
        accentBorder = "#43d964";
        themeBadgeBg = "#143018";
        themeBadgeText = "#4eff75";
        themeName = `LVL ${state.currentLevel} PRADERA`;
    } else if (state.levelTheme === "cave") {
        accentBorder = "#00f0ff";
        themeBadgeBg = "#0e243a";
        themeBadgeText = "#38f3ff";
        themeName = `LVL ${state.currentLevel} CUEVA`;
    } else if (state.levelTheme === "factory") {
        accentBorder = "#ff5533";
        themeBadgeBg = "#381710";
        themeBadgeText = "#ff7755";
        themeName = `LVL ${state.currentLevel} FÁBRICA`;
    } else if (state.levelTheme === "ice") {
        accentBorder = "#70e4ff";
        themeBadgeBg = "#112b3d";
        themeBadgeText = "#8eedff";
        themeName = `LVL ${state.currentLevel} HIELO`;
    }

    // 1. Dark Glass Panel with Chamfered Retro Corners
    ctx.fillStyle = "rgba(10, 14, 22, 0.90)";
    ctx.beginPath();
    ctx.moveTo(panelX + 8, panelY);
    ctx.lineTo(panelX + panelW - 8, panelY);
    ctx.lineTo(panelX + panelW, panelY + 8);
    ctx.lineTo(panelX + panelW, panelY + panelH - 8);
    ctx.lineTo(panelX + panelW - 8, panelY + panelH);
    ctx.lineTo(panelX + 8, panelY + panelH);
    ctx.lineTo(panelX, panelY + panelH - 8);
    ctx.lineTo(panelX, panelY + 8);
    ctx.closePath();
    ctx.fill();

    // 2. Beveled Metallic Trim
    ctx.strokeStyle = accentBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top glossy highlight stripe
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(panelX + 4, panelY + 3, panelW - 8, 14);

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    // --- ROW 1: VIDAS, SCORE & SPEEDRUN TIMER ---
    const row1Y = panelY + 20;

    // 1a. VIDAS
    let lowHealth = state.lives <= 2;
    drawPixelHeart(ctx, panelX + 18, row1Y, 1.4, lowHealth);

    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = "#ffffff";
    ctx.fillText("x", panelX + 30, row1Y + 1);

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = lowHealth ? "#ff3355" : "#ffffff";
    ctx.fillText(`${state.lives}`, panelX + 42, row1Y + 1);

    // Mini heart pips (visual indicators up to 5 hearts)
    let pipsToShow = Math.min(state.lives, 5);
    for (let i = 0; i < pipsToShow; i++) {
        drawPixelHeart(ctx, panelX + 70 + i * 10, row1Y, 0.7, false);
    }

    // 1b. SCORE (Middle of Row 1)
    const scoreX = panelX + 138;
    drawHUDCoin(ctx, scoreX, row1Y, 1.15);

    ctx.save();
    ctx.translate(scoreX + 12, row1Y);
    if (state.scoreScale !== 1.0) {
        ctx.scale(state.scoreScale, state.scoreScale);
    }
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = "#5c3d00";
    ctx.fillText(`${state.score}`, 1, 2);
    ctx.fillStyle = state.scoreTimer > 5 ? "#ffffff" : "#ffd700";
    ctx.fillText(`${state.score}`, 0, 1);
    ctx.restore();

    // 1c. SPEEDRUN TIMER (Right side of Row 1)
    const timerX = panelX + 235;
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = "#88e0ff";
    let totalSec = Math.floor(state.levelTimer / 60);
    let mins = Math.floor(totalSec / 60);
    let secs = totalSec % 60;
    let tenths = Math.floor((state.levelTimer % 60) / 6);
    let timeStr = `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}.${tenths}`;
    
    // Mini clock icon
    ctx.strokeStyle = "#88e0ff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(timerX, row1Y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(timerX, row1Y);
    ctx.lineTo(timerX + 3, row1Y);
    ctx.moveTo(timerX, row1Y);
    ctx.lineTo(timerX, row1Y - 3);
    ctx.stroke();

    ctx.fillText(timeStr, timerX + 10, row1Y + 1);

    // Divider line between rows
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(panelX + 8, panelY + 36, panelW - 16, 1);

    // --- ROW 2: COINS PROGRESS, LEVEL BADGE, 3 STAR GEMS, DEATHS ---
    const row2Y = panelY + 52;

    // 2a. COIN PROGRESS (Coins to next life: 0/10)
    drawHUDCoin(ctx, panelX + 18, row2Y, 0.85);

    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = "#d0d8e2";
    ctx.fillText(`${state.coinsCount}/10`, panelX + 30, row2Y + 1);

    // Mini progress bar for coins
    let barX = panelX + 76;
    let barW = 34;
    let barH = 6;
    ctx.fillStyle = "#141c26";
    ctx.fillRect(barX, row2Y - 3, barW, barH);
    let fillRatio = Math.min(1.0, state.coinsCount / 10);
    ctx.fillStyle = fillRatio === 1.0 ? "#55ff77" : "#ffd700";
    ctx.fillRect(barX, row2Y - 3, barW * fillRatio, barH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 0.5, row2Y - 2.5, barW - 1, barH - 1);

    // 2b. LEVEL BADGE
    let badgeX = panelX + 118;
    let badgeW = 96;
    let badgeH = 17;
    ctx.fillStyle = themeBadgeBg;
    ctx.fillRect(badgeX, row2Y - 8, badgeW, badgeH);

    ctx.fillStyle = accentBorder;
    ctx.fillRect(badgeX, row2Y - 8, badgeW, 1);
    ctx.fillRect(badgeX, row2Y + badgeH - 9, badgeW, 1);
    ctx.fillRect(badgeX, row2Y - 8, 1, badgeH);
    ctx.fillRect(badgeX + badgeW - 1, row2Y - 8, 1, badgeH);

    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.fillStyle = themeBadgeText;
    ctx.textAlign = "center";
    ctx.fillText(themeName, badgeX + badgeW / 2, row2Y + 1);
    ctx.textAlign = "left";

    // 2c. 3 SECRET STAR GEMS ([♦] [♦] [♦])
    const gemStartX = panelX + 224;
    const gemColors = ["#ff2a55", "#00c3ff", "#00ff77"];
    for (let i = 0; i < 3; i++) {
        const gx = gemStartX + i * 13;
        const gy = row2Y;
        const hasGem = state.currentGems[i];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(gx, gy - 5);
        ctx.lineTo(gx + 4.5, gy);
        ctx.lineTo(gx, gy + 5);
        ctx.lineTo(gx - 4.5, gy);
        ctx.closePath();

        if (hasGem) {
            ctx.fillStyle = gemColors[i];
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.stroke();
            // Tiny gleam
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(gx - 1, gy - 2, 2, 2);
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    // 2d. DEATHS (Skull + count)
    let skullX = panelX + 276;
    drawPixelSkull(ctx, skullX, row2Y, 1.1);

    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = "#f0a5a5";
    ctx.fillText(`${state.deaths}`, skullX + 10, row2Y + 1);

    // 2e. SWITCH INDICATOR PILL (if level contains switch blocks)
    if (lists.switchBlocks && lists.switchBlocks.length > 0) {
        const swX = panelX + panelW - 24;
        const isRed = state.switchState === "red";
        ctx.fillStyle = isRed ? "#ff2a55" : "#00a2ff";
        ctx.beginPath();
        ctx.arc(swX, row2Y, 5 + (state.switchAnim > 0 ? 1.5 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.restore();
}
