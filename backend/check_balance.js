const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function checkBalance() {
    try {
        const address = '8YxY6SnnS1cnVuY8Sft1xRBdxywhJNJfyjMdPtDC6Xek';
        const pubKey = new PublicKey(address);
        
        console.log(`Checking balance for: ${address}`);
        const balance = await connection.getBalance(pubKey);
        
        console.log(`Balance: ${balance} lamports`);
        console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    } catch (error) {
        console.error("Error:", error);
    }
}

checkBalance();
