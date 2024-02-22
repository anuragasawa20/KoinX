const express = require('express');
const router = express.Router();
const axios = require("axios");
const CoinController = require("../Controllers/coinControllers");




// Route to fetch and store cryptocurrencies
router.get('/fetchCryptos', CoinController.getList);

// http://localhost:4000/api/crypto/priceConversion
// used for converting the price from one unit of any crypto to other listed crypto
router.post('/priceConversion', CoinController.priceConversion);

// http://localhost:4000/api/crypto/companiesList
// fetching the companylist for public_treasury on basis of ethereum and bitcoin
router.get('/companiesList', CoinController.fetchPublicTresury);

module.exports = router;