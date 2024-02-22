const express = require("express");
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const connectDB = require("./db")
const priceRoutes = require("./Routes/priceRoutes");
const Crypto = require("./Models/cryptoModel");



const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.json());

const port = process.env.PORT || 4000;

connectDB();

app.get('/', (req, res) => {
    res.send("Hello it's working");
});

app.use("/api/crypto", priceRoutes);

async function updateCurrencies() {
    try {
        // Fetch currency list from Coingecko API
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        const currencies = response.data;

        // Get existing currencies from the database
        const existingCurrencies = await Crypto.find({}, { id: 1 });
        const existingIds = existingCurrencies.map(currency => currency.id);

        // Filter out new currencies
        const newCurrencies = currencies.filter(currency => !existingIds.includes(currency.id));

        // Insert new currencies into the database
        if (newCurrencies.length > 0) {
            await Crypto.insertMany(newCurrencies);
            console.log(`${newCurrencies.length} new currencies added to the database.`);
        } else {
            console.log('No new currencies to add.');
        }
    } catch (error) {
        console.error('Error updating currencies:', error);
    }
}

// Schedule the job to run every hour
schedule.scheduleJob('0 * * * *', () => {
    console.log('Updating currencies...');
    updateCurrencies();
});



const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
