'use strict';

const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const batchRoutes = require('./routes/batchRoutes');
const storageRulesRoutes = require('./routes/storageRulesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/storage-rules', storageRulesRoutes);

// 404 Not Found Handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        error: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
