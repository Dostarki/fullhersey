import React, { useState, useEffect } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { 
    Settings, 
    ArrowDown, 
    ArrowRight, 
    Shield, 
    Wallet, 
    RefreshCw, 
    LogOut, 
    ChevronDown, 
    Copy, 
    ExternalLink, 
    Check, 
    X,
    History,
    SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import TokenSelector from '../components/TokenSelector';

// Helius RPC URL
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=9b5e747a-f1c2-4c67-8294-537ad41e92b6';
// Use relative path for API, works for both dev (with proxy) and prod (same origin)
// If running dev separately without proxy, you might need http://localhost:80/api
const API_URL = '/api'; 

const DEFAULT_TOKENS = [
    { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', decimals: 6 }
];

const DashboardPage = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('swap'); // swap, transfer, shield, unshield
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(0); // Public Balance
    const [privateBalance, setPrivateBalance] = useState(0); // Private SOL
    const [authToken, setAuthToken] = useState(null);
    
    // Inputs
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    
    // Swap State
    const [tokens, setTokens] = useState([]);
    const [portfolio, setPortfolio] = useState([]); // Shielded Assets
    const [fromToken, setFromToken] = useState(DEFAULT_TOKENS[0]);
    const [toToken, setToToken] = useState(DEFAULT_TOKENS[1]);
    const [slippage, setSlippage] = useState(0.5); // %
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectorType, setSelectorType] = useState('from'); // 'from' or 'to'
    const [showSlippageSettings, setShowSlippageSettings] = useState(false);
    
    // Quote State
    const [quote, setQuote] = useState(null);
    const [outputAmount, setOutputAmount] = useState('');
    const [isQuoting, setIsQuoting] = useState(false);

    // Jupiter API Config
    const JUPITER_API_KEY = 'e6d7de54-9c24-4a7e-b0e6-67ba48867951'; // User provided key
    const JUPITER_URL = 'https://api.jup.ag/swap/v1'; // Using v1 as standard, ultra/v1 if needed

    // UI & Status
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [transactions, setTransactions] = useState([]);

    // --- Effects ---
    useEffect(() => {
        checkWalletConnection();
        fetchTokens();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (authToken) {
            fetchPrivateBalance(authToken);
            fetchTransactions(authToken);
        }
    }, [authToken]);

    // --- Quote Logic ---
    useEffect(() => {
        if (activeTab !== 'swap' || !amount || isNaN(amount) || Number(amount) <= 0) {
            setQuote(null);
            setOutputAmount('');
            return;
        }

        const fetchQuote = async () => {
            setIsQuoting(true);
            try {
                const inputMint = fromToken.address;
                const outputMint = toToken.address;
                const inputDecimals = fromToken.decimals || 9;
                const amountInSmallestUnit = Math.floor(Number(amount) * Math.pow(10, inputDecimals));

                if (amountInSmallestUnit <= 0) return;

                const quoteUrl = `${JUPITER_URL}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInSmallestUnit}&slippageBps=${Math.round(slippage * 100)}`;
                
                const response = await axios.get(quoteUrl, {
                    headers: {
                        'x-api-key': JUPITER_API_KEY
                    }
                });

                const data = response.data;
                setQuote(data);

                if (data.outAmount) {
                    const outputDecimals = toToken.decimals || 6;
                    const outAmt = Number(data.outAmount) / Math.pow(10, outputDecimals);
                    setOutputAmount(outAmt.toFixed(6));
                }
            } catch (error) {
                console.error("Quote fetch error:", error);
                setQuote(null);
                setOutputAmount('');
            } finally {
                setIsQuoting(false);
            }
        };

        const timeoutId = setTimeout(fetchQuote, 500); // Debounce 500ms
        return () => clearTimeout(timeoutId);

    }, [amount, fromToken, toToken, slippage, activeTab]);

    // --- Helpers ---
    const fetchPortfolio = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/balance/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.tokens) {
                // Enrich tokens with metadata from Jupiter list
                const enriched = res.data.tokens.map(pt => {
                    const meta = tokens.find(t => t.address === pt.mint);
                    return {
                        ...pt,
                        symbol: meta?.symbol || 'Unknown',
                        name: meta?.name || 'Unknown Token',
                        logoURI: meta?.logoURI || 'https://via.placeholder.com/32'
                    };
                });
                setPortfolio(enriched);
            }
        } catch (e) {
            console.error("Portfolio fetch failed", e);
        }
    };

    const fetchTokens = async () => {
        try {
            // Check local storage first
            const cached = localStorage.getItem('jupiter_tokens');
            const cachedTime = localStorage.getItem('jupiter_tokens_time');
            if (cached && cachedTime && Date.now() - Number(cachedTime) < 1000 * 60 * 60) {
                setTokens(JSON.parse(cached));
                return;
            }

            const res = await axios.get(`${API_URL}/swap/tokens`);
            setTokens(res.data);
            localStorage.setItem('jupiter_tokens', JSON.stringify(res.data));
            localStorage.setItem('jupiter_tokens_time', Date.now());
        } catch (e) {
            console.error("Failed to fetch tokens", e);
            setTokens(DEFAULT_TOKENS);
        }
    };

    const refreshData = () => {
        if (walletAddress) refreshPublicBalance();
        if (authToken) {
            fetchPrivateBalance(authToken);
            fetchPortfolio(authToken);
        }
    };

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 5000);
    };

    // --- Wallet & Auth ---
    const checkWalletConnection = async () => {
        if (window.phantom?.solana?.isPhantom) {
            try {
                const resp = await window.phantom.solana.connect({ onlyIfTrusted: true });
                handleConnect(resp.publicKey);
            } catch (err) { /* Not connected */ }
        }
    };

    const connectWallet = async () => {
        if (window.phantom?.solana?.isPhantom) {
            try {
                const resp = await window.phantom.solana.connect();
                handleConnect(resp.publicKey);
            } catch (err) { console.error(err); }
        } else {
            window.open('https://phantom.app/', '_blank');
        }
    };

    const handleConnect = async (publicKey) => {
        const address = publicKey.toString();
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        
        // Get Public Balance
        try {
            const connection = new Connection(HELIUS_RPC);
            const bal = await connection.getBalance(publicKey);
            setBalance(bal / LAMPORTS_PER_SOL);
        } catch (e) { console.error(e); }

        // Attempt Auth
        handleSignMessage(publicKey);
    };

    const handleSignMessage = async (publicKey) => {
        try {
            const address = publicKey.toString();
            const storedToken = localStorage.getItem('authToken');
            const storedWallet = localStorage.getItem('walletAddress');

            if (storedToken && storedWallet === address) {
                setAuthToken(storedToken);
                return storedToken;
            }

            const message = `Sign this message to authenticate with Spectre Privacy Layer. Wallet: ${address}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.phantom.solana.signMessage(encodedMessage, "utf8");
            
            const signature = bs58.encode(signedMessage.signature);
            const res = await axios.post(`${API_URL}/auth`, { walletAddress: address, signature, message });
            
            const token = res.data.token;
            setAuthToken(token);
            localStorage.setItem('authToken', token);
            return token;
        } catch (err) {
            console.error("Auth failed:", err);
            return null;
        }
    };

    const disconnect = () => {
        setWalletAddress(null);
        setAuthToken(null);
        setBalance(0);
        setPrivateBalance(0);
        localStorage.clear();
        window.phantom?.solana?.disconnect();
    };

    // --- API Calls ---
    const refreshPublicBalance = async () => {
        if (!walletAddress) return;
        try {
            const connection = new Connection(HELIUS_RPC);
            const bal = await connection.getBalance(new PublicKey(walletAddress));
            setBalance(bal / LAMPORTS_PER_SOL);
        } catch (e) { console.error(e); }
    };

    const fetchPrivateBalance = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/balance`, { headers: { Authorization: `Bearer ${token}` } });
            setPrivateBalance(res.data.privateBalance);
        } catch (e) { console.error(e); }
    };

    const fetchTransactions = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
            setTransactions(res.data);
        } catch (e) { console.error(e); }
    };

    // --- Actions ---
    const handleAction = async () => {
        if (!walletAddress) return connectWallet();
        if (!amount || isNaN(amount) || Number(amount) <= 0) return notify('error', 'Invalid amount');

        let token = authToken;
        if (!token) {
            token = await handleSignMessage(new PublicKey(walletAddress));
            if (!token) return notify('error', 'Authentication failed');
        }

        setIsProcessing(true);
        try {
            // 1. SHIELD (Deposit)
            if (activeTab === 'shield') {
                const res = await axios.post(`${API_URL}/deposit/create-tx`, { amount: Number(amount) }, { headers: { Authorization: `Bearer ${token}` } });
                await processTx(res.data.unsignedTx, token, 'deposit');
            }
            // 2. WITHDRAW (Private to Self)
            else if (activeTab === 'withdraw') {
                const res = await axios.post(`${API_URL}/transfer`, { amount: Number(amount), recipientAddress: walletAddress }, { headers: { Authorization: `Bearer ${token}` } });
                
                if (res.data.requiresSignature) {
                    await processTransferSignature(res.data.signatureData, token, walletAddress);
                } else {
                    await processTx(res.data.unsignedTx, token, 'withdraw');
                }
            }
            // 3. TRANSFER (Private to Other)
            else if (activeTab === 'transfer') {
                if (!recipient) return notify('error', 'Recipient address required');
                const res = await axios.post(`${API_URL}/transfer`, { amount: Number(amount), recipientAddress: recipient }, { headers: { Authorization: `Bearer ${token}` } });
                
                if (res.data.requiresSignature) {
                    await processTransferSignature(res.data.signatureData, token, recipient);
                } else {
                    await processTx(res.data.unsignedTx, token, 'withdraw'); 
                }
            }
            // 4. SWAP
            else if (activeTab === 'swap') {
                // 1. Prepare Swap (Get nonce/message from backend if needed, or generate locally)
                // For simplicity and matching Transfer logic, we'll sign a message locally or ask backend for it.
                
                // IMPORTANT: We use 'external_transfer' format so backend can actually deduct balance via RADR SDK
                const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
                const timestamp = Math.floor(Date.now() / 1000);
                const transferType = 'external_transfer';
                const message = `shadowpay:${transferType}:${nonce}:${timestamp}`;
                
                const encodedMessage = new TextEncoder().encode(message);
                
                // Request Signature from Phantom
                const { signature } = await window.phantom.solana.signMessage(encodedMessage, 'utf8');
                const signatureBase58 = bs58.encode(signature);

                // 2. Execute Swap on Backend with Signature
                const res = await axios.post(`${API_URL}/swap/execute`, { 
                    amount: Number(amount), 
                    fromToken, 
                    toToken,
                    slippageBps: Math.round(slippage * 100),
                    signature: signatureBase58,
                    message: message,
                    nonce: nonce, // Send nonce too
                    timestamp: timestamp
                }, { headers: { Authorization: `Bearer ${token}` } });
                
                notify('success', 'Swap Successful! TX: ' + res.data.txHash.slice(0, 8) + '...');
            }
            
            setAmount('');
            refreshData();
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            notify('error', msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const processTx = async (unsignedTx, token, type) => {
        // This function is now only used for Deposit/Withdraw (Public Wallet)
        try {
            // Determine transaction type (Versioned or Legacy)
            const txBuffer = Buffer.from(unsignedTx, 'base64');
            let transaction;
            
            try {
                // Try deserializing as Versioned Transaction first (Jupiter v6 default)
                transaction = VersionedTransaction.deserialize(txBuffer);
            } catch (e) {
                // Fallback to Legacy Transaction
                transaction = Transaction.from(txBuffer);
            }

            const { signature } = await window.phantom.solana.signAndSendTransaction(transaction);
            
            const connection = new Connection(HELIUS_RPC, 'confirmed');
            const latestBlockhash = await connection.getLatestBlockhash();
            
            await connection.confirmTransaction({ 
                signature, 
                blockhash: latestBlockhash.blockhash, 
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight 
            }, 'confirmed');
    
            // Notify Backend
            const endpoint = type === 'swap' ? '/swap/notify' : (type === 'deposit' ? '/deposit/notify' : '/withdraw/notify');
            const payload = type === 'swap' 
                ? { amount: Number(amount), fromTokenSymbol: fromToken.symbol, toTokenSymbol: toToken.symbol, txHash: signature }
                : { amount: Number(amount), txHash: signature };
                
            await axios.post(`${API_URL}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            notify('success', 'Transaction Successful');
        } catch (error) {
            console.error("Transaction failed", error);
            notify('error', 'Transaction failed: ' + error.message);
        }
    };

    // --- New Transfer Flow (Message Signing) ---
    const processTransferSignature = async (transferData, token, targetRecipient) => {
        try {
            console.log("Processing Transfer Signature with data:", transferData);
            const { message, nonce } = transferData;
            
            if (!message) {
                throw new Error("Message to sign is missing from backend response");
            }

            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.phantom.solana.signMessage(encodedMessage, "utf8");
            
            console.log("Phantom signMessage response:", signedMessage);

            // Fix: Check if signature is a Uint8Array (Phantom standard) or object
            // Some wallet versions return { signature: Uint8Array }
            let signatureBytes = signedMessage.signature || signedMessage;
            
            // Ensure signatureBytes is a Uint8Array or Buffer
            if (signatureBytes && typeof signatureBytes === 'object' && !Array.isArray(signatureBytes) && !(signatureBytes instanceof Uint8Array) && !Buffer.isBuffer(signatureBytes)) {
                 // It might be a regular object with numeric keys if something weird happened, but unlikely.
                 // If it's the raw response object and signature prop is missing, we might have an issue.
                 console.warn("Signature bytes is an unknown object:", signatureBytes);
            }

            if (!signatureBytes) {
                throw new Error("Failed to get signature bytes from wallet response");
            }

            const signature = bs58.encode(signatureBytes);
            console.log("Encoded Signature:", signature);
            
            // Confirm with Backend
            const res = await axios.post(`${API_URL}/transfer/confirm`, {
                amount: Number(amount),
                recipientAddress: targetRecipient,
                nonce,
                signature,
                message
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                notify('success', 'Transfer Successful: ' + res.data.txHash.slice(0, 8) + '...');
                setAmount('');
                setRecipient('');
                refreshData();
            }
        } catch (err) {
            console.error("Transfer Signature Error:", err);
            notify('error', 'Transfer signature failed: ' + err.message);
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 flex flex-col font-sans relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Navbar */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[95%] max-w-6xl bg-[#0A0A0A]/70 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl transition-all hover:border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <img src="https://i.hizliresim.com/852gn2e.png" alt="Spectre" className="relative w-8 h-8 rounded-lg shadow-lg" />
                    </div>
                    <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Spectre</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-1 bg-[#111]/50 p-1 rounded-full border border-white/5">
                         <button onClick={() => setShowHistory(!showHistory)} className="text-gray-400 hover:text-white transition-all text-xs font-medium hover:bg-white/5 px-4 py-1.5 rounded-full">History</button>
                         <a href="/app" className="text-gray-400 hover:text-white transition-all text-xs font-medium hover:bg-white/5 px-4 py-1.5 rounded-full">Docs</a>
                    </div>
                    
                    {walletAddress ? (
                        <button onClick={disconnect} className="group relative flex items-center gap-2 bg-[#111] hover:bg-[#161616] px-4 py-2 rounded-full transition-all border border-white/5 shadow-lg hover:border-purple-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
                                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                            </span>
                        </button>
                    ) : (
                        <button onClick={connectWallet} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-80 transition duration-300"></div>
                            <div className="relative bg-white text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-gray-100 transition-colors shadow-xl">
                                Connect Wallet
                            </div>
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-10">
                
                {/* Network Status Pill */}
                <div className="mb-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="relative group cursor-default">
                        <div className="absolute -inset-px bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        <div className="relative flex items-center gap-4 px-5 py-2 bg-[#0A0A0A] rounded-full border border-white/5 shadow-2xl">
                            <div className="flex items-center gap-2">
                                <div className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </div>
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Solana Mainnet</span>
                            </div>
                            <div className="w-px h-3 bg-white/10"></div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 uppercase">ZK-Privacy Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Stats */}
                {walletAddress && (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-[520px] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Public Balance */}
                        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                                <Wallet className="w-10 h-10 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Public Balance</span>
                                </div>
                                <div className="text-2xl font-bold text-white font-mono tracking-tight mb-1">
                                    {(balance || 0).toFixed(4)}
                                </div>
                                <div className="flex items-center gap-1 opacity-50">
                                    <span className="text-[10px] font-mono text-gray-300 truncate max-w-[100px]">{walletAddress}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Private Balance */}
                        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
                            <div className="absolute -inset-px bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                                <Shield className="w-10 h-10 text-purple-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Shielded Balance</span>
                                </div>
                                <div className="text-2xl font-bold text-white font-mono tracking-tight mb-1">
                                    {(privateBalance || 0).toFixed(4)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${authToken ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        {authToken ? 'Protected' : 'Auth Required'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    {/* Shielded Assets Portfolio - ALWAYS VISIBLE FOR DEBUG */}
                    <div className="col-span-2 mt-2 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                            Shielded Assets
                        </h4>
                        
                        {portfolio.length > 0 ? (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {portfolio.map((asset, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={asset.logoURI} 
                                                alt={asset.symbol} 
                                                className="w-8 h-8 rounded-full bg-gray-800 object-cover shadow-sm"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=?'; }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{asset.symbol}</span>
                                                <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{asset.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold text-white">{asset.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-gray-600 gap-2 border border-dashed border-white/5 rounded-xl">
                                <span className="text-xs">No assets found</span>
                                <span className="text-[9px] text-gray-700">Swap tokens to see them here</span>
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Main Interaction Card */}
                <div className="w-full max-w-[520px] bg-[#0A0A0A]/80 border border-white/5 rounded-[32px] p-2 shadow-2xl backdrop-blur-2xl relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Tab Navigation */}
                    <div className="grid grid-cols-4 gap-1 mb-2 p-1.5 bg-[#050505] rounded-[24px] border border-white/5">
                        {[
                            { id: 'shield', label: 'Shield', icon: Shield },
                            { id: 'withdraw', label: 'Withdraw', icon: LogOut },
                            { id: 'swap', label: 'Swap', icon: RefreshCw },
                            { id: 'transfer', label: 'Transfer', icon: ArrowRight }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setAmount(''); setRecipient(''); }}
                                className={`flex items-center justify-center gap-2 py-2 rounded-[20px] text-[11px] font-bold uppercase tracking-wide transition-all duration-300 ${
                                    activeTab === tab.id 
                                    ? 'bg-[#151515] text-white shadow-lg border border-white/5' 
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                            >
                                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-purple-400' : ''}`} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-3">
                        
                        {/* Input Section */}
                        <div className="bg-[#0F0F0F] rounded-[24px] p-4 border border-white/5 hover:border-white/10 transition-all duration-300 group relative">
                            <div className="flex justify-between items-center mb-3 relative z-10">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                    {activeTab === 'unshield' ? 'Unshield Amount' : 'You Pay'}
                                </span>
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                    <span className="text-[10px] text-gray-400 font-mono px-2">
                                        Bal: {activeTab === 'shield' ? (balance || 0).toFixed(4) : (privateBalance || 0).toFixed(4)}
                                    </span>
                                    <button 
                                        onClick={() => setAmount(activeTab === 'shield' ? balance : privateBalance)}
                                        className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-purple-400 font-bold transition-colors uppercase tracking-wider"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4 relative z-10">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-800 outline-none font-mono tracking-tighter"
                                />
                                {activeTab === 'swap' ? (
                                    <button 
                                        onClick={() => { setSelectorType('from'); setIsSelectorOpen(true); }}
                                        className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 duration-300 min-w-[120px]"
                                    >
                                        <img 
                                            src={fromToken.logoURI} 
                                            className="w-6 h-6 rounded-full shadow-sm" 
                                            alt={fromToken.symbol}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/24?text=?'; }} 
                                        />
                                        <span className="font-bold text-sm pr-1 truncate">{fromToken.symbol}</span>
                                        <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-xl border border-white/5 shadow-lg">
                                        <img 
                                            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" 
                                            className="w-6 h-6 rounded-full shadow-sm" 
                                            alt="SOL" 
                                        />
                                        <span className="font-bold text-sm pr-1">SOL</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle Action Indicator */}
                        <div className="flex justify-center -my-6 relative z-20">
                            <div 
                                onClick={() => {
                                    if (activeTab === 'swap') {
                                        const temp = fromToken;
                                        setFromToken(toToken);
                                        setToToken(temp);
                                    }
                                }}
                                className={`bg-[#0A0A0A] border-[3px] border-[#0A0A0A] outline outline-1 outline-white/10 p-2.5 rounded-xl text-gray-400 shadow-xl hover:text-white hover:scale-110 transition-all cursor-pointer bg-[#111] ${activeTab === 'swap' ? 'hover:rotate-180' : ''}`}
                            >
                                {activeTab === 'swap' ? <RefreshCw className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            </div>
                        </div>

                        {/* Recipient / Output Area */}
                        <div className="bg-[#0F0F0F] rounded-[24px] p-4 border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
                            
                            {/* Content based on Tab */}
                            <div className="relative min-h-[140px]">
                            {activeTab === 'swap' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300 absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <div className="bg-purple-500/10 p-4 rounded-full border border-purple-500/10 mb-3 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                                        <RefreshCw className="w-8 h-8 text-purple-400 relative z-10" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Coming Soon</h3>
                                    <p className="text-xs text-gray-400 max-w-[200px]">
                                        Private Swaps are currently under maintenance. Check back later!
                                    </p>
                                </div>
                            )}
                            
                            {/* DISABLED SWAP UI
                            {activeTab === 'swap_disabled' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300 absolute inset-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                                            You Receive
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="0.00"
                                            value={isQuoting ? "Loading..." : outputAmount || "0.00"} 
                                            className="w-full bg-transparent text-4xl font-bold text-gray-600 outline-none font-mono tracking-tighter"
                                        />
                                        <button 
                                            onClick={() => { setSelectorType('to'); setIsSelectorOpen(true); }}
                                            className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 duration-300 min-w-[120px]"
                                        >
                                            <img 
                                                src={toToken.logoURI} 
                                                className="w-6 h-6 rounded-full shadow-sm" 
                                                alt={toToken.symbol} 
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/24?text=?'; }}
                                            />
                                            <span className="font-bold text-sm pr-1 truncate">{toToken.symbol}</span>
                                            <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
                                        </button>
                                    </div>
                                </div>
                            )} 
                            */}
                            
                            {activeTab === 'shield' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300 absolute inset-0 flex items-center">
                                    <div className="flex items-center gap-5 w-full">
                                        <div className="bg-purple-500/10 p-4 rounded-full border border-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative">
                                            <Shield className="w-8 h-8 text-purple-400 relative z-10" />
                                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-white text-lg tracking-tight">Shielded Pool</span>
                                            <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                                                Your assets will be encrypted and moved to the private pool.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'withdraw' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300 absolute inset-0 flex items-center">
                                    <div className="flex items-center gap-5 w-full">
                                        <div className="bg-green-500/10 p-4 rounded-full border border-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                            <LogOut className="w-8 h-8 text-green-400" />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-bold text-white text-sm">Withdraw to Wallet</span>
                                                <div className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/10 tracking-wider">SELF</div>
                                            </div>
                                            <div className="bg-black/30 rounded-xl px-3 py-2 border border-white/5 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={walletAddress || ''}
                                                    className="bg-transparent text-xs font-mono text-gray-400 outline-none w-full tracking-wide"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'transfer' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300 absolute inset-0 flex flex-col justify-center">
                                    <div className="space-y-3 w-full">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                                                Recipient
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-[#050505] rounded-2xl p-2 border border-white/5 focus-within:border-purple-500/30 transition-colors shadow-inner">
                                            <input
                                                type="text"
                                                placeholder="Enter Solana Address..."
                                                value={recipient}
                                                onChange={(e) => setRecipient(e.target.value)}
                                                className="w-full bg-transparent text-sm font-mono text-white placeholder-gray-700 outline-none px-3 py-2"
                                            />
                                            <button 
                                                onClick={async () => { try { const t = await navigator.clipboard.readText(); setRecipient(t); } catch(e){} }}
                                                className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg tracking-wider"
                                            >
                                                PASTE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>

                        {/* Footer / Fee */}
                        <div className="px-4 py-2 bg-[#0A0A0A] rounded-[18px] border border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                Network Fee
                            </span>
                            <span className="font-mono text-gray-400">~0.00005 SOL</span>
                        </div>

                        {/* Main Action Button */}
                        <Button
                            onClick={handleAction}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-[24px] font-bold text-sm uppercase tracking-[0.15em] transition-all transform active:scale-[0.99] relative overflow-hidden group shadow-2xl ${
                                isProcessing 
                                ? 'bg-[#151515] text-gray-600 cursor-not-allowed border border-white/5' 
                                : 'bg-white text-black hover:bg-gray-100 border border-white/10 hover:shadow-[0_0_50px_rgba(255,255,255,0.15)]'
                            }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {!walletAddress ? 'Connect Wallet' : 
                                        activeTab === 'shield' ? 'Shield Assets' :
                                        activeTab === 'withdraw' ? 'Withdraw Assets' :
                                        activeTab === 'swap' ? 'Swap Tokens' : 'Transfer Assets'}
                                        {!isProcessing && walletAddress && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                </div>



            </main>

            {/* Notifications */}
            {notification && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 z-50 flex items-center gap-4 ${
                    notification.type === 'error' ? 'bg-[#1a0505]/90 border-red-500/20 text-red-400' : 'bg-[#051a05]/90 border-green-500/20 text-green-400'
                }`}>
                    <div className={`p-2 rounded-full ${notification.type === 'error' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                        {notification.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-xs tracking-wide uppercase">{notification.msg}</span>
                </div>
            )}

            {/* History Sidebar */}
            {showHistory && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setShowHistory(false)}></div>
                    <div className="fixed inset-y-0 right-0 w-[400px] bg-[#0A0A0A] border-l border-white/5 p-8 z-50 animate-in slide-in-from-right duration-500 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl tracking-tight text-white">Activity History</h3>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500 hover:text-white" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {transactions.length > 0 ? transactions.map((tx, i) => (
                                <div key={i} className="bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                            tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-400' : 
                                            tx.type === 'WITHDRAW' ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400'
                                        }`}>{tx.type}</span>
                                        <span className="text-[10px] text-gray-600 font-mono">{new Date(tx.createdAt || tx.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-lg font-bold text-white">{tx.amount} SOL</span>
                                        <a href={`https://solscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-4 opacity-50">
                                    <History className="w-12 h-12" />
                                    <span className="text-sm font-medium">No transactions yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Token Selector Modal */}
            <TokenSelector 
                isOpen={isSelectorOpen} 
                onClose={() => setIsSelectorOpen(false)}
                tokens={tokens}
                rpcUrl={HELIUS_RPC}
                onSelect={(token) => {
                    if (selectorType === 'from') setFromToken(token);
                    else setToToken(token);
                    setIsSelectorOpen(false);
                }}
            />

        </div>
    );
};

export default DashboardPage;