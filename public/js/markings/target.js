class TargetMarking extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.type = "target";
    }

    draw(ctx, isLHT = true) {
        this.center.draw(ctx, { color: "red", size: 30 });
        this.center.draw(ctx, { color: "white", size: 20 });
        this.center.draw(ctx, { color: "red", size: 10 });
    }
}