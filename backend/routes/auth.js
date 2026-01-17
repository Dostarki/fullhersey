const express = require('express');
const router = express.Router();
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { TextEncoder } = require('util'); // Ensure TextEncoder is available
const RadrService = require('../services/radrService');

router.post('/', async (req, res) => {
  console.log('--- Auth Request Received ---');
  try {
    const { walletAddress, signature, message } = req.body;

    console.log('Wallet:', walletAddress);
    // console.log('Message:', message);
    // console.log('Signature:', signature);

    if (!walletAddress || !signature || !message) {
        console.log('Missing fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    try {
        const messageBytes = new TextEncoder().encode(message);
        
        // Handle bs58 version differences (v6+ uses default export, older uses direct export)
        const decode = bs58.decode || bs58.default?.decode;
        if (!decode) throw new Error('bs58.decode is not a function');

        const signatureBytes = decode(signature);
        const publicKeyBytes = decode(walletAddress);

        const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        console.log('Signature Verified:', verified);

        if (!verified) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
    } catch (verifyError) {
        console.error('Verification Error:', verifyError);
        return res.status(400).json({ error: 'Verification failed: ' + verifyError.message });
    }

    // Find or Create User
    let user = await User.findOne({ walletAddress });
    if (!user) {
      console.log('Creating new user...');
      user = new User({ walletAddress });

      // Fetch Real API Key from Radr
      const radrKey = await RadrService.registerUser(walletAddress);
      user.radrApiKey = radrKey;
    } else {
      console.log('User found:', user._id);
      
      // Fix for legacy/mock keys: If key is missing OR is a mock key, fetch a REAL one
      if (!user.radrApiKey || user.radrApiKey.startsWith('mock_key')) {
        console.log('Refreshing API Key for user...');
        const radrKey = await RadrService.registerUser(walletAddress);
        user.radrApiKey = radrKey;
      }
    }

    // Generate Deposit Address if missing (For both new and existing users)
    if (!user.depositAddress) {
        console.log('Generating new deposit address for user...');
        const keyPair = nacl.sign.keyPair();
        
        // Handle bs58 encode
        const encode = bs58.encode || bs58.default?.encode;
        if (!encode) throw new Error('bs58.encode is not a function');

        user.depositAddress = encode(keyPair.publicKey);
        user.depositSecret = encode(keyPair.secretKey);
        console.log('Deposit address generated:', user.depositAddress);
    }

    // Save User Changes
    await user.save();
    console.log('User saved:', user._id);

    // Issue JWT
    const token = jwt.sign(
        { userId: user._id, walletAddress }, 
        process.env.JWT_SECRET || 'secret', 
        { expiresIn: '24h' }
    );

    res.json({ token, user: { walletAddress: user.walletAddress, radrApiKey: user.radrApiKey } });
  } catch (error) {
    console.error('Auth Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
