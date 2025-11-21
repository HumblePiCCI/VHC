import type { HydrationBarrier } from '../sync/barrier';
import { EncryptedIndexedDBAdapter, hasIndexedDBSupport } from './indexeddb';

export interface StorageRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

export interface StorageAdapter {
  backend: 'indexeddb' | 'memory';
  hydrate(): Promise<void>;
  write<T>(record: StorageRecord<T>): Promise<void>;
  read<T>(key: string): Promise<StorageRecord<T> | null>;
  close(): Promise<void>;
}

class MemoryStorageAdapter implements StorageAdapter {
  readonly backend = 'memory' as const;
  private readonly store = new Map<string, StorageRecord>();

  constructor(private readonly barrier?: HydrationBarrier) {}

  async hydrate(): Promise<void> {
    this.barrier?.markReady();
  }

  async write<T>(record: StorageRecord<T>): Promise<void> {
    this.store.set(record.key, {
      key: record.key,
      value: record.value,
      updatedAt: record.updatedAt ?? Date.now()
    });
  }

  async read<T>(key: string): Promise<StorageRecord<T> | null> {
    const value = this.store.get(key);
    return (value as StorageRecord<T>) ?? null;
  }

  async close(): Promise<void> {
    this.store.clear();
  }
}

export function createStorageAdapter(barrier: HydrationBarrier): StorageAdapter {
  if (hasIndexedDBSupport()) {
    return new EncryptedIndexedDBAdapter(barrier);
  }

  return new MemoryStorageAdapter(barrier);
}
