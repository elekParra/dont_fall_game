// =========================================================
// PARTICLES.JS: High-Performance Particle Pool System
// =========================================================

const MAX_PARTICLES = 350;
let particlePoolIndex = 0;

function initParticlePool() {
    lists.particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        lists.particles.push({
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0, max: 1,
            size: 0,
            color: "#ffffff",
            gravity: 0,
            type: "dust",
            spin: 0,
            spinVel: 0,
            text: ""
        });
    }
}
initParticlePool();

function spawnParticle() {
    const pool = lists.particles;
    const len = pool.length;
    for (let i = 0; i < len; i++) {
        const p = pool[(particlePoolIndex + i) % len];
        if (!p.active) {
            particlePoolIndex = (particlePoolIndex + i + 1) % len;
            p.active = true;
            return p;
        }
    }
    // All active: reuse oldest slot
    const p = pool[particlePoolIndex];
    particlePoolIndex = (particlePoolIndex + 1) % len;
    p.active = true;
    return p;
}

function clearParticles() {
    if (!lists.particles) return;
    for (let i = 0; i < lists.particles.length; i++) {
        lists.particles[i].active = false;
    }
}

function addBlood(x, y, count = 34) {
    for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 8;
        p.vy = -Math.random() * 7 - 1;
        p.life = 50 + Math.random() * 25;
        p.max = 70;
        p.size = 3 + Math.random() * 5;
        p.color = Math.random() > 0.35 ? "#d00000" : "#ff3030";
        p.gravity = 0.28;
        p.type = "blood";
        p.spin = Math.random() * Math.PI * 2;
        p.spinVel = (Math.random() - 0.5) * 0.2;
    }
}

function addExplosion(x, y, color = "#ffcc00", count = 25) {
    for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 12;
        p.vy = (Math.random() - 0.5) * 12;
        p.life = 30 + Math.random() * 20;
        p.max = 50;
        p.size = 4 + Math.random() * 8;
        p.color = color;
        p.gravity = 0.05;
        p.type = "explosion";
        p.spin = Math.random() * Math.PI * 2;
        p.spinVel = (Math.random() - 0.5) * 0.3;
    }
}

function addDust(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.x = x + (Math.random() - 0.5) * 8;
        p.y = y - 1 + Math.random() * 2;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = -Math.random() * 0.5 - 0.15;
        p.life = 14 + Math.random() * 8;
        p.max = 22;
        p.size = 1.8 + Math.random() * 1.4;
        p.color = "rgba(215, 225, 235, 0.42)";
        p.gravity = -0.01;
        p.type = "dust";
        p.spin = 0;
        p.spinVel = 0;
    }
}

function addCoinSparkle(x, y, count = 10) {
    const sparkleColors = ["#ffffff", "#fff580", "#ffd700", "#ffa600"];
    for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.x = x + (Math.random() - 0.5) * 8;
        p.y = y + (Math.random() - 0.5) * 8;
        p.vx = (Math.random() - 0.5) * 5;
        p.vy = (Math.random() - 0.5) * 5 - 1.2;
        p.life = 20 + Math.random() * 12;
        p.max = 32;
        p.size = 3 + Math.random() * 3.5;
        p.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        p.gravity = 0.05;
        p.type = "sparkle";
        p.spin = Math.random() * Math.PI * 2;
        p.spinVel = (Math.random() - 0.5) * 0.35;
    }
}

function addFloatingText(x, y, text = "+1", color = "#ffd700") {
    const p = spawnParticle();
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 0.3;
    p.vy = -1.4;
    p.life = 34;
    p.max = 34;
    p.size = 10;
    p.color = color;
    p.gravity = 0.01;
    p.type = "floatText";
    p.text = text;
    p.spin = 0;
    p.spinVel = 0;
}

function addJetpackFire(x, y, count = 3) {
    const colors = ["#ffcc00", "#ff6600", "#ff3300", "rgba(200, 200, 200, 0.5)"];
    for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = Math.random() * 4 + 1; // shoot downwards
        p.life = 10 + Math.random() * 10;
        p.max = 20;
        p.size = 4 + Math.random() * 6;
        p.color = colors[Math.floor(Math.random() * colors.length)];
        p.gravity = 0;
        p.type = "fire";
        p.spin = 0;
        p.spinVel = 0;
    }
}

