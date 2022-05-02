const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require('./config');
const fs = require('fs');
const {serializeNft, deserializeNft} = require('./protobuf.js');
const schema = fs.readFileSync(`./${config.outputSchema}`);

function submitTransaction(sender, transaction) {
  return new Promise(async function(resolve, reject) {
    try {
      const unsub = await transaction
      .signAndSend(sender, (result) => {
        console.log(`Current tx status is ${result.status}`);
    
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          resolve(result.status.asInBlock);
          unsub();
        }
      });
    }
    catch (e) {
      reject(e.toString());
    }
  });
}

async function createItemAsync(api, signer, buffer) {
  const createData = {
    NFT: { const_data: Array.from(buffer), variable_data: [] },
  };

  const tx = api.tx.nft.createItem(config.collectionId, signer.address, createData);
  console.log("Result of createItem: " + tx);
  return await submitTransaction(signer, tx);
}


function encode(_traits) {
  const payload = {
    traits: _traits
  };    
  return serializeNft(schema, payload);
};

// TODO Metadata description
async function mintNFT(ownerId, user, imageURL, rawdata) {

    // 1. Initialise the provider to connect to the node
    const wsProvider = new WsProvider(config.wsEndpoint);
    const rtt = JSON.parse(fs.readFileSync("./runtime_types.json"));

    // 2. Create the API and wait until ready
    const api = await ApiPromise.create({ 
        provider: wsProvider,
        types: rtt
    });

    // 3. Receive Owners's keypair from the input .json (via .env file) to sign transactions
    // ownerId ?????
    const keyring = new Keyring({ type: 'sr25519' });
    const owner = keyring.addFromUri(config.ownerSeed);
    console.log("Collection owner address: ", owner.address);

    // 4. Mint NFTs (by initiating a transaction) using urls of raw data & 3D-model from the input .json
    // Create NFT traits from data attributes — TODO replace with raw data & 3D models
    let traits = [];
    // TODO check data values to define dead or alive
    if (rawdata == 0) {
        traits.push(0);
    } else {
        traits.push(1);
    }
    console.log("Traits:", traits);

    const buffer = encode(traits);
    console.log("Serialized NFT properties:", Array.from(buffer));

    // Test
    const payload = deserializeNft(schema, buffer, "en");
    console.log("Deserialized NFT properties:", payload);

    let hash = await createItemAsync(api, owner, buffer);
    console.log("Item created");

    // 5. (if User ≠ None) Transfer the minted NFT from the Owner (Unit) to the User

    // use .transfer method
    //let sendtoUser = api.tx.nft.transfer(user, config.collectionId, itemId);
    //await submitTransaction(owner, sendtoUser);
    
    // TODO - figure out how to get itemId
    return {"transactionHash" : hash, "collectionId": config.collectionId};
}
  
module.exports = {
    mintNFT
}