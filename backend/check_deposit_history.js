const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function checkDepositHistory() {
    try {
        // Kullanıcının Deposit Adresi (list_users.js çıktısından alındı)
        const address = 'HHiwfcPnKbu6m7coDmVobivvN85tZWbdc1nXEapSGjj9';
        const pubKey = new PublicKey(address);
        
        console.log(`Fetching history for Deposit Address: ${address}`);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 });
        
        console.log(`Found ${signatures.length} transactions.`);
        
        for (const sig of signatures) {
            console.log(`Sig: ${sig.signature}`);
            console.log(`Time: ${new Date(sig.blockTime * 1000).toISOString()}`);
            console.log(`Err: ${sig.err ? JSON.stringify(sig.err) : 'Success'}`);
            console.log('---');
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkDepositHistory();
