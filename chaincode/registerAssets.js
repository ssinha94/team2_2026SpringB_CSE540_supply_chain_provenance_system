const fs = require('fs');
const path = require('path');
const assetId = process.argv[2];
const docHash = process.argv[3];

const assetsFile = path.join(__dirname, 'assets.json');

let assets = {};
if (fs.existsSync(assetsFile)) {
    assets = JSON.parse(fs.readFileSync(assetsFile));
}

assets[assetId] = { owner: "manufacturer", hash: docHash };
fs.writeFileSync(assetsFile, JSON.stringify(assets));
console.log(`Asset ${assetId} registered`);