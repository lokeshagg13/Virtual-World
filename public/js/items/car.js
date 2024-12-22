class Car {
    constructor(x, y, width, height, angle, color = "blue", maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.angle = angle;
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        this.controls = new Controls();
        this.img = new Image();
        this.img.src = "images/cars/car_white.png";
        this.polygon = []

        // this.mask = document.createElement("canvas");
        // this.mask.width = width;
        // this.mask.height = height;

        // const maskCtx = this.mask.getContext("2d");
        // this.img.onload = () => {
        //     maskCtx.fillStyle = color;
        //     maskCtx.rect(0, 0, this.width, this.height);
        //     maskCtx.fill();

        //     maskCtx.globalCompositeOperation = "destination-atop";
        //     maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        // }
    }

    update() {
        this.#move();
    }

    #move() {
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

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, isLHT = true) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (isLHT) {
            ctx.rotate(this.angle + Math.PI / 2);
        } else {
            ctx.rotate(this.angle - Math.PI / 2);
        }
        // ctx.drawImage(this.mask,
        //     -this.width / 2,
        //     -this.height / 2,
        //     this.width,
        //     this.height
        // );
        // ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}