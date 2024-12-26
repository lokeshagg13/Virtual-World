myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;
let world = worldInfo
    ? World.load(worldInfo)
    : new World(new Graph());
const graph = world.graph;
let oldGraphHash = graph.hash();

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

addEventListeners();
setMode("graph");
animate();

function animate() {
    viewport.reset();
    if (world.graph.hash() != oldGraphHash) {
        showLoadingModal();
        world.generate();
        hideLoadingModal();
        viewport.setOffset(world.graph.getCenter());
        oldGraphHash = world.graph.hash();
    }
    if (world.carToFollow) {
        viewport.setOffset(world.carToFollow.center);
    }
    const viewpoint = scale(viewport.getOffset(), -1);
    const renderRadius = viewport.getScreenRadius();

    world.draw(ctx, viewpoint, renderRadius);

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

    world.save();
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
            const loadedWorld = data.world;
            world = World.load(loadedWorld); // Load the world data
            world.save();
            document.getElementById("loadWorldModal").style.display = "none";
            showLoadingModal();
            setTimeout(() => {
                location.reload();
                hideLoadingModal();
            }, 3000);
        })
        .catch((error) => {
            console.error("Error loading world:", error);
            document.getElementById("loadWorldModal").style.display = "none";
            showErrorModal("Error loading the world.");
        });
}

function loadWorldFromOSM() {
    const osmDataContainer = document.getElementById('osmDataInput');
    if (osmDataContainer.value === "") {
        showTooltip('osmDataInput');
        return;
    }
    const osmParsedData = OSM.parseRoads(JSON.parse(osmDataContainer.value));
    if (osmParsedData.error) {
        showErrorModal(osmParsedData.message);
        return;
    }

    world.graph.points = osmParsedData.points;
    world.graph.segments = osmParsedData.segments;
    hideLoadWorldModal();
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

let isTrafficSideChangedConfirmed = false;

function showTrafficSideChangeConfirmationModal() {
    document.getElementById("trafficSideChangeModal").style.display =
        "flex";
}

function confirmTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
    isTrafficSideChangedConfirmed = true;
    world.markings.length = 0;
    saveSettings();
}

function cancelTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
    isTrafficSideChangedConfirmed = false;
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

function showLoadWorldModal() {
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
            document.getElementById("loadWorldModal").style.display = "flex";
        })
        .catch((error) => {
            console.error("Error fetching worlds:", error);
            showErrorModal("Error fetching the saved worlds.");
        });
}

