const fs = require('fs');
const path = require('path');
const assetId = process.argv[2];
const newOwner = process.argv[3];

const assetsFile = path.join(__dirname, 'assets.json');

if (!fs.existsSync(assetsFile)) {
    console.log('No assets found');
    process.exit(1);
}

let assets = JSON.parse(fs.readFileSync(assetsFile));

if (assets[assetId]) {
    assets[assetId].owner = newOwner;
    fs.writeFileSync(assetsFile, JSON.stringify(assets));
    console.log(`Asset ${assetId} transferred to ${newOwner}`);
} else {
    console.log(`Asset ${assetId} not found`);
}