class StartEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector, isLHT) {
        return new StartMarking(
            center,
            directionVector,
            this.world.roadWidth * 0.4,
            this.world.roadWidth / 4,
            isLHT
        );
    }
}