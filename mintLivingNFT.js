const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');
const { UniqueSchemaHelper } = require('./src/lib/unique');
const config = require('./config');
const fs = require('fs');
const { SCHEMA_JSON } = require('./schema.data');

// Mint a LivingNFT
async function mintNFT(imageURL, user) {

    // 1. Initialise the provider to connect to the node

    let uniqueHelper = new UniqueHelper(new Logger());
    await uniqueHelper.connect(config.wsEndpoint);

    // 2. Receive Owners's keypair from the .env file to sign transactions
    let owner = uniqueHelper.util.fromSeed(config.ownerSeed);
    console.log("Collection owner address: ", owner.address);

    // 3. Mint NFTs (by initiating a transaction) using url of a 3D-model from the input .json
    
    let schemaHelper = new UniqueSchemaHelper(new Logger());

    // Configure NFT metadata from User's data in the input .json (the mapping process described in schema-generator.js):
    // "This piece of art created by the Nature Cognita unit at the SNI Experimental Zone #1."
    // "Digitally pollinated by: itself / a human (if user ≠ None, i.e. User's public key is recieved)"
    let traitsArr = [];
    if (user == "None") {
      traitsArr.push(0);
    } else {
      traitsArr.push(1);
    }
    console.log("Traits:", traitsArr);

    let dataBinary = schemaHelper.encodeData(SCHEMA_JSON, { traits: traitsArr });

    // Test
    let decodedData = schemaHelper.decodeData(SCHEMA_JSON, dataBinary);
    console.log("Deserialized NFT properties:", decodedData);

    let collectionId = config.collectionId;
    const result = await uniqueHelper.mintNFTToken(owner, {collectionId, owner: owner.address, constData: dataBinary});
    console.log(`Transaction included at blockHash ${result}`);
    console.log(`LivingNFT minted: \n success - ${result.success} \n collectionId - ${result.token.collectionId} \n tokenId - ${result.token.tokenId} owner address - ${result.token.owner.substrate}`);

    // TODO if user ≠ None, then owner = user 

    return {"collectionId": result.token.collectionId, "tokenId": result.token.tokenId, "owner": result.token.owner.substrate};
    // TODO "transactionHash" : hash
}
  
module.exports = {
    mintNFT
}