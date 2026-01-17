const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const RadrService = require('../services/radrService');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Mainnet Connection
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
        console.log('Balance Check: User not found for ID', req.user.userId);
        return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[Balance] Checking for ${user.walletAddress}`);
    console.log(`[Balance] API Key: ${user.radrApiKey ? 'Present' : 'Missing'}`);

    // Fetch balance from ShadowWire SDK (Source of Truth)
    let privateBalance = user.privateBalance || 0;

    try {
        // Use Radr API Key if available
        const shadowBalance = await RadrService.getBalance(user.walletAddress, user.radrApiKey);
        console.log(`[Balance] SDK Result:`, JSON.stringify(shadowBalance));

        if (shadowBalance && typeof shadowBalance.available === 'number') {
            // Convert Lamports to SOL
            const sdkBalanceSOL = shadowBalance.available / LAMPORTS_PER_SOL;
            
            // Update if significant difference or if DB is 0 but SDK has funds
            if (Math.abs(user.privateBalance - sdkBalanceSOL) > 0.000001) {
                console.log(`Syncing Balance for ${user.walletAddress}: DB=${user.privateBalance} -> SDK=${sdkBalanceSOL}`);
                user.privateBalance = sdkBalanceSOL;
                await user.save();
                privateBalance = sdkBalanceSOL;
            } else {
                 privateBalance = sdkBalanceSOL;
            }
        }
    } catch (err) {
        console.error("Failed to fetch ShadowWire balance:", err);
        // Fallback to DB balance if SDK fails
    }
    
    res.json({ 
        privateBalance: privateBalance,
        depositAddress: user.depositAddress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
