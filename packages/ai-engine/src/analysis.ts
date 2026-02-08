import type { AnalysisResult } from './schema';

export interface EngineMetadata {
  id: string;
  kind: 'remote' | 'local';
  modelName: string;
}

export interface CanonicalAnalysis extends AnalysisResult {
  schemaVersion: 'canonical-analysis-v1';
  url: string;
  urlHash: string;
  timestamp: number;
  engine?: EngineMetadata;
  warnings?: string[];
}

export interface GenerateResult {
  analysis: AnalysisResult;
  engine?: EngineMetadata;
  warnings?: string[];
}

export interface AnalysisStore {
  getByHash(urlHash: string): Promise<CanonicalAnalysis | null>;
  save(record: CanonicalAnalysis): Promise<void>;
  listRecent(limit?: number): Promise<CanonicalAnalysis[]>;
}

function toHex(value: number) {
  return value.toString(16).padStart(8, '0');
}

// Lightweight FNV-1a hash to keep the function sync and browser-friendly.
export function hashUrl(url: string): string {
  const normalized = url.trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return toHex(hash);
}

export async function getOrGenerate(
  url: string,
  store: AnalysisStore,
  generate: (url: string) => Promise<GenerateResult>
): Promise<{ analysis: CanonicalAnalysis; reused: boolean }> {
  const urlHash = hashUrl(url);
  const existing = await store.getByHash(urlHash);
  if (existing) {
    return { analysis: existing, reused: true };
  }

  const result = await generate(url);
  const canonical: CanonicalAnalysis = {
    ...result.analysis,
    schemaVersion: 'canonical-analysis-v1',
    url,
    urlHash,
    timestamp: Date.now(),
    ...(result.engine ? { engine: result.engine } : {}),
    ...(result.warnings ? { warnings: result.warnings } : {})
  };

  await store.save(canonical);
  return { analysis: canonical, reused: false };
}
