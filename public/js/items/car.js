class Car {
    constructor(x, y, width, height, angle, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        this.controls = {
            forward: false,
            left: false,
            right: false,
            reverse: false
        };

        this.img = new Image();
        this.img.src = "images/cars/car_white.png";
        this.polygon = []

        this.#addKeyboardListeners();

    }

    #addKeyboardListeners() {
        this.boundKeyDown = this.#handleKeyDown.bind(this);
        this.boundKeyUp = this.#handleKeyUp.bind(this);
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
    }

    #handleKeyDown(ev) {
        switch (ev.key) {
            case "ArrowLeft":
                this.controls.left = true;
                break;
            case "ArrowRight":
                this.controls.right = true;
                break;
            case "ArrowUp":
                this.controls.forward = true;
                break;
            case "ArrowDown":
                this.controls.reverse = true;
                break;
        }
    }

    #handleKeyUp(ev) {
        switch (ev.key) {
            case "ArrowLeft":
                this.controls.left = false;
                break;
            case "ArrowRight":
                this.controls.right = false;
                break;
            case "ArrowUp":
                this.controls.forward = false;
                break;
            case "ArrowDown":
                this.controls.reverse = false;
                break;
        }
    }

    #move(isLHT) {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        let calcAngle = this.angle;
        if (isLHT) {
            calcAngle += Math.PI
        }
        this.x -= Math.sin(calcAngle) * this.speed;
        this.y -= Math.cos(calcAngle) * this.speed;
    }

    update(isLHT) {
        this.#move(isLHT);
    }

    draw(ctx, isLHT = true) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (isLHT) {
            ctx.rotate(-this.angle + Math.PI);
        } else {
            ctx.rotate(-this.angle);
        }

        ctx.drawImage(this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}