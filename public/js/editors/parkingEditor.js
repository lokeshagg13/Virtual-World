class ParkingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector, isLHT) {
        return new ParkingMarking(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2, 
            isLHT
        );
    }
}