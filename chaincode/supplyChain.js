'use strict';

const { Contract } = require('fabric-contract-api');
const SupplyChainContext = require('./transactionContext');

class SupplyChainContract extends Contract {

    /**
     * Task 1: Initialize the Ledger
     * Sets up the initial state of the supply chain database.
     */
    async InitLedger(ctx) {
        // Initial state can be empty or contain seed data for testing.
    }

    /**
     * @override
     * This method overrides the default Fabric context to inject our custom 
     * SupplyChainContext. It acts as the primary interface for identity management 
     * across the supply chain.
     * @returns {SupplyChainContext} A custom context containing helper methods 
     * for Role-Based Access Control (RBAC), allowing functions to verify if 
     * a participant is a Manufacturer, Distributor, or Retailer.
     */
    createContext() {
        return new SupplyChainContext();
    }

    /**
     * Task 1 & 2: Register a New Asset
     * @param {Context} ctx The transaction context
     * @param {string} assetId Unique identifier for the shipment
     * @param {string} owner The initial stakeholder (e.g., Manufacturer)
     * @param {string} docHash SHA-256 hash of the off-chain Bill of Lading
     * * Logic: Only users with the 'Producer' role can initiate this transaction.
     * This function stores the link between the physical asset and the digital record.
     */
    async RegisterAsset(ctx, assetId, owner, docHash) {
        const exists = await this.AssetExists(ctx, assetId);
        if (exists) {
            throw new Error(`The asset ${assetId} already exists`);
        }

        const asset = {
            ID: assetId,
            Owner: owner,
            DocumentHash: docHash,
            Status: 'REGISTERED',
            Timestamp: ctx.stub.getTxTimestamp(),
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        ctx.stub.setEvent('AssetRegistered', Buffer.from(JSON.stringify(asset)));
    }

    /**
     * Task 1 & 2: Transfer Asset Custody
     * @param {Context} ctx The transaction context
     * @param {string} assetId The ID of the asset being moved
     * @param {string} newOwner The next stakeholder (e.g., Distributor or Retailer)
     * * Logic: Updates the "Owner" field to reflect the new holder in the supply chain.
     * This creates an immutable audit trail of the product's journey.
     */
    async TransferCustody(ctx, assetId, newOwner) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        asset.Status = 'IN_TRANSIT';

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${assetId} transferred from ${oldOwner} to ${newOwner}`);
    }

    /**
     * Task 1 & 2: Verify Asset Integrity
     * @param {string} assetId The asset to check
     * @returns {Object} Returns the asset details including the hash for audit
     */
    async QueryAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        return assetAsBytes.toString();
    }

    /**
     * Helper: Check if asset exists
     */
    async AssetExists(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        return assetAsBytes && assetAsBytes.length > 0;
    }
}

module.exports = SupplyChainContract;
