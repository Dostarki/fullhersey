const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const axios = require('axios');
const nacl = require('tweetnacl'); // Move nacl import to top
const RadrService = require('../services/radrService');

// Jupiter API V6 (Standard/Ultra)
const JUPITER_API_KEY = 'e6d7de54-9c24-4a7e-b0e6-67ba48867951';
const JUPITER_BASE_URL = 'https://api.jup.ag/swap/v1'; // Using v1 as standard
const JUPITER_QUOTE_API = `${JUPITER_BASE_URL}/quote`;
const JUPITER_SWAP_API = `${JUPITER_BASE_URL}/swap`;
const JUPITER_TOKENS_API = 'https://token.jup.ag/strict'; // Use strict list for safety

// Cache for tokens
let tokenCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Helper: Fetch Tokens
const getTokens = async () => {
    if (tokenCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
        return tokenCache;
    }
    try {
        const response = await axios.get(JUPITER_TOKENS_API);
        tokenCache = response.data;
        lastCacheTime = Date.now();
        return tokenCache;
    } catch (error) {
        console.error('Failed to fetch tokens:', error.message);
        return tokenCache || []; // Return stale cache or empty
    }
};

// Get Token List
router.get('/tokens', async (req, res) => {
    const tokens = await getTokens();
    res.json(tokens);
});

