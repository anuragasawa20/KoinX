const Crypto = require("../Models/cryptoModel");
const axios = require("axios");

const coingeckoUrlList = 'https://api.coingecko.com/api/v3/coins/list';
const coingeckoPrice = 'https://api.coingecko.com/api/v3/coins';
const coingeckoPublicTreasury = 'https://api.coingecko.com/api/v3/companies/public_treasury';

class Coins {

    async getList(req, res) {
        try {
            // Fetch data from Coingecko API
            const response = await axios.get(coingeckoUrlList);
            const cryptos = response.data;

            // Insert cryptocurrencies into MongoDB
            await Crypto.insertMany(cryptos);

            res.send('Cryptocurrencies fetched and stored successfully.');
        } catch (error) {
            console.error('Error fetching and storing cryptocurrencies:', error);
            res.status(500).send('Internal server error');
        }
    }

    async priceConversion(req, res) {
        try {
            const { fromCurrency, toCurrency, date } = req.body;

            // Validate date to ensure it is not more than today's date
            const currentDate = new Date();
            const requestedDate = new Date(date);
            if (requestedDate > currentDate) {
                return res.status(400).json({ error: 'Date cannot be more than today.' });
            }

            // Check if both fromCurrency and toCurrency exist in Crypto model
            // This check take little time
            const cryptoExists = await Crypto.find({ id: { $in: [fromCurrency, toCurrency] } });
            if (cryptoExists.length !== 2) {
                return res.status(400).json({ error: 'One or both of the provided cryptocurrencies are not listed.' });
            }

            // Make a GET request to the CoinGecko API
            const responseFrom = await axios.get(`${coingeckoPrice}/${fromCurrency}/history`, {
                params: {
                    date,
                    localization: false
                }
            });

            const responseTo = await axios.get(`${coingeckoPrice}/${toCurrency}/history`, {
                params: {
                    date,
                    localization: false
                }
            });

            // Extract Usd value from the response
            const usdValueFrom = responseFrom.data.market_data.current_price.usd;
            const usdValueTo = responseTo.data.market_data.current_price.usd;

            // console.log(usdValueFrom, usdValueTo);

            const convertedPrice = usdValueFrom / usdValueTo;

            res.json({ convertedPrice: convertedPrice });
        } catch (error) {
            console.error('Error fetching stablecoin data:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error });
        }
    }

    async fetchPublicTresury(req, res) {
        try {
            const { currency } = req.body;

            if (currency !== 'bitcoin' && currency !== 'ethereum') {
                return res.status(400).json({ error: 'Invalid currency. Only bitcoin or ethereum are allowed.' });
            }

            // Making a GET request to the Coingecko API
            const response = await axios.get(`${coingeckoPublicTreasury}/${currency}`);

            // Extracting the list of companies from the response
            const companies = response.data.companies;

            // Return the list of companies in the response
            res.json({ companies });
        } catch (error) {
            console.error('Error fetching companies data:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error });
        }
    }

}


const coinController = new Coins();
module.exports = coinController;