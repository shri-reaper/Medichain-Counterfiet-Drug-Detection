'use strict';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`); next(); });
app.use('/api/health', healthRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` }));

// Serve the built React app (single-service hosting). Skipped when frontend/dist doesn't exist.
const dist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((req, res) => res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` }));
app.use(errorHandler);
module.exports = app;
