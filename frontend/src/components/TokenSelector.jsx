import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Loader2, Plus, AlertCircle } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

const TokenSelector = ({ isOpen, onClose, onSelect, tokens = [], rpcUrl }) => {
    const [search, setSearch] = useState('');
    const [importedTokens, setImportedTokens] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setError(null);
        }
    }, [isOpen]);

    const allTokens = useMemo(() => {
        // Dedup logic: prefer tokens list over imported if address matches
        const tokenMap = new Map();
        tokens.forEach(t => tokenMap.set(t.address, t));
        importedTokens.forEach(t => {
            if (!tokenMap.has(t.address)) {
                tokenMap.set(t.address, t);
            }
        });
        return Array.from(tokenMap.values());
    }, [tokens, importedTokens]);

    const filteredTokens = useMemo(() => {
        if (!search) return allTokens;
        const lowerSearch = search.toLowerCase();
        return allTokens.filter(t => 
            t.symbol.toLowerCase().includes(lowerSearch) || 
            t.name.toLowerCase().includes(lowerSearch) ||
            t.address === search
        );
    }, [allTokens, search]);

    // Check if search is a valid address and not already in list
    const isUnknownAddress = useMemo(() => {
        try {
            // Basic length check for optimization
            if (search.length < 32 || search.length > 44) return false;
            new PublicKey(search);
            // If it's already in the filtered list, we don't need to import it
            return filteredTokens.length === 0;
        } catch (e) {
            return false;
        }
    }, [search, filteredTokens]);

    const handleImport = async () => {
        if (!rpcUrl) {
            setError("RPC URL missing");
            return;
        }
        setIsSearching(true);
        setError(null);
        
        try {
            // Use Helius DAS API getAsset
            const response = await axios.post(rpcUrl, {
                jsonrpc: '2.0',
                id: 'token-import',
                method: 'getAsset',
                params: {
                    id: search
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error.message);
            }

            const result = response.data.result;
            if (!result) throw new Error("Token not found");

            const metadata = result.content?.metadata;
            const tokenInfo = result.token_info;

            // Basic validation
            if (!tokenInfo) throw new Error("Address is not a valid token mint");

            const newToken = {
                address: search,
                name: metadata?.name || "Unknown Token",
                symbol: metadata?.symbol || "UNKNOWN",
                logoURI: result.content?.links?.image || "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
                decimals: tokenInfo.decimals !== undefined ? tokenInfo.decimals : 9
            };

            setImportedTokens(prev => [...prev, newToken]);
            onSelect(newToken);
            onClose();

        } catch (err) {
            console.error(err);
            setError("Could not import token. Ensure the address is a valid Mint Account.");
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="font-bold text-white text-lg">Select Token</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5 space-y-2">
                    <div className="relative bg-[#050505] rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-colors">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by name or mint address" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent p-3 pl-10 text-sm text-white placeholder-gray-600 outline-none"
                            autoFocus
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs px-2 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Token List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {/* Import Option */}
                    {isUnknownAddress && (
                        <button
                            onClick={handleImport}
                            disabled={isSearching}
                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group text-left border border-dashed border-white/10 hover:border-purple-500/50"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                {isSearching ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" /> : <Plus className="w-4 h-4 text-purple-500" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                                    {isSearching ? "Importing..." : "Import Token"}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                                    {search}
                                </span>
                            </div>
                        </button>
                    )}

                    {filteredTokens.length > 0 ? (
                        filteredTokens.map((token) => (
                            <button
                                key={token.address}
                                onClick={() => { onSelect(token); onClose(); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group text-left"
                            >
                                <img 
                                    src={token.logoURI} 
                                    alt={token.symbol} 
                                    className="w-8 h-8 rounded-full bg-gray-800 object-cover"
                                    onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'; }} 
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                                        {token.symbol}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                                        {token.name}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : !isUnknownAddress && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No tokens found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TokenSelector;
