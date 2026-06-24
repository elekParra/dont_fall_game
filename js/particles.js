// =========================================================
// PARTICLES.JS: Particle effects system
// =========================================================


function addBlood(x, y, count = 34) {
    for (let i = 0; i < count; i++) {
        lists.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 7 - 1,
            life: 50 + Math.random() * 25,
            max: 70,
            size: 2 + Math.random() * 4,
            color: Math.random() > 0.35 ? "#d00000" : "#ff3030",
            gravity: 0.28
        });
    }
}

function addExplosion(x, y, color = "#ffcc00", count = 34) {
    for (let i = 0; i < count; i++) {
        lists.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            life: 42 + Math.random() * 22,
            max: 65,
            size: 2 + Math.random() * 5,
            color,
            gravity: 0.06
        });
    }
}

function addDust(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
        lists.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2,
            life: 25 + Math.random() * 15,
            max: 40,
            size: 2 + Math.random() * 4,
            color: "rgba(230,230,230,0.75)",
            gravity: 0.05
        });
    }
}

function addJetpackFire(x, y, count = 3) {
    const colors = ["#ffcc00", "#ff6600", "#ff3300", "rgba(200, 200, 200, 0.5)"];
    for (let i = 0; i < count; i++) {
        lists.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 4 + 1, // shoot downwards
            life: 10 + Math.random() * 10,
            max: 20,
            size: 3 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: 0 // Fire doesn't fall like dust, it just dissipates
        });
    }
}

function updateParticles() {
    lists.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.life--;
    });

    lists.particles = lists.particles.filter(p => p.life > 0);
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
