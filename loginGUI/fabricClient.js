
const { Gateway, Wallets } = require('fabric-network');

async function registerAsset(assetId, docHash) {
    const gateway = new Gateway();
    await gateway.connect(connectionProfile, { wallet, identity: 'manufacturer' });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain'); // your chaincode name

    await contract.submitTransaction('RegisterAsset', assetId, docHash);
    await gateway.disconnect();
}

module.exports = { registerAsset };