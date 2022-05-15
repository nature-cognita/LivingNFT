const minter = require('./mintLivingNFT');

var express = require('express');
var port = 3000;
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/', async function (req, res) {
  console.log(req.body);

    let user = req.body["user"]; // User's public key or None (if a Unit sends data by itself)
    let imageURL = req.body["imageURL"]; // ID of a 3D-model to use in the off-chain schema

    // Image ID from imageURL will be parsed and compared with a token ID in the mintNFT script

  try {
    var mintedNft = await minter.mintNFT(imageURL, user);
  } catch (err) {
    res.status(500).send({"ERROR" : err}); // if Image ID and token ID do not match
  }
  // returns: 
    //  collectionId
    //  collectionOwner
    //  tokenId
    //  tokenOwner

  res.status(201).send(mintedNft);
})

app.get('/', (req, res) => {
  res.send('Hello, better use post!')
})

app.listen(port, () => {
  console.log(`LivingNFT app is listening on port ${port}`)
})

module.exports = app;
