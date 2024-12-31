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
        this.container.style.display = "none";
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
            console.log('happening?')
            resizeHandle.removeEventListener("mousedown", resizeHandle.boundMouseDown);
        });
    }

    #handleMouseDown(ev) {
        console.log('here')
        this.startX = ev.clientX;
        this.startY = ev.clientY;
        this.startWidth = miniMapContainer.offsetWidth;
        this.startHeight = miniMapContainer.offsetHeight;
        this.boundMouseMove = this.#resize.bind(this);
        this.boundMouseUp = this.#stopResize.bind(this);
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        ev.preventDefault(); // Prevent text selection
    }

    #resize(ev) {
        const dx = ev.clientX - this.startX;
        const dy = ev.clientY - this.startY;

        const handleClass = ev.target.classList;

        if (handleClass.contains('handle-left')) {
            const newWidth = Math.min(Math.max(this.startWidth - dx, this.minSize), this.maxSize);
            miniMapContainer.style.width = `${newWidth}px`;
            miniMapCanvas.width = newWidth;
        }

        if (handleClass.contains('handle-bottom')) {
            const newHeight = Math.min(Math.max(this.startHeight + dy, this.minSize), this.maxSize);
            miniMapContainer.style.height = `${newHeight}px`;
            miniMapCanvas.height = newHeight;
        }

        if (handleClass.contains('handle-bottom-left')) {
            const newWidth = Math.min(Math.max(this.startWidth - dx, this.minSize), this.maxSize);
            const newHeight = Math.min(Math.max(this.startHeight + dy, this.minSize), this.maxSize);
            miniMapContainer.style.width = `${newWidth}px`;
            miniMapContainer.style.height = `${newHeight}px`;
            miniMapCanvas.width = newWidth;
            miniMapCanvas.height = newHeight;
        }
    }

    #stopResize() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

    display() {
        this.container.style.display = "block";
    }

}