function hideLoadWorldModal() {
    document.getElementById("loadWorldModal").style.display = "none";
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

let tooltipTimeout;
let tempSettings = JSON.parse(JSON.stringify(world.settings));

function addEventListeners() {
    $('#trafficToggle').change((ev) => {
        tempSettings.isLHT = !ev.target.checked;
    });

    document
        .getElementById("roadWidth")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("roadWidth").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("roadWidth").value = tempSettings.roadWidth;
                showTooltip('roadWidth');
                return;
            }
            tempSettings.roadWidth = value;
        });

    document
        .getElementById("buildingWidth")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingWidth").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingWidth").value = tempSettings.buildingWidth;
                showTooltip('buildingWidth');
                return;
            }
            tempSettings.buildingWidth = value;
        });

    document
        .getElementById("buildingMinLength")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingMinLength").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingMinLength").value = tempSettings.buildingMinLength;
                showTooltip('buildingMinLength');
                return;
            }
            tempSettings.buildingMinLength = value;
        });

    document
        .getElementById("spacing")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("spacing").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("spacing").value = tempSettings.spacing;
                showTooltip('spacing');
                return;
            }
            tempSettings.spacing = value;
        });

    document
        .getElementById("treeSize")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeSize").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeSize").value = tempSettings.treeSize;
                showTooltip('treeSize');
                return;
            }
            tempSettings.treeSize = value;
        });

    document
        .getElementById("treeHeight")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeHeight").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeHeight").value = tempSettings.treeHeight;
                showTooltip('treeHeight');
                return;
            }
            tempSettings.treeHeight = value;
        });

    document
        .getElementById("carMaxSpeed")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("carMaxSpeed").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("carMaxSpeed").value = tempSettings.carMaxSpeed;
                showTooltip('carMaxSpeed');
                return;
            }
            tempSettings.carMaxSpeed = value;
        });

    document
        .getElementById("carAcceleration")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("carAcceleration").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-'].includes(ev.data)) {
                document.getElementById("carAcceleration").value = tempSettings.carAcceleration;
                showTooltip('carAcceleration');
                return;
            }
            tempSettings.carAcceleration = value;
        });

    document
        .getElementById("simulationNumCars")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationNumCars").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showTooltip('simulationNumCars');
                return;
            }
            if (parseInt(value, 10) < 1) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showTooltip('simulationNumCars');
                return;
            }
            tempSettings.simulationNumCars = value;
        });

    document
        .getElementById("simulationDiffFactor")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationDiffFactor").value;
            console.log(value)
            if (value === "" && ev.data === null) {
                console.log('1' + value)
                return;
            }
            if (['+', '-'].includes(ev.data)) {
                console.log('2' + ev.data)
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showTooltip('simulationDiffFactor');
                return;
            }
            if (parseFloat(value, 10) < 0 || parseFloat(value, 10) > 1) {
                console.log('3' + value)
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showTooltip('simulationDiffFactor');
                return;
            }
            tempSettings.simulationDiffFactor = value || 0.1;
        });

    document
        .getElementById("sensorRayCount")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("sensorRayCount").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("sensorRayCount").value = tempSettings.sensorRayCount;
                showTooltip('sensorRayCount');
                return;
            }
            tempSettings.sensorRayCount = value;
        });

    document
        .getElementById("sensorRayLength")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("sensorRayLength").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("sensorRayLength").value = tempSettings.sensorRayLength;
                showTooltip('sensorRayLength');
                return;
            }
            tempSettings.sensorRayLength = value;
        });
}

function showTooltip(inputId) {
    clearTimeout(tooltipTimeout);
    $('#' + inputId).popover('show');
    tooltipTimeout = setTimeout((id) => hideTooltip(id), 3000, inputId);
}

function hideTooltip(inputId) {
    $('#' + inputId).popover('hide')
}

function showErrorMessage(inputId) {
    document.getElementById(inputId + 'Error').style.display = 'block';
}

function hideErrorMessages() {
    const selectors = [...document.querySelectorAll('#settingsModal small.error-message')];
    for (let i = 0; i < selectors.length; i++) {
        selectors[i].style.display = 'none';
    }
}

function loadSettingsIntoDisplay() {
    // Reset World Section
    document.getElementById("roadWidth").value = world.settings.roadWidth;
    document.getElementById("buildingWidth").value = world.settings.buildingWidth;
    document.getElementById("buildingMinLength").value = world.settings.buildingMinLength;
    document.getElementById("spacing").value = world.settings.spacing;
    document.getElementById("treeSize").value = world.settings.treeSize;
    document.getElementById("treeHeight").value = world.settings.treeHeight;
    $("#trafficToggle").bootstrapToggle(world.settings.isLHT ? 'off' : 'on');

    // Reset Cars Section
    document.getElementById("carMaxSpeed").value = world.settings.carMaxSpeed; // Medium
    document.getElementById("carAcceleration").value = world.settings.carAcceleration; // Medium

    // Reset Simulation Section
    document.getElementById("simulationNumCars").value = world.settings.simulationNumCars;
    document.getElementById("simulationDiffFactor").value = world.settings.simulationDiffFactor;

    // Reset Sensors Section
    document.getElementById("sensorRayCount").value = world.settings.sensorRayCount;
    document.getElementById("sensorRaySpread").value = convertRadiansToDegrees(
        world.settings.sensorRaySpread
    ); // 90º
    document.getElementById("sensorRayLength").value = world.settings.sensorRayLength;
    document.getElementById("showSensors").checked = world.settings.showSensors;

    // Reset Brain Section
    document.getElementById("brainComplexity").value = world.settings.brainComplexity; // Low
}

