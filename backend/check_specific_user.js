const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB.");

        const targetAddress = 'MSmvaTpdPCPfaAg4FEhexrtY5dWDhbnGbXG89PLJAdq';
        const user = await User.findOne({ walletAddress: targetAddress });

        if (user) {
            console.log(`User Found! ID: ${user._id}`);
            console.log(`Wallet: ${user.walletAddress}`);
            console.log(`Private Balance: ${user.privateBalance}`);
            console.log(`Deposit Address: ${user.depositAddress}`);
        } else {
            console.log("User with this wallet address NOT FOUND.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
