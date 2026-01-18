const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RadrService = require('../services/radrService');

// Create Unsigned Withdraw Transaction (Using ShadowWire SDK)
// User requests to withdraw from Shielded Pool -> Wallet
router.post('/create-tx', auth, async (req, res) => {
    try {
        const { amount, destinationAddress } = req.body;
        const amountNum = Number(amount);

        if (!amountNum || amountNum <= 0) return res.status(400).json({ error: 'Invalid amount' });
        if (!destinationAddress) return res.status(400).json({ error: 'Destination address required' });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check Balance
        if (user.privateBalance < amountNum) {
             return res.status(400).json({ error: 'Insufficient private balance' });
        }

        console.log(`Creating ShadowWire Withdraw TX: Pool -> ${destinationAddress} (${amountNum} SOL)`);

        // Use RadrService (ShadowWire SDK)
        const tx = await RadrService.createWithdrawTx(req.user.walletAddress, amountNum);
        
        // Serialize Transaction
        // SDK returns { unsigned_tx_base64: "..." }
        let base64Transaction = tx.unsigned_tx_base64;

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
            message: 'Please sign this transaction to withdraw funds'
        });

    } catch (error) {
        console.error("Withdraw Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Notify Backend that withdraw is complete (Deduct Balance)
router.post('/notify', auth, async (req, res) => {
    try {
        const { amount, txHash } = req.body;
        const amountNum = Number(amount);

        const user = await User.findById(req.user.userId);
        
        // Deduct Balance
        // Note: In production, verify txHash on-chain to ensure it's a valid ShadowWire withdraw
        user.privateBalance -= amountNum;
        if (user.privateBalance < 0) user.privateBalance = 0; // Safety check
        await user.save();

        // Log Transaction
        const txRecord = new Transaction({
            type: 'WITHDRAW',
            userId: req.user.userId,
            amount: amountNum,
            token: 'SOL',
            txHash: txHash,
            details: { 
                protocol: 'SHADOWWIRE_ZK' 
            }
        });
        await txRecord.save();

        res.json({ 
            message: 'Withdrawal successful', 
            txHash: txHash,
            newBalance: user.privateBalance 
        });

    } catch (error) {
        console.error("Withdraw Notify Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
