class CrossingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
    }

    createMarking(center, directionVector) {
        return new CrossingMarking(
            center,
            directionVector,
            this.world.settings.roadWidth,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}