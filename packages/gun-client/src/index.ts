import type { AttestationPayload, UniquenessNullifier } from '@vh/types';
import type { CryptoProvider } from '@vh/crypto';
import 'gun';
import { EncryptedStorageAdapter } from './storage/adapter';
import { createHydrationBarrier, HydrationBarrier } from './sync/barrier';

export interface VennClientConfig {
  peers?: string[];
  cryptoProvider?: CryptoProvider;
  storage?: EncryptedStorageAdapter;
}

export interface VennClient {
  config: VennClientConfig;
  hydrationBarrier: HydrationBarrier;
  storage: EncryptedStorageAdapter;
  gun?: unknown;
  bootstrap(attestation: AttestationPayload): Promise<UniquenessNullifier>;
  shutdown(): Promise<void>;
}

export function createClient(config: VennClientConfig = {}): VennClient {
  const storage = config.storage ?? new EncryptedStorageAdapter();
  const hydrationBarrier = createHydrationBarrier();

  return {
    config,
    hydrationBarrier,
    storage,
    async bootstrap(_attestation: AttestationPayload): Promise<UniquenessNullifier> {
      hydrationBarrier.markReady();
      return 'nullifier-placeholder';
    },
    async shutdown(): Promise<void> {
      await storage.close();
    }
  };
}

export type { HydrationBarrier } from './sync/barrier';
export { EncryptedStorageAdapter } from './storage/adapter';
