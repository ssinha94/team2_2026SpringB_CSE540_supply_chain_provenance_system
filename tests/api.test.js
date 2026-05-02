const http = require('http');
const assert = require('assert');
const app = require('../server');

// Helper function to mock fabric service methods
function mockFabricService(methodName, mockImplementation) {
    const fabricService = require('../services/fabricService');
    const originalMethod = fabricService[methodName];
    fabricService[methodName] = mockImplementation;
    return () => {
        fabricService[methodName] = originalMethod;
    };
}

describe('Supply Chain API', () => {
    let server;

    before((done) => {
        server = http.createServer(app);
        server.listen(3001, done); // Use a different port for testing
    });

    after((done) => {
        server.close(done);
    });

    describe('GET /health', () => {
        it('should return health status', (done) => {
            http.get('http://localhost:3001/health', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.status, 'OK');
                    assert.strictEqual(response.service, 'Supply Chain API');
                    done();
                });
            });
        });
    });

    describe('POST /register', () => {
        it('should return 400 for missing fields', (done) => {
            const postData = JSON.stringify({});

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 400);
                    const response = JSON.parse(data);
                    assert(response.error.includes('Missing required fields'));
                    done();
                });
            });

            req.write(postData);
            req.end();
        });

        it('should register an asset successfully with mocked blockchain', (done) => {
            // Mock the fabric service to simulate successful registration
            const restoreMock = mockFabricService('registerAsset', async () => {
                return { success: true, message: 'Asset TEST001 registered successfully' };
            });

            const postData = JSON.stringify({
                assetId: 'TEST001',
                owner: 'TestManufacturer',
                docHash: 'testhash123456789'
            });

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 201);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.success, true);
                    assert(response.message.includes('Asset TEST001 registered successfully'));

                    // Restore original function
                    restoreMock();
                    done();
                });
            });

            req.write(postData);
            req.end();
        });
    });

    describe('PUT /transfer', () => {
        it('should return 400 for missing fields', (done) => {
            const postData = JSON.stringify({ assetId: 'TEST001' }); // missing newOwner

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/transfer',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 400);
                    const response = JSON.parse(data);
                    assert(response.error.includes('Missing required fields'));
                    done();
                });
            });

            req.write(postData);
            req.end();
        });

        it('should transfer asset successfully with mocked blockchain', (done) => {
            const restoreMock = mockFabricService('transferAsset', async () => {
                return { success: true, message: 'Asset TEST001 transferred to DistributorX by distributor' };
            });

            const postData = JSON.stringify({
                assetId: 'TEST001',
                newOwner: 'DistributorX'
            });

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/transfer',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.success, true);
                    assert(response.message.includes('Asset TEST001 transferred to DistributorX'));

                    restoreMock();
                    done();
                });
            });

            req.write(postData);
            req.end();
        });
    });

    describe('GET /asset/:id', () => {
        it('should return asset details successfully with mocked blockchain', (done) => {
            const restoreMock = mockFabricService('queryAsset', async () => {
                return {
                    success: true,
                    asset: {
                        ID: 'TEST001',
                        Owner: 'TestManufacturer',
                        DocumentHash: 'testhash123456789',
                        Status: 'REGISTERED',
                        Timestamp: {}
                    }
                };
            });

            http.get('http://localhost:3001/asset/TEST001', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.success, true);
                    assert.strictEqual(response.asset.ID, 'TEST001');
                    assert.strictEqual(response.asset.Owner, 'TestManufacturer');

                    restoreMock();
                    done();
                });
            });
        });

        it('should return 404 for non-existent asset', (done) => {
            const restoreMock = mockFabricService('queryAsset', async () => {
                throw new Error('TEST002 does not exist');
            });

            http.get('http://localhost:3001/asset/TEST002', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 404);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.error, 'Asset not found');

                    restoreMock();
                    done();
                });
            });
        });
    });

    describe('GET /trace/:id', () => {
        it('should return asset trace successfully with mocked blockchain', (done) => {
            const restoreMock = mockFabricService('getAssetHistory', async () => {
                return {
                    success: true,
                    history: [{
                        ID: 'TEST001',
                        Owner: 'TestManufacturer',
                        DocumentHash: 'testhash123456789',
                        Status: 'REGISTERED',
                        Timestamp: {}
                    }]
                };
            });

            http.get('http://localhost:3001/trace/TEST001', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.success, true);
                    assert(Array.isArray(response.history));
                    assert.strictEqual(response.history[0].ID, 'TEST001');

                    restoreMock();
                    done();
                });
            });
        });

        it('should return 404 for non-existent asset trace', (done) => {
            const restoreMock = mockFabricService('getAssetHistory', async () => {
                throw new Error('TEST003 does not exist');
            });

            http.get('http://localhost:3001/trace/TEST003', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 404);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.error, 'Asset not found');

                    restoreMock();
                    done();
                });
            });
        });
    });
});