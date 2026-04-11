const fs = require('fs');
const path = require('path');
const assetId = process.argv[2];

const assetsFile = path.join(__dirname, 'assets.json');
const assets = JSON.parse(fs.readFileSync(assetsFile));
const asset = assets[assetId];

console.log(`Asset querying`);
if (asset) {
    console.log(`Asset ID: ${assetId}\nOwner: ${asset.owner}`);
} else {
    console.log(`Asset ${assetId} not found`);
}