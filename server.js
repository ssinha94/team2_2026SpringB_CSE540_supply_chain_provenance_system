const express = require('express');
const fabricService = require('./services/fabricService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend integration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes

/**
 * POST /register
 * Register a new asset in the supply chain
 * Body: { assetId: string, owner: string, docHash: string }
 */
app.post('/register', async (req, res) => {
    try {
        const { assetId, owner, docHash } = req.body;

        if (!assetId || !owner || !docHash) {
            return res.status(400).json({
                error: 'Missing required fields: assetId, owner, docHash'
            });
        }

        const result = await fabricService.registerAsset(assetId, owner, docHash);

        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register asset',
            details: error.message
        });
    }
});

/**
 * PUT /transfer
 * Transfer custody of an asset
 * Body: { assetId: string, newOwner: string }
 */
app.put('/transfer', async (req, res) => {
    try {
        const { assetId, newOwner } = req.body;

        if (!assetId || !newOwner) {
            return res.status(400).json({
                error: 'Missing required fields: assetId, newOwner'
            });
        }

        const result = await fabricService.transferAsset(assetId, newOwner);

        res.status(200).json(result);
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({
            error: 'Failed to transfer asset',
            details: error.message
        });
    }
});

/**
 * GET /asset/:id
 * Query asset details by ID
 */
app.get('/asset/:id', async (req, res) => {
    try {
        const assetId = req.params.id;

        const result = await fabricService.queryAsset(assetId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Query error:', error);
        if (error.message.includes('does not exist')) {
            res.status(404).json({
                error: 'Asset not found',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Failed to query asset',
                details: error.message
            });
        }
    }
});

/**
 * GET /trace/:id
 * Get the complete trace/history of an asset
 */
app.get('/trace/:id', async (req, res) => {
    try {
        const assetId = req.params.id;

        const result = await fabricService.getAssetHistory(assetId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Trace error:', error);
        if (error.message.includes('does not exist')) {
            res.status(404).json({
                error: 'Asset not found',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Failed to trace asset',
                details: error.message
            });
        }
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Supply Chain API'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Supply Chain API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;