class World {
    constructor(graph,
        roadWidth = 100,
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];

        this.generate();
    }

    generate() {
        this.envelopes.length = 0;

        for (const segment of this.graph.segments) {
            this.envelopes.push(
                new Envelope(segment, this.roadWidth, this.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((envelop) => envelop.polygon));
        this.buildings = this.#generateBuildings();
    }

    #generateBuildings() {
        // Creating building region envelopes
        const tmpEnvelopes = [];
        for (const segment of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    segment,
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoundness
                )
            );
        }

        const guides = Polygon.union(tmpEnvelopes.map((e) => e.polygon));
        const buildingSuitableGuides = guides.filter((segment) => (segment.length() > this.buildingMinLength));

        // Creating supports for buildings using the buildings
        const buildingSupports = [];
        for (let segment of buildingSuitableGuides) {
            const length = segment.length() + this.spacing;
            const buildingCount = Math.floor(
                length / (this.buildingMinLength + this.spacing)
            );
            const buildingLength = length / buildingCount - this.spacing;

            const direction = segment.directionVector();

            let q1 = segment.p1;
            let q2 = add(q1, scale(direction, buildingLength));
            buildingSupports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(direction, this.spacing));
                q2 = add(q1, scale(direction, buildingLength));
                buildingSupports.push(new Segment(q1, q2));
            }
        }

        // Creating rectangular bases for buildings using the supports
        const buildingBases = [];
        for (let segment of buildingSupports) {
            buildingBases.push(new Envelope(segment, this.buildingWidth).polygon);
        }

        // Removing any overlapping building bases
        for (let i = 0; i < buildingBases.length - 1; i++) {
            for (let j = i + 1; j < buildingBases.length; j++) {
                if (buildingBases[i].intersectsPolygon(buildingBases[j])) {
                    buildingBases.splice(j, 1);
                    j--;
                }
            }
        }

        return buildingBases;
    }

    draw(ctx) {

        // Road Paths
        for (const envelope of this.envelopes) {
            envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        // Road Markings
        for (const segment of this.graph.segments) {
            segment.draw(ctx, { color: "#FFF", width: 4, dash: [10, 10] });
        }
        // Road Borders
        for (const segment of this.roadBorders) {
            segment.draw(ctx, { color: "#FFF", width: 4 });
        }

        // Buildings
        for (const building of this.buildings) {
            building.draw(ctx)
        }


    }
}