function areValidSettings(settings) {
    let valid = true;
    if (!settings.roadWidth || (settings.roadWidth < 100 || settings.roadWidth > 500)) {
        showErrorMessage('roadWidth')
        valid = false;
    }
    if (!settings.buildingWidth || (settings.buildingWidth < 50 || settings.buildingWidth > 200)) {
        showErrorMessage('buildingWidth')
        valid = false;
    }
    if (!settings.buildingMinLength || (settings.buildingMinLength < 50 || settings.buildingMinLength > 150)) {
        showErrorMessage('buildingMinLength')
        valid = false;
    }
    if (!settings.spacing || (settings.spacing < 0 || settings.spacing > 100)) {
        showErrorMessage('spacing')
        valid = false;
    }
    if (!settings.treeSize || (settings.treeSize < 100 || settings.treeSize > 200)) {
        showErrorMessage('treeSize')
        valid = false;
    }
    if (!settings.treeHeight || (settings.treeHeight < 100 || settings.treeHeight > 300)) {
        showErrorMessage('treeHeight')
        valid = false;
    }
    if (!settings.simulationNumCars || settings.simulationNumCars < 1) {
        showErrorMessage('simulationNumCars')
        valid = false;
    }
    if (!settings.simulationDiffFactor || (settings.simulationDiffFactor < 0 || settings.simulationDiffFactor > 1)) {
        showErrorMessage('simulationDiffFactor')
        valid = false;
    }
    if (!settings.sensorRayCount || (settings.sensorRayCount < 1 || settings.sensorRayCount > 100)) {
        showErrorMessage('sensorRayCount')
        valid = false;
    }
    if (!settings.sensorRayLength || (settings.sensorRayLength < 50 || settings.sensorRayLength > 200)) {
        showErrorMessage('sensorRayLength')
        valid = false;
    }
    return valid;
}

function saveSettings() {
    hideErrorMessages();

    if (!isTrafficSideChangedConfirmed) {
        if (tempSettings.isLHT !== world.settings.isLHT) {
            showTrafficSideChangeConfirmationModal();
            return;
        }
    } else {
        isTrafficSideChangedConfirmed = false;
    }

    const worldSettingsObj = world.settings.convertValuesToDisplay();

    // Save World Section
    worldSettingsObj.roadWidth = document.getElementById("roadWidth").value;
    worldSettingsObj.buildingWidth = document.getElementById("buildingWidth").value;
    worldSettingsObj.buildingMinLength = document.getElementById("buildingMinLength").value;
    worldSettingsObj.spacing = document.getElementById("spacing").value;
    worldSettingsObj.treeSize = document.getElementById("treeSize").value;
    worldSettingsObj.treeHeight = document.getElementById("treeHeight").value;
    worldSettingsObj.isLHT = !document.getElementById("trafficToggle").checked;

    // Save Cars Section
    worldSettingsObj.carMaxSpeed = document.getElementById("carMaxSpeed").value; // Medium
    worldSettingsObj.carAcceleration = document.getElementById("carAcceleration").value; // Medium

    // Save Simulation Section
    worldSettingsObj.simulationNumCars = document.getElementById("simulationNumCars").value;
    worldSettingsObj.simulationDiffFactor = document.getElementById("simulationDiffFactor").value;

    // Save Sensors Section
    worldSettingsObj.sensorRayCount = document.getElementById("sensorRayCount").value;
    worldSettingsObj.sensorRaySpread = convertDegreesToRadians(
        document.getElementById("sensorRaySpread").value
    ); // 90º
    worldSettingsObj.sensorRayLength = document.getElementById("sensorRayLength").value;
    worldSettingsObj.showSensors = document.getElementById("showSensors").checked;

    // Save Brain Section
    worldSettingsObj.brainComplexity = document.getElementById("brainComplexity").value; // Low

    const newSettings = Settings.load(worldSettingsObj);
    if (areValidSettings(newSettings)) {
        world.settings = newSettings;
        world.settings.save();
        world.generate();
        showSaveConfirmationModal('Settings saved successfully');
        loadSettingsIntoDisplay();
    }
}

function resetSettings() {
    hideErrorMessages();
    world.settings.reset();
    world.settings.save();
    loadSettingsIntoDisplay();
}

function showSettingsModal() {
    loadSettingsIntoDisplay();
    document.getElementById("settingsModal").style.display = "block";
    hideErrorMessages();
}

function hideSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
    hideErrorMessages();
}