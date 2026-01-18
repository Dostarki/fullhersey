
const { Connection, PublicKey } = require('@solana/web3.js');

async function checkTokens() {
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');
    const wallet = new PublicKey('HHiwfcPnKbu6m7coDmVobivvN85tZWbdc1nXEapSGjj9');

    console.log('Checking tokens for:', wallet.toString());

    // Token Program ID
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID
    });

    console.log('Found accounts:', tokenAccounts.value.length);

    tokenAccounts.value.forEach((accountInfo) => {
        const parsedInfo = accountInfo.account.data.parsed.info;
        if (parsedInfo.tokenAmount.uiAmount > 0) {
            console.log(`- Mint: ${parsedInfo.mint}`);
            console.log(`  Amount: ${parsedInfo.tokenAmount.uiAmount}`);
        }
    });
    
    if (tokenAccounts.value.length === 0) {
        console.log("No token accounts found.");
    }
}

checkTokens();
