const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/worldDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Connection error:', err));

// Schema and Model
const worldSchema = new mongoose.Schema({
    worldString: { type: String, required: true },
});
const World = mongoose.model('World', worldSchema);

// Serve Frontend
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); // Move index.html to "public" directory
});

// API Endpoints

// Save "world" string to the database
app.post('/api/save-world', async (req, res) => {
    try {
        const { worldString } = req.body;
        if (!worldString) {
            return res.status(400).json({ error: 'worldString is required' });
        }

        const world = new World({ worldString });
        await world.save();
        res.status(201).json({ message: 'World saved successfully', data: world });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Load the "world" string from the database
app.get('/api/load-world', async (req, res) => {
    try {
        const worlds = await World.find();
        if (worlds.length === 0) {
            return res.status(404).json({ error: 'No world strings found' });
        }

        res.json({ message: 'World strings retrieved successfully', data: worlds });
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