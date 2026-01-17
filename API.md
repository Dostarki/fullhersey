# Spectra API Reference

This documentation outlines the backend API endpoints for **Spectra**, a privacy-preserving Solana wallet built on top of the **Radr / ShadowPay** protocol.

## Base URL
`http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer Token in the Authorization header.
`Authorization: Bearer <JWT_TOKEN>`

### 1. Authenticate / Connect Wallet
Authenticates a user via Solana wallet signature. Automatically registers the user with **Radr Labs** to obtain a real API Key for privacy operations.

- **Endpoint:** `POST /auth`
- **Body:**
  ```json
  {
    "walletAddress": "SOLANA_WALLET_ADDRESS",
    "signature": "BASE58_SIGNATURE",
    "message": "Sign this message to authenticate..."
  }
  ```
- **Response:**
  ```json
  {
    "token": "JWT_TOKEN",
    "user": {
      "walletAddress": "...",
      "radrApiKey": "sp_live_..." // Real Radr API Key
    }
  }
  ```

---

## Privacy Operations (Radr Integration)

These endpoints interact directly with the Radr / ShadowPay infrastructure to execute on-chain privacy transactions.

### 2. Create Deposit Transaction (Shield Funds)
Generates an **Unsigned Transaction** via Radr API. The frontend must sign this transaction using the user's wallet (e.g., Phantom).

- **Endpoint:** `POST /deposit/create-tx`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "amount": 1.5 // Amount in SOL
  }
  ```
- **Response:**
  ```json
  {
    "unsignedTx": "BASE64_ENCODED_TRANSACTION",
    "message": "Please sign this transaction in your wallet"
  }
  ```

### 3. Notify Deposit Success
Notifies the backend that the deposit transaction has been signed and submitted to the blockchain. Updates the user's shielded balance.

- **Endpoint:** `POST /deposit/notify`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "amount": 1.5,
    "txHash": "SOLANA_TX_SIGNATURE"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Deposit recorded successfully",
    "newBalance": 10.5
  }
  ```

### 4. Create Withdraw Transaction (Unshield Funds)
Generates a **ZK-Proof backed Unsigned Transaction** to withdraw funds from the privacy pool back to a public wallet.

- **Endpoint:** `POST /withdraw/create-tx`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "amount": 0.5,
    "destinationAddress": "RECIPIENT_WALLET_ADDRESS" // Optional, defaults to self
  }
  ```
- **Response:**
  ```json
  {
    "unsignedTx": "BASE64_ENCODED_TRANSACTION",
    "message": "Please sign this transaction in your wallet"
  }
  ```

### 5. Notify Withdraw Success
Updates the internal ledger after a successful withdrawal.

- **Endpoint:** `POST /withdraw/notify`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "amount": 0.5,
    "txHash": "SOLANA_TX_SIGNATURE"
  }
  ```

---

## Internal Operations (ShadowWire)

### 6. Private Transfer (ShadowWire)
Executes an instant, gas-free, private transfer between Spectra users. Validates the user's active Radr API Key before processing.

- **Endpoint:** `POST /transfer`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "recipientAddress": "RECIPIENT_WALLET_ADDRESS",
    "amount": 2.0,
    "token": "SOL"
  }
  ```

### 7. Get Balance
Fetches the user's shielded private balance.

- **Endpoint:** `GET /balance`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 8. Get Transaction History
Fetches the recent activity (Deposits, Withdrawals, Transfers).

- **Endpoint:** `GET /transactions`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:**
  ```json
  [
    {
      "type": "DEPOSIT",
      "amount": 1.0,
      "token": "SOL",
      "txHash": "...",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
  ```

---

## Radr / ShadowPay Integration Details

Spectra acts as a **Relayer and UI Layer** for the Radr Protocol.

- **API Key Management:** Spectra automatically fetches a unique `X-API-Key` for each user from `https://shadow.radr.fun/shadowpay/v1/keys/new` upon first login.
- **Escrow:** Funds are deposited into the Radr Escrow Smart Contract.
- **Zero Knowledge:** Withdrawals use ZK Proofs (handled by Radr's backend) to break the link between depositor and withdrawer.
