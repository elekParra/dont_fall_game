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
    lists.spikes.forEach(s => { if (s.x + s.w > leftEdge && s.x < rightEdge) drawSpike(ctx, s); });
    lists.coins.forEach(c => { if (c.x + 20 > leftEdge && c.x - 20 < rightEdge) drawCoin(ctx, c); });
    lists.enemyProjectiles.forEach(p => { if (p.x + p.w > leftEdge && p.x < rightEdge) drawEnemyProjectile(ctx, p); });
    lists.enemies.forEach(e => { if (e.x + e.w > leftEdge && e.x < rightEdge) drawEnemy(ctx, e); });

    drawIceBoss(ctx);

    lists.checkpoints.forEach(cp => drawCheckpoint(ctx, cp));
    lists.signs.forEach(s => drawSign(ctx, s));

    drawCastle(ctx);
    drawFlag(ctx);
    drawParticles(ctx, canvas);
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
            let x = i * 310 - (state.camX * 0.08 % 310);
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
            let x = i * 420 - (state.camX * 0.16 % 420);
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
            let x = (i * 520 - state.camX * 0.28 + Math.sin(t + i) * 8) % 1500;
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
            let x = i * 160 - (state.camX * 0.1 % 160);
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
            let x = (i * 190 - state.camX * 0.20) % 1200;
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
            ctx.arc((i * 240 - state.camX * 0.05) % 1100, 320, 180, 0, Math.PI * 2);
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
            let xx = x - (state.camX * 0.15 % 80);
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
            let x = (i * 210 - state.camX * 0.25) % 1200;
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
            let x = (i * 260 - state.camX * 0.3) % 1300;
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
            let x = i * 260 - (state.camX * 0.12 % 260);
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
        // Brick pattern for grass/cave
        for (let y = b.y + 14; y < b.y + b.h; y += 14) {
            ctx.fillRect(b.x, y, b.w, 2); // Horizontal lines
            let offset = ((y - b.y) / 14 % 2 === 0) ? 0 : 16;
            for (let x = b.x + offset; x < b.x + b.w; x += 32) {
                ctx.fillRect(x, y, 2, 14); // Vertical lines
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

function drawShadowDynamic(ctx, x, y, base) {
    const height = Math.max(0, state.groundY - (player.y + player.h));
    const stretch = 1 + Math.min(height * 0.01, 0.10);
    const alpha = Math.max(0.08, 0.25 - height * 0.002);

    ctx.save();
    // Replaced expensive ctx.filter = blur() with a simple radial gradient for performance
    const r = base * stretch;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(0.8, `rgba(0,0,0,${alpha * 0.5})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, 5, 0, 0, Math.PI * 2);
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
    drawShadowDynamic(ctx, p.x + p.w / 2, p.y + p.h + 8, p.w / 2);
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
    drawShadowDynamic(ctx, p.x + p.w / 2, p.y + p.h + 8, p.w / 2);
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
    drawShadowDynamic(ctx, b.x + b.w / 2, b.y + b.h + 8, b.w / 2);
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
    drawShadowDynamic(ctx, b.x + b.w / 2, b.y + b.h + 8, b.w / 2);
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
    ctx.fillStyle = "rgba(0,0,0,0.4)";
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
    
    // Massive drop shadow
    drawShadowDynamic(ctx, c.x + c.w / 2, c.y + c.h + 20, c.w * 0.6);
    
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
    drawShadowDynamic(ctx, s.x + s.w / 2, s.y + s.h + 10, s.w / 2);
    ctx.save();
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    ctx.rotate(s.angle);
    
    // Saw blade body gradient (metallic sheen)
    const grad = ctx.createLinearGradient(-s.w/2, -s.h/2, s.w/2, s.h/2);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, "#999999");
    grad.addColorStop(1, "#333333");
    
    ctx.fillStyle = grad;
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0, -s.h / 2 + 2);
        ctx.lineTo(8, -s.h / 2 + 14);
        ctx.lineTo(-2, -s.h / 2 + 10);
        ctx.closePath();
        ctx.fill();
    }
    
    // Central metallic disc
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 3.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Core bolt
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff9999";
    ctx.beginPath();
    ctx.arc(-2, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Motion blur / rotation lines
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, s.w / 2.8, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();
}

function drawCoin(ctx, c) {
    if (c.taken) return;
    
    // Spinning animation
    let t = Date.now() / 200 + c.x;
    let spinWidth = Math.max(0.1, Math.abs(Math.cos(t)));
    const y = c.y + Math.sin(c.anim) * 4;
    
    // Drop shadow
    drawShadowDynamic(ctx, c.x, y + 15, 12);
    
    // Core glow
    drawGlow(ctx, c.x, y, 20, c.trap ? "rgba(255,50,50,0.5)" : "rgba(255,223,0,0.5)");

    ctx.save();
    ctx.translate(c.x, y);
    ctx.scale(spinWidth, 1);
    
    // Outer edge (thickness)
    ctx.fillStyle = c.trap ? "#8b0000" : "#d4af37";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner coin face
    ctx.fillStyle = c.trap ? "#ff3333" : "#ffdf00";
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin rim shine
    ctx.strokeStyle = c.trap ? "#ff9999" : "#fff1b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 11, 0, Math.PI * 0.25, Math.PI * 1.25);
    ctx.stroke();

    // Central slot/mark
    ctx.fillStyle = c.trap ? "#4a0000" : "#b8860b";
    ctx.fillRect(-2, -6, 4, 12);
    
    ctx.restore();
}

function drawEnemyProjectile(ctx, p) {
    ctx.fillStyle = p.type === "boss" ? "#ffffff" : "#bfffff";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#73e8ff";
    ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 2);
}

function drawEnemy(ctx, e) {
    if (!e.alive) return;
    drawShadowDynamic(ctx, e.x + e.w / 2, e.y + e.h + 6, e.w / 2);
    
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
        
        // Wings
        ctx.fillStyle = "#4c1a7a"; // Shadow wing
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-30, -10 + flap);
        ctx.lineTo(-15, 10 + flap*0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(30, -10 + flap);
        ctx.lineTo(15, 10 + flap*0.5);
        ctx.fill();
        
        // Highlight wing
        ctx.fillStyle = "#702cb3"; 
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-26, -6 + flap);
        ctx.lineTo(-12, 6 + flap*0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(26, -6 + flap);
        ctx.lineTo(12, 6 + flap*0.5);
        ctx.fill();

        // Body
        ctx.fillStyle = "#9d4edd";
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(-9, -16);
        ctx.lineTo(-2, -10);
        ctx.moveTo(6, -8);
        ctx.lineTo(9, -16);
        ctx.lineTo(2, -10);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = "#ff2a00";
        ctx.fillRect(-6, -2, 4, 3);
        ctx.fillRect(2, -2, 4, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-5, -2, 2, 1);
        ctx.fillRect(3, -2, 2, 1);
        
        // Fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-3, 3); ctx.lineTo(-1, 6); ctx.lineTo(-1, 3);
        ctx.moveTo(3, 3); ctx.lineTo(1, 6); ctx.lineTo(1, 3);
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

function drawMiniCharacter(g, type, x, y, run = false, frame = 0, idleTimer = 0) {
    if (type === "hero") {
        let breathe = (!run && idleTimer) ? Math.sin(idleTimer * 0.1) * 1.5 : 0;
        let walkY = run ? Math.abs(Math.sin(frame * 0.6)) * 2 : 0;
        
        let py = y + breathe - walkY;
        
        // Sombra de los pies (no se mueve con breathe ni rebota)
        g.fillStyle = "rgba(0,0,0,0.25)";
        g.beginPath();
        g.ellipse(x + 17, y + 48, 14 - walkY, 3, 0, 0, Math.PI * 2);
        g.fill();

        let armRot = run ? Math.sin(frame * 0.6) * 0.6 : 0;
        let legRot = run ? Math.sin(frame * 0.6) * 0.7 : 0;

        // --- BRAZO TRASERO ---
        g.save();
        g.translate(x + 8, py + 26);
        g.rotate(-armRot);
        g.fillStyle = "#b51218"; // Manga trasera oscura
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#e0e0e0"; // Guante
        g.fillRect(-5, 11, 10, 8);
        g.restore();

        // --- PIERNA TRASERA ---
        g.save();
        g.translate(x + 12, py + 38);
        g.rotate(-legRot);
        g.fillStyle = "#16417c"; // Overol oscuro
        g.fillRect(-4, 0, 8, 8);
        g.fillStyle = "#4a2c11"; // Zapato oscuro
        g.fillRect(-5, 8, 10, 6);
        g.restore();

        // --- CUERPO ---
        // Camisa roja
        g.fillStyle = "#d71920"; 
        g.fillRect(x + 9, py + 22, 16, 12);
        
        // Overol azul
        g.fillStyle = "#205ab0";
        g.fillRect(x + 10, py + 30, 14, 11);
        
        // Tirantes y botones
        g.fillStyle = "#205ab0";
        g.fillRect(x + 11, py + 25, 3, 5);
        g.fillRect(x + 20, py + 25, 3, 5);
        g.fillStyle = "#ffcc00"; // Botones
        g.fillRect(x + 11, py + 28, 3, 3);
        g.fillRect(x + 20, py + 28, 3, 3);

        // --- PIERNA FRONTAL ---
        g.save();
        g.translate(x + 22, py + 38);
        g.rotate(legRot);
        g.fillStyle = "#286cdc"; // Overol brillante
        g.fillRect(-4, 0, 8, 8);
        g.fillStyle = "#6e421a"; // Zapato
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

        // Gorra roja
        g.fillStyle = "#d71920"; 
        g.fillRect(x + 7, headY - 8, 18, 8); // Cúpula
        g.fillRect(x + 7, headY, 24, 3);     // Visera
        
        // Sombra de gorra
        g.fillStyle = "#b51218";
        g.fillRect(x + 7, headY - 2, 18, 2);

        // --- BRAZO FRONTAL ---
        g.save();
        g.translate(x + 24, py + 26);
        g.rotate(armRot);
        g.fillStyle = "#d71920"; // Manga roja brillante
        g.fillRect(-4, 0, 8, 11);
        g.fillStyle = "#ffffff"; // Guante blanco
        g.fillRect(-5, 11, 10, 8);
        g.fillStyle = "#cccccc"; // Detalle guante
        g.fillRect(-5, 17, 10, 2);
        g.restore();
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
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame, player.idleTimer);
    } else {
        ctx.translate(player.x, player.y);
        drawMiniCharacter(ctx, state.selectedCharacter, 0, 0, player.dx !== 0, player.frame, player.idleTimer);
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

            // Shadow under leaves
            ctx.fillStyle = "rgba(0,40,0,0.8)";
            ctx.beginPath();
            ctx.arc(lx, ly + 8, 28, 0, Math.PI * 2);
            ctx.fill();

            // Main dark leaves
            ctx.fillStyle = "#1e5c12";
            ctx.beginPath();
            ctx.arc(lx - 12, ly + 2, 22, 0, Math.PI * 2);
            ctx.arc(lx + 12, ly + 4, 24, 0, Math.PI * 2);
            ctx.arc(lx, ly - 12, 26, 0, Math.PI * 2);
            ctx.fill();
            
            // Midtone leaves
            ctx.fillStyle = "#2d8a20";
            ctx.beginPath();
            ctx.arc(lx - 14, ly - 2, 18, 0, Math.PI * 2);
            ctx.arc(lx + 10, ly, 20, 0, Math.PI * 2);
            ctx.arc(lx, ly - 16, 22, 0, Math.PI * 2);
            ctx.fill();

            // Highlight leaves (3D volume)
            ctx.fillStyle = "#5edc45";
            ctx.beginPath();
            ctx.arc(lx - 10, ly - 6, 10, 0, Math.PI * 2);
            ctx.arc(lx + 8, ly - 4, 12, 0, Math.PI * 2);
            ctx.arc(lx, ly - 20, 14, 0, Math.PI * 2);
            ctx.fill();
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
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
}

function drawHUD(ctx, canvas) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 15px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText("Nivel: " + state.currentLevel + "/" + state.maxLevel, 14, 24);
    ctx.fillText("Score: " + state.score, 14, 44);
    ctx.fillText("Vidas: " + state.lives, 14, 64);
    ctx.fillText("Muertes: " + state.deaths, 14, 84);
}
