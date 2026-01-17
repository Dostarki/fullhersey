const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/transactions - Fetch transaction history for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId })
            .sort({ timestamp: -1 }) // Newest first
            .limit(20); // Limit to last 20 transactions

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
});

module.exports = router;