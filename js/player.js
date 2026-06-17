// =========================================================
// PLAYER.JS: Player physics, movement, and input logic
// =========================================================


function updatePlayer(killPlayer) {
    if (player.invulnerable > 0) player.invulnerable--;

    // Moving platforms
    lists.movingPlatforms.forEach(p => {
        const oldX = p.x;
        p.x += p.dir * p.speed;
        if (p.x < p.startX || p.x > p.endX) {
            p.dir *= -1;
            p.x += p.dir * p.speed;
        }
        p.moveX = p.x - oldX;
    });

    // Check Ice
    let onIce = false;
    lists.iceZones.forEach(zone => {
        const feet = {
            x: player.x,
            y: player.y + player.h,
            w: player.w,
            h: 4
        };
        if (rectsCollide(feet, zone)) onIce = true;
    });

    if (onIce) {
        if (state.keys.left) {
            player.dx -= 0.22;
            player.facing = -1;
        }
        if (state.keys.right) {
            player.dx += 0.22;
            player.facing = 1;
        }
        player.dx *= 0.975;
        if (player.dx > player.speed * 1.35) player.dx = player.speed * 1.35;
        if (player.dx < -player.speed * 1.35) player.dx = -player.speed * 1.35;
    } else {
        player.dx = 0;
        if (state.keys.left) {
            player.dx = -player.speed;
            player.facing = -1;
        }
        if (state.keys.right) {
            player.dx = player.speed;
            player.facing = 1;
        }
    }

    let gravityMultiplier = 1;
    lists.gravityZones.forEach(g => {
        if (g.active && rectsCollide(player, g)) gravityMultiplier = 0.45;
    });

    // Wind
    lists.windZones.forEach(wind => {
        if (rectsCollide(player, wind)) {
            player.x += wind.force;
        }
    });

    // Jump logic
    if (state.keys.jump) state.jumpBuffer = 8;
    else state.jumpBuffer--;

    if (player.grounded) state.coyoteTime = 8;
    else state.coyoteTime--;

    if (state.jumpBuffer > 0 && state.coyoteTime > 0) {
        player.dy = player.jumpPower;
        player.grounded = false;
        state.jumpBuffer = 0;
        state.coyoteTime = 0;
        addDust(player.x + player.w / 2, player.y + player.h, 8);
    }

    player.prevX = player.x;
    player.prevY = player.y;

    player.dy += player.gravity * gravityMultiplier;

    // Horiz movement
    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x > state.levelEnd - player.w) player.x = state.levelEnd - player.w;

    lists.invisibleWalls.forEach(w => {
        if (!w.active) return;
        if (rectsCollide(player, w)) {
            if (player.dx > 0) player.x = w.x - player.w;
            if (player.dx < 0) player.x = w.x + w.w;
            showMessage("¿Qué ha sido eso?", 45);
        }
    });

    // Vert movement
    player.y += player.dy;
    player.grounded = false;

    // Collect active solids
    let solids = [...lists.blocks];
    lists.fakeFloors.forEach(f => { if (f.active) solids.push(f); });
    lists.fallingBlocks.forEach(f => { if (f.y < 800) solids.push(f); });
    lists.movingPlatforms.forEach(m => solids.push(m));
    lists.vanishingPlatforms.forEach(v => { if (v.active) solids.push(v); });
    lists.brittlePlatforms.forEach(b => { if (b.active) solids.push(b); });

    solids.forEach(s => {
        if (!rectsCollide(player, s)) return;

        const wasAbove = player.prevY + player.h <= s.y;
        const wasBelow = player.prevY >= s.y + s.h;

        if (player.dy >= 0 && wasAbove) {
            player.y = s.y - player.h;
            player.dy = 0;
            player.grounded = true;

            if (s.type === "moving") player.x += s.moveX || 0;

            if (s.type === "fake" && !s.triggered) {
                s.triggered = true;
                showMessage("El suelo no era suelo", 80);
                setTimeout(() => s.active = false, state.currentLevel === 3 ? 180 : 330);
            }

            if (s.type === "falling" && !s.used) {
                s.used = true;
                showMessage("Corre, corre...", 55);
                setTimeout(() => s.falling = true, s.delay);
            }

            if (s.type === "vanish" && !s.touched) {
                s.touched = true;
                showMessage("No te quedes ahí", 60);
            }

            if (s.type === "brittle" && !s.cracking) {
                s.cracking = true;
                s.crackTimer = 45;
                showMessage("El hielo se rompe...", 55);
            }
        } else if (player.dy < 0 && wasBelow) {
            player.y = s.y + s.h;
            player.dy = 0;
        }
    });

    // Animations
    if (Math.abs(player.dx) > 0.1) {
        player.frame += 0.25 + Math.abs(player.dx) * 0.06;
    } else {
        player.frame = 0;
    }
    if (player.dy === 0 && Math.random() < 0.3) {
        addDust(player.x + player.w / 2, player.y + player.h);
    }
}
