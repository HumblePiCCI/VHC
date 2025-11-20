import type { AttestationPayload } from '@vh/types';

export interface CryptoProvider {
  subtle: SubtleCrypto;
  getRandomValues<T extends ArrayBufferView>(array: T): T;
}

let cachedProvider: CryptoProvider | null = null;

function isBrowserCrypto(candidate: unknown): candidate is CryptoProvider {
  if (!candidate) return false;
  return (
    typeof candidate === 'object' &&
    typeof (candidate as CryptoProvider).getRandomValues === 'function' &&
    typeof (candidate as CryptoProvider).subtle !== 'undefined'
  );
}

export async function getWebCrypto(): Promise<CryptoProvider> {
  if (cachedProvider) return cachedProvider;
  if (typeof globalThis !== 'undefined' && isBrowserCrypto(globalThis.crypto)) {
    cachedProvider = globalThis.crypto as CryptoProvider;
    return cachedProvider;
  }

  const nodeCrypto = await import('node:crypto');
  cachedProvider = nodeCrypto.webcrypto as CryptoProvider;
  return cachedProvider;
}

export interface CryptoSessionContext {
  attestation: AttestationPayload;
  provider?: CryptoProvider;
}

export * from './primitives';
