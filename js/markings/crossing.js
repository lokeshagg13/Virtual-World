class CrossingMarking {
    constructor(center, directionVector, width, height) {
        this.center = center;
        this.directionVector = directionVector;
        this.width = width;
        this.height = height;

        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2),
        )
        this.polygon = new Envelope(this.support, width, 0).polygon;
        this.border = this.polygon.segments[2];
    }

    draw(ctx) {
        const perp = perpendicular(this.directionVector);
    }
}