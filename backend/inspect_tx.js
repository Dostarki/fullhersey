const { Connection } = require('@solana/web3.js');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function inspectTx() {
    try {
        const sig = '4xQzjMCHgp3PhnkzRnWhpo9D1NRAWHpFG2DucPMqzjt36ENXfux2VEv2SZ8GeHfmUdfXi4TWYp3SQg3SXTVdA4JR';
        console.log(`Fetching TX: ${sig}`);
        
        const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
        
        if (!tx) {
            console.log("Transaction not found.");
            return;
        }

        console.log("Date:", new Date(tx.blockTime * 1000).toISOString());
        
        console.log("Logs:", tx.meta.logMessages);

        const instructions = tx.transaction.message.instructions;
        console.log("Instruction Count:", instructions.length);

        for (const ix of instructions) {
            console.log("Program:", ix.programId.toString());
            if (ix.parsed) {
                 console.log("Parsed:", JSON.stringify(ix.parsed, null, 2));
            }
        }
        
        // Check post balances to see net changes
        const accountKeys = tx.transaction.message.accountKeys.map(k => ({
            pubkey: k.pubkey.toString(),
            signer: k.signer,
            writable: k.writable
        }));
        
        const preBalances = tx.meta.preBalances;
        const postBalances = tx.meta.postBalances;

        console.log("Balance Changes:");
        accountKeys.forEach((k, i) => {
            const diff = (postBalances[i] - preBalances[i]) / 1_000_000_000;
            if (diff !== 0) {
                console.log(`${k.pubkey}: ${diff} SOL`);
            }
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

inspectTx();
