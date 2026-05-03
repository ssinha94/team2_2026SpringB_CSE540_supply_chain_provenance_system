const roles = {
    MANUFACTURER: 'manufacturer',
    DISTRIBUTOR: 'distributor',
    RETAILER: 'retailer',
    AUDITOR: 'auditor'
};

/**
 * Validates if the transaction creator has the required role.
 */
function checkRole(ctx, requiredRole) {
    const clientID = ctx.clientIdentity;
    if (!clientID.assertAttributeValue('role', requiredRole)) {
        throw new Error(`Unauthorized: Client does not have the ${requiredRole} role.`);
    }
    return true;
}

/**
 * Auditors are granted read-only access to ledger queries and audit history.
 * They may only write certification or auditor status flags.
 */
function checkAuditorReadAccess(ctx) {
    const clientID = ctx.clientIdentity;
    return clientID.assertAttributeValue('role', roles.AUDITOR);
}

function checkAuditorWriteAccess(ctx) {
    const clientID = ctx.clientIdentity;
    if (!clientID.assertAttributeValue('role', roles.AUDITOR)) {
        throw new Error('Unauthorized: Client is not an auditor');
    }
    return true;
}

module.exports = { roles, checkRole, checkAuditorReadAccess, checkAuditorWriteAccess };
