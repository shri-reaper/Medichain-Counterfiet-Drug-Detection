'use strict';

function getHealth(req, res) {
    return res.status(200).json({
        status: 'UP',
        message: 'MediChain backend is running',
        timestamp: new Date().toISOString(),
    });
}

module.exports = {
    getHealth,
};
