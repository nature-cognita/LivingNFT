const minter = require('./mint');

var express = require('express');
var port = 3000;
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/', async function (req, res) {
  console.log(req.body);

  // TODO validate values
  let owner = req.body["owner"]; // Unit's public key + seed phrase. TODO — send Owner's seed phrase via .env file
  let user = req.body["user"]; // User's public key or None (if a Unit sends data by itself)
  let imageURL = req.body["imageURL"]; // ID of a 3D-model to use in the off-chain schema
  let rawdata = req.body["rawdata"]; // ID of raw data to use in the off-chain schema (optional)

  // TODO - как конвертировать ID 3д-модели из запроса в ID, который вставляется в url в off-chain schema
   
  var mintedNft = await minter.mintNFT(owner, user, imageURL, rawdata);

  res.status(201).send(mintedNft);
})

app.get('/', (req, res) => {
  res.send('Hello, better use post!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
