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
    let testToken = '';

    before((done) => {
        server = http.createServer(app);
        server.listen(3001, () => {
            // Generate auth token locally prior to suites
            const postData = JSON.stringify({ username: 'ssinha94', password: 'abcd1234' });
            const req = http.request({
                hostname: 'localhost', port: 3001, path: '/login', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    testToken = JSON.parse(data).token;
                    done();
                });
            });
            req.write(postData);
            req.end();
        });
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
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': `Bearer ${testToken}`
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
            const restoreMock = mockFabricService('registerAsset', async () => {
                return { success: true, message: 'Asset TEST001 registered successfully' };
            });

            const postData = JSON.stringify({
                assetId: 'TEST001',
                docHash: 'testhash123456789'
            });

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': `Bearer ${testToken}`
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
            const postData = JSON.stringify({ assetId: 'TEST001' });

            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/transfer',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': `Bearer ${testToken}`
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
            const restoreQueryMock = mockFabricService('queryAsset', async () => ({
                asset: { Owner: 'ssinha94' }
            }));
            const restoreTransferMock = mockFabricService('transferAsset', async () => {
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
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': `Bearer ${testToken}`
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

                    restoreQueryMock();
                    restoreTransferMock();
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

            const req = http.request({
                hostname: 'localhost', port: 3001, path: '/asset/TEST001', method: 'GET',
                headers: { 'Authorization': `Bearer ${testToken}` }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    const response = JSON.parse(data);
                    assert.strictEqual(response.success, true);
                    assert.strictEqual(response.asset.ID, 'TEST001');

                    restoreMock();
                    done();
                });
            });
            req.end();
        });

        it('should return 404 for non-existent asset', (done) => {
            const restoreMock = mockFabricService('queryAsset', async () => {
                throw new Error('TEST002 does not exist');
            });

            const req = http.request({
                hostname: 'localhost', port: 3001, path: '/asset/TEST002', method: 'GET',
                headers: { 'Authorization': `Bearer ${testToken}` }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 404);
                    restoreMock();
                    done();
                });
            });
            req.end();
        });
    });

    describe('GET /trace/:id', () => {
        it('should return asset trace successfully', (done) => {
            const restoreMock = mockFabricService('getAssetHistory', async () => {
                return {
                    success: true,
                    history: [{ ID: 'TEST001', Status: 'REGISTERED' }]
                };
            });

            const req = http.request({
                hostname: 'localhost', port: 3001, path: '/trace/TEST001', method: 'GET',
                headers: { 'Authorization': `Bearer ${testToken}` }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 200);
                    restoreMock();
                    done();
                });
            });
            req.end();
        });

        it('should return 404 for non-existent trace', (done) => {
            const restoreMock = mockFabricService('getAssetHistory', async () => {
                throw new Error('TEST003 does not exist');
            });

            const req = http.request({
                hostname: 'localhost', port: 3001, path: '/trace/TEST003', method: 'GET',
                headers: { 'Authorization': `Bearer ${testToken}` }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    assert.strictEqual(res.statusCode, 404);
                    restoreMock();
                    done();
                });
            });
            req.end();
        });
    });
});