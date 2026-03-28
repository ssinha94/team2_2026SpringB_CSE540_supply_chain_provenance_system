const SupplyChain = require('../chaincode/supplyChain.js');
const { roles } = require('../chaincode/accessControl');
const assert = require('assert');

describe('SupplyChain Smart Contract Tests', () => {
    let contract;
    let mockStub;
    let mockContext;

    beforeEach(() => {
        contract = new SupplyChain();
        mockStub = {
            state: {},
            putState: async function(key, value) {
                this.state[key] = value;
            },
            getState: async function(key) {
                return this.state[key] || Buffer.from('');
            },
            getTxTimestamp: () => ({ seconds: Math.floor(Date.now() / 1000) }),
            setEvent: (name, payload) => {
                console.log(`Event Emitted: ${name}`);
            }
        };

        mockContext = {
            stub: mockStub,
            clientIdentity: {
                assertAttributeValue: (attr, value) =>
                    value === roles.MANUFACTURER ||
                    value === roles.DISTRIBUTOR ||
                    value === roles.RETAILER
            }
        };
    });

    it('should register a new asset with a document hash', async () => {
        const assetId = 'BOL-001';
        const docHash = 'f123456789abcdef';
        
        await contract.RegisterAsset(mockContext, assetId, 'Manufacturer_Node', docHash);
        
        const response = await contract.QueryAsset(mockContext, assetId);
        const asset = JSON.parse(response);
        
        assert.strictEqual(asset.ID, assetId);
        assert.strictEqual(asset.DocumentHash, docHash);
        assert.strictEqual(asset.Status, 'REGISTERED');
    });

    it('should update custody during transfer', async () => {
        const assetId = 'SHIP-999';
        await contract.RegisterAsset(mockContext, assetId, 'Producer_A', 'hash123');
        await contract.TransferCustody(mockContext, assetId, 'Distributor_B');
        
        const response = await contract.QueryAsset(mockContext, assetId);
        const asset = JSON.parse(response);
        
        assert.strictEqual(asset.Owner, 'Distributor_B');
        assert.strictEqual(asset.Status, 'IN_TRANSIT');
    });

    it('should fail if an unauthorized role tries to register an asset', async () => {
        mockContext.clientIdentity = {
            assertAttributeValue: (_, __) => false
        };

        try {
            await contract.RegisterAsset(mockContext, 'ERR-01', 'User', 'hash');
            assert.fail('Should have thrown an unauthorized error');
        } catch (err) {
            assert.ok(err.message.includes('Unauthorized'));
        }
    });

    it('should fail if RETAILER, DISTRIBUTOR, or AUDITOR tries to register asset', async () => {
        const invalidRoles = [roles.RETAILER, roles.DISTRIBUTOR, roles.AUDITOR];
        for (const invalidRole of invalidRoles) {
            mockContext.clientIdentity = {
                assertAttributeValue: (_, value) => value === invalidRole
            };

            try {
                await contract.RegisterAsset(mockContext, 'INVALID-ROLE', 'User', 'hash');
                assert.fail(`Should have thrown for role ${invalidRole}`);
            } catch (err) {
                assert.ok(err.message.includes('Unauthorized'));
            }
        }
    });
});
