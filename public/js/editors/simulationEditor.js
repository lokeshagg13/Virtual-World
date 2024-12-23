class SimulationEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.intent = null;
        this.running = false;

        this.numCars = 100

        this.targetSegments = world.laneGuides;
    }

    createMarking(center, directionVector, isLHT) {
        return new StartMarking(
            center,
            directionVector,
            this.world.roadWidth * 0.4,
            this.world.roadWidth / 4,
            isLHT,
            true
        );
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
    }

    #addEventListeners() {
        // Binding is required here so that the 'this' within the function body refers 
        // to the GraphEditor instance and not the Event instance.
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundContextMenu = (ev) => ev.preventDefault();
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseDown(ev) {
        if (ev.button == 0) { // left click
            if (this.intent && !this.running) {
                const bestBrainString = localStorage.getItem("bestBrain");
                for (let i = 0; i < this.numCars; i++) {
                    const startMarking = this.createMarking(
                        this.intent.center,
                        this.intent.directionVector,
                        this.world.isLHT
                    );
                    if (bestBrainString) {
                        startMarking.car.brain = JSON.parse(bestBrainString);
                        if (i != 0) {
                            NeuralNetwork.mutate(startMarking.car.brain, 0.1)
                        }
                    }
                    world.markings.push(startMarking);
                }
                this.running = true;
                this.intent = null;
            }
        }
    }

    #handleMouseMove(ev) {
        if (this.running) {
            return;
        }
        this.hoveredPoint = this.viewport.getCurrentMousePoint(ev, true);
        const nearestSegment = getNearestSegment(
            this.hoveredPoint,
            this.targetSegments,
            12 * this.viewport.zoom
        );
        if (nearestSegment) {
            const projection = nearestSegment.projectPoint(this.hoveredPoint);
            if (projection.offset >= 0 && projection.offset <= 1) {
                this.intent = this.createMarking(
                    projection.point,
                    nearestSegment.directionVector(),
                    this.world.isLHT
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}