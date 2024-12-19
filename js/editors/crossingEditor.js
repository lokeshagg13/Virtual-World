class CrossingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
    }

    createMarking(center, directionVector) {
        return new CrossingMarking(
            center,
            directionVector,
            world.roadWidth,
            world.roadWidth / 2
        );
    }
}