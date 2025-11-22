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
