class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new TargetMarking(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}