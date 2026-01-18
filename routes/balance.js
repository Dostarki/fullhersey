const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const RadrService = require('../services/radrService');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
// const { TOKEN_PROGRAM_ID } = require('@solana/spl-token'); // Removed dependency
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Mainnet Connection
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

router.get('/portfolio', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Use depositAddress OR derive from depositSecret if available
        let walletAddress = user.depositAddress;
        
        // Fallback: if depositAddress is missing but we have secret, derive it
        if (!walletAddress && user.depositSecret) {
            const { Keypair } = require('@solana/web3.js');
            const bs58 = require('bs58');
            try {
                // Handle different bs58 import styles
                const decode = bs58.decode || (bs58.default ? bs58.default.decode : null) || ((str) => new Uint8Array(bs58.default(str)));
                const kp = Keypair.fromSecretKey(decode(user.depositSecret));
                walletAddress = kp.publicKey.toString();
                console.log(`[Portfolio] Derived address from secret: ${walletAddress}`);
            } catch (e) {
                console.error('[Portfolio] Failed to derive address:', e);
            }
        }

        if (!walletAddress) {
            console.log('[Portfolio] No wallet address found for user');
            return res.json({ tokens: [] });
        }

        const walletPublicKey = new PublicKey(walletAddress);
        console.log(`[Portfolio] Fetching tokens for ${walletAddress}`);

        // 1. Get SPL Tokens
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
            programId: TOKEN_PROGRAM_ID
        });
        
        console.log(`[Portfolio] Found ${tokenAccounts.value.length} token accounts`);

        const tokens = tokenAccounts.value.map((accountInfo) => {
            const parsedInfo = accountInfo.account.data.parsed.info;
            return {
                mint: parsedInfo.mint,
                amount: parsedInfo.tokenAmount.uiAmount,
                decimals: parsedInfo.tokenAmount.decimals
            };
        }).filter(t => t.amount > 0); // Hide zero balances
        
        console.log(`[Portfolio] Non-zero tokens:`, tokens);

        // 2. Enhance with Metadata (Symbol, Logo)
        // We can fetch from Jupiter Token List or local map
        // For now, let's use a basic map or fetch on frontend
        // Or fetch from Jupiter Token API if needed for backend enrichment
        
        res.json({ 
            address: user.depositAddress,
            tokens: tokens 
        });

    } catch (error) {
        console.error('[Portfolio] Error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

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
