// We create collection only once for a single Unit and then just mint NFTs (via mintLivingNFT.js) in this collection
const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');
const config = require('./__env.dev');
const { schema } = require('./schema.data');
const COLLECTION_NAME = `Living NFTs by Nature Cognita x SNI`;
const COLLECTION_DESCRIPTION = `Digital art created by nature. Living plants generate electricity and power environmental sensors. Each new portion of sensing data is transformed into a generative art that represents the life of the plants and thus can change | learn more at cognita.dev`;
const COLLECTION_TOKEN_PREFIX = `COGN`;


// Create NFT collection

async function main() {
  
  // 1. Initialise the provider to connect to the node
  let uniqueHelper = new UniqueHelper(new Logger());
  await uniqueHelper.connect(config.wsEndpoint);

  // 2. Receive Owners's keypair from the .env file to sign transactions
  let owner = uniqueHelper.util.fromSeed(config.ownerSeed);
  console.log("Collection owner address: ", owner.address);

  // 3. Configure collection options 
  const constOnChainSchema = schema;
  const offchainSchema = `https://cognita-dev.s3.amazonaws.com/outputs/living_nft_{id}.png`; // Each minted token in the collection will refer to an image with the corresponding id

  const collectionOptions = {
    name: COLLECTION_NAME, 
    description: COLLECTION_DESCRIPTION, 
    tokenPrefix: COLLECTION_TOKEN_PREFIX,
    offchainSchema,
    schemaVersion: "ImageURL",
    constOnChainSchema,
    limits: {
      sponsorTransferTimeout: 0,
      sponsorApproveTimeout: 0,
    },
    metaUpdatePermission: "Admin"
  };

  const {collectionId} = await uniqueHelper.mintNFTCollection(owner, collectionOptions);
  console.log(`Collection created: ${collectionId}`);
}

main().catch(console.error).finally(() => process.exit());
