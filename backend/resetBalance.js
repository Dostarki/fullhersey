
const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetBalance() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB.");

        const walletAddress = 'FSz6Rct85bQ2YkD9AomsXDNfrmPV49vFtE3Db9vmSN5v'; 
        const user = await User.findOne({ walletAddress });

        if (user) {
            console.log(`User Found: ${user.walletAddress}`);
            console.log(`Current Balance: ${user.privateBalance} SOL`);
            
            user.privateBalance = 0; // Reset to 0
            await user.save();
            
            console.log(`Balance Reset to: ${user.privateBalance} SOL`);
        } else {
            console.log("User not found.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

resetBalance();
