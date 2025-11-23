interface MemoryCache {
  weights: Map<string, unknown>;
  analyses: Map<string, unknown>;
}

const memory: MemoryCache = {
  weights: new Map(),
  analyses: new Map()
};

const DB_NAME = 'vh-ai-cache';
const DB_VERSION = 1;
const WEIGHTS_STORE = 'weights';
const ANALYSES_STORE = 'analyses';

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

async function openDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB()) return null;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(WEIGHTS_STORE)) {
        db.createObjectStore(WEIGHTS_STORE);
      }
      if (!db.objectStoreNames.contains(ANALYSES_STORE)) {
        db.createObjectStore(ANALYSES_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(store: string, key: string, value: unknown) {
  const db = await openDb();
  if (!db) {
    const target = store === WEIGHTS_STORE ? memory.weights : memory.analyses;
    target.set(key, structuredClone(value));
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(store).put(value, key);
  });
}

async function get<T>(store: string, key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) {
    const target = store === WEIGHTS_STORE ? memory.weights : memory.analyses;
    return (target.get(key) as T | undefined) ?? null;
  }
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheModelMeta(modelId: string, meta: Record<string, unknown>) {
  await put(WEIGHTS_STORE, modelId, meta);
}

export async function getCachedModelMeta<T = Record<string, unknown>>(modelId: string): Promise<T | null> {
  return get<T>(WEIGHTS_STORE, modelId);
}

export async function cacheAnalysisResult(hash: string, result: unknown) {
  await put(ANALYSES_STORE, hash, result);
}

export async function getCachedAnalysisResult<T>(hash: string): Promise<T | null> {
  return get<T>(ANALYSES_STORE, hash);
}