function updateParticles() {
    const pool = lists.particles;
    const len = pool.length;
    for (let i = 0; i < len; i++) {
        const p = pool[i];
        if (!p.active) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.96;
        if (p.type === "dust") p.size += 0.04; // Discreet soft expansion
        if (p.type === "explosion" || p.type === "blood") p.size *= 0.95; // Shrink
        if (p.spinVel) p.spin += p.spinVel;
        p.life--;
        if (p.life <= 0) {
            p.active = false;
        }
    }
}

function seedAmbientParticles(canvasWidth, canvasHeight) {
    lists.ambientParticles = [];
    const count = state.levelTheme === "factory" ? 28 : state.levelTheme === "ice" ? 65 : 40;
    for (let i = 0; i < count; i++) {
        lists.ambientParticles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: state.levelTheme === "ice" ? -0.2 + Math.random() * 0.4 : -0.15 + Math.random() * 0.3,
            vy: state.levelTheme === "factory" ? -0.25 - Math.random() * 0.4 : 0.25 + Math.random() * 0.35,
            size: state.levelTheme === "ice" ? 1 + Math.random() * 2 : 1 + Math.random() * 3,
            alpha: 0.25 + Math.random() * 0.45
        });
    }
}

function updateAmbientParticles(canvasWidth, canvasHeight) {
    lists.ambientParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (state.levelTheme === "ice") p.x += Math.sin(Date.now() / 600 + p.y) * 0.05;
        if (p.y > canvasHeight + 10) p.y = -10;
        if (p.y < -10) p.y = canvasHeight + 10;
        if (state.levelTheme === "ice") {
            p.x += lists.windZones.length ? lists.windZones[0].force * 0.3 : 0;
        }

        if (p.x < -10) p.x = canvasWidth + 10;
        if (p.x > canvasWidth + 10) p.x = -10;
    });
}

function updateBgShips(canvasWidth, canvasHeight) {
    // Spawn randomly (about every 3-5 seconds on average, assuming 60fps)
    if (Math.random() < 0.005) {
        let y = Math.random() * (canvasHeight * 0.7); // Spawn in upper 70% of screen
        let dir = Math.random() > 0.5 ? 1 : -1;
        let x = dir === 1 ? state.camX - 100 : state.camX + canvasWidth + 100;
        
        let speed = 4 + Math.random() * 3;
        
        // Spawn a chaser and a runner
        lists.bgShips.push({
            x: x,
            y: y,
            vx: speed * dir,
            vy: (Math.random() - 0.5) * 1,
            color: "#ff3a1f",
            isChaser: true,
            timer: 0,
            dir: dir
        });
        
        lists.bgShips.push({
            x: x + (150 + Math.random() * 100) * dir, // runner is ahead
            y: y + (Math.random() - 0.5) * 40,
            vx: speed * dir, // slightly different speed? no, same speed looks like a chase
            vy: (Math.random() - 0.5) * 1,
            color: "#00ffff",
            isChaser: false,
            timer: 0,
            dir: dir
        });
    }
    
    // Update ships and lasers
    lists.bgShips.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.timer++;
        
        // Chasers shoot at runners occasionally
        if (s.isChaser && Math.random() < 0.05) {
            // Draw a quick laser line behind? Just add a particle to bgShips that is a laser
            lists.bgShips.push({
                x: s.x + (s.dir === 1 ? 10 : -10),
                y: s.y,
                vx: (Math.abs(s.vx) + 8) * s.dir,
                vy: s.vy,
                color: "#ffaa00",
                isLaser: true,
                timer: 0,
                dir: s.dir
            });
        }
    });
    
    // Remove if too far off screen or lasers if they get old
    lists.bgShips = lists.bgShips.filter(s => {
        if (s.isLaser && s.timer > 30) return false;
        if (s.x < state.camX - 1000 || s.x > state.camX + canvasWidth + 1000) return false;
        return true;
    });
}
