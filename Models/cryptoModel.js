const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema({
    name: String,
    id: {
        type: String,
        unique: true // Ensure uniqueness for ID
    },
    symbol: String
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

module.exports = Crypto;