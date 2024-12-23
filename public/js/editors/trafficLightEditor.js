class TrafficLightEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector, isLHT) {
        return new TrafficLightMarking(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2,
            isLHT
        );
    }
}