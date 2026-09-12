'use strict';

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const cryptoPath = process.env.CRYPTO_PATH || path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'test-network',
    'organizations',
    'peerOrganizations',
    'org1.example.com'
);

const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    channelName: process.env.CHANNEL_NAME || 'agrichannel',
    chaincodeName: process.env.CHAINCODE_NAME || 'agrichain',
    mspId: process.env.MSP_ID || 'Org1MSP',
    cryptoPath: cryptoPath,
    keyDirectoryPath: process.env.KEY_DIRECTORY_PATH || path.resolve(
        cryptoPath,
        'users',
        'Admin@org1.example.com',
        'msp',
        'keystore'
    ),
    certDirectoryPath: process.env.CERT_DIRECTORY_PATH || path.resolve(
        cryptoPath,
        'users',
        'Admin@org1.example.com',
        'msp',
        'signcerts'
    ),
    tlsCertPath: process.env.TLS_CERT_PATH || path.resolve(
        cryptoPath,
        'peers',
        'peer0.org1.example.com',
        'tls',
        'ca.crt'
    ),
    peerEndpoint: process.env.PEER_ENDPOINT || 'localhost:7051',
    peerHostAlias: process.env.PEER_HOST_ALIAS || 'peer0.org1.example.com',
};

module.exports = config;
