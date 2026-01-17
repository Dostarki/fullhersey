
const mongoose = require('mongoose');
const { Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Mainnet Connection
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function recoverFunds() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected.");

        // Find all users with deposit addresses
        const users = await User.find({ depositAddress: { $exists: true } });
        console.log(`Found ${users.length} users checking for funds...`);

        const decode = bs58.decode || bs58.default?.decode;
        const relayerSecretKey = decode(process.env.RELAYER_SECRET_KEY);
        const relayerKeypair = Keypair.fromSecretKey(relayerSecretKey);
        
        console.log(`Target Relayer Address: ${relayerKeypair.publicKey.toString()}`);

        for (const user of users) {
            if (!user.depositSecret) continue;

            try {
                const userSecretKey = decode(user.depositSecret);
                const userKeypair = Keypair.fromSecretKey(userSecretKey);
                const pubKey = userKeypair.publicKey;

                const balance = await connection.getBalance(pubKey);
                console.log(`User ${user.walletAddress} (Deposit Addr: ${pubKey.toString()}): ${balance} lamports (${balance / LAMPORTS_PER_SOL} SOL)`);

                if (balance > 5000) { // If > fee
                    const fee = 5000;
                    const transferAmount = balance - fee;
                    
                    console.log(`RECOVERING ${transferAmount} lamports (${transferAmount / LAMPORTS_PER_SOL} SOL) from ${pubKey.toString()}...`);

                    const transaction = new Transaction().add(
                        SystemProgram.transfer({
                            fromPubkey: pubKey,
                            toPubkey: relayerKeypair.publicKey,
                            lamports: transferAmount,
                        })
                    );

                    const { blockhash } = await connection.getLatestBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = pubKey;
                    transaction.sign(userKeypair);

                    const signature = await connection.sendRawTransaction(transaction.serialize());
                    console.log(`SUCCESS! TX: ${signature}`);
                    console.log(`Funds moved to Relayer. You can now Withdraw from the Dashboard.`);
                }
            } catch (err) {
                console.error(`Error processing user ${user._id}:`, err.message);
            }
        }

    } catch (error) {
        console.error("Recovery Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

recoverFunds();
