const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAW', 'SWAP', 'TRANSFER'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  token: {
    type: String, // 'SOL' or 'USDC'
    default: 'SOL'
  },
  txHash: { // Only for Deposit/Withdraw
    type: String,
    unique: true,
    sparse: true
  },
  details: {
    type: Object // Extra details like swap rate, recipient, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
