import { createHash } from 'crypto';
import type { AnalysisResult } from './prompts';

export interface CanonicalAnalysis extends AnalysisResult {
  url: string;
  urlHash: string;
  timestamp: number;
}

export interface AnalysisStore {
  getByHash(urlHash: string): Promise<CanonicalAnalysis | null>;
  save(record: CanonicalAnalysis): Promise<void>;
  listRecent(limit?: number): Promise<CanonicalAnalysis[]>;
}

export function hashUrl(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
}

export async function getOrGenerate(
  url: string,
  store: AnalysisStore,
  generate: (url: string) => Promise<AnalysisResult>
): Promise<{ analysis: CanonicalAnalysis; reused: boolean }> {
  const urlHash = hashUrl(url);
  const existing = await store.getByHash(urlHash);
  if (existing) {
    return { analysis: existing, reused: true };
  }
  const result = await generate(url);
  const canonical: CanonicalAnalysis = {
    ...result,
    url,
    urlHash,
    timestamp: Date.now()
  };
  await store.save(canonical);
  return { analysis: canonical, reused: false };
}
