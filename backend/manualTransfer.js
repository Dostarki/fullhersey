
const { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Mainnet Connection
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function manualTransfer() {
    try {
        const recipientAddress = 'FSz6Rct85bQ2YkD9AomsXDNfrmPV49vFtE3Db9vmSN5v';
        const amountSOL = 0.00150; // Belirtilen miktar

        console.log(`Initiating Transfer: Relayer -> ${recipientAddress} (${amountSOL} SOL)`);

        // Load Relayer Keypair
        const decode = bs58.decode || bs58.default?.decode;
        const relayerSecretKey = decode(process.env.RELAYER_SECRET_KEY);
        const relayerKeypair = Keypair.fromSecretKey(relayerSecretKey);

        const fromPubkey = relayerKeypair.publicKey;
        const toPubkey = new PublicKey(recipientAddress);

        const balance = await connection.getBalance(fromPubkey);
        console.log(`Relayer Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

        // Sweep ALL funds (Balance - Fee)
        const fee = 5000;
        const lamports = balance - fee;

        if (lamports <= 0) {
            console.error("Insufficient funds in Relayer wallet (Balance < Fee).");
            return;
        }

        console.log(`Sweeping ALL Funds: ${lamports / LAMPORTS_PER_SOL} SOL`);

        // Create Transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;
        transaction.sign(relayerKeypair);

        const signature = await connection.sendRawTransaction(transaction.serialize());
        console.log(`Transaction Sent: ${signature}`);
        
        console.log("Waiting for confirmation...");
        await connection.confirmTransaction(signature, 'confirmed');
        console.log("Transfer Successful!");

    } catch (error) {
        console.error("Transfer Error:", error);
    }
}

manualTransfer();
