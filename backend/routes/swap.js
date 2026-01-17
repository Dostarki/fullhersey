const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

const JUPITER_QUOTE_API = 'https://public.jupiterapi.com/quote';
const JUPITER_SWAP_API = 'https://public.jupiterapi.com/swap';

// Token Mints
const TOKENS = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    'RENDER': 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof'
};

const TOKEN_DECIMALS = {
    'SOL': 9,
    'USDC': 6,
    'USDT': 6,
    'BONK': 5,
    'WIF': 6,
    'RAY': 6,
    'JUP': 6,
    'RENDER': 8
};

// Create Swap Transaction (via Jupiter)
router.post('/create-tx', auth, async (req, res) => {
    try {
        const { amount, fromToken, toToken } = req.body;
        
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
        if (!TOKENS[fromToken] || !TOKENS[toToken]) return res.status(400).json({ error: 'Invalid token' });

        const inputMint = TOKENS[fromToken];
        const outputMint = TOKENS[toToken];
        
        const decimals = TOKEN_DECIMALS[fromToken] || 9;
        const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals)); 

        // 1. Get Quote
        const quoteUrl = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInSmallestUnit}&slippageBps=50`;
        const quoteResponse = await axios.get(quoteUrl);
        const quoteData = quoteResponse.data;

        if (!quoteData) throw new Error('No quote found');

        // 2. Get Swap Transaction
        const swapResponse = await axios.post(JUPITER_SWAP_API, {
            quoteResponse: quoteData,
            userPublicKey: req.user.walletAddress,
            wrapAndUnwrapSol: true
        });

        const { swapTransaction } = swapResponse.data;

        res.json({ 
            unsignedTx: swapTransaction,
            message: 'Please sign the swap transaction'
        });

    } catch (error) {
        console.error('Swap Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Swap creation failed: ' + (error.response?.data?.error || error.message) });
    }
});

// Notify Backend of Success
router.post('/notify', auth, async (req, res) => {
    try {
        const { amount, fromToken, toToken, txHash } = req.body;
        
        const transaction = new Transaction({
            type: 'SWAP',
            userId: req.user.userId,
            amount: Number(amount),
            token: `${fromToken}-${toToken}`,
            txHash: txHash,
            details: { protocol: 'JUPITER' }
        });
        await transaction.save();

        res.json({ message: 'Swap recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
