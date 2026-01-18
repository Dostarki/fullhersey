const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  privateBalance: {
    type: Number,
    default: 0
  },
  usdcBalance: { type: Number, default: 0 },
  radrApiKey: { type: String, default: null }, // Store user's personal Radr API Key
  
  // Deposit Wallet (Internal Keypair)
  depositAddress: { type: String, default: null }, // Public Key
  depositSecret: { type: String, default: null }, // Private Key (Base58 encoded)
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
