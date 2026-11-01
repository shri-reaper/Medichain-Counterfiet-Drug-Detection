'use strict';

const app = require('./app');
const config = require('./config/chain.config');
const gw = require('./ethereum/gateway');

console.log('====================================================');
console.log('        MEDICHAIN - Ethereum (Sepolia) Backend       ');
console.log('====================================================');
if (gw.isConfigured()) {
    console.log(`Contract: ${config.contractAddress}`);
    console.log(`Operator: ${gw.getWallet().address}`);
} else {
    console.warn(`WARNING: missing env vars: ${gw.missingConfig().join(', ')} (API will return 503 until set)`);
}

const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Listening on port ${config.port}`);
});

const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
