const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listTx() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB.");

        const txs = await Transaction.find().sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${txs.length} recent transactions.`);

        txs.forEach(t => {
            console.log(`Type: ${t.type}, Amount: ${t.amount}, Hash: ${t.txHash}, Date: ${t.createdAt}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

listTx();
