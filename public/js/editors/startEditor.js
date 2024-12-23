class StartEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector, isLHT) {
        const startMarking = new StartMarking(
            center,
            directionVector,
            this.world.roadWidth * 0.4,
            this.world.roadWidth / 4,
            isLHT
        );
        const bestBrainString = localStorage.getItem("bestBrain");
        if (bestBrainString) {
            startMarking.car.brain = JSON.parse(bestBrainString);
        }
        return startMarking;
    }
}