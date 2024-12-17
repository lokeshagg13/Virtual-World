class GraphEditor {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selectedPoint = null;
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", (ev) => {
            const mouse = new Point(ev.offsetX, ev.offsetY);
            this.hoveredPoint = getNearestPoint(mouse, this.graph.points, 12);
            if (this.hoveredPoint) {
                this.selectedPoint = this.hoveredPoint;
                return
            }
            this.graph.addPoint(mouse);
            this.selectedPoint = mouse;
        })
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.selectedPoint) {
            this.selectedPoint.draw(this.ctx, { outline: true });
        }
    }
}