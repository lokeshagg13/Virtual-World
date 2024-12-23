myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;
let world = worldInfo
    ? World.load(worldInfo)
    : new World(new Graph(), true);
const graph = world.graph;

const viewport = new Viewport(myCanvas, world.zoom, world.offset);
const tools = {
    graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
    simulation: {
        button: simulationBtn,
        editor: new SimulationEditor(viewport, world),
    },
    start: { button: startBtn, editor: new StartEditor(viewport, world) },
    stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
    yield: { button: yieldBtn, editor: new YieldEditor(viewport, world) },
    crossing: {
        button: crossingBtn,
        editor: new CrossingEditor(viewport, world),
    },
    parking: {
        button: parkingBtn,
        editor: new ParkingEditor(viewport, world),
    },
    target: {
        button: targetBtn,
        editor: new TargetEditor(viewport, world),
    },
    trafficLight: {
        button: trafficLightBtn,
        editor: new TrafficLightEditor(viewport, world),
    },
};
let oldGraphHash = graph.hash();

setMode("graph");
animate();

let pendingTrafficSideChange = false;
document
    .getElementById("trafficToggle")
    .addEventListener("change", (ev) => {
        ev.target.checked = !ev.target.checked; // Prevent immediate change
        pendingTrafficSideChange = ev.target.checked;
        showTrafficSideChangeConfirmationModal();
    });

function animate() {
    viewport.reset();
    if (graph.hash() != oldGraphHash) {
        world.generate();
        oldGraphHash = graph.hash();
    }
    if (world.carToFollow) {
        viewport.setOffset(world.carToFollow.center);
    }
    const viewpoint = scale(viewport.getOffset(), -1);
    world.draw(ctx, viewpoint);
    ctx.globalAlpha = 0.3;
    for (const tool of Object.values(tools)) {
        tool.editor.display();
    }
    requestAnimationFrame(animate);
}

function disposeEverything() {
    tools["graph"].editor.dispose();
    world.markings.length = 0;
}

function disposeMarkings() {
    world.markings.length = 0;
}

function saveWorldData() {
    world.zoom = viewport.zoom;
    world.offset = viewport.offset;
    world.screenshot = myCanvas.toDataURL("image/png");
    // Send the API request
    fetch("http://localhost:3000/api/save-world", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            world,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to save world");
                });
            }
            return response.json();
        })
        .then((data) => {
            showSaveConfirmationModal("World saved successfully.");
        })
        .catch((error) => {
            console.error("Error saving world:", error);
            showErrorModal("Error saving the world.");
        });

    localStorage.setItem("world", JSON.stringify(world));
}

function loadWorldData(worldId) {
    fetch(`http://localhost:3000/api/load-world/${worldId}`, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to fetch worlds");
                });
            }
            return response.json();
        })
        .then((data) => {
            const selectedWorld = data.world;
            world = World.load(selectedWorld); // Load the world data
            localStorage.setItem("world", JSON.stringify(world));
            document.getElementById("selectWorldModal").style.display = "none";
            showLoadingModal();
            setTimeout(() => {
                location.reload();
                hideLoadingModal();
            }, 3000);
        })
        .catch((error) => {
            console.error("Error loading world:", error);
            document.getElementById("selectWorldModal").style.display = "none";
            showErrorModal("Error loading the world.");
        });
}

function setMode(mode) {
    disableEditors();
    tools[mode].button.style.backgroundColor = "white";
    tools[mode].button.style.filter = "";
    tools[mode].editor.enable();
    if (mode == "simulation") {
        saveSimulationBtn.style.display = "inline-block";
        resetSimulationBtn.style.display = "inline-block";
    }
}

function disableEditors() {
    for (const tool of Object.values(tools)) {
        tool.button.style.backgroundColor = "gray";
        tool.button.style.filter = "grayscale(100%)";
        saveSimulationBtn.style.display = "none";
        resetSimulationBtn.style.display = "none";
        tool.editor.disable();
    }
}

function showTrafficSideChangeConfirmationModal() {
    document.getElementById("trafficSideChangeModal").style.display =
        "flex";
}

function confirmTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
    document.getElementById("trafficToggle").checked =
        !pendingTrafficSideChange;
    world.changeTrafficSide(pendingTrafficSideChange);
}

function cancelTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
}

function showSaveConfirmationModal(message) {
    document.getElementById("saveConfirmationModal").style.display = "flex";
    document.querySelector("#saveConfirmationModal .modal-body").innerHTML =
        "<p>" + message + "</p>";;
}

function hideSaveConfirmationModal() {
    document.getElementById("saveConfirmationModal").style.display = "none";
}

function showErrorModal(message) {
    document.querySelector("#errorModal .modal-body").innerHTML =
        "<p>" + message + "</p>";
    document.getElementById("errorModal").style.display = "flex";
}

function hideErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

function showLoadingModal() {
    document.getElementById("loadingModal").style.display = "flex";
}

function hideLoadingModal() {
    document.getElementById("loadingModal").style.display = "none";
}

function showSelectWorldModal() {
    // Fetch the list of worlds from the server
    fetch("http://localhost:3000/api/get-worlds", {
        method: "POST",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to fetch worlds");
                });
            }
            return response.json();
        })
        .then((data) => {
            const worldListContainer = document.getElementById("worldList");
            worldListContainer.innerHTML = ""; // Clear existing content

            if (data.worlds && data.worlds.length > 0) {
                data.worlds.forEach((world) => {
                    // Create elements to display the world
                    const worldItem = document.createElement("div");
                    worldItem.classList.add("world-item");
                    worldItem.innerHTML = `
                  <img src="${world.screenshot}" alt="World ${world.id}" />
                  <h4>World ${world.id}</h4>
                `;

                    // Add event listener to handle world selection
                    worldItem.addEventListener("click", () => {
                        loadWorldData(world.id);
                    });

                    // Append the world item to the container
                    worldListContainer.appendChild(worldItem);
                });
            } else {
                worldListContainer.innerHTML = "<p>No saved worlds found.</p>";
            }
            document.getElementById("selectWorldModal").style.display = "flex";
        })
        .catch((error) => {
            console.error("Error fetching worlds:", error);
            showErrorModal("Error fetching the saved worlds.");
        });
}

function hideSelectWorldModal() {
    document.getElementById("selectWorldModal").style.display = "none";
}

function saveSimulationResult() {
    if (world.carToFollow && world.carToFollow.brain) {
        localStorage.setItem("bestBrain", JSON.stringify(world.carToFollow.brain));
        showSaveConfirmationModal("Simulation saved successfully.");
        // Remove all simulation cars
        resetSimulation();
    }
}

function resetSimulation() {
    // Remove all simulation cars
    world.markings = world.markings.filter((m) => {
        if (!(m instanceof StartMarking)) {
            return true;
        }
        return !m.car.isSimulation;
    });
    tools["simulation"].editor.running = false;
}