const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');

require("dotenv").config(); // use .env file

//const config = require('./__env.dev');
let collectionId = 451; // put the collection ID number you want to burn

async function main() {
  
    // 1. Initialise the provider to connect to the node
    let uniqueHelper = new UniqueHelper(new Logger());
    //await uniqueHelper.connect(config.wsEndpoint);
    await uniqueHelper.connect(process.env.WS_ENDPOINT); // via .env
  
    // 2. Receive Owners's keypair from the .env file to sign transactions
    //let owner = uniqueHelper.util.fromSeed(config.ownerSeed);
    let owner = uniqueHelper.util.fromSeed(process.env.OWNER_SEED); // via .env
    console.log("Collection owner address: ", owner.address);
  
    // 3. Burn collection 
    let success = await uniqueHelper.burnNFTCollection(owner, collectionId);
    console.log(`Collection #${collectionId} burned — ${success}`);
  }
  
  main().catch(console.error).finally(() => process.exit());
  