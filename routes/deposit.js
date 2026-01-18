const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RadrService = require('../services/radrService');
const { Transaction: SolTransaction } = require('@solana/web3.js');

// Create Unsigned Deposit Transaction (Using ShadowWire SDK)
router.post('/create-tx', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        console.log(`Creating ShadowWire Deposit TX for ${req.user.walletAddress} (${amount} SOL)`);

        // Use RadrService (ShadowWire SDK)
        const tx = await RadrService.createDepositTx(req.user.walletAddress, amount);
        
        // SDK returns an object with 'unsigned_tx_base64'
        // Example: { amount_deposited: ..., fee: ..., unsigned_tx_base64: "..." }
        
        let base64Transaction = tx.unsigned_tx_base64;
        
        // Fallback if structure is different (e.g. if SDK updates)
        if (!base64Transaction && tx.serialize) {
             const serialized = tx.serialize({ requireAllSignatures: false });
             base64Transaction = serialized.toString('base64');
        } else if (!base64Transaction && typeof tx === 'string') {
             base64Transaction = tx;
        }

        if (!base64Transaction) {
            throw new Error("Failed to generate unsigned transaction from ShadowWire SDK");
        }

        res.json({ 
            unsignedTx: base64Transaction,
            message: 'Please sign this transaction to deposit into ShadowWire Shielded Pool'
        });
    } catch (error) {
        console.error("Create Deposit TX Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Notify Backend that deposit is complete
router.post('/notify', auth, async (req, res) => {
    try {
        const { amount, txHash } = req.body;
        
        const user = await User.findById(req.user.userId);
        user.privateBalance += Number(amount);
        await user.save();

        const transaction = new Transaction({
            type: 'DEPOSIT',
            userId: req.user.userId,
            amount: Number(amount),
            token: 'SOL',
            txHash: txHash,
            details: { protocol: 'SHADOWWIRE_ZK' }
        });
        await transaction.save();

        res.json({ message: 'Deposit recorded successfully', newBalance: user.privateBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
