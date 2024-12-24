class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new TargetMarking(
            center,
            directionVector,
            this.world.settings.roadWidth / 2,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}