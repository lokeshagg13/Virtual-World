class GraphEditor {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.hoveredPoint = null;
        this.selectedPoint = null;
        this.nearestPoint = null;
        this.dragging = false;

        this.#addEventListeners();
    }

    #addEventListeners() {
        // Binding is required here so that the 'this' within the function body refers 
        // to the GraphEditor instance and not the Event instance.
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this))
        this.canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());
        this.canvas.addEventListener("mouseup", () => this.dragging = false);
    }

    #handleMouseDown(ev) {
        if (ev.button == 2) {  // Right click
            if (this.selectedPoint) {
                this.selectedPoint = null;
            } 
            else if (this.nearestPoint) {
                this.#removePoint(this.nearestPoint)
            }
        }
        if (ev.button == 0) {   // Left click
            // If clicked on an existing point
            if (this.nearestPoint) {
                this.#select(this.nearestPoint);
                this.dragging = true;
                return
            }
            // Else adding a new point to the graph and selecting it
            this.graph.addPoint(this.hoveredPoint);
            this.#select(this.hoveredPoint);
            this.nearestPoint = this.hoveredPoint;
        }
    }

    #handleMouseMove(ev) {
        this.hoveredPoint = new Point(ev.offsetX, ev.offsetY);
        this.nearestPoint = getNearestPoint(this.hoveredPoint, this.graph.points, 12);
        if (this.dragging) {
            this.selectedPoint.x = this.hoveredPoint.x;
            this.selectedPoint.y = this.hoveredPoint.y;
        }
    }

    #select(point) {
        if (this.selectedPoint) {
            this.graph.tryAddSegment(new Segment(this.selectedPoint, point));
        }
        this.selectedPoint = point;
    }

    // This method is made separately since the point is still visible after it is removed
    // as the selectedPoint and nearestPoint are still not set as null
    #removePoint(point) {
        this.graph.removePoint(point);
        this.nearestPoint = null;
        if (this.selectedPoint == point) {
            this.selectedPoint = null;
        }
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.nearestPoint) {
            this.nearestPoint.draw(this.ctx, { fill: true })
        }
        if (this.selectedPoint) {
            const intent = this.nearestPoint ? this.nearestPoint : this.hoveredPoint;
            if (!this.nearestPoint) {
                new Point(intent.x, intent.y).draw(ctx, { opacity: 0.5 });
            }
            new Segment(this.selectedPoint, intent).draw(ctx, { dash: [3, 3] });
            this.selectedPoint.draw(this.ctx, { outline: true });
        }
    }
}