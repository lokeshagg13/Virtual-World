class TrafficLightMarking extends Marking {
    constructor(center, directionVector, width, height) {
        height = 25
        super(center, directionVector, width, height);
        this.border = this.polygon.segments[0];
        this.state = "off";
        this.type = "trafficLight";
    }

    draw(ctx, isLHT = true) {
        if (isLHT) {
            this.border = this.polygon.segments[2];
        }
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        )

        const green = lerp2D(line.p1, line.p2, 0.25);
        const yellow = lerp2D(line.p1, line.p2, 0.5);
        const red = lerp2D(line.p1, line.p2, 0.75);

        new Segment(red, green).draw(ctx, { width: this.height, cap: "round" });
        green.draw(ctx, { size: this.height * 0.4, color: "#060" });
        yellow.draw(ctx, { size: this.height * 0.4, color: "#660" });
        red.draw(ctx, { size: this.height * 0.4, color: "#600" });

        switch (this.state) {
            case "green":
                green.draw(ctx, { size: this.height * 0.4, color: "#0F0" });
                break;
            case "yellow":
                yellow.draw(ctx, { size: this.height * 0.4, color: "#FF0" });
                break;
            case "red":
                red.draw(ctx, { size: this.height * 0.4, color: "#F00" });
                break;
        }
    }
}