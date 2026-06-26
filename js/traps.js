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
            if (c.y > state.groundY - c.h) {
                c.y = state.groundY - c.h;
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
                if (s.x >= b.x - 20 && s.x <= b.x + b.w + 20 && Math.abs((s.targetY + 28) - (b.y - b.vy)) < 5) {
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
    lists.coins.forEach(c => {
        c.anim += 0.1;
        if (c.taken) return;

        const dx = (player.x + player.w / 2) - c.x;
        const dy = (player.y + player.h / 2) - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 28) {
            c.taken = true;
            state.collectedCoins.push(c.x + "_" + c.y);
            state.score++;
            state.coinsCount++;
            state.scoreScale = 1.5;
            state.scoreTimer = 15;
            
            if (c.trap) addExplosion(c.x, c.y, "#ff3333", 10);
            else addCoinSparkle(c.x, c.y, 15);

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
                if (state.currentLevel === 2 && c.y < 100) {
                    lists.crushers.push({
                        x: c.x - 30, y: -450, w: 60, h: 400,
                        vy: 0, active: true, dropping: true
                    });
                    showMessage("Aplastador aéreo activado", 90);
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
}
