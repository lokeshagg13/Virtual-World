class MiniMap {
    constructor(editor, graph) {
        this.editor = editor;
        this.graph = graph;
        this.visible = false;
        this.minimized = false;
        this.ctx = editor.canvas.getContext("2d");
    }

    load(graph) {
        this.graph = graph;
        return this;
    }

    show() {
        this.visible = true;
        this.editor.container.style.display = "block";
        this.editor.enable();
    }

    hide() {
        this.editor.disable();
        this.editor.container.style.display = "none";
        this.visible = false;
    }

    minimize() {
        this.minimized = true;
        this.editor.container.querySelector('#maximizeMiniMapBtn').style.display = 'block';
        this.editor.container.querySelector('#maximizedMapContent').style.display = 'none';
    }

    maximize() {
        this.minimized = false;
        this.editor.container.querySelector('#maximizeMiniMapBtn').style.display = 'none';
        this.editor.container.querySelector('#maximizedMapContent').style.display = 'block';

    }

    draw(viewpoint) {
        if (this.visible && !this.minimized) {
            const { width, height } = this.editor.canvas;
            this.ctx.clearRect(0, 0, width, height);

            const scaler = 0.05;
            const scaledViewpoint = scale(viewpoint, -scaler);
            this.ctx.save();
            this.ctx.translate(
                scaledViewpoint.x + width / 2,
                scaledViewpoint.y + height / 2
            );
            this.ctx.scale(scaler, scaler);
            for (const segment of this.graph.segments) {
                segment.draw(this.ctx, { width: 3 / scaler, color: "white" });
            }
            this.ctx.restore();
            new Point(width / 2, height / 2)
                .draw(this.ctx, { color: "blue", outline: true });
        }
    }
}