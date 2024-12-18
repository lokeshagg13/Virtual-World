class Building {
    constructor(basePolygon, heightCoeff = 0.4) {
        this.base = basePolygon;
        this.heightCoeff = heightCoeff;
    }

    draw(ctx, viewpoint) {
        const ceilingPoints = this.base.points.map((p) => {
            const diff = subtract(p, viewpoint);
            const top = add(p, scale(diff, this.heightCoeff));
            return top
        });
        const ceiling = new Polygon(ceilingPoints);

        const walls = [];
        for (let i = 0; i < this.base.points.length; i++) {
            const nextI = (i + 1) % this.base.points.length;
            const wall = new Polygon([
                this.base.points[i],
                this.base.points[nextI],
                ceilingPoints[nextI],
                ceilingPoints[i]
            ]);
            walls.push(wall);
        }

        // Sort the walls so that the walls far from the viewpoint
        // are drawn first and then the nearer walls to overlap them
        walls.sort(
            (wallA, wallB) => 
                wallB.distanceToPoint(viewpoint) - 
                wallA.distanceToPoint(viewpoint)
        );

        this.base.draw(ctx, { fill: "white", stroke: "#AAA" });
        for (const wall of walls) {
            wall.draw(ctx, { fill: "white", stroke: "#AAA" });
        }
        ceiling.draw(ctx, { fill: "white", stroke: "#AAA" });


    }
}