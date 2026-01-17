I have analyzed the requirements and the current file structure. 
**Correction**: The current frontend is **Create React App (CRA)**, not Next.js. I will implement the solution within the existing React codebase to ensure immediate "Hackathon-ready" delivery.

### **1. Backend Implementation (Express + MongoDB)**
*   **Dependencies**: `tweetnacl`, `bs58`, `jsonwebtoken`, `@solana/web3.js`.
*   **Models**:
    *   `User`: `walletAddress` (Unique, Indexed), `privateBalance`, `createdAt`.
    *   `RegisteredSwap`: `txHash` (Unique, Indexed). **(Double-spend protection)**.
*   **Routes**:
    *   `POST /api/auth`: Verify signature, issue JWT.
    *   `GET /api/balance`: Return `privateBalance`.
    *   `POST /api/swap/register`:
        *   **Verify**: `txHash` on-chain, `meta.err === null`, `blockTime` recent, `txHash` unique.
        *   **Action**: `privateBalance += amountOut`.
        *   **Strict**: NO parsing of routes/tokens.
    *   `POST /api/transfer`: Off-chain atomic update.

### **2. Minimal Rust Vault (On-Chain)**
*   **Structure**: Native Solana Program (PDA Vault).
*   **Functions**: `deposit(amount)`, `withdraw(amount)`.
*   **Code**: ~150 lines. No privacy logic.

### **3. Frontend Integration (React)**
*   **Auth**: Message signing.
*   **UI**:
    *   Display "Private Balance".
    *   "Register Swap" (Input `txHash`).
    *   "Internal Private Transfer".
    *   Vault Interaction.
*   **Compliance**: Strict adherence to terminology ("Register public swap privately", etc.).

I will start by installing backend dependencies and creating the MongoDB models.
