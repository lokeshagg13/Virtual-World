class StartMarking extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.car = new Car(center.x, center.y, width, height, angle(this.directionVector));
        this.type = "start";
    }

    draw(ctx, isLHT = true) {
        this.car.draw(ctx, isLHT);
    }
}