export interface StorageRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

export class EncryptedStorageAdapter {
  async write<T>(record: StorageRecord<T>): Promise<void> {
    void record;
    // TODO: Persist encrypted payloads to IndexedDB/OPFS.
  }

  async read<T>(_key: string): Promise<StorageRecord<T> | null> {
    return null;
  }

  async close(): Promise<void> {
    // Placeholder for tearing down connections.
  }
}
