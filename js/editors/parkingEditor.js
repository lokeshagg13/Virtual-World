class ParkingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new ParkingMarking(
            center,
            directionVector,
            world.roadWidth / 2,
            world.roadWidth / 2
        );
    }
}