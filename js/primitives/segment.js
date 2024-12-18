class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    length() {
        return distance(this.p1, this.p2);
    }

    directionVector() {
        return normalize(subtract(this.p2, this.p1));
    }

    equals(segment) {
        return this.includes(segment.p1) && this.includes(segment.p2);
    }

    includes(point) {
        // returns true if a segment includes a point
        return this.p1.equals(point) || this.p2.equals(point);
    }

    draw(ctx, { width = 2, color = "black", dash = [] } = {}) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}