class StopEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new StopMarking(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}