// We create collection only once for a single Unit and then just mint NFTs (via mint.js) in this collection
const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');
const config = require('./config');
const fs = require('fs');
const { SCHEMA_JSON } = require('./schema.data');

async function main() {
  const collectionOptions = {name: 'LivingNFT', description: 'LivingNFT test collection', tokenPrefix: 'TMP'};

  let uniqueHelper = new UniqueHelper(new Logger());
  await uniqueHelper.connect(config.wsEndpoint);

  let owner = uniqueHelper.util.fromSeed(config.ownerSeed);
  console.log("Collection owner address: ", owner.address);

  let collection = await uniqueHelper.mintNFTCollection(owner, collectionOptions);
  console.log(`Collection created: ${collection.collectionId}`);

  console.log("=== Set const on-chain schema ===");
  let setOnChainSchemaResult = await collection.setConstOnChainSchema(owner, SCHEMA_JSON); 
  if (!setOnChainSchemaResult) console.error('FAILED to set on-chain schema');

  console.log("=== Set schema version ===");
  let setSchemaVersionResult = await collection.setSchemaVersion(owner, 'ImageURL');
  if (!setSchemaVersionResult) console.error('FAILED to set schema version');
 
  console.log("=== Set offchain schema ===");
  const newOffchainSchema = `http://localhost:8080/ipfs/QmWB5Qmd2MtMLzzCmH4rKyDfSxPLGcEVt7ERiBdT6YQVh7/nft_image_{id}.png`;
  let setOffchainSchemaResult = await collection.setOffchainSchema(owner, newOffchainSchema);
  if (!setOffchainSchemaResult) console.error('FAILED to set offchain schema');
}

main().catch(console.error).finally(() => process.exit());
