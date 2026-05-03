const crypto = require('crypto');

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
                Timestamp: timestamp,
                EventType: 'REGISTERED',
                Details: 'Asset registered'
            }]
        };

        this.mockLedger.set(assetId, asset);
        
        return { success: true, message: `Asset ${assetId} registered successfully` };
    }

    async transferAsset(assetId, newOwner, newOwnerRole) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const timestamp = new Date().toISOString();
        
        // Calculate status dynamically based on new owner role
        let newStatus = 'TRANSFERRED';
        if (newOwnerRole === 'distributor') newStatus = 'IN_STORAGE';
        if (newOwnerRole === 'retailer') newStatus = 'DELIVERED';
        
        asset.Owner = newOwner;
        asset.Status = newStatus;
        asset.Timestamp = timestamp;
        
        // Push the new state to the tracked history to mock the block trail
        asset.History.push({
            ID: asset.ID,
            Owner: newOwner,
            DocumentHash: asset.DocumentHash,
            Status: newStatus,
            Timestamp: timestamp,
            EventType: 'TRANSFER',
            Details: `Transferred to ${newOwner}`
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

    /**
     * Get all assets owned by a specific user
     */
    async getAssetsByOwner(owner) {
        const assets = [];
        
        for (const [assetId, asset] of this.mockLedger.entries()) {
            if (asset.Owner === owner) {
                const { History, ...assetState } = asset;
                assets.push({
                    ...assetState,
                    ID: assetId
                });
            }
        }

        return {
            success: true,
            owner: owner,
            assetCount: assets.length,
            assets: assets
        };
    }

    async getAssetHistory(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        
        return { success: true, history: asset.History };
    }

    async getAssetAuditDetails(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const history = asset.History || [];
        const historyJSON = JSON.stringify(history);
        const historyHash = crypto.createHash('sha256').update(historyJSON).digest('hex');
        const stateSnapshot = {
            ID: asset.ID,
            Owner: asset.Owner,
            Status: asset.Status,
            Timestamp: asset.Timestamp,
            DocumentHash: asset.DocumentHash
        };
        const stateHash = crypto.createHash('sha256').update(JSON.stringify(stateSnapshot)).digest('hex');

        const discrepancies = history.reduce((acc, event, index) => {
            if (event.DocumentHash && event.DocumentHash !== asset.DocumentHash) {
                acc.push({ index, event, reason: 'Document hash mismatch for history entry' });
            }
            return acc;
        }, []);

        const transferEvents = history.filter(evt => evt.EventType === 'TRANSFER');
        const conflicts = [];
        for (let i = 0; i < transferEvents.length - 1; i++) {
            const current = transferEvents[i];
            const next = transferEvents[i + 1];
            if (current.Timestamp === next.Timestamp && current.Owner !== next.Owner) {
                conflicts.push({ first: current, second: next, reason: 'Multiple transfers recorded at the same timestamp' });
            }
        }

        const validationStatus = discrepancies.length > 0 || conflicts.length > 0 ? 'FAILED' : 'PASSED';

        return {
            success: true,
            asset: {
                ID: asset.ID,
                Owner: asset.Owner,
                Status: asset.Status,
                Timestamp: asset.Timestamp,
                DocumentHash: asset.DocumentHash
            },
            history,
            audit: {
                historyHash,
                stateHash,
                validationStatus,
                discrepancies,
                conflicts,
                isIntegrityVerified: validationStatus === 'PASSED'
            }
        };
    }

    /**
     * Update the status of an asset in the supply chain journey
     * Statuses: ORIGINATED, SHIPPED, RECEIVED, DELIVERED, VERIFIED, DAMAGED, LOST
     */
    async updateAssetStatus(assetId, newStatus, details) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const timestamp = new Date().toISOString();

        // Add status event to history
        if (!asset.StatusHistory) {
            asset.StatusHistory = [];
        }

        asset.StatusHistory.push({
            status: newStatus,
            details: details,
            timestamp: timestamp
        });

        asset.Status = newStatus;
        asset.LastStatusUpdate = timestamp;

        // Also add to main history
        asset.History.push({
            ID: asset.ID,
            Owner: asset.Owner,
            DocumentHash: asset.DocumentHash,
            Status: newStatus,
            Timestamp: timestamp,
            EventType: 'STATUS_UPDATE',
            Details: details
        });

        return { 
            success: true, 
            message: `Asset ${assetId} status updated to ${newStatus}`,
            asset: { ID: assetId, Status: newStatus, Timestamp: timestamp }
        };
    }

    /**
     * Verify asset authenticity and integrity
     */
    async verifyAsset(assetId, verifier, verificationData) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);

        if (!asset.Verifications) {
            asset.Verifications = [];
        }

        const verification = {
            verifier: verifier,
            verifiedAt: verificationData.timestamp,
            notes: verificationData.notes,
            qualityCheck: verificationData.qualityCheck,
            verificationId: `VER-${assetId}-${Date.now()}`
        };

        asset.Verifications.push(verification);
        asset.IsVerified = true;
        asset.LastVerification = verificationData.timestamp;

        // Add verification event to history
        asset.History.push({
            ID: asset.ID,
            Owner: asset.Owner,
            DocumentHash: asset.DocumentHash,
            Status: asset.Status,
            Timestamp: verificationData.timestamp,
            EventType: 'VERIFICATION',
            Verifier: verifier,
            Details: verificationData.notes
        });

        return {
            success: true,
            message: `Asset ${assetId} verified successfully`,
            verification: verification
        };
    }

    /**
     * Get verification history for an asset
     */
    async getVerificationHistory(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const verifications = asset.Verifications || [];

        return {
            success: true,
            assetId: assetId,
            verificationCount: verifications.length,
            isVerified: asset.IsVerified || false,
            verifications: verifications
        };
    }

    /**
     * Issue a certification for an asset
     */
    async issueCertification(assetId, certificationData) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);

        if (!asset.Certifications) {
            asset.Certifications = [];
        }

        const certification = {
            certificationId: `CERT-${assetId}-${Date.now()}`,
            type: certificationData.type,
            issuer: certificationData.issuer,
            issuedDate: certificationData.issuedDate,
            expiryDate: certificationData.expiryDate,
            metadata: certificationData.metadata,
            status: 'ACTIVE'
        };

        asset.Certifications.push(certification);

        // Add certification event to history
        asset.History.push({
            ID: asset.ID,
            Owner: asset.Owner,
            DocumentHash: asset.DocumentHash,
            Status: asset.Status,
            Timestamp: certificationData.issuedDate,
            EventType: 'CERTIFICATION',
            Issuer: certificationData.issuer,
            Details: `${certificationData.type} certification issued`
        });

        return {
            success: true,
            message: `Certification ${certificationData.type} issued for asset ${assetId}`,
            certification: certification
        };
    }

    /**
     * Get all certifications for an asset
     */
    async getCertifications(assetId) {
        if (!this.mockLedger.has(assetId)) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset = this.mockLedger.get(assetId);
        const certifications = asset.Certifications || [];

        // Filter out expired certifications
        const activeCertifications = certifications.filter(cert => {
            if (!cert.expiryDate) return true;
            return new Date(cert.expiryDate) > new Date();
        });

        return {
            success: true,
            assetId: assetId,
            certificationCount: certifications.length,
            activeCertificationCount: activeCertifications.length,
            certifications: certifications
        };
    }
}

module.exports = new FabricService();