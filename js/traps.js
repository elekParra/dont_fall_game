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
        }
    });

    // Lasers
    lists.lasers.forEach(l => {
        l.timer++;
        l.active = Math.sin(l.timer / 40) > -0.25;
    });

    // Saws
    lists.sawBlades.forEach(s => {
        s.x += s.dir * s.speed;
        if (s.x < s.minX || s.x > s.maxX) s.dir *= -1;
        s.angle += 0.25;
    });

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
            state.score++;
            addExplosion(c.x, c.y, c.trap ? "#ff3333" : "#ffdf00", 10);

            if (c.trap) {
                revealSpikeAt(c.spikeX);
                showMessage("Moneda trampa", 80);
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
