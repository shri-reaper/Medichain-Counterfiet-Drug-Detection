'use strict';

const app = require('./app');
const config = require('./config/fabric.config');
const { initializeGateway, closeGateway } = require('./fabric/gateway');

let server = null;

async function startServer() {
    try {
        console.log('====================================================');
        console.log('       AGRICHAIN - Hyperledger Fabric Backend       ');
        console.log('====================================================');

        // Connect to Hyperledger Fabric Gateway
        await initializeGateway();

        // Start HTTP server
        server = app.listen(config.port, () => {
            console.log(`Backend server listening on http://localhost:${config.port}`);
            console.log(`Health check: http://localhost:${config.port}/api/health`);
            console.log(`Batches API:  http://localhost:${config.port}/api/batches`);
            console.log('====================================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown handling
async function shutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            console.log('HTTP server closed.');
        });
    }
    await closeGateway();
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
