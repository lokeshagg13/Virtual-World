class MiniMapEditor {
    constructor() {
        this.minSize = 100;
        this.maxSize = 250;

        this.container = document.getElementById('miniMapContainer');
        this.canvas = document.getElementById('miniMapCanvas');
        this.resizeHandles = document.querySelectorAll('.resize-handle');
        this.miniMap = null;
        this.startX = null;
        this.startY = null;
        this.startWidth = null;
        this.startHeight = null;

        this.container.style.width = this.canvas.width = 200;
        this.container.style.height = this.canvas.height = 200;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
    }

    #addEventListeners() {
        // Binding is required here so that the 'this' within the function body refers 
        // to the Editor instance and not the Event instance.
        this.resizeHandles.forEach((resizeHandle) => {
            resizeHandle.boundMouseDown = this.#handleMouseDown.bind(this);
            resizeHandle.addEventListener("mousedown", resizeHandle.boundMouseDown);
        });
    }

    #removeEventListeners() {
        this.resizeHandles.forEach((resizeHandle) => {
            resizeHandle.removeEventListener("mousedown", resizeHandle.boundMouseDown);
        });
    }

    #handleMouseDown(ev) {
        this.startX = ev.clientX;
        this.startY = ev.clientY;
        this.startWidth = this.container.offsetWidth;
        this.startHeight = this.container.offsetHeight;
        this.boundMouseMove = this.#resize.bind(this);
        this.boundMouseUp = this.#stopResize.bind(this);
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        ev.preventDefault(); // Prevent text selection
    }

    #resize(ev) {
        const dx = ev.clientX - this.startX;
        const dy = ev.clientY - this.startY;

        let newSize = this.canvas.width;

        const handleClass = ev.target.classList;

        if (handleClass.contains('handle-left')) {
            newSize = Math.min(Math.max(this.startWidth - dx, this.minSize), this.maxSize);
        }

        if (handleClass.contains('handle-bottom')) {
            newSize = Math.min(Math.max(this.startHeight + dy, this.minSize), this.maxSize);
        }

        this.container.style.width = `${newSize}px`;
        this.container.style.height = `${newSize}px`;
        this.canvas.width = newSize;
        this.canvas.height = newSize;
    }

    #stopResize() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

}