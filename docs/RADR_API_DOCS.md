# Radr / ShadowPay API Documentation

**Source:** https://registry.scalar.com/@radr/apis/shadowpay-api
**Base URL:** `https://shadow.radr.fun`

## API Keys

### Generate new API key
Create a new API key for a wallet address. No authentication required.
- **POST** `/shadowpay/v1/keys/new`
- **Body:**
  ```json
  {
    "wallet_address": "Solana wallet address (base58)",
    "treasury_wallet": "Optional treasury wallet"
  }
  ```
- **Response:**
  ```json
  {
    "api_key": "sp_live_...",
    "wallet_address": "..."
  }
  ```

### Get API key by wallet
Retrieve API key for a wallet address.
- **GET** `/shadowpay/v1/keys/by-wallet/{wallet}`

### Rotate API key
Generate a new API key for your wallet.
- **POST** `/shadowpay/v1/keys/rotate`
- **Header:** `X-API-Key: YOUR_CURRENT_KEY`

### Get API key rate limits
- **GET** `/shadowpay/v1/keys/limits`
- **Header:** `X-API-Key: YOUR_KEY`

---

## Escrow Operations (Deposits & Withdrawals)

### Deposit SOL to escrow
Create an unsigned transaction to deposit SOL into user's escrow account.
- **POST** `/shadowpay/api/escrow/deposit`
- **Body:**
  ```json
  {
    "wallet_address": "User's wallet address",
    "amount": 20000000 // Lamports
  }
  ```
- **Response:**
  ```json
  {
    "unsigned_tx_base64": "...",
    "recent_blockhash": "...",
    "last_valid_block_height": 12345
  }
  ```

### User withdraws SOL from escrow
Create an unsigned transaction for a user to withdraw their SOL balance from escrow.
- **POST** `/shadowpay/api/escrow/withdraw`
- **Body:**
  ```json
  {
    "wallet_address": "User's wallet address",
    "amount": 10000000 // Lamports
  }
  ```

### Get SOL escrow balance
- **GET** `/shadowpay/api/escrow/balance/{wallet}`

### Get SPL token escrow balance
- **GET** `/shadowpay/api/escrow/balance-token/{wallet}/{mint}`

### User withdraws SPL tokens from escrow
- **POST** `/shadowpay/api/escrow/withdraw-tokens`

---

## Payment Intents (Transfers)

### Create Payment Intent
- **POST** `/shadowpay/v1/pay/intent`

### Verify Payment
- **POST** `/shadowpay/v1/pay/verify`

---

## ZK Payments (Zero Knowledge)

### Prepare ZK Payment
- **POST** `/shadowpay/v1/payment/prepare`

### Deposit (ZK)
- **POST** `/shadowpay/v1/payment/deposit`

### Withdraw (ZK)
- **POST** `/shadowpay/v1/payment/withdraw`

---

## ShadowID (Identity)

### Auto Register
- **POST** `/shadowpay/api/shadowid/auto-register`

### Get Merkle Proof
- **GET** `/shadowpay/shadowid/v1/merkle/proof/{commitment}`

---

## Circuit Artifacts (Client-Side ZK Proofs)

- **Proving Key:** `GET /shadowpay/circuit/shadowpay_final.zkey`
- **WASM File:** `GET /shadowpay/circuit/shadowpay_js/shadowpay.wasm`
- **ElGamal Key:** `GET /shadowpay/circuit-elgamal/shadowpay-elgamal_final.zkey`
