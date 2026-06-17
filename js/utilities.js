// =========================================================
// UTILITIES.JS: Helper functions
// =========================================================

function getTileType(i, arr) {
    let left = arr[i - 1];
    let right = arr[i + 1];

    if (!left && !right) return "solo";
    if (!left) return "inicio";
    if (!right) return "fin";
    return "centro";
}

function rectsCollide(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function roundRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    if (fill) ctx.fill(); else ctx.stroke();
}
