'use strict';

/**
 * Health check endpoint controller.
 */
function getHealth(req, res) {
    return res.status(200).json({
        status: 'UP',
        message: 'AgriChain backend is running',
        timestamp: new Date().toISOString(),
    });
}

module.exports = {
    getHealth,
};