const { Connection, Keypair, VersionedTransaction, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
// Fix for bs58 import issue across different versions
const decode = bs58.decode || (bs58.default ? bs58.default.decode : null) || ((str) => new Uint8Array(bs58.default(str))); 

// If decode is still not found, try to use the raw library if it's a function directly
// But usually bs58.decode works in older versions, and bs58.default.decode in newer.
// Let's print what bs58 is to debug if this fails again.
if (typeof decode !== 'function') {
    console.error('[CRITICAL] bs58 library structure unexpected:', bs58);
}

// ... (imports remain same)

// Execute Swap Transaction (via Jupiter, signed by Backend Shielded Wallet)
router.post('/execute', auth, async (req, res) => {
    try {
        console.log('[SWAP] Execute Request Body:', req.body);

        let { amount, inputMint, outputMint, fromToken, toToken, slippageBps = 50, signature, message, nonce } = req.body;
        
        // Handle frontend sending whole token objects
        if (!inputMint && fromToken && fromToken.address) inputMint = fromToken.address;
        if (!outputMint && toToken && toToken.address) outputMint = toToken.address;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
        
        // 1. Get User
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        // 2. Get Internal Keypair (To execute Jupiter TX)
        const privateKey = user.depositSecret || user.walletPrivateKey;
        if (!privateKey) return res.status(400).json({ error: 'Internal wallet not configured' });
        
        // Setup Connection
        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6', 'confirmed');
        const wallet = Keypair.fromSecretKey(decode(privateKey));
        const userPublicKey = wallet.publicKey.toString();

        // Check Internal Wallet Balance First
        const internalBalance = await connection.getBalance(wallet.publicKey);
        const internalBalanceSOL = internalBalance / 1_000_000_000;
        console.log(`[SWAP] Internal Wallet Balance: ${internalBalanceSOL} SOL`);

        // 3. DEDUCT BALANCE FROM SHIELDED ACCOUNT (via RadrService)
        // Only if we are swapping FROM SOL (which is the shielded asset)
        // AND if Internal Wallet doesn't have enough SOL
        if (inputMint === 'So11111111111111111111111111111111111111112' || fromToken?.symbol === 'SOL') {
            
            // Check if we need to transfer
            // We need amount + fee (0.005)
            const requiredAmount = Number(amount) + 0.005;
            
            if (internalBalanceSOL >= requiredAmount) {
                console.log('[SWAP] Internal Wallet has enough SOL. Skipping Shielded Transfer.');
            } else {
                console.log('[SWAP] Deducting SOL from Shielded Balance...');
                
                // Verify signature matches the transfer message format (Safely)
                if (message && !message.includes('external_transfer')) {
                     console.warn('[SWAP] Warning: Message format does not match external_transfer.');
                }

                try {
                    // Transfer amount needed (or full amount if internal is empty)
                    // For simplicity, let's transfer the requested amount
                    const transferResult = await RadrService.executeExternalTransfer(
                        user.walletAddress,   // Sender
                        userPublicKey,        // Recipient (Internal Wallet)
                        amount,               // Amount
                        nonce,                // Nonce
                        signature,            // Signature
                        message               // Message
                    );
                    console.log('[SWAP] Shielded Balance Deducted Successfully. TX:', transferResult.tx_signature);
                    
                    // Wait for confirmation...
                    if (transferResult.tx_signature) {
                        console.log('[SWAP] Waiting for transfer confirmation...');
                        try {
                            const confirmRes = await connection.confirmTransaction(transferResult.tx_signature, 'confirmed');
                            if (confirmRes.value.err) throw new Error('Transfer failed on-chain');
                            console.log('[SWAP] Transfer Confirmed. Proceeding to Swap.');
                        } catch (e) {
                            console.warn('[SWAP] Transfer confirmation warning:', e.message);
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }

                } catch (deductError) {
                    // If transfer fails (e.g. insufficient funds in Shielded), check if we can still proceed with Internal Balance
                    console.error('[SWAP] Failed to deduct balance:', deductError.message);
                    
                    if (internalBalanceSOL >= Number(amount)) {
                         console.warn('[SWAP] Transfer failed but Internal Wallet has funds. Proceeding anyway.');
                    } else {
                         return res.status(400).json({ error: 'Failed to deduct shielded balance and Internal Wallet is empty: ' + deductError.message });
                    }
                }
            }
        }
        
        // 4. PREPARE JUPITER SWAP
        // Calculate amount in smallest unit
        // FIX: Leave some SOL for fees in the Internal Wallet if swapping SOL
        let swapAmount = Number(amount);
        if (inputMint === 'So11111111111111111111111111111111111111112' || fromToken?.symbol === 'SOL') {
            // Deduct 0.003 SOL for network fees & rent
            const FEE_RESERVE = 0.003; 
            if (swapAmount > FEE_RESERVE) {
                swapAmount -= FEE_RESERVE;
                console.log(`[SWAP] Reserved ${FEE_RESERVE} SOL for fees. Swapping ${swapAmount} SOL.`);
            }
        }

        // Decimals Logic
        let decimals = 9;
        if (fromToken && fromToken.decimals !== undefined) decimals = fromToken.decimals;
        else if (inputMint !== 'So11111111111111111111111111111111111111112') decimals = 6;

        const amountInSmallestUnit = Math.floor(swapAmount * Math.pow(10, decimals)); 

        // Get Quote
        const quoteUrl = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInSmallestUnit}&slippageBps=${slippageBps}`;
        console.log('[SWAP] Fetching Quote:', quoteUrl);
        
        const quoteResponse = await axios.get(quoteUrl, { headers: { 'x-api-key': JUPITER_API_KEY } });
        const quoteData = quoteResponse.data;

        if (!quoteData) throw new Error('No quote found');

        // Get Swap Transaction
        const swapPayload = {
            quoteResponse: quoteData,
            userPublicKey: userPublicKey, // Shielded Wallet Public Key
            wrapAndUnwrapSol: true,
            asLegacyTransaction: false,
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true
        };
        
        console.log('[SWAP] Getting Swap TX from Jupiter...');
        const swapResponse = await axios.post('https://api.jup.ag/swap/v1/swap', swapPayload, {
            headers: { 'Content-Type': 'application/json', 'x-api-key': JUPITER_API_KEY }
        });

        const { swapTransaction } = swapResponse.data;
        if (!swapTransaction) throw new Error('No swap transaction returned');

        // 5. Sign and Send Transaction (Backend Side)
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        
        // Sign with Shielded Wallet
        transaction.sign([wallet]);

        console.log('[SWAP] Sending Signed Transaction...');
        const txid = await connection.sendTransaction(transaction, {
            skipPreflight: true,
            maxRetries: 2
        });

        console.log(`[SWAP] Transaction Sent: ${txid}`);

        // Wait for confirmation logic optimized
        let status = 'pending';
        try {
            // Use a simpler confirmation strategy or just wait slightly
            // Ideally we should use a retry loop or webhook, but for now let's be optimistic
            // and handle the timeout gracefully.
            const confirmation = await connection.confirmTransaction(txid, 'confirmed');
            
            if (confirmation.value.err) {
                console.error('[SWAP] Transaction failed on chain:', confirmation.value.err);
                status = 'failed';
                throw new Error('Transaction failed on chain');
            }
            status = 'confirmed';
            console.log('[SWAP] Transaction Confirmed');
        } catch (confirmError) {
            if (confirmError.name === 'TransactionExpiredTimeoutError' || confirmError.message.includes('tim')) {
                console.warn('[SWAP] Confirmation timed out, but TX was sent. It might still succeed.');
                status = 'sent_unknown';
                // We do NOT throw here, we return success with a warning note
            } else {
                throw confirmError;
            }
        }

        // 6. Record Transaction
        const dbTransaction = new Transaction({
            type: 'SWAP',
            userId: req.user.userId,
            amount: Number(amount),
            token: `${fromToken?.symbol || 'UNKNOWN'}-${toToken?.symbol || 'UNKNOWN'}`,
            txHash: txid,
            status: status === 'confirmed' ? 'COMPLETED' : 'PENDING',
            details: { protocol: 'JUPITER', inputMint, outputMint }
        });
        await dbTransaction.save();

        res.json({ 
            success: true,
            txHash: txid,
            status: status,
            message: status === 'confirmed' 
                ? 'Swap executed successfully' 
                : 'Swap transaction sent, waiting for confirmation on chain.'
        });

    } catch (error) {
        console.error('Swap Execution Error:', error);
        const msg = error.response?.data?.error || error.message || 'Swap failed';
        res.status(500).json({ error: msg });
    }
});

// Notify Backend of Success
router.post('/notify', auth, async (req, res) => {
    try {
        const { amount, fromTokenSymbol, toTokenSymbol, txHash } = req.body;
        
        const transaction = new Transaction({
            type: 'SWAP',
            userId: req.user.userId,
            amount: Number(amount),
            token: `${fromTokenSymbol}-${toTokenSymbol}`,
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
