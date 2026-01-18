/* tslint:disable */
/* eslint-disable */
/**
 * Generate a Bulletproofs range proof for a given amount
 *
 * This uses curve25519/Ristretto, matching the on-chain Solana verifier.
 *
 * # Arguments
 * * `amount` - The value to prove is in range [0, 2^bit_length)
 * * `bit_length` - Number of bits for range proof (typically 64 for u64 amounts)
 *
 * # Returns
 * ZKProofResult containing proof, commitment, and blinding factor
 *
 * # Errors
 * Returns JsValue error if proof generation fails
 */
export function generate_range_proof(amount: bigint, bit_length: number): ZKProofResult;
/**
 * Initialize panic hook for better error messages in browser console
 */
export function init(): void;
/**
 * Verify a range proof (optional client-side pre-check)
 *
 * This is useful for validating proofs before submitting to the chain,
 * but the on-chain verifier is the source of truth.
 *
 * # Arguments
 * * `proof_bytes` - The serialized proof
 * * `commitment_bytes` - The Pedersen commitment (32 bytes)
 * * `bit_length` - Number of bits for range proof
 *
 * # Returns
 * true if proof is valid, false otherwise
 */
export function verify_range_proof(proof_bytes: Uint8Array, commitment_bytes: Uint8Array, bit_length: number): boolean;
/**
 * Result of proof generation containing all necessary data for ZK transfer
 */
export class ZKProofResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the Bulletproof range proof bytes (672 bytes for 64-bit range)
   */
  readonly proof_bytes: Uint8Array;
  /**
   * Get the Pedersen commitment bytes (32 bytes)
   */
  readonly commitment_bytes: Uint8Array;
  /**
   * Get the blinding factor bytes (32 bytes)
   */
  readonly blinding_factor_bytes: Uint8Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_zkproofresult_free: (a: number, b: number) => void;
  readonly generate_range_proof: (a: bigint, b: number) => [number, number, number];
  readonly init: () => void;
  readonly verify_range_proof: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly zkproofresult_blinding_factor_bytes: (a: number) => [number, number];
  readonly zkproofresult_commitment_bytes: (a: number) => [number, number];
  readonly zkproofresult_proof_bytes: (a: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
