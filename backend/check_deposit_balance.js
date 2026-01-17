const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function checkDepositBalance() {
    try {
        const address = 'HHiwfcPnKbu6m7coDmVobivvN85tZWbdc1nXEapSGjj9';
        const pubKey = new PublicKey(address);
        
        console.log(`Checking balance for: ${address}`);
        const balance = await connection.getBalance(pubKey);
        
        console.log(`Balance: ${balance} lamports`);
        console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    } catch (error) {
        console.error("Error:", error);
    }
}

checkDepositBalance();
