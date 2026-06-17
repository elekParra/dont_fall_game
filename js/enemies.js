// =========================================================
// ENEMIES.JS: Enemy updates and drawing
// =========================================================


function updateEnemies(killPlayer) {
    // Regular Enemies
    lists.enemies.forEach(e => {
        if (!e.alive) return;

        e.x += e.dir * (state.currentLevel === 3 ? 2.1 : state.currentLevel === 2 ? 1.9 : 1.7);

        if (e.x < e.minX || e.x > e.maxX) e.dir *= -1;

        if (e.type === "bat") e.y += Math.sin(Date.now() / 150 + e.x) * 0.5;

        if (e.type === "shooter") {
            e.fireCooldown--;

            if (e.fireCooldown <= 0) {
                const direction = player.x < e.x ? -1 : 1;
                addEnemyProjectile(e.x + e.w / 2, e.y + 16, direction * 4.2, 0, "ice");
                addExplosion(e.x + e.w / 2, e.y + 16, "#bfffff", 8);
                e.fireCooldown = e.fireRate;
            }
        }

        if (rectsCollide(player, e)) {
            const wasAbove = player.prevY + player.h <= e.y + 8;

            if (player.dy > 0 && wasAbove) {
                e.alive = false;
                player.dy = -7;
                state.score += 3;
                addExplosion(e.x + e.w / 2, e.y + e.h / 2, "#aa66ff", 20);
            } else {
                killPlayer("Enemigo al contacto", "generic");
            }
        }
    });

    // Enemy Projectiles
    lists.enemyProjectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (rectsCollide(player, p)) {
            killPlayer(p.type === "boss" ? "Fragmento del guardián" : "Proyectil helado", "laser");
        }
    });

    lists.enemyProjectiles = lists.enemyProjectiles.filter(p => {
        return p.life > 0 && p.x > state.camX - 300 && p.x < state.camX + 900 + 500; // 900 is roughly canvas.width
    });

    // Boss
    updateIceBoss(killPlayer);
}

function updateIceBoss(killPlayer) {
    const iceBoss = bossState.iceBoss;
    if (!iceBoss || iceBoss.defeated || !iceBoss.active) return;

    if (iceBoss.hurtTimer > 0) iceBoss.hurtTimer--;

    iceBoss.fireCooldown--;
    iceBoss.jumpCooldown--;
    iceBoss.stompCooldown--;
    
    if (iceBoss.hp <= iceBoss.maxHp/2) {
        addExplosion(iceBoss.x + 40, iceBoss.y + 50, "#ffffff", 4);
    }

    if (iceBoss.fireCooldown <= 0) {
        const direction = player.x < iceBoss.x ? -1 : 1;

        addEnemyProjectile(
            iceBoss.x + iceBoss.w / 2,
            iceBoss.y + 35,
            direction * 4.8,
            -0.4,
            "boss"
        );

        addEnemyProjectile(
            iceBoss.x + iceBoss.w / 2,
            iceBoss.y + 58,
            direction * 4.2,
            0.5,
            "boss"
        );

        addExplosion(iceBoss.x + iceBoss.w / 2, iceBoss.y + 50, "#bfffff", 12);
        iceBoss.fireCooldown = iceBoss.hp <= 7 ? 55 : 85;
    }

    if (iceBoss.stompCooldown <= 0) {
        addSpike(iceBoss.x - 80, false, "ice");
        addSpike(iceBoss.x + iceBoss.w + 45, false, "ice");
        showMessage("¡El guardián rompe el hielo!", 60);
        iceBoss.stompCooldown = 190;
    }

    if (iceBoss.jumpCooldown <= 0) {
        iceBoss.y -= 20;
        setTimeout(() => {
            if (iceBoss && !iceBoss.defeated) {
                iceBoss.y = state.groundY - iceBoss.h;
                state.shakeTimer = 18;
                state.shakePower = 6;
                addExplosion(iceBoss.x + iceBoss.w / 2, state.groundY - 10, "#bfffff", 22);
            }
        }, 220);

        iceBoss.jumpCooldown = 260;
    }

    if (rectsCollide(player, iceBoss)) {
        const wasAbove = player.prevY + player.h <= iceBoss.y + 12;

        if (player.dy > 0 && wasAbove) {
            iceBoss.hp--;
            iceBoss.hurtTimer = 20;
            player.dy = -9;
            addExplosion(player.x + player.w / 2, player.y + player.h, "#ffffff", 18);
            showMessage("¡Golpe al jefe! HP: " + iceBoss.hp, 50);

            if (iceBoss.hp <= 0) {
                iceBoss.defeated = true;
                iceBoss.active = false;
                state.score += 50;
                state.shakeTimer = 35;
                state.shakePower = 10;
                addExplosion(iceBoss.x + iceBoss.w / 2, iceBoss.y + iceBoss.h / 2, "#bfffff", 80);
                showMessage("¡Guardián derrotado!", 120);
            }
        } else {
            killPlayer("Aplastado por el guardián", "crush");
        }
    }

    if (state.currentLevel === 4 && !iceBoss.defeated && player.x > 8250) {
        player.x = 8250;
        showMessage("Derrota al guardián", 40);
    }
}
