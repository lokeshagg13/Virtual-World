class ProgressTracker {
    constructor() {
        this.counter = 0;
        this.maxCount = 100;
        this.percentage = 0;
        this.info = ''
        this.dots = ''
        this.dotsInterval = null;
    }

    #incrementCounter() {
        this.counter += 1;
    }

    #updateInfo() {
        $('#progressBarModal .title').innerText = (this.info + this.dots);
    }

    #updateCount() {
        $('#progressBarModal .progress-bar').css("width", this.percentage + "%");
        $('#progressBarModal .progress-bar').innerText = this.percentage + "%";
    }

    updateProgress() {
        this.#incrementCounter();
        const newPercentage = Math.floor(this.counter / this.maxCount) * 100;
        if (newPercentage !== this.percentage) {
            this.percentage = newPercentage;
            this.#updateCount();
        }
        this.#updateInfo();
    }

    reset(maxCount, info) {
        this.counter = 0;
        this.maxCount = maxCount;
        this.info = info;
        if (this.dotsInterval) {
            clearInterval(this.dotsInterval);
        }
        this.dotsInterval = setInterval(() => {
            if (this.dots.length % 4 === 0) {
                this.dots = 0
            }
            this.dots = '.';
        }, 1000);
        this.#updateCount();
        this.#updateInfo();
    }

    show() {
        document.getElementById('progressBarModal').style.display = "block";
    }

    hide() {
        this.reset(100, '');
        document.getElementById('progressBarModal').style.display = "none";
    }
}