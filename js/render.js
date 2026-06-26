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
    drawAmbientParticles(ctx, canvas);

    ctx.save();
    ctx.translate(-state.camX, 0);

    drawLevelDecorations(ctx, canvas);
    lists.gravityZones.forEach(g => drawGravityZone(ctx, g));
    lists.windZones.forEach(w => drawWindZone(ctx, w));
    lists.iceZones.forEach(z => drawIceZone(ctx, z));

    // Frustum culling bounds
    const leftEdge = state.camX - 200;
    const rightEdge = state.camX + canvas.width + 200;

    lists.signs.forEach(s => drawSign(ctx, s));
    lists.blocks.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawBlock(ctx, b); });
    lists.lavaPits.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawLavaPit(ctx, p); });
    lists.fakeFloors.forEach(f => { if (f.x + f.w > leftEdge && f.x < rightEdge) drawFakeFloor(ctx, f); });
    lists.movingPlatforms.forEach(m => { if (m.x + m.w > leftEdge && m.x < rightEdge) drawMovingPlatform(ctx, m); });
    lists.vanishingPlatforms.forEach(v => { if (v.x + v.w > leftEdge && v.x < rightEdge) drawVanishingPlatform(ctx, v); });
    lists.brittlePlatforms.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawBrittlePlatform(ctx, b); });
    lists.fallingBlocks.forEach(b => { if (b.x + b.w > leftEdge && b.x < rightEdge) drawFallingBlock(ctx, b, canvas); });
    lists.invisibleWalls.forEach(w => { if (w.x + w.w > leftEdge && w.x < rightEdge) drawInvisibleWall(ctx, w); });
    lists.crushers.forEach(c => { if (c.x + c.w > leftEdge && c.x < rightEdge) drawCrusher(ctx, c); });
    lists.lasers.forEach(l => { if (l.x + l.w > leftEdge && l.x < rightEdge) drawLaser(ctx, l); });
    lists.sawBlades.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawSawBlade(ctx, s); });
    lists.spikePlatforms.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawSpikePlatform(ctx, p); });
    lists.hiddenBlocks.forEach(h => { if (h.x + h.w > leftEdge && h.x < rightEdge) drawHiddenBlock(ctx, h); });
    lists.fallingSpikes.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawFallingSpike(ctx, s); });
    lists.springboards.forEach(sb => { if (sb.x + sb.w > leftEdge && sb.x < rightEdge) drawSpringboard(ctx, sb); });
    lists.spikes.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawSpike(ctx, s); });
    lists.coins.forEach(c => { if (c.x + 20 > leftEdge && c.x - 20 < rightEdge) drawCoin(ctx, c); });
    lists.enemyProjectiles.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawEnemyProjectile(ctx, p); });
    lists.enemies.forEach(e => { if (e.x + e.w > leftEdge && e.x < rightEdge) drawEnemy(ctx, e); });

    drawIceBoss(ctx);

    lists.checkpoints.forEach(cp => drawCheckpoint(ctx, cp));

    drawCastle(ctx);
    drawFlag(ctx);
    drawParticles(ctx, canvas);
    drawPlayer(ctx);

    ctx.restore();

    drawHUD(ctx, canvas);

    if (state.messageTimer > 0) {
        // Message is now handled via HTML overlay in showMessage
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

        // Foreground hills (Greener)
        for (let i = -1; i < 8; i++) {
            let x = i * 420 - (state.camX * 0.6 % 420);
            const hillG = ctx.createLinearGradient(x, 240, x, 400);
            hillG.addColorStop(0, "#67bd56");
            hillG.addColorStop(1, "#267318");
            ctx.fillStyle = hillG;
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

        // Distant stalagmites with gradient
        for (let i = -1; i < 12; i++) {
            let x = i * 160 - (state.camX * 0.3 % 160);
            const mGrad = ctx.createLinearGradient(x, 0, x, 250);
            mGrad.addColorStop(0, "rgba(0,0,0,0)");
            mGrad.addColorStop(1, "rgba(0,20,40,0.7)");
            ctx.fillStyle = mGrad;
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

        // Massive pipes
        for (let i = 0; i < 8; i++) {
            let x = (i * 210 - state.camX * 0.7) % 1200;
            if (x < -120) x += 1200;
            
            const pipeG = ctx.createLinearGradient(x, 0, x+42, 0);
            pipeG.addColorStop(0, "rgba(20,20,20,0.8)");
            pipeG.addColorStop(0.5, "rgba(80,80,80,0.8)");
            pipeG.addColorStop(1, "rgba(10,10,10,0.8)");
            
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

        // Distant mountains
        for (let i = -1; i < 7; i++) {
            let x = i * 260 - (state.camX * 0.3 % 260);
            const mG = ctx.createLinearGradient(x, 150, x, 400);
            mG.addColorStop(0, "rgba(255,255,255,0.6)");
            mG.addColorStop(1, "rgba(100,180,255,0.1)");
            ctx.fillStyle = mG;
            ctx.beginPath();
            ctx.moveTo(x, 400);
            ctx.lineTo(x + 120, 150);
            ctx.lineTo(x + 245, 400);
            ctx.closePath();
            ctx.fill();
        }

        // Foreground ice shards
        for (let i = 0; i < 8; i++) {
            let x = (i * 180 - state.camX * 0.2) % 1200;
            if (x < -80) x += 1200;
            const sG = ctx.createLinearGradient(x, 80, x+78, 400);
            sG.addColorStop(0, "rgba(255,255,255,0.8)");
            sG.addColorStop(1, "rgba(50,150,200,0.3)");
            ctx.fillStyle = sG;
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
        let index = lists.blocks.indexOf(b);
        if (index > -1) {
            let type = getTileType(index, lists.blocks);
            if (type === "inicio") ctx.fillStyle = "#aef";
            if (type === "fin") ctx.fillStyle = "#cdf";
        }
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
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(25, 40, 60, ${alpha})`);
    g.addColorStop(0.5, `rgba(25, 40, 60, ${alpha * 0.5})`);
    g.addColorStop(1, "rgba(25, 40, 60, 0)");
    
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, Math.max(3, radius * 0.3), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawPlatformShadow(ctx, x, y, width, height) {
    const shadowHeight = 10;
    ctx.save();
    const g = ctx.createLinearGradient(x, y + height, x, y + height + shadowHeight);
    g.addColorStop(0, "rgba(25, 40, 60, 0.25)");
    g.addColorStop(1, "rgba(25, 40, 60, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x + 4, y + height, width - 8, shadowHeight);
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
    // Base Platform
    ctx.fillStyle = p.triggered ? (p.timer % 10 < 5 ? "#ff3333" : "#aa0000") : "#888888";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(p.x, p.y, p.w, 4);

    if (p.popped) {
        ctx.fillStyle = "#aaaaaa";
        for (let i = 2; i < p.w - 8; i += 12) {
            ctx.beginPath();
            ctx.moveTo(p.x + i, p.y);
            ctx.lineTo(p.x + i + 4, p.y - 12);
            ctx.lineTo(p.x + i + 8, p.y);
            ctx.fill();
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
    ctx.fillStyle = "#778899";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.w/2, s.y + s.h);
    ctx.lineTo(s.x + s.w, s.y);
    ctx.fill();
    ctx.fillStyle = "#99aabb";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.w/2, s.y + s.h);
    ctx.lineTo(s.x + s.w/2, s.y);
    ctx.fill();
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
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(w.x, w.y, w.w, w.h);
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
    
    // Spin animation
    let t = Date.now() / 200 + c.x;
    let spinWidth = Math.max(0.1, Math.abs(Math.cos(t)));
    const y = c.y + Math.sin(c.anim) * 4;
    
    // Soft shadow
    drawContactShadow(ctx, c.x, y + 15, 12, 0.2);
    
    // Core glow (same for both)
    drawGlow(ctx, c.x, y, 20, "rgba(255,223,0,0.5)");

    ctx.save();
    ctx.translate(c.x, y);
    ctx.scale(spinWidth, 1);
    
    // Outer edge (thickness)
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner coin face
    ctx.fillStyle = "#ffdf00";
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin rim shine
    ctx.strokeStyle = "#fff1b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 11, 0, Math.PI * 0.25, Math.PI * 1.25);
    ctx.stroke();

    // Central slot/mark
    ctx.fillStyle = "#b8860b";
    if (c.trap) {
        // Subtle detail: The line is broken in the middle
        ctx.fillRect(-2, -5, 4, 3);
        ctx.fillRect(-2, 2, 4, 3);
    } else {
        ctx.fillRect(-2, -6, 4, 12);
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
    ctx.fillRect(-12, -18 + bounce, 24, 12);
    ctx.fillStyle = "#b57d4a";
    ctx.fillRect(-12, -10 + bounce, 24, 4); // Shadow under face
    
    // Eyes
    ctx.fillStyle = "white";
    ctx.fillRect(-8 - squishW*0.2, -16 + bounce, 6, 7);
    ctx.fillRect(2 + squishW*0.2, -16 + bounce, 6, 7);
    ctx.fillStyle = "black";
    ctx.fillRect(-6 - squishW*0.2, -14 + bounce, 3, 4);
    ctx.fillRect(4 + squishW*0.2, -14 + bounce, 3, 4);
    
    // Angry eyebrows
    ctx.fillStyle = "#4a1902";
    ctx.beginPath();
    ctx.moveTo(-10, -18 + bounce); ctx.lineTo(-2, -15 + bounce); ctx.lineTo(-2, -17 + bounce);
    ctx.moveTo(10, -18 + bounce); ctx.lineTo(2, -15 + bounce); ctx.lineTo(2, -17 + bounce);
    ctx.fill();
    
    // Feet
    let walkPhase = Math.sin(e.x * 0.15);
    ctx.fillStyle = "#1a0800";
    ctx.fillRect(-14, 0, 10, 4 + walkPhase * 2);
    ctx.fillRect(4, 0, 10, 4 - walkPhase * 2);
    
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
        g.fillStyle = "#6b6b6b"; // Manga trasera oscura (Sudadera gris sombra)
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#e0e0e0"; // Mano/Guante
        g.fillRect(-5, 11, 10, 8);
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#3b3b3b"; // Pantalon oscuro trasero
        // Estirar la pierna hacia arriba para que no se separe del cuerpo
        g.fillRect(-4, -breathe, 8, 8 + breathe); 
        g.fillStyle = "#2b2b2b"; // Zapato oscuro
        g.fillRect(-5, 8, 10, 6);
        g.restore();

        // --- CUERPO ---
        // Sudadera gris
        g.fillStyle = "#8c8c8c"; 
        g.fillRect(x + 9, py + 22, 16, 12);
        
        // Pantalones grises oscuros
        g.fillStyle = "#555555";
        g.fillRect(x + 10, py + 30, 14, 11);
        
        // Cintas sudadera
        g.fillStyle = "#cccccc";
        g.fillRect(x + 11, py + 24, 2, 6);
        g.fillRect(x + 20, py + 24, 2, 6);

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#555555"; // Pantalon frontal
        g.fillRect(-4, -breathe, 8, 8 + breathe);
        g.fillStyle = "#444444"; // Zapato
        g.fillRect(-4, 8, 11, 6);
        g.restore();

        // --- CABEZA ---
        let headY = py + 8 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.1) * 0.5);
        
        // Piel
        g.fillStyle = "#ffd0a0"; 
        g.fillRect(x + 9, headY, 18, 15);
        
        // Nariz grande
        g.fillStyle = "#ffb370"; 
        g.fillRect(x + 23, headY + 5, 7, 6);

        // Ojo
        g.fillStyle = "black";
        g.fillRect(x + 20, headY + 2, 3, 6);

        // Bigote y cabello
        g.fillStyle = "#2b1807"; 
        g.fillRect(x + 19, headY + 11, 12, 4); // Bigote
        g.fillRect(x + 7, headY + 3, 4, 9);    // Cabello atrás

        // Capucha gris
        g.fillStyle = "#8c8c8c"; 
        g.fillRect(x + 7, headY - 8, 18, 10); // Cúpula
        g.fillRect(x + 5, headY - 2, 5, 12);  // Borde nuca
        
        // Sombra de capucha
        g.fillStyle = "#6b6b6b";
        g.fillRect(x + 7, headY - 2, 18, 2);

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#8c8c8c"; // Manga gris brillante
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#ffffff"; // Mano/Guante
        g.fillRect(-5, 11, 10, 8);
        g.fillStyle = "#cccccc"; // Detalle
        g.fillRect(-5, 17, 10, 2);
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

        // Scarf trailing
        let scarfWind = Math.sin(Date.now() / 150) * 4;
        g.fillStyle = "#00bfff";
        g.beginPath();
        g.moveTo(x + 12, py + 18);
        g.lineTo(x - 8 + (run ? -10 : 0), py + 22 + scarfWind);
        g.lineTo(x - 6 + (run ? -10 : 0), py + 28 + scarfWind * 0.5);
        g.lineTo(x + 12, py + 24);
        g.fill();

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#111111"; // Manga trasera
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#222222"; // Guante
        g.fillRect(-5, 11, 10, 8);
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#111111"; // Pantalon trasero
        g.fillRect(-4, -breathe, 8, 8 + breathe);
        g.fillStyle = "#0a0a0a"; // Zapato trasero
        g.fillRect(-5, 8, 10, 6);
        g.restore();

        // --- CUERPO ---
        g.fillStyle = "#1a1a1a"; 
        g.fillRect(x + 9, py + 22, 16, 18);
        g.fillStyle = "#00bfff"; // Cinturon
        g.fillRect(x + 9, py + 34, 16, 3);

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#222222"; 
        g.fillRect(-4, -breathe, 8, 8 + breathe);
        g.fillStyle = "#111111"; 
        g.fillRect(-4, 8, 11, 6);
        g.restore();

        // --- CABEZA ---
        let headY = py + 8 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.1) * 0.5);
        g.fillStyle = "#111111"; // Capucha ninja
        g.fillRect(x + 7, headY - 4, 20, 19);
        
        // Piel visible (ojos)
        g.fillStyle = "#ffd0a0"; 
        g.fillRect(x + 13, headY + 3, 14, 6);
        
        // Ojos ninja
        g.fillStyle = "white";
        g.fillRect(x + 17, headY + 4, 3, 3);
        g.fillRect(x + 23, headY + 4, 3, 3);
        g.fillStyle = "#00bfff"; // Pupila
        g.fillRect(x + 18, headY + 4, 2, 2);
        g.fillRect(x + 24, headY + 4, 2, 2);

        // Diadema
        g.fillStyle = "#00bfff";
        g.fillRect(x + 7, headY, 20, 3);

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#222222"; 
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#333333"; // Guante frontal
        g.fillRect(-5, 11, 10, 8);
        g.fillStyle = "#00bfff"; // Pulsera
        g.fillRect(-4, 10, 8, 2);
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

        // Jetpack Fire
        if (playerObj && playerObj.jetpackActive) {
            g.fillStyle = "#00ffcc";
            g.beginPath();
            g.moveTo(x, py + 30);
            g.lineTo(x + 8, py + 30);
            g.lineTo(x + 4, py + 50 + Math.random() * 15);
            g.fill();
        }

        // Jetpack Backpack
        g.fillStyle = "#555555";
        g.fillRect(x - 2, py + 18, 12, 16);
        g.fillStyle = "#00ffcc";
        g.fillRect(x - 1, py + 22, 4, 8);

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#444444"; 
        g.fillRect(-3, 0, 6, 11);
        g.fillStyle = "#666666"; 
        g.beginPath(); g.arc(0, 12, 5, 0, Math.PI*2); g.fill(); // Pinza
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, baseY + 38);
        g.rotate(-legRot);
        g.fillStyle = "#444444"; 
        g.fillRect(-3, -breathe, 6, 10 + breathe);
        g.fillStyle = "#333333"; 
        g.fillRect(-5, 8, 10, 4);
        g.restore();

        // --- CUERPO ---
        g.fillStyle = "#999999"; 
        g.fillRect(x + 9, py + 20, 16, 18);
        // Detalles pecho
        g.fillStyle = "#ff3a1f";
        g.fillRect(x + 12, py + 24, 4, 3);
        g.fillStyle = "#00ffcc";
        g.fillRect(x + 18, py + 24, 4, 3);
        g.fillStyle = "#555555";
        g.fillRect(x + 12, py + 30, 10, 6); // Rejilla

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, baseY + 38);
        g.rotate(legRot);
        g.fillStyle = "#777777"; 
        g.fillRect(-3, -breathe, 6, 10 + breathe);
        g.fillStyle = "#555555"; 
        g.fillRect(-4, 8, 11, 4);
        g.restore();

        // --- CABEZA ---
        let headY = py + 4 + (run ? Math.sin(frame * 0.6) * 0.8 : Math.sin(idleTimer * 0.2) * 0.5);
        
        g.fillStyle = "#888888"; // Bloque cabeza
        g.fillRect(x + 7, headY, 20, 16);
        
        // Visor
        g.fillStyle = "#222222"; 
        g.fillRect(x + 10, headY + 4, 16, 6);
        g.fillStyle = "#00ffcc"; // Ojos luz
        g.fillRect(x + 12, headY + 5, 12, 4);

        // Antena
        g.fillStyle = "#666666";
        g.fillRect(x + 15, headY - 6, 2, 6);
        g.fillStyle = "#ff3a1f";
        let antGlow = Math.abs(Math.sin(Date.now()/200));
        g.globalAlpha = 0.5 + antGlow * 0.5;
        g.beginPath(); g.arc(x + 16, headY - 7, 3, 0, Math.PI*2); g.fill();
        g.globalAlpha = 1.0;

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#aaaaaa"; 
        g.fillRect(-3, 0, 6, 11);
        g.fillStyle = "#cccccc"; 
        g.beginPath(); g.arc(0, 12, 5, 0, Math.PI*2); g.fill(); // Pinza
        g.fillStyle = "#555555";
        g.beginPath(); g.arc(0, 12, 3, 0, Math.PI*2); g.fill(); // Agujero pinza
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
    
    // Drop Shadow
    ctx.shadowColor = "rgba(25, 40, 60, 0.3)";
    ctx.shadowOffsetY = isSign ? 6 : 10;
    ctx.shadowBlur = isSign ? 6 : 12;
    
    // Base Box
    ctx.fillStyle = bg;
    roundRect(ctx, bx, by, boxWidth, boxHeight, r, true, false);
    
    ctx.shadowColor = "transparent"; // disable shadow for inner elements
    
    // Highlight / Glossy top half
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + boxWidth - r, by);
    ctx.quadraticCurveTo(bx + boxWidth, by, bx + boxWidth, by + r);
    ctx.lineTo(bx + boxWidth, by + boxHeight - r);
    ctx.quadraticCurveTo(bx + boxWidth, by + boxHeight, bx + boxWidth - r, by + boxHeight);
    ctx.lineTo(bx + r, by + boxHeight);
    ctx.quadraticCurveTo(bx, by + boxHeight, bx, by + boxHeight - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.clip();
    
    ctx.fillStyle = theme === "cave" ? "rgba(0, 255, 255, 0.15)" : "rgba(255,255,255,0.35)";
    ctx.fillRect(bx, by, boxWidth, boxHeight * 0.45);
    ctx.restore();

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

function drawParticles(ctx, canvas) {
    const leftEdge = state.camX - 50;
    const rightEdge = state.camX + canvas.width + 50;
    
    lists.particles.forEach(p => {
        if (p.x < leftEdge || p.x > rightEdge) return;
        const a = Math.max(0, p.life / p.max);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.spin) ctx.rotate(p.spin);

        if (p.type === "dust" || p.type === "fire") {
            // Draw circle (soft)
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === "sparkle") {
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

function drawHUD(ctx, canvas) {
    ctx.save();
    
    // Choose colors based on theme
    let bg, border, textColor;
    if (state.levelTheme === "grass") {
        bg = "rgba(255, 246, 217, 0.85)"; border = "#7A5C4A"; textColor = "#4A3022";
    } else if (state.levelTheme === "cave") {
        bg = "rgba(26, 26, 58, 0.85)"; border = "#00FFFF"; textColor = "#E0FFFF";
    } else if (state.levelTheme === "factory") {
        bg = "rgba(255, 213, 79, 0.85)"; border = "#37474F"; textColor = "#B71C1C";
    } else if (state.levelTheme === "ice") {
        bg = "rgba(224, 247, 250, 0.85)"; border = "#00B8D4"; textColor = "#01579B";
    } else {
        bg = "rgba(255, 246, 217, 0.85)"; border = "#7A5C4A"; textColor = "#4A3022";
    }

    const panelX = 15;
    const panelY = 15;
    const panelW = 185;
    const panelH = 114;
    const r = 16;
    
    // Drop Shadow
    ctx.shadowColor = "rgba(25, 40, 60, 0.25)";
    ctx.shadowOffsetY = 6;
    ctx.shadowBlur = 8;
    
    // Base Box
    ctx.fillStyle = bg;
    roundRect(ctx, panelX, panelY, panelW, panelH, r, true, false);
    
    ctx.shadowColor = "transparent";
    
    // Highlight / Glossy top half
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(panelX + r, panelY);
    ctx.lineTo(panelX + panelW - r, panelY);
    ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + r);
    ctx.lineTo(panelX + panelW, panelY + panelH - r);
    ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - r, panelY + panelH);
    ctx.lineTo(panelX + r, panelY + panelH);
    ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - r);
    ctx.lineTo(panelX, panelY + r);
    ctx.quadraticCurveTo(panelX, panelY, panelX + r, panelY);
    ctx.clip();
    
    ctx.fillStyle = state.levelTheme === "cave" ? "rgba(0, 255, 255, 0.1)" : "rgba(255,255,255,0.4)";
    ctx.fillRect(panelX, panelY, panelW, panelH * 0.45);
    ctx.restore();

    // Border
    ctx.strokeStyle = border;
    ctx.lineWidth = 4;
    roundRect(ctx, panelX, panelY, panelW, panelH, r, false, true);

    // Thematic flourishes
    if (state.levelTheme === "grass") {
        ctx.fillStyle = "#4CAF50";
        ctx.beginPath(); ctx.arc(panelX + 10, panelY + 10, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(panelX + panelW - 10, panelY + panelH - 10, 5, 0, Math.PI*2); ctx.fill();
    } else if (state.levelTheme === "factory") {
        ctx.fillStyle = "#90A4AE";
        [ [panelX+10, panelY+10], [panelX+panelW-10, panelY+10], [panelX+10, panelY+panelH-10], [panelX+panelW-10, panelY+panelH-10] ].forEach(pos => {
            ctx.beginPath(); ctx.arc(pos[0], pos[1], 3, 0, Math.PI*2); ctx.fill();
        });
    } else if (state.levelTheme === "ice") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(panelX + r, panelY - 2, panelW - r*2, 4);
    } else if (state.levelTheme === "cave") {
        ctx.fillStyle = "#00FFFF";
        ctx.beginPath(); ctx.moveTo(panelX + 6, panelY + 12); ctx.lineTo(panelX + 12, panelY + 6); ctx.lineTo(panelX + 18, panelY + 12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(panelX + panelW - 18, panelY + panelH - 12); ctx.lineTo(panelX + panelW - 12, panelY + panelH - 6); ctx.lineTo(panelX + panelW - 6, panelY + panelH - 12); ctx.fill();
    }

    // Texts inside
    const startX = panelX + 32;
    let startY = panelY + 22;
    const spacing = 24;

    ctx.font = `bold 14px "Fredoka", "Varela Round", "Arial Rounded MT Bold", sans-serif`;
    ctx.textBaseline = "middle";
    
    // Helper to draw text with icon
    const drawHUDText = (label, value, color, iconDrawFn) => {
        // Icon
        ctx.save();
        ctx.translate(panelX + 18, startY);
        iconDrawFn(ctx);
        ctx.restore();
        
        // Text
        ctx.fillStyle = textColor; 
        ctx.fillText(label, startX, startY);
        
        let labelW = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillText(value, startX + labelW, startY);
        startY += spacing;
    };

    // 1. Nivel
    drawHUDText("NIVEL: ", `${state.currentLevel}/${state.maxLevel}`, textColor, (c) => {
        c.fillStyle = "#a0a0a0"; c.fillRect(-4, -6, 2, 12);
        c.fillStyle = "#00ffee"; c.beginPath(); c.moveTo(-2, -6); c.lineTo(5, -2); c.lineTo(-2, 2); c.fill();
    });

    // 2. Score
    ctx.save();
    let scoreStr = `${state.score}`;
    
    // Icon
    ctx.save();
    ctx.translate(panelX + 18, startY);
    ctx.fillStyle = "#ffaa00"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = (state.scoreTimer > 10) ? "#ffffff" : "#ffee55"; 
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    // Label
    ctx.fillStyle = textColor; 
    ctx.fillText("SCORE: ", startX, startY);
    let scoreLabelW = ctx.measureText("SCORE: ").width;
    
    // Value (Bouncy)
    ctx.translate(startX + scoreLabelW, startY);
    if (state.scoreScale !== 1.0) {
        ctx.scale(state.scoreScale, state.scoreScale);
    }
    ctx.fillStyle = (state.scoreTimer > 5) ? "#ffff00" : "#ffaa00";
    ctx.fillText(scoreStr, 0, 0);
    ctx.restore();
    
    startY += spacing;

    // 3. Vidas (Hearts)
    // Icon (Label)
    ctx.save();
    ctx.translate(panelX + 18, startY);
    ctx.fillStyle = "#ff1f1f"; ctx.beginPath();
    let hx = 0, hy = -1;
    ctx.moveTo(hx, hy + 4); ctx.lineTo(hx - 5, hy - 2);
    ctx.arc(hx - 2.5, hy - 2, 2.5, Math.PI, 0); ctx.arc(hx + 2.5, hy - 2, 2.5, Math.PI, 0);
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = textColor; 
    ctx.fillText("VIDAS: ", startX, startY);
    let vidasLabelW = ctx.measureText("VIDAS: ").width;
    
    for(let i = 0; i < state.lives; i++) {
        // Closer spacing if there are many hearts
        let heartSpacing = state.lives > 6 ? 9 : 12;
        let heartX = startX + vidasLabelW + (i * heartSpacing);
        
        ctx.save();
        ctx.translate(heartX, startY);
        // Little heartbeat scale if low on lives
        if (state.lives <= 2 && Math.sin(Date.now() / 150) > 0.5) {
            ctx.scale(1.2, 1.2);
        }
        ctx.fillStyle = "#ff1f1f"; 
        ctx.beginPath();
        ctx.moveTo(0, 3); ctx.lineTo(-4, -2);
        ctx.arc(-2, -2, 2, Math.PI, 0); ctx.arc(2, -2, 2, Math.PI, 0);
        ctx.fill();
        ctx.restore();
    }
    startY += spacing;

    // 4. Muertes
    drawHUDText("MUERTES: ", `${state.deaths}`, textColor === "#E0FFFF" ? "#AAB" : "#555", (c) => {
        c.fillStyle = textColor === "#E0FFFF" ? "#FFF" : "#444";
        c.beginPath(); c.arc(0, -2, 4.5, 0, Math.PI*2); c.fill();
        c.fillRect(-3, 0, 6, 4);
        c.fillStyle = bg;
        c.fillRect(-2, -3, 1.5, 1.5); c.fillRect(0.5, -3, 1.5, 1.5);
    });

    ctx.restore();
}
