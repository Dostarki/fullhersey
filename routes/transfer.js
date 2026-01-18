const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RadrService = require('../services/radrService');

// POST /api/transfer
// Initiates a ShadowWire "Withdraw to Recipient" transaction (Private Transfer)
router.post('/', auth, async (req, res) => {
    try {
        const { recipientAddress, amount } = req.body;
        const walletAddress = req.user.walletAddress;

        if (!recipientAddress || !amount) {
            return res.status(400).json({ error: 'Recipient address and amount are required' });
        }

        console.log(`Initiating Private Transfer: ${walletAddress} -> ${recipientAddress} (${amount} SOL)`);

        // Check if this is a Self-Withdraw (Withdraw Tab)
        if (recipientAddress === walletAddress) {
             console.log("Detecting Self-Withdraw. Using standard withdraw flow.");
             const unsignedTx = await RadrService.createWithdrawTx(walletAddress, amount);
             
             return res.json({
                 success: true,
                 message: 'Withdraw transaction created',
                 requiresSignature: false, // Frontend will sign the transaction itself
                 unsignedTx: unsignedTx
             });
        }

        // Use ShadowWire to create a withdraw transaction destined for the recipient
        // This acts as a private transfer since funds come from the shielded pool
        
        // NEW LOGIC: Use 'prepareExternalTransfer' to start the signature flow
        const transferData = await RadrService.prepareExternalTransfer(walletAddress, recipientAddress, amount);

        res.json({ 
            success: true, 
            message: 'Transfer initiated. Signature required.',
            requiresSignature: true,
            signatureData: transferData // { message, nonce, timestamp }
        });

    } catch (error) {
        console.error('Transfer Error:', error);
        res.status(500).json({ error: error.message || 'Transfer failed' });
    }
});

router.post('/confirm', auth, async (req, res) => {
    try {
        const { recipientAddress, amount, nonce, signature, message } = req.body;
        const walletAddress = req.user.walletAddress;

        console.log(`Confirming Transfer: ${walletAddress} -> ${recipientAddress}`);

        const result = await RadrService.executeExternalTransfer(
            walletAddress, 
            recipientAddress, 
            amount, 
            nonce, 
            signature, 
            message
        );

        res.json({
            success: true,
            message: 'Transfer successful',
            txHash: result.tx_signature
        });
    } catch (error) {
        console.error('Transfer Confirmation Error:', error);
        res.status(500).json({ error: error.message || 'Transfer confirmation failed' });
    }
});

module.exports = router;