class FabricService {
    constructor() {
        // Since there is no actual blockchain to connect to, we use an in-memory store
        // to mock the blockchain ledger state and provenance history.
        this.mockLedger = new Map();
    }

    async registerAsset(assetId, owner, docHash) {
        // Check if asset already exists
        if (this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} already exists`);
        }

        const timestamp = new Date().toISOString();
        
        const asset = {
            ID: assetId,
            Owner: owner,
            DocumentHash: docHash,
            Status: 'REGISTERED',
            Timestamp: timestamp,
            History: [{
                ID: assetId,
                Owner: owner,
                DocumentHash: docHash,
                Status: 'REGISTERED',
                Timestamp: timestamp
            }]
        };

        this.mockLedger.set(assetId, asset);
        
        return { success: true, message: `Asset ${assetId} registered successfully` };
    }

    async transferAsset(assetId, newOwner) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const timestamp = new Date().toISOString();
        
        asset.Owner = newOwner;
        asset.Status = 'TRANSFERRED';
        asset.Timestamp = timestamp;
        
        // Push the new state to the tracked history to mock the block trail
        asset.History.push({
            ID: asset.ID,
            Owner: newOwner,
            DocumentHash: asset.DocumentHash,
            Status: 'TRANSFERRED',
            Timestamp: timestamp
        });

        return { success: true, message: `Asset ${assetId} transferred to ${newOwner}` };
    }

    async queryAsset(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        
        // Strip out the mock History array to emulate the original blockchain state response
        const { History, ...assetState } = asset;

        return { success: true, asset: assetState };
    }

    async getAssetHistory(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        
        return { success: true, history: asset.History };
    }
}

module.exports = new FabricService();