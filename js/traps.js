// =========================================================
// TRAPS.JS: Trap updates (crushers, falling blocks, etc)
// =========================================================


function updateTraps(killPlayer) {
    // Crushers
    lists.crushers.forEach(c => {
        if (!c.active) return;
        if (c.dropping) {
            c.vy += 0.8;
            c.y += c.vy;
            let targetY = c.stopY !== undefined ? c.stopY : state.groundY - c.h;
            if (c.y > targetY) {
                c.y = targetY;
                c.vy = -12;
                c.dropping = false;
            }
        } else {
            c.vy += 0.35;
            c.y += c.vy;
            if (c.y < 60) {
                c.y = 60;
                c.vy = 0;
                c.dropping = true;
            }
        }
    });

    // Spikes
    lists.spikes.forEach(s => {
        if (s.rising) {
            s.y -= 4;
            if (s.y <= s.targetY) {
                s.y = s.targetY;
                s.rising = false;
            }
        }
    });

    // Falling Blocks
    lists.fallingBlocks.forEach(b => {
        if (b.falling) {
            b.vy += 0.35;
            b.y += b.vy;
            
            // Attached spikes fall with the block
            lists.spikes.forEach(s => {
                // Solo adjuntar si el pincho estaba encima del bloque (no en el suelo)
                if (s.x >= b.x - 20 && s.x <= b.x + b.w + 20 && Math.abs((s.targetY + 28) - (b.y - b.vy)) < 5 && (s.targetY + 28) < state.groundY - 5) {
                    s.y += b.vy;
                    s.targetY += b.vy;
                }
            });
        }
    });

    // Lasers
    lists.lasers.forEach(l => {
        if (l.timer === undefined) l.timer = 0;
        l.timer++;
        
        const cycle = l.timer % 220;
        
        if (cycle === 120) {
            // Start warning
            l.state = "warning";
            l.active = false;
            playTone(400, 0.1, "sine");
            setTimeout(() => playTone(500, 0.1, "sine"), 150);
        } else if (cycle === 170) {
            // Start firing
            l.state = "firing";
            l.active = true;
            playTone(120, 0.35, "sawtooth");
            addExplosion(l.x + l.w/2, l.y, state.levelTheme === "factory" ? "#ff3333" : "#00ffff", 10);
        } else if (cycle >= 210 || cycle < 120) {
            // Cooldown / Off
            l.state = "off";
            l.active = false;
        }
    });

    // Saws
    lists.sawBlades.forEach(s => {
        s.x += s.dir * s.speed;
        if (s.x < s.minX || s.x > s.maxX) s.dir *= -1;
        s.angle += 0.25;
    });

    // Moving platforms logic removed from here as it is handled in player.js
    // Fade platforms
    lists.fakeFloors.forEach(f => {
        if (f.triggered) {
            f.alpha -= state.currentLevel === 3 ? 0.045 : 0.025;
            if (f.alpha < 0.1) f.alpha = 0.1;
        }
    });

    lists.vanishingPlatforms.forEach(v => {
        if (v.touched && v.active) {
            v.alpha -= state.currentLevel === 3 ? 0.055 : 0.035;
            if (v.alpha <= 0) v.active = false;
        }
    });

    lists.brittlePlatforms.forEach(b => {
        if (!b.active) return;
        if (b.cracking) {
            b.crackTimer--;
            b.alpha -= 0.018;
            if (b.crackTimer <= 0) {
                b.active = false;
                addExplosion(b.x + b.w / 2, b.y + 10, "#bfffff", 18);
            }
        }
    });

    // New Traps
    lists.spikePlatforms.forEach(p => {
        if (p.triggered && !p.popped) {
            p.timer--;
            if (p.timer <= 0) {
                p.popped = true;
                p.retractTimer = 60; // 1 second before retracting
                addExplosion(p.x + p.w / 2, p.y, "#aaaaaa", 12);
                playTone(250, 0.1, "sawtooth");
            }
        } else if (p.popped) {
            const spikeRect = { x: p.x + 2, y: p.y - 12, w: p.w - 4, h: 12 };
            if (rectsCollide(player, spikeRect)) killPlayer("Trampa oculta", "spike");
            
            p.retractTimer--;
            if (p.retractTimer <= 0) {
                p.popped = false;
                p.triggered = false;
            }
        }
    });

    lists.fallingSpikes.forEach(s => {
        if (!s.active) return;
        
        if (!s.falling) {
            if (Math.abs((player.x + player.w / 2) - (s.x + s.w / 2)) < 40 && player.y > s.y) {
                s.falling = true;
                playTone(700, 0.15, "triangle");
            }
        } else {
            s.vy += 0.6;
            s.y += s.vy;
            if (rectsCollide(player, s)) killPlayer("Estalactita mortal", "spike");
            
            if (s.y > state.groundY || s.y > 1000) {
                s.active = false;
                addExplosion(s.x + s.w / 2, s.y + s.h, "#ffffff", 15);
            }
        }
    });

    lists.springboards.forEach(sb => {
        if (sb.animTimer > 0) sb.animTimer--;
    });

    // Triggers
    lists.triggers.forEach(t => {
        if (!t.done && rectsCollide(player, t)) {
            t.done = true;
            t.action();
        }
    });

    // Trap Kills & Coins
    lists.lavaPits.forEach(p => {
        if (rectsCollide(player, p)) {
            killPlayer(
                state.currentLevel === 2 ? "Ácido neón" :
                state.currentLevel === 3 ? "Fundido por la fábrica" :
                state.currentLevel === 4 ? "Agua helada" :
                "A la lava",
                "lava"
            );
        }
    });

    lists.spikes.forEach(s => {
        if (s.active && rectsCollide(player, s)) {
            killPlayer(
                state.currentLevel === 2 ? "Cristales letales" :
                state.currentLevel === 3 ? "Pinchos industriales" :
                state.currentLevel === 4 ? "Estalactitas heladas" :
                "Pinchos sorpresa",
                "spike"
            );
        }
    });

    lists.crushers.forEach(c => {
        if (c.active && rectsCollide(player, c)) killPlayer("Aplastado", "crush");
    });

    lists.lasers.forEach(l => {
        if (l.active && rectsCollide(player, l)) killPlayer("Láser", "laser");
    });

    lists.sawBlades.forEach(s => {
        if (rectsCollide(player, s)) killPlayer("Sierra giratoria", "spike");
    });

    // Coins
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;
    lists.coins.forEach(c => {
        c.anim += 0.1;
        if (c.taken) return;

        const dx = playerCenterX - c.x;
        if (Math.abs(dx) > 30) return;
        const dy = playerCenterY - c.y;
        if (Math.abs(dy) > 30) return;

        if (dx * dx + dy * dy < 784) { // 28 * 28 = 784, avoids Math.sqrt
            c.taken = true;
            state.collectedCoins.push(c.x + "_" + c.y);
            state.score++;
            state.coinsCount++;
            state.scoreScale = 1.5;
            state.scoreTimer = 15;
            
            if (c.trap) {
                addExplosion(c.x, c.y, "#ff3355", 14);
                if (typeof addFloatingText === "function") addFloatingText(c.x, c.y - 12, "¡TRAMPA!", "#ff3355");
            } else {
                addCoinSparkle(c.x, c.y, 10);
                if (typeof addFloatingText === "function") addFloatingText(c.x, c.y - 12, "+1", "#ffd700");
            }

            if (state.coinsCount >= 10) {
                state.coinsCount = 0;
                state.lives++;
                player.lifeGlowTimer = 90;
                showMessage("¡+1 VIDA!", 90);
                playTone(880, 0.1, "sine");
                setTimeout(() => playTone(1320, 0.2, "sine"), 100);
                addExplosion(player.x + player.w/2, player.y + player.h/2, "#00ff00", 30);
            }

            if (c.trap) {
                if (state.currentLevel === 2 && c.y < 250) {
                    lists.crushers.push({
                        x: c.x - 30, y: -450, w: 60, h: 400,
                        vy: 0, active: true, dropping: true
                    });
                    showMessage("Aplastador aéreo activado", 90);
                } else if (state.currentLevel === 1 && Math.abs(c.x - 600) < 10) {
                    let plat = lists.fallingBlocks.find(b => Math.abs(b.x - 520) < 10);
                    if (plat) {
                        plat.falling = true;
                        plat.used = true;
                    }
                    revealSpikeAt(c.spikeX);
                    showMessage("¡Plataforma trampa!", 80);
                } else {
                    revealSpikeAt(c.spikeX);
                    showMessage("Moneda trampa", 80);
                }
            }
        }
    });

    // Checkpoints
    lists.checkpoints.forEach((cp, index) => {
        if (!cp.active && rectsCollide(player, cp)) {
            cp.active = true;
            state.checkpointIndex = index;
            state.checkpoint.x = cp.x;
            state.checkpoint.y = cp.y - player.h;
            showMessage("Checkpoint conseguido", 80);
            addExplosion(cp.x, cp.y, "#00ff99", 25);
        }
    });

    // --- ADVANCED ENGAGING MECHANICS ---

    // 1. Troll Coins with Running Legs
    lists.trollCoins.forEach(tc => {
        if (tc.taken) return;
        const dx = playerCenterX - tc.x;
        const dy = playerCenterY - tc.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 110 && !tc.fleeing) {
            tc.fleeing = true;
            tc.vx = 4.3;
            showMessage("¡La moneda se escapa!", 65);
            playTone(600, 0.08, "triangle");
        }

        if (tc.fleeing) {
            tc.legsAnim += 0.45;
            tc.x += tc.vx;
            tc.y = tc.startY + Math.sin(tc.legsAnim * 2) * 4;
            if (Math.random() < 0.25) addDust(tc.x, tc.y + 10, 1);
        }

        if (dist < 26) {
            tc.taken = true;
            state.score += 5;
            state.scoreScale = 1.6;
            state.scoreTimer = 16;
            showMessage("¡Moneda fugitiva atrapada! +5", 80);
            addCoinSparkle(tc.x, tc.y, 16);
            if (typeof addFloatingText === "function") addFloatingText(tc.x, tc.y - 12, "+5 ORO", "#ffd700");
            playTone(880, 0.1, "sine");
            setTimeout(() => playTone(1100, 0.15, "sine"), 80);
        }
    });

    // 2. Secret Star Gems (Ruby, Sapphire, Emerald)
    lists.gems.forEach(g => {
        if (g.taken) return;
        g.anim += 0.08;
        g.floatY = Math.sin(g.anim) * 5;

        const gemRect = { x: g.x - 14, y: g.y + g.floatY - 14, w: 28, h: 28 };
        if (rectsCollide(player, gemRect)) {
            g.taken = true;
            state.collectedGems.push(g.id);
            const idx = g.type === "ruby" ? 0 : g.type === "sapphire" ? 1 : 2;
            state.currentGems[idx] = true;
            state.score += 25;
            state.scoreScale = 1.8;
            state.scoreTimer = 20;

            const name = g.type === "ruby" ? "¡RUBÍ SECRETO!" : g.type === "sapphire" ? "¡ZAFIRO SECRETO!" : "¡ESMERALDA SECRETA!";
            const color = g.type === "ruby" ? "#ff2a55" : g.type === "sapphire" ? "#00c3ff" : "#00ff77";
            showMessage(`${name} (+25)`, 100);
            if (typeof addFloatingText === "function") addFloatingText(g.x, g.y - 14, name, color);
            addExplosion(g.x, g.y, color, 30);
            playTone(660, 0.1, "sine");
            setTimeout(() => playTone(880, 0.1, "sine"), 80);
            setTimeout(() => playTone(1320, 0.25, "sine"), 160);
        }
    });

    // 3. Fake Checkpoints
    lists.fakeCheckpoints.forEach(fcp => {
        if (!fcp.triggered && rectsCollide(player, { x: fcp.x, y: fcp.y, w: 28, h: 50 })) {
            fcp.triggered = true;
            fcp.vy = -3.8;
            showMessage("¡JAJA! ¡Checkpoint FALSO!", 90);
            if (typeof addFloatingText === "function") addFloatingText(fcp.x, fcp.y - 15, "¡TROLLEO!", "#ff4444");
            playTone(320, 0.15, "sawtooth");
            setTimeout(() => playTone(160, 0.25, "sawtooth"), 120);
        }
        if (fcp.triggered) {
            fcp.y += fcp.vy;
            fcp.x += Math.sin(Date.now() / 150) * 1.5;
            fcp.alpha = Math.max(0, fcp.alpha - 0.015);
        }
    });

    // 4. Runaway Castle with Legs
    lists.runawayCastles.forEach(rc => {
        if (!rc.triggered && player.x > rc.x - 280) {
            rc.triggered = true;
            rc.runVx = 5.2;
            showMessage("¿¡A DÓNDE VA EL CASTILLO!?", 100);
            playTone(220, 0.15, "square");
            setTimeout(() => playTone(330, 0.2, "square"), 100);
        }
        if (rc.triggered && rc.runX < 480) {
            rc.runX += rc.runVx;
            rc.legsAnim += 0.35;
            if (Math.random() < 0.3) addDust(rc.x + rc.runX + 20, rc.y + 70, 2);
            if (rc.runX >= 480) {
                rc.runX = 480;
                state.shakeTimer = 15;
                state.shakePower = 6;
                addExplosion(rc.x + rc.runX + 40, rc.y + 70, "#aaaaaa", 25);
                playTone(120, 0.3, "sawtooth");
                showMessage("¡Ahora sí puedes pasar!", 80);
            }
        }
    });

    // 5. Chase Wall Hazard
    if (state.chaseWall && state.chaseWall.active) {
        state.chaseWall.timer++;
        state.chaseWall.x += state.chaseWall.speed;

        if (Math.random() < 0.4) {
            const debrisY = state.groundY - 10 - Math.random() * 260;
            addExplosion(state.chaseWall.x + 20, debrisY, state.chaseWall.type === "factory" ? "#ff5500" : "#ffffff", 8);
        }

        if (player.x + player.w < state.chaseWall.x + 35) {
            killPlayer(state.chaseWall.type === "factory" ? "Triturado por la maquinaria" : "Sepultado por la avalancha", state.chaseWall.type === "factory" ? "crush" : "ice");
        }
    }

    // 6. Dark Zones Check
    state.inDarkZone = lists.darkZones.some(dz => dz.active && player.x >= dz.x && player.x <= dz.x + dz.w);
}
