class StartMarking extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.img = new Image();
        this.img.src = "car_white.png";
    }

    draw(ctx, isLHT = true) {
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        if (isLHT) {
            ctx.rotate(angle(this.directionVector) + Math.PI / 2);
        } else {
            ctx.rotate(angle(this.directionVector) - Math.PI / 2);
        }

        ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
        ctx.restore();
    }
}