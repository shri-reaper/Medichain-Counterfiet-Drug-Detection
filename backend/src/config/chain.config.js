'use strict';

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    rpcUrl: process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    contractAddress: (process.env.CONTRACT_ADDRESS || '').trim(),
    privateKey: (process.env.PRIVATE_KEY || '').trim(),
    codePepper: process.env.CODE_PEPPER || '',
    chainId: 11155111,
    networkName: 'sepolia',
    explorer: 'https://sepolia.etherscan.io',
};
