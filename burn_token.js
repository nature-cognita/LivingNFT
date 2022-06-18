const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');

require("dotenv").config(); // use .env

//const config = require('./__env.dev');
const collectionId = 410; // put the collection ID number where the token is located
const burnTokenId = 2 //  put the token ID you want to burn

async function main() {
  
    // 1. Initialise the provider to connect to the node
    let uniqueHelper = new UniqueHelper(new Logger());
    //await uniqueHelper.connect(config.wsEndpoint);
    await uniqueHelper.connect(process.env.WS_ENDPOINT); // via .env
  
    // 2. Receive Owners's keypair from the .env file to sign transactions
    //let owner = uniqueHelper.util.fromSeed(config.ownerSeed);
    let owner = uniqueHelper.util.fromSeed(process.env.OWNER_SEED); // via .env
    console.log("Collection owner address: ", owner.address);
  
    // 3. Burn an NFT
    let success = await uniqueHelper.burnNFTToken(owner, collectionId, burnTokenId);
    console.log(`Token #${burnTokenId} from the collection #${collectionId} burned — ${success}`);
  }
  
  main().catch(console.error).finally(() => process.exit());
  