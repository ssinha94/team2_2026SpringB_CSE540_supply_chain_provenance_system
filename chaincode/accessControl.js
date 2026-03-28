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

module.exports = { roles, checkRole };
