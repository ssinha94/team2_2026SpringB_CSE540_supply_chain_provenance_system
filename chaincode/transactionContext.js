'use strict';

const { Context } = require('fabric-contract-api');

class SupplyChainContext extends Context {
    constructor() {
        super();
    }

    /**
     * Interface Method: GetClientRole
     * Extracts the 'role' attribute from the participant's certificate.
     */
    getClientRole() {
        return this.clientIdentity.getAttributeValue('role');
    }
}

module.exports = SupplyChainContext;
