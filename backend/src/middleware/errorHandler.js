'use strict';

/**
 * Global error handling middleware.
 * Maps Fabric chaincode and application errors to appropriate HTTP status codes.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

    const errorMessage = err.message || 'An unexpected error occurred';

    // Check if the error indicates an entity was not found
    if (errorMessage.includes('does not exist')) {
        return res.status(404).json({
            error: errorMessage,
        });
    }

    // Check if the error indicates a duplicate key or entity already exists
    if (errorMessage.includes('already exists')) {
        return res.status(409).json({
            error: errorMessage,
        });
    }

    // Check for explicit HTTP status code set by controllers
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: errorMessage,
        });
    }

    // Default to 500 Internal Server Error
    return res.status(500).json({
        error: errorMessage,
    });
}

module.exports = errorHandler;
