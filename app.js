const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Serve Frontend
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); // Move index.html to "public" directory
});

// API Endpoints

const worldJSONPath = path.join(__dirname, 'db', 'worlds.json');
if (!fs.existsSync(worldJSONPath)) {
    fs.writeFileSync(worldJSONPath, '');
}
const worldScreenshotsFolderPath = path.join(__dirname, 'db', 'screenshots');
if (!fs.existsSync(worldScreenshotsFolderPath)) {
    fs.mkdirSync(worldScreenshotsFolderPath);
}

// Save "world" string to the database
app.post('/api/save-world', async (req, res) => {
    try {
        const { world: worldToSave } = req.body;
        if (!worldToSave) {
            return res.status(400).json({ error: 'worldString is required' });
        }

        // Read world data json file
        let worldDataString = fs.readFileSync(worldJSONPath, 'utf8');
        const worlds = worldDataString !== '' ? JSON.parse(worldDataString) : [];
        worldToSave.id = worlds.length;

        // Save screenshot file
        const base64Data = worldToSave.screenshot.replace(/^data:image\/png;base64,/, '');
        const screenshotPath = path.join(worldScreenshotsFolderPath, 'World_' + worldToSave.id + '.png')
        fs.writeFileSync(screenshotPath, base64Data, 'base64');

        // Add textual data to the json file
        worlds.push(worldToSave);
        fs.writeFileSync(worldJSONPath, JSON.stringify(worlds, '', 4))

        res.status(201).json({ message: 'World saved successfully', data: worldToSave });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.post('/api/get-worlds', async (req, res) => {
    try {
        let worldDataString = fs.readFileSync(path.join(__dirname, 'db', 'worlds.json'));
        const worlds = worldDataString ? JSON.parse(worldDataString) : [];
        res.json({ message: 'World strings retrieved successfully', data: worldData });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
})

// Load the "world" string from the database
app.get('/api/load-world', async (req, res) => {
    try {
        let worldDataString = fs.readFileSync(path.join(__dirname, 'db', 'worlds.json'));
        const worlds = worldDataString ? JSON.parse(worldDataString) : [];

        if (worlds.length === 0) {
            return res.status(404).json({ error: 'No saved worlds.' });
        }

        const worldId = req.params['id'];
        const world = worlds.filter((world) => world.id == worldId);
        if (world.length == 0) {
            return res.json({ message: 'World not found' })
        }
        res.json({ message: 'World retrieved successfully', data: world });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Fetch a random car image from a folder
app.get('/api/random-car', (req, res) => {
    try {
        const carImagesDir = path.join(__dirname, 'car-images'); // Ensure a folder named 'car-images' exists
        const fs = require('fs');

        fs.readdir(carImagesDir, (err, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error reading car images directory', details: err.message });
            }

            if (files.length === 0) {
                return res.status(404).json({ error: 'No car images found' });
            }

            const randomImage = files[Math.floor(Math.random() * files.length)];
            res.sendFile(path.join(carImagesDir, randomImage));
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});