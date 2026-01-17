I have analyzed the current codebase and the new "Spectra Privacy Layer" requirements. The architecture needs a significant shift from "Swap Registration" to "Off-Chain Vault Operations".

Here is the implementation plan:

### **1. Backend Refactoring (Node.js)**
*   **Update `User` Model**: Add support for multiple off-chain balances (e.g., `usdcBalance` alongside `privateBalance`).
*   **Rename/Replace Models**: `RegisteredSwap` is no longer needed. I will rename it to `Transaction` to log internal operations (Deposit, Swap, Transfer, Withdraw) for auditing.
*   **Update `routes/swap.js`**:
    *   **REMOVE** `POST /register` (Public swap registration).
    *   **ADD** `POST /execute` (Off-chain private swap). Logic: Convert SOL <-> USDC using a mock rate (e.g., 1 SOL = 100 USDC). Atomic update of user balances.
*   **Update `routes/transfer.js`**: Ensure it works with the new multi-currency model if needed, or keep strictly SOL for transfers as per MVP.
*   **Add `routes/deposit.js`**:
    *   Endpoint: `POST /notify`.
    *   Input: `txHash` (sent automatically by Frontend, **not user input**).
    *   Logic: Verify on-chain deposit to Vault PDA. Credit `privateBalance`.
*   **Add `routes/withdraw.js`**:
    *   Endpoint: `POST /request`.
    *   Logic: Verify `privateBalance` >= amount. Deduct balance. Return a signed instruction or signature that allows the user to withdraw on-chain (or just deduct for MVP simulation if on-chain authority is complex without a deployed program). *Decision*: I will stick to the "User withdraws from their own PDA" model in Rust for simplicity, but the backend must "approve" it. However, the current Rust code uses a PDA derived from `user_account`. This means **only the user** can withdraw from their own "vault box". This fits the "Vault PDA" requirement perfectly.
    *   **Refinement**: The backend just needs to deduct the *off-chain* balance when the user withdraws. But if the user can withdraw on-chain directly, the backend might get out of sync.
    *   **Solution for MVP**: The "Privacy Layer" tracks the *aggregate* state. If the user withdraws on-chain, they should notify the backend to update the ledger. Or better, the backend *authorizes* the withdrawal. Given the constraints, I will keep the Rust program as is (User <-> Vault PDA) and assume the "Privacy" comes from the off-chain swaps happening *while* funds are in the vault. The backend simply tracks the *value*.

### **2. Rust Program Refinement**
*   The current Rust program (`lib.rs`) uses `Pubkey::find_program_address(&[b"vault", user_account.key.as_ref()], program_id)`.
*   This creates a **unique vault per user**. This is good for security (no pooling risk) but slightly less "private" on-chain if observers track `User -> PDA`. However, the *swaps* inside are invisible.
*   **Action**: Keep `lib.rs` as is. It meets the "Minimal Vault" requirement perfectly.

### **3. Frontend Refactoring (React)**
*   **Remove** "Register Swap" tab/functionality completely.
*   **Add** "Private Swap" Tab:
    *   UI: Input Amount (SOL) -> Output (USDC).
    *   Action: Call `POST /api/swap/execute`.
*   **Update "Deposit"**:
    *   Action: Wallet Transfer -> `POST /api/deposit/notify` (Background sync).
*   **Update "Withdraw"**:
    *   Action: Wallet Withdraw -> `POST /api/withdraw/notify` (Background sync).
*   **UI Cleanup**: Remove any text mentioning "TxHash", "Solscan", "Public Swap". Use "Private Balance", "Vault Deposit", etc.

### **Execution Order**
1.  **Backend Models**: Update `User`, create `Transaction`.
2.  **Backend Routes**: Rewrite `swap.js`, add `deposit.js`, `withdraw.js`.
3.  **Frontend**: Update `DashboardPage.jsx` to match new flow.
