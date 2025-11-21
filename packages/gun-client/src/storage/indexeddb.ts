import { openDB, type IDBPDatabase } from 'idb';
import { aesDecrypt, aesEncrypt, deriveKey } from '@vh/crypto';
import type { StorageAdapter, StorageRecord } from './adapter';
import type { HydrationBarrier } from '../sync/barrier';

const DB_NAME = 'vh_encrypted_graph';
const STORE_NAME = 'vh_graph_nodes';
const DEV_ROOT_SECRET = 'vh-dev-root-secret';
const DEV_ROOT_SALT = 'vh-dev-root-salt';
const textDecoder = new TextDecoder();

type NodePayload = {
  iv: Uint8Array;
  ciphertext: Uint8Array;
  updatedAt: number;
};

type GraphDB = IDBPDatabase;

export function hasIndexedDBSupport(): boolean {
  return typeof indexedDB !== 'undefined';
}

export class EncryptedIndexedDBAdapter implements StorageAdapter {
  readonly backend = 'indexeddb' as const;
  #dbPromise: Promise<GraphDB>;
  #rootKeyPromise: Promise<Uint8Array>;

  constructor(private readonly barrier?: HydrationBarrier) {
    this.#dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      }
    });
    this.#rootKeyPromise = deriveKey(DEV_ROOT_SECRET, DEV_ROOT_SALT);
  }

  async hydrate(): Promise<void> {
    await this.#dbPromise;
    this.barrier?.markReady();
  }

  async write<T>(record: StorageRecord<T>): Promise<void> {
    const db = await this.#dbPromise;
    const key = await this.#rootKeyPromise;
    const payload = typeof record.value === 'string' ? record.value : JSON.stringify(record.value);
    const { iv, ciphertext } = await aesEncrypt(payload, key);

    await db.put(STORE_NAME, {
      iv,
      ciphertext,
      updatedAt: record.updatedAt ?? Date.now()
    }, record.key);
  }

  async read<T>(key: string): Promise<StorageRecord<T> | null> {
    const db = await this.#dbPromise;
    const entry = (await db.get(STORE_NAME, key)) as NodePayload | undefined;
    if (!entry) {
      return null;
    }

    const rootKey = await this.#rootKeyPromise;
    const decrypted = await aesDecrypt(entry.iv, entry.ciphertext, rootKey);
    const decoded = textDecoder.decode(decrypted);

    let value: T;
    try {
      value = JSON.parse(decoded) as T;
    } catch {
      value = decoded as unknown as T;
    }

    return {
      key,
      value,
      updatedAt: entry.updatedAt
    };
  }

  async close(): Promise<void> {
    const db = await this.#dbPromise;
    db.close();
  }
}

export { DB_NAME as ENCRYPTED_DB_NAME, STORE_NAME as ENCRYPTED_STORE_NAME };
