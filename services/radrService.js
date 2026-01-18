const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Import Base64 WASM Data
let WASM_BASE64 = null;
try {
    WASM_BASE64 = require('./wasm_data');
} catch (e) {
    console.warn("WARNING: wasm_data.js not found. Base64 loading will be disabled.");
}

let ShadowWireClient, initWASM, TokenUtils;
let shadowWireAvailable = false;

try {
    const shadowWire = require('@radr/shadowwire');
    ShadowWireClient = shadowWire.ShadowWireClient;
    initWASM = shadowWire.initWASM;
    TokenUtils = shadowWire.TokenUtils;
    shadowWireAvailable = true;
} catch (error) {
    console.warn("WARNING: @radr/shadowwire library not found or failed to load. Running in offline/fallback mode.", error.message);
}

let client = null;
let isInitialized = false;

class RadrService {
    
    static async init() {
        if (isInitialized) return;
        
        if (!shadowWireAvailable) {
            console.warn("ShadowWire unavailable, skipping initialization.");
            isInitialized = true;
            return;
        }

        try {
            console.log("Initializing ShadowWire WASM...");
            
            // 1. Write Base64 WASM to temp file (CRITICAL FIX FOR VERCEL)
            let wasmPath = null;
            
            if (WASM_BASE64) {
                try {
                    const tempDir = os.tmpdir();
                    wasmPath = path.join(tempDir, 'settler_wasm_bg.wasm');
                    
                    console.log(`Writing embedded WASM to: ${wasmPath}`);
                    const buffer = Buffer.from(WASM_BASE64, 'base64');
                    fs.writeFileSync(wasmPath, buffer);
                    console.log("WASM file written successfully.");
                } catch (writeError) {
                    console.error("Failed to write WASM from Base64:", writeError);
                    wasmPath = null; // Fallback to auto-discovery
                }
            } else {
                console.warn("No Base64 WASM data available. Relying on file system.");
            }

            // 2. Initialize WASM with the temp path or default
            if (wasmPath) {
                await initWASM(wasmPath);
                console.log(`? ShadowWire WASM Initialized from: ${wasmPath}`);
            } else {
                // Try explicit path for Vercel if default fails
                try {
                   await initWASM();
                   console.log("? ShadowWire WASM Initialized (Default Path)");
                } catch (defaultError) {
                     // ATTEMPT RECOVERY
                     console.warn("? Default Init Failed, attempting manual paths...");
                     const potentialPaths = [
                        path.join(process.cwd(), 'node_modules', '@radr', 'shadowwire', 'dist', 'wasm', 'settler_wasm_bg.wasm'),
                        path.join(__dirname, '..', 'node_modules', '@radr', 'shadowwire', 'dist', 'wasm', 'settler_wasm_bg.wasm'),
                        '/var/task/node_modules/@radr/shadowwire/dist/wasm/settler_wasm_bg.wasm'
                     ];

                     for (const p of potentialPaths) {
                        try {
                            await initWASM(p);
                            console.log(`? Recovered with path: ${p}`);
                            wasmPath = p; // Mark as success
                            break;
                        } catch (e) { /* ignore */ }
                     }
                     
                     if (!wasmPath) throw defaultError;
                }
            }
            
            // Initialize Client
            client = new ShadowWireClient({ 
                debug: true 
            });
            
            isInitialized = true;
            console.log("? ShadowWire SDK Initialized Successfully");
        } catch (error) {
            console.error("? ShadowWire Init Failed (CRITICAL):", error);
            throw error;
        }
    }

    // Generate Unsigned Deposit Transaction
    static async createDepositTx(walletAddress, amountSOL, targetVaultAddress = null) {
        if (!shadowWireAvailable) {
            throw new Error("ShadowWire Library is unavailable (Module Not Found).");
        }

        if (!isInitialized) {
            try {
                await this.init();
            } catch (e) {
                throw new Error(`ShadowWire Initialization Failed: ${e.message}`);
            }
        }
        
        // Double check client
        if (!client) {
             throw new Error("ShadowWire Client is null (Init failed silently?)");
        }

        try {
            console.log(`Creating Deposit TX for ${walletAddress}, Amount: ${amountSOL}`);

            const amountLamports = Math.floor(Number(amountSOL) * 1_000_000_000);
            console.log(`Converted Amount: ${amountSOL} SOL -> ${amountLamports} Lamports`);

            if (isNaN(amountLamports) || amountLamports <= 0) {
                throw new Error("Invalid amount conversion");
            }
            
            // Call ShadowWire SDK
            const response = await client.deposit({
                wallet: walletAddress,
                amount: amountLamports, 
                token: 'SOL'
            });
            
            console.log("Deposit TX Response:", response);
            return response.unsigned_tx_base64 || response.transaction;
        } catch (error) {
            console.error("ShadowWire Deposit Error:", error);
            throw error;
        }
    }

