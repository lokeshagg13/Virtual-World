class CrossingMarking extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.borders = [this.polygon.segments[0], this.polygon.segments[2]];
    }

    draw(ctx) {
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        );

        line.draw(ctx, {
            width: this.height,
            color: "white",
            dash: [11, 11]
        })
    }
}