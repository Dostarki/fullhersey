const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB.");

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Wallet: ${u.walletAddress}`);
            console.log(`PrivateBal: ${u.privateBalance}`);
            console.log(`DepositAddr: ${u.depositAddress}`);
            console.log('---');
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
