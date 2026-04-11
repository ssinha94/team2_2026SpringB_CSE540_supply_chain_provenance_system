const assetId = process.argv[2];
const newOwner = process.argv[3];
// call Fabric SDK TransferCustody here
console.log(`Asset ${assetId} transferred to ${newOwner}`);