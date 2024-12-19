class Marking {
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
        this.type = "marking";
    }

    static load(info) {
        const center = new Point(
            info.center.x,
            info.center.y
        );
        const directionVector = new Point(
            info.directionVector.x,
            info.directionVector.y
        );
        switch (info.type) {
            case "crossing":
                return new CrossingMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "parking":
                return new ParkingMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "start":
                return new StartMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "stop":
                return new StopMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "target":
                return new TargetMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "trafficLight":
                return new TrafficLightMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
            case "yield":
                return new YieldMarking(
                    center,
                    directionVector,
                    info.width,
                    info.height
                );
        }
    }

    draw(ctx, isLHT = true) {
        this.polygon.draw(ctx);
    }
}