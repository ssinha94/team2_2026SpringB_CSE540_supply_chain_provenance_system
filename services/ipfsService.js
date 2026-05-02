let heliaInstance;
let heliaJson;

/**
 * Initializes the Helia IPFS node. Because Helia is ESM-only and this
 * project uses CommonJS, we dynamically import the modules here.
 */
async function initIPFS() {
    if (heliaInstance && heliaJson) return;

    try {
        const { createHelia } = await import('helia');
        const { json } = await import('@helia/json');

        heliaInstance = await createHelia();
        heliaJson = json(heliaInstance);
        
        console.log('Helia IPFS Node successfully initialized in memory.');
    } catch (error) {
        console.error('Failed to initialize Helia IPFS node:', error);
        throw error;
    }
}

/**
 * Stores a JSON object in IPFS.
 * @param {Object} data - The JSON object to store
 * @returns {string} - The IPFS CID string representing the stored object
 */
async function uploadDocument(data) {
    if (!heliaJson) await initIPFS();

    const cid = await heliaJson.add(data);
    return cid.toString();
}

/**
 * Retrieves a JSON object from IPFS given its CID.
 * @param {string} cidString - The CID string of the object to retrieve
 * @returns {Object} - The retrieved JSON object
 */
async function getDocument(cidString) {
    if (!heliaJson) await initIPFS();

    const { CID } = await import('multiformats/cid');
    const cid = CID.parse(cidString);
    
    const data = await heliaJson.get(cid);
    return data;
}

module.exports = {
    initIPFS,
    uploadDocument,
    getDocument
};
