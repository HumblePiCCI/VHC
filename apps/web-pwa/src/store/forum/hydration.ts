import type { StoreApi } from 'zustand';
import { HermesThreadSchema } from '@vh/data-model';
import type { VennClient } from '@vh/gun-client';
import type { ForumState } from './types';
import { parseThreadFromGun, isThreadSeen, markThreadSeen, addThread } from './helpers';

// Track which stores have been hydrated (WeakSet allows GC of old stores)
const hydratedStores = new WeakSet<StoreApi<ForumState>>();

export function hydrateFromGun(resolveClient: () => VennClient | null, store: StoreApi<ForumState>): void {
  if (hydratedStores.has(store)) return;
  const client = resolveClient();
  if (!client?.gun?.get) return;

  hydratedStores.add(store);
  const threadsChain = client.gun.get('vh').get('forum').get('threads');

  console.info('[vh:forum] Starting hydration subscription');

  threadsChain.map().on((data: unknown, key: string) => {
    console.debug('[vh:forum] hydration callback:', { key, dataType: typeof data, hasData: !!data });

    // Skip non-objects
    if (!data || typeof data !== 'object') {
      console.debug('[vh:forum] skipping: not an object');
      return;
    }

    // Gun adds `_` metadata to ALL objects - we need to check actual fields, not just `_` presence
    const obj = data as Record<string, unknown>;

    // Skip if this is ONLY metadata (no actual thread fields)
    if (!obj.id || !obj.schemaVersion || !obj.title) {
      console.debug('[vh:forum] skipping: missing required fields', {
        hasId: !!obj.id,
        hasSchema: !!obj.schemaVersion,
        hasTitle: !!obj.title,
        keys: Object.keys(obj).filter((k) => k !== '_')
      });
      return;
    }

    if (isThreadSeen(key)) {
      console.debug('[vh:forum] skipping: already seen', key);
      return;
    }

    // Remove Gun metadata before parsing
    const { _, ...cleanObj } = obj as Record<string, unknown> & { _?: unknown };
    const parsedData = parseThreadFromGun(cleanObj);
    const result = HermesThreadSchema.safeParse(parsedData);
    if (result.success) {
      markThreadSeen(key); // Only mark as seen after successful validation
      console.info('[vh:forum] Hydrated thread:', result.data.id);
      store.setState((s) => addThread(s, result.data));
    } else {
      // Don't mark as seen - Gun may fire again with complete data
      console.debug('[vh:forum] Thread validation failed, will retry:', key, result.error.issues);
    }
  });
}

