import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openDB } from 'idb';
import { EncryptedIndexedDBAdapter, ENCRYPTED_DB_NAME, ENCRYPTED_STORE_NAME } from './indexeddb';
import { HydrationBarrier } from '../sync/barrier';

const textDecoder = new TextDecoder();

describe('EncryptedIndexedDBAdapter', () => {
  it('encrypts payloads at rest while remaining readable through the adapter', async () => {
    const barrier = new HydrationBarrier();
    const adapter = new EncryptedIndexedDBAdapter(barrier);

    await adapter.hydrate();
    expect(barrier.ready).toBe(true);

    const record = {
      key: 'node/1',
      value: { hello: 'world', count: 1 },
      updatedAt: Date.now()
    } as const;

    await adapter.write(record);

    const db = await openDB(ENCRYPTED_DB_NAME, 1);
    const stored = await db.get(ENCRYPTED_STORE_NAME, record.key);
    expect(stored).toBeTruthy();
    expect(stored?.ciphertext).toBeInstanceOf(Uint8Array);
    expect(textDecoder.decode(stored!.ciphertext)).not.toContain('world');

    const decrypted = await adapter.read<typeof record.value>(record.key);
    expect(decrypted?.value).toEqual(record.value);
    expect(decrypted?.updatedAt).toBe(record.updatedAt);
  });
});
