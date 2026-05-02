const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricService {
    constructor() {
        this.connectionProfilePath = path.resolve(__dirname, '../connection-profile.json');
        this.walletPath = path.resolve(__dirname, '../wallet');
        this.channelName = 'mychannel';
        this.contractName = 'supplychain';
    }

    async connectAsUser(userId) {
        const gateway = new Gateway();

        // Load connection profile
        const connectionProfile = JSON.parse(fs.readFileSync(this.connectionProfilePath, 'utf8'));

        // Load wallet
        const wallet = await Wallets.newFileSystemWallet(this.walletPath);

        // Connect to gateway
        await gateway.connect(connectionProfile, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: true }
        });

        return gateway;
    }

    async registerAsset(assetId, owner, docHash) {
        let gateway;
        try {
            gateway = await this.connectAsUser('manufacturer');

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.contractName);

            await contract.submitTransaction('RegisterAsset', assetId, owner, docHash);

            return { success: true, message: `Asset ${assetId} registered successfully` };
        } catch (error) {
            console.error('Error registering asset:', error);
            throw new Error(`Failed to register asset: ${error.message}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }

    async transferAsset(assetId, newOwner) {
        let gateway;
        try {
            // Try distributor first, then retailer
            let userId = 'distributor';
            try {
                gateway = await this.connectAsUser(userId);
            } catch {
                gateway = await this.connectAsUser('retailer');
                userId = 'retailer';
            }

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.contractName);

            await contract.submitTransaction('TransferCustody', assetId, newOwner);

            return { success: true, message: `Asset ${assetId} transferred to ${newOwner} by ${userId}` };
        } catch (error) {
            console.error('Error transferring asset:', error);
            throw new Error(`Failed to transfer asset: ${error.message}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }

    async queryAsset(assetId) {
        let gateway;
        try {
            gateway = await this.connectAsUser('manufacturer'); // Can be any user for query

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.contractName);

            const result = await contract.evaluateTransaction('QueryAsset', assetId);
            const asset = JSON.parse(result.toString());

            return { success: true, asset };
        } catch (error) {
            console.error('Error querying asset:', error);
            throw new Error(`Failed to query asset: ${error.message}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }

    async getAssetHistory(assetId) {
        let gateway;
        try {
            gateway = await this.connectAsUser('manufacturer');

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.contractName);

            // Note: This would require implementing history tracking in the chaincode
            // For now, we'll just return the current state
            const result = await contract.evaluateTransaction('QueryAsset', assetId);
            const asset = JSON.parse(result.toString());

            return { success: true, history: [asset] };
        } catch (error) {
            console.error('Error getting asset history:', error);
            throw new Error(`Failed to get asset history: ${error.message}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }
}

module.exports = new FabricService();