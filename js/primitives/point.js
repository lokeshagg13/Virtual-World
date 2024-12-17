class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(point) {
        return this.x == point.x && this.y == point.y;
    }

    draw(ctx, { size = 18, color = "#000000", outline = false, fill = false, opacity = 100 } = {}) {
        const rad = size / 2;
        ctx.beginPath();
        const r = parseInt(color[1] + color[2], 16);
        const g = parseInt(color[3] + color[4], 16);
        const b = parseInt(color[5] + color[6], 16);
        ctx.fillStyle = `rgba(${ r }, ${ g }, ${ b }, ${ opacity })`;
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill();
        if (outline) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (fill) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "yellow"
            ctx.fill();
        }
    }
}