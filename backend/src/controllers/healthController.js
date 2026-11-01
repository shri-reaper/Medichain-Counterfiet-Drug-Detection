'use strict';
const { ethers } = require('ethers');
const gw = require('../ethereum/gateway');

async function getHealth(req, res) {
    const base = { network: gw.config.networkName, chainId: gw.config.chainId, explorer: gw.config.explorer, timestamp: new Date().toISOString() };
    if (!gw.isConfigured()) {
        return res.status(200).json({ ...base, status: 'NOT_CONFIGURED', message: `Missing env vars: ${gw.missingConfig().join(', ')}` });
    }
    try {
        const wallet = gw.getWallet();
        const balance = await gw.getProvider().getBalance(wallet.address);
        return res.status(200).json({
            ...base,
            status: 'UP',
            message: 'MediChain backend is connected to Ethereum Sepolia',
            contractAddress: gw.config.contractAddress,
            operator: wallet.address,
            operatorBalanceEth: ethers.formatEther(balance),
        });
    } catch (e) {
        return res.status(200).json({ ...base, status: 'DEGRADED', message: e.shortMessage || e.message });
    }
}

module.exports = { getHealth };
