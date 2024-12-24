class World {
    constructor(graph) {
        this.graph = graph;
        this.settings = World.loadSettingsFromLocalStorage();

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];
        this.laneGuides = [];

        this.markings = [];
        this.carToFollow = null;

        this.frameCount = 0;

        this.generate();
    }

    static load(info) {
        const world = new World(new Graph());
        world.graph = Graph.load(info.graph);
        world.settings = World.loadSettingsFromLocalStorage();

        world.envelopes = info.envelopes.map(
            (e) => Envelope.load(e)
        );
        world.roadBorders = info.roadBorders.map(
            (rb) => new Segment(
                new Point(
                    rb.p1.x,
                    rb.p1.y
                ), new Point(
                    rb.p2.x,
                    rb.p2.y
                )
            )
        );
        world.buildings = info.buildings.map(
            (b) => Building.load(b)
        );
        world.trees = info.trees.map(
            (t) => Tree.load(t)
        );
        world.laneGuides = info.laneGuides.map(
            (lg) => new Segment(
                new Point(
                    lg.p1.x,
                    lg.p1.y
                ), new Point(
                    lg.p2.x,
                    lg.p2.y
                )
            )
        );
        world.markings = info.markings.map(
            (m) => Marking.load(m)
        );
        world.zoom = info.zoom;
        world.offset = info.offset;
        return world;
    }

    save() {
        localStorage.setItem("world", JSON.stringify(this));
    }

    static loadSettingsFromLocalStorage() {
        const worldSettingsString = localStorage.getItem("settings");
        const worldSettingsObj = worldSettingsString
            ? JSON.parse(worldSettingsString)
            : null;
        const worldSettings = worldSettingsObj
            ? Settings.load(worldSettingsObj)
            : new Settings();
        worldSettings.save();
        return worldSettings;
    }

    generate() {
        this.envelopes.length = 0;

        for (const segment of this.graph.segments) {
            this.envelopes.push(
                new Envelope(segment, this.settings.roadWidth, this.settings.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((envelop) => envelop.polygon));
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();

        this.laneGuides.length = 0;
        this.laneGuides.push(...this.#generateLaneGuides());
    }

    changeTrafficSide(isLHT) {
        this.settings.isLHT = isLHT;
        this.settings.save();
        this.markings.length = 0;
    }

    #generateLaneGuides() {
        const tmpEnvelopes = [];
        for (const segment of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    segment,
                    this.settings.roadWidth / 2,
                    this.settings.roadRoundness
                )
            );
        }
        const segments = Polygon.union(tmpEnvelopes.map((e) => e.polygon));
        return segments;
    }

    #generateTrees() {
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];
        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        const illegalPolygons = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.polygon)
        ];

        const trees = [];
        let tryCount = 0;
        while (tryCount < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );

            // Check if tree is inside or nearby building or road
            let keep = true;
            for (const polygon of illegalPolygons) {
                if (polygon.containsPoint(p) ||
                    polygon.distanceToPoint(p) < this.settings.treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            // Check if tree is too close to other trees
            if (keep) {
                for (const tree of trees) {
                    if (distance(tree.center, p) < this.settings.treeSize) {
                        keep = false;
                        break
                    }
                }
            }

            // Check if tree is in the middle of nowhere
            if (keep) {
                let closeToSomething = false;
                for (const polygon of illegalPolygons) {
                    if (polygon.distanceToPoint(p) < this.settings.treeSize * 2) {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething
            }

            if (keep) {
                trees.push(new Tree(p, this.settings.treeSize, this.settings.treeHeight));
                tryCount = 0;
            }
            tryCount++;
        }
        return trees;
    }

    #generateBuildings() {
        // Creating building region envelopes
        const tmpEnvelopes = [];
        for (const segment of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    segment,
                    this.settings.roadWidth + this.settings.buildingWidth + this.settings.spacing * 2,
                    this.settings.roadRoundness
                )
            );
        }

        const guides = Polygon.union(tmpEnvelopes.map((e) => e.polygon));
        const buildingSuitableGuides = guides.filter((segment) => (segment.length() > this.settings.buildingMinLength));

        // Creating supports for buildings using the buildings
        const buildingSupports = [];
        for (let segment of buildingSuitableGuides) {
            const length = segment.length() + this.settings.spacing;
            const buildingCount = Math.floor(
                length / (this.settings.buildingMinLength + this.settings.spacing)
            );
            const buildingLength = length / buildingCount - this.settings.spacing;

            const direction = segment.directionVector();

            let q1 = segment.p1;
            let q2 = add(q1, scale(direction, buildingLength));
            buildingSupports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(direction, this.settings.spacing));
                q2 = add(q1, scale(direction, buildingLength));
                buildingSupports.push(new Segment(q1, q2));
            }
        }

        // Creating rectangular bases for buildings using the supports
        const buildingBases = [];
        for (let segment of buildingSupports) {
            buildingBases.push(new Envelope(segment, this.settings.buildingWidth).polygon);
        }

        // Removing any overlapping building bases
        const eps = 0.001;
        for (let i = 0; i < buildingBases.length - 1; i++) {
            for (let j = i + 1; j < buildingBases.length; j++) {
                if (
                    buildingBases[i].intersectsPolygon(buildingBases[j]) ||
                    buildingBases[i].distanceToPolygon(buildingBases[j]) < this.settings.spacing - eps
                ) {
                    buildingBases.splice(j, 1);
                    j--;
                }
            }
        }

        return buildingBases.map((base) => new Building(base));
    }

    // Intersections are graph points with two or more intersecting segments (or roads)
    #getRoadIntersections() {
        const subset = [];
        for (const point of this.graph.points) {
            let degree = 0;
            for (const segment of this.graph.segments) {
                if (segment.includes(point)) {
                    degree++
                }
            }

            if (degree >= 2) {
                subset.push(point);
            }
        }
        return subset;
    }

    #updateTrafficLights() {
        const trafficLights = this.markings.filter((m) => m instanceof TrafficLightMarking);
        // Each road intersection has one corresponding control center and 
        // a traffic light is linked to its nearest control center.
        const controlCenters = [];
        for (const trafficLight of trafficLights) {
            // For each traffic light, get the nearest road intersection
            const nearestIntersectionPoint = getNearestPoint(trafficLight.center, this.#getRoadIntersections());
            if (!nearestIntersectionPoint) continue;
            let controlCenter = controlCenters.find((c) => c.equals(nearestIntersectionPoint));
            if (!controlCenter) {
                controlCenter = new Point(
                    nearestIntersectionPoint.x,
                    nearestIntersectionPoint.y
                );
                controlCenter.trafficLights = [trafficLight];
                controlCenters.push(controlCenter);
            } else {
                controlCenter.trafficLights.push(trafficLight);
            }
        }

        const greenDuration = 2, yellowDuration = 1;
        for (const controlCenter of controlCenters) {
            controlCenter.ticks = controlCenter.trafficLights.length * (greenDuration + yellowDuration);
        }
        const tick = Math.floor(this.frameCount / 60);
        for (const controlCenter of controlCenters) {
            const cTick = tick % controlCenter.ticks;
            // greenYellowIndex means the index of traffic light that must be activated
            // at the current tick of the control center
            const greenYellowIndex = Math.floor(
                cTick / (greenDuration + yellowDuration)
            );
            const greenYellowState =
                cTick % (greenDuration + yellowDuration) < greenDuration
                    ? "green"
                    : "yellow";
            for (let i = 0; i < controlCenter.trafficLights.length; i++) {
                if (i == greenYellowIndex) {
                    controlCenter.trafficLights[i].state = greenYellowState;
                } else {
                    controlCenter.trafficLights[i].state = "red";
                }
            }
        }
        this.frameCount++
    }

    #updateCars() {
        const cars = this.markings.filter((marking) => marking instanceof StartMarking).map((marking) => marking.car);
        for (const car of cars) {
            car.update(this.roadBorders);
        }
        this.carToFollow = cars.find(
            car => car.fitness === (Math.max(
                ...cars.map(c => c.fitness))
            )
        );
    }

    #removeDisconnectedMarkings() {
        for (let i = 0; i < this.markings.length; i++) {
            const markingCenter = this.markings[i].center;
            let isDisconnected = true;
            for (const envelope of this.envelopes) {
                if (envelope.polygon.containsPoint(markingCenter)) {
                    isDisconnected = false;
                    break;
                }
            }
            if (isDisconnected) {
                this.markings.splice(i, 1);
                i--;
            }
        }
    }

    draw(ctx, viewpoint) {
        this.#removeDisconnectedMarkings();
        this.#updateTrafficLights();
        this.#updateCars();

        // Road Paths
        for (const envelope of this.envelopes) {
            envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        // Road Dividers
        for (const segment of this.graph.segments) {
            segment.draw(ctx, { color: "#FFF", width: 4, dash: [10, 10] });
        }
        // Road Borders
        for (const segment of this.roadBorders) {
            segment.draw(ctx, { color: "#FFF", width: 4 });
        }
        // Road Markings
        for (const marking of this.markings) {
            marking.draw(ctx);
        }

        // Buildings & Trees
        const items = [...this.buildings, ...this.trees];
        // Sort buildings and trees so that the items far from the 
        // viewpoint are drawn first and then the nearer walls 
        // to overlap them
        items.sort(
            (a, b) =>
                b.base.distanceToPoint(viewpoint) -
                a.base.distanceToPoint(viewpoint)
        );

        for (const item of items) {
            item.draw(ctx, viewpoint);
        }
    }
}