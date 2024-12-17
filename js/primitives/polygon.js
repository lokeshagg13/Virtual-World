class Polygon {
    constructor(points) {
        this.points = points;
        this.segments = [];
        for (let i = 1; i <= points.length; i++) {
            this.segments.push(
                new Segment(points[i - 1], points[i % points.length])
            );
        }
    }

    static union(polygons) {
        Polygon.multiBreak(polygons);
        const keptSegments = [];
        for (let i = 0; i < polygons.length; i++) {
            for (const segment of polygons[i].segments) {
                let keep = true;
                for (let j = 0; j < polygons.length; j++) {
                    if (i != j) {
                        if (polygons[j].containsSegment(segment)) {
                            keep = false;
                            break;
                        }
                    }
                }
                if (keep) {
                    keptSegments.push(segment);
                }
            }
        }
        return keptSegments;
    }

    static multiBreak(polygons) {
        for (let i = 0; i < polygons.length - 1; i++) {
            for (let j = i + 1; j < polygons.length; j++) {
                Polygon.break(polygons[i], polygons[j])
            }
        }
    }

    static break(polygon1, polygon2) {
        const segments1 = polygon1.segments;
        const segments2 = polygon2.segments;
        for (let i = 0; i < segments1.length; i++) {
            for (let j = 0; j < segments2.length; j++) {
                const intersection = getIntersection(
                    segments1[i].p1, segments1[i].p2, segments2[j].p1, segments2[j].p2
                );

                if (intersection && intersection.offset != 1 && intersection.offset != 0) {
                    const intersectionPoint = new Point(intersection.x, intersection.y)
                    let aux = segments1[i].p2;
                    segments1[i].p2 = intersectionPoint;
                    segments1.splice(i + 1, 0, new Segment(intersectionPoint, aux));
                    aux = segments2[j].p2;
                    segments2[j].p2 = intersectionPoint;
                    segments2.splice(j + 1, 0, new Segment(intersectionPoint, aux));
                }
            }
        }
    }

    containsSegment(segment) {
        // This works because the whole broken segment lies either completely inside or outside the polygon
        const midpoint = average(segment.p1, segment.p2);
        return this.containsPoint(midpoint);
    }

    containsPoint(point) {
        // Based on the property of polygon that if the line segment drawn from outside
        // to the point (to be inspected) intersects the polygon odd number of times, then
        // it means that the latter point lies inside the polygon and vice versa.
        const outerPoint = new Point(-1000, -1000);
        let intersectionCount = 0;
        for (const segment of this.segments) {
            const intersection = getIntersection(outerPoint, point, segment.p1, segment.p2);
            if (intersection) {
                intersectionCount++;
            }
        }
        return intersectionCount % 2 == 1;
    }

    draw(ctx, { stroke = "blue", lineWidth = 2, fill = "rgba(0,0,255,0.3)" } = {}) {
        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 0; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}