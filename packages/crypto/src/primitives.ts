import type { AttestationPayload } from '@vh/types';

export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface Envelope<T = Uint8Array> {
  ciphertext: T;
  nonce: Uint8Array;
  associatedData?: Uint8Array;
}

export async function deriveSessionSecrets(_payload: AttestationPayload): Promise<Uint8Array> {
  throw new Error('deriveSessionSecrets is not implemented yet.');
}

export async function generateEd25519KeyPair(): Promise<KeyPair> {
  throw new Error('generateEd25519KeyPair is not implemented yet.');
}

export async function encryptEnvelope(_plaintext: Uint8Array, _aad?: Uint8Array): Promise<Envelope> {
  throw new Error('encryptEnvelope is not implemented yet.');
}

export async function decryptEnvelope(_envelope: Envelope): Promise<Uint8Array> {
  throw new Error('decryptEnvelope is not implemented yet.');
}
