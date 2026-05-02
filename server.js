const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fabricService = require('./services/fabricService');
const ipfsService = require('./services/ipfsService');
const { authenticateUser, hasPermission, getUserRole } = require('./services/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Session store (in-memory for now)
const sessions = {};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use('/app', express.static(path.join(__dirname, 'build')));

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

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!sessions[token]) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = sessions[token];
    next();
}

// Role-based access control middleware
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                details: `Your role (${req.user.role}) does not have permission for this action`
            });
        }
        next();
    };
}

// Routes

/**
 * POST /login
 * Authenticate user and return session token
 * Body: { username: string, password: string }
 */
app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Missing username or password'
            });
        }

        const user = authenticateUser(username, password);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }

        // Generate session token
        const token = crypto.randomBytes(32).toString('hex');
        sessions[token] = user;

        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
});

/**
 * POST /logout
 * Invalidate session token
 */
app.post('/logout', authenticateToken, (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        delete sessions[token];

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            details: error.message
        });
    }
});

/**
 * GET /profile
 * Get current user profile
 */
app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

/**
 * POST /register
 * Register a new asset in the supply chain
 * Body: { assetId: string, owner: string, docHash: string }
 */
app.post('/register', authenticateToken, authorize('manufacturer', 'superuser'), async (req, res) => {
    try {
        const { assetId, docHash } = req.body;
        const owner = req.user.username; // Extract owner natively from securely decoded token

        if (!assetId || !docHash) {
            return res.status(400).json({
                error: 'Missing required fields: assetId, docHash'
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
app.put('/transfer', authenticateToken, authorize('manufacturer', 'distributor', 'retailer', 'superuser'), async (req, res) => {
    try {
        const { assetId, newOwner } = req.body;

        if (!assetId || !newOwner) {
            return res.status(400).json({
                error: 'Missing required fields: assetId, newOwner'
            });
        }
        
        try {
            // Verify ownership
            const assetQuery = await fabricService.queryAsset(assetId);
            if (assetQuery.asset.Owner !== req.user.username) {
                return res.status(403).json({
                    error: 'Forbidden',
                    details: 'You can only transfer ownership of assets that you currently own.'
                });
            }
        } catch (queryError) {
            return res.status(404).json({
                error: 'Asset not found or failed to query during ownership check',
                details: queryError.message
            });
        }

        const newOwnerRole = getUserRole(newOwner);
        const result = await fabricService.transferAsset(assetId, newOwner, newOwnerRole);

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
app.get('/asset/:id', authenticateToken, authorize('manufacturer', 'distributor', 'retailer', 'auditor', 'superuser'), async (req, res) => {
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
app.get('/trace/:id', authenticateToken, authorize('manufacturer', 'distributor', 'auditor', 'superuser'), async (req, res) => {
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
 * POST /ipfs/upload
 * Store a document in IPFS and return the CID
 * Body: { metadata: any }
 */
app.post('/ipfs/upload', authenticateToken, async (req, res) => {
    try {
        const { metadata } = req.body;
        if (!metadata) {
            return res.status(400).json({ error: 'Missing metadata payload' });
        }
        
        const cid = await ipfsService.uploadDocument(metadata);
        
        res.status(201).json({ success: true, cid });
    } catch (error) {
        console.error('IPFS upload error:', error);
        res.status(500).json({
            error: 'Failed to upload document to IPFS',
            details: error.message
        });
    }
});

/**
 * GET /ipfs/:cid
 * Retrieve document metadata from IPFS
 */
app.get('/ipfs/:cid', authenticateToken, async (req, res) => {
    try {
        const { cid } = req.params;
        const data = await ipfsService.getDocument(cid);
        
        res.status(200).json({ success: true, metadata: data });
    } catch (error) {
        console.error('IPFS retrieve error:', error);
        res.status(500).json({
            error: 'Failed to fetch document from IPFS',
            details: error.message
        });
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

// Catch all handler: send back React's index.html file for /app routes
app.get('/app/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Start server only if this script is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Supply Chain API server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

module.exports = app;