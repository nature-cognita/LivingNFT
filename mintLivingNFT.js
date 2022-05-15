const { UniqueHelper } = require('./src/lib/unique');
const { Logger } = require('./src/lib/logger');
const { UniqueSchemaHelper } = require('./src/lib/unique');
const config = require('./__env.dev');
const { schemaObject, schema } = require('./schema.data');

const checkBalance = async (uniqueHelper, signer) => {
  const props = await uniqueHelper.getChainProperties()
  const tokenSymbol = props.tokenSymbol[0]
  const decimals = parseInt(props.tokenDecimals[0])

  const balanceBigInt = await uniqueHelper.getSubstrateAccountBalance(signer.address)
  const balanceStr = balanceBigInt.toString().padStart(decimals, '0')
  const balance = parseFloat(balanceStr.slice(0, -decimals) + '.' + balanceStr.slice(-decimals))
  
  const MIN_BALANCE = 3

  console.log(`Balance check: Your have ${balance} ${tokenSymbol}.`)

  if (balance >= MIN_BALANCE) {
    console.log(`Balance check: OK. Your have more than ${MIN_BALANCE} ${tokenSymbol}.`)
  } else {
    throw new Error(`YOU HAVE JUST ${balance} ${tokenSymbol}. Please get more than ${MIN_BALANCE} ${tokenSymbol} to mint collection and tokens`)
  }
  return {
    tokenSymbol, decimals, balance
  }
}

const prepareTokenData = (schemaObject, tokenJson) => {

  const {attributes} = tokenJson;
  const preparedData = {};

  for (const attribute of attributes) {
    const {trait_type: traitName, value: traitValue} = attribute
    const result = schemaObject.lookupEnum(traitName)
    const fieldName = Object.entries(result.options).find(([_, translatesJson]) => {
      return translatesJson.match(traitValue)
    })?.[0]
    const encodedValue = result.values[fieldName]
    if (encodedValue !== undefined)
      preparedData[traitName] = encodedValue
  }

  return preparedData
}

const parseImageURL = (imageURL) => {
  // http://server/address/path/to/image/nft_image_{id}.png
  let imageId;
  try {
    imageId = imageURL.match(/(?<=\_)(\d+)(?=\.)/g)[0]; // we're searching for the "_{id}." part
  } catch (err) {
    throw "ImageURL not properly formatted, should contain _{id}." + err;
  }
  return parseInt(imageId);
};

// Mint a LivingNFT
async function mintNFT(imageURL, user) {

    // 1. Initialize the provider to connect to the node
    let uniqueHelper = new UniqueHelper(new Logger());
    await uniqueHelper.connect(config.wsEndpoint);

    // 2. Receive Owners's keypair from the .env file to sign transactions
    let unitNC = uniqueHelper.util.fromSeed(config.ownerSeed);
    console.log("Collection owner address: ", unitNC.address);

    // 3. Check if the imageURL ID corresponds to the ID of the token we're about to mint 
    let collectionId = config.collectionId;
    let lastTokenId = await uniqueHelper.getCollectionLastTokenId(collectionId);
    let imageId = parseImageURL(imageURL);
    console.log(`imageId=${imageId}, lasttokenid=${lastTokenId}`);
    if (lastTokenId !== imageId - 1) {
      throw `IDs of the image and token DO NOT match. Image ID should be changed to ${lastTokenId + 1}`;
    }

    // 4. Check Owner's account balance
    await checkBalance(uniqueHelper, unitNC);

    // To refill the balance automatically on the test network:
    // try {
    //   await checkBalance(uniqueHelper, unitNC)
    // } catch (err) {
    //   console.error(err)
    //   if (config.wsEndpoint.match('comecord')) {
    //     console.log('RPC is dev (comecord), trying to send some money from Alice')
    //     const aliceSigner = UniqueUtil.fromSeed('//Alice')
    //     const result = await uniqueHelper.transferBalanceToSubstrateAccount(aliceSigner, unitNC.address, 100n * (10n**18n))
    //     console.log('Money balance sufficience result', result)
    //     await checkBalance(uniqueHelper, unitNC).catch()
    //   }
    // }

    // 5. Check whether we have User's address to mint to
    let ADDRESS_TO_MINT_TO;
    let pollinatedBy = 'itself';
    
    if (user !== "None") {
      ADDRESS_TO_MINT_TO = user;
      pollinatedBy = 'a human';
      console.log(`User address recieved ---------------> ${user}`);
    }

    const tokenOwner = ADDRESS_TO_MINT_TO || unitNC.address; 
    console.log(`Address to mint to ---------------> ${tokenOwner}`);

    if (tokenOwner !== unitNC.address) {
      console.log('minting LivingNFT for a human.............');
    } else {
      console.log('minting LivingNFT for a Nature Cognita unit.............');
    }

    // 6. Configure NFT metadata based on the info about User from the input .json
    let schemaHelper = new UniqueSchemaHelper(new Logger());
    
    let tokenJson = {
      "attributes": [
       {
        "trait_type": "Description", // permanent description
        "value": "This piece of art is created by the Nature Cognita unit at the SNI Experimental Zone #1"
       },
       {
        "trait_type": "Digitally_pollinated_by", // if user ≠ None: by a human, else: by itself
        "value": pollinatedBy
       }
      ]
    };
    const preparedTokenData = prepareTokenData(schemaObject, tokenJson) // tranform token data according to the schema
    const encodedToken = schemaHelper.encodeData(schema, preparedTokenData) // token data to the hex format
    const validateResult = schemaHelper.validateData(schema, preparedTokenData)

    if (!validateResult.success) {
      console.error('ERROR', validateResult.error.message);
    }
  
    // 7. Mint an NFT (by initiating a transaction) with configured metadata

    const result = await uniqueHelper.mintNFTToken(unitNC, {collectionId, owner: {Substrate: tokenOwner}, constData: encodedToken});
    const tokenOwnerNorm = uniqueHelper.util.normalizeSubstrateAddress(result.token.owner.substrate);
    console.log(`LivingNFT minted: \n success - ${result.success} \n collectionId - ${result.token.collectionId} \n collectionOwner - ${unitNC.address} \n tokenId - ${result.token.tokenId} \n tokenOwner - ${tokenOwnerNorm}`);
    // console.log(result.token.owner.substrate); // not normalized owner address
    
    return {"collectionId": result.token.collectionId, "collectionOwner": unitNC.address, "tokenId": result.token.tokenId, "tokenOwner": tokenOwnerNorm};
    // TODO return "transactionHash" : hash 
}
  
module.exports = {
    mintNFT
}