
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6');

async function checkRelayerBalance() {
    const relayerAddress = '32u4d8ucKmPr63os1HHtL2vWiCG67GorVmtU3ftzvr1v';
    const balance = await connection.getBalance(new PublicKey(relayerAddress));
    console.log(`Relayer Balance (${relayerAddress}): ${balance / LAMPORTS_PER_SOL} SOL`);
}

checkRelayerBalance();
