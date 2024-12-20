class YieldMarking extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.border = this.polygon.segments[2];
        this.type = "yield";
    }

    draw(ctx, isLHT = true) {
        if (isLHT) {
            this.border = this.polygon.segments[0]
        }
        this.border.draw(ctx, { width: 5, color: "white", dash: [2, 2] });
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        if (isLHT) {
            ctx.rotate(angle(this.directionVector) + Math.PI / 2);
        } else {
            ctx.rotate(angle(this.directionVector) - Math.PI / 2);
        }
        ctx.scale(1, 3);

        ctx.beginPath();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold " + this.height * 0.3 + "px Arial";
        ctx.fillText("YEILD", 0, 1);

        ctx.restore();
    }
}