    // Prepare External Transfer (Get Message to Sign)
    static async prepareExternalTransfer(walletAddress, recipientAddress, amountSOL) {
        if (!isInitialized) await this.init();

        // 1. Generate Nonce & Timestamp (Matching SDK Logic)
        const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const timestamp = Math.floor(Date.now() / 1000);
        const transferType = 'external_transfer';

        // 2. Build Message
        const message = `shadowpay:${transferType}:${nonce}:${timestamp}`;

        console.log(`Prepared Transfer Message for ${walletAddress}: ${message}`);

        return {
            message,
            nonce,
            timestamp,
            amountLamports: Math.floor(Number(amountSOL) * 1_000_000_000)
        };
    }

    // Execute External Transfer (Submit Signed Request)
    static async executeExternalTransfer(walletAddress, recipientAddress, amountSOL, nonce, signature, message) {
        if (!isInitialized) await this.init();

        try {
            console.log(`Executing Signed Transfer: ${walletAddress} -> ${recipientAddress}`);
            
            if (!signature || typeof signature !== 'string') {
                throw new Error("Invalid signature format");
            }
            
            const amountLamports = Math.floor(Number(amountSOL) * 1_000_000_000);

            // Step 1: Upload Proof
            const token = 'SOL';
            const proofNonce = Math.floor(Date.now() / 1000);
            
            console.log(`Uploading Proof with numeric nonce: ${proofNonce} (Sig nonce: ${nonce})`);
            
            let proofResult;
            try {
                proofResult = await client.uploadProof({
                    sender_wallet: walletAddress,
                    token: token,
                    amount: amountLamports,
                    nonce: proofNonce 
                });
            } catch (proofError) {
                console.error("Upload Proof Failed:", proofError);
                throw new Error(`Proof generation failed: ${proofError.message}`);
            }
            
            // Step 2: Execute External Transfer
            const relayerFee = Math.floor(amountLamports * 0.01);
            
            const transferPayload = {
                sender_wallet: walletAddress,
                recipient_wallet: recipientAddress,
                token: token,
                nonce: proofResult.nonce, 
                relayer_fee: relayerFee,
                sender_signature: signature,
                signature_message: message
            };
            
            console.log("Submitting External Transfer...");
            
            const result = await client.externalTransfer(transferPayload);
            return result;

        } catch (error) {
            console.error("ShadowWire Transfer Error:", error);
            throw error;
        }
    }

    // Generate Unsigned Withdraw Transaction
    static async createWithdrawTx(walletAddress, amountSOL, destinationAddress = null) {
        if (!isInitialized) await this.init();
        
        try {
            console.log(`Creating Withdraw TX for ${walletAddress}, Amount: ${amountSOL}, Dest: ${destinationAddress}`);
            
            const amountLamports = Math.floor(Number(amountSOL) * 1_000_000_000);
            console.log(`Converted Withdraw Amount: ${amountSOL} SOL -> ${amountLamports} Lamports`);

            if (isNaN(amountLamports) || amountLamports <= 0) {
                throw new Error("Invalid amount conversion");
            }

            if (destinationAddress && destinationAddress !== walletAddress) {
                console.warn("WARNING: Direct withdraw to 3rd party failed/disabled. Reverting to self-withdraw.");
                console.warn("Funds will be sent to your main wallet:", walletAddress);
            }

            const payload = {
                wallet: walletAddress,
                amount: amountLamports,
                token: 'SOL'
            };

            const response = await client.withdraw(payload);
            
            console.log("Withdraw TX Response:", response);
            return response.unsigned_tx_base64 || response.transaction;
        } catch (error) {
            console.error("ShadowWire Withdraw Error:", error);
            throw error;
        }
    }

    // Internal Transfer (Shielded)
    static async createTransferTx(senderWallet, recipientWallet, amountSOL) {
        if (!isInitialized) await this.init();

        try {
            const result = await client.transfer({
                sender: senderWallet,
                recipient: recipientWallet,
                amount: amountSOL, 
                token: 'SOL',
                type: 'internal'
            });

            return result;
        } catch (error) {
            console.error("ShadowWire Transfer Error:", error);
            throw error;
        }
    }

    // Register User (Get API Key)
    static async registerUser(walletAddress) {
        // Attempt init but don't crash if it fails
        if (!isInitialized) {
            try {
                await this.init();
            } catch (e) {
                console.warn("RadrService Init failed during registration (non-fatal):", e.message);
            }
        }
        
        try {
            const timestamp = Date.now();
            const key = `radr_key_${walletAddress}_${timestamp}`;
            console.log(`Generated Radr API Key: ${key}`);
            return key;

        } catch (error) {
            console.error("Radr Registration Error:", error);
            // Fallback
            return `radr_key_${walletAddress}_${Date.now()}`;
        } Get Shielded Balance
    static async getBalance(walletAddress, apiKey = null) {
        if (!isInitialized) await this.init();
        try {
            let requestClient = client;
            
            if (apiKey) {
                console.log("Using provided API Key for balance check");
                requestClient = new ShadowWireClient({ 
                    apiKey: apiKey,
                    debug: true 
                });
            }

            const balance = await requestClient.getBalance(walletAddress, 'SOL');
            return balance; 
        } catch (error) {
            console.error("ShadowWire Balance Error:", error);
            return { available: 0 };
        }
    }
}

module.exports = RadrService;
