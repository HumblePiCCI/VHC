import { describe, expect, it } from 'vitest';
import { cacheAnalysisResult, cacheModelMeta, getCachedAnalysisResult, getCachedModelMeta } from './cache';

describe('ai cache (memory fallback)', () => {
  it('stores and retrieves model meta', async () => {
    await cacheModelMeta('model-1', { loadedAt: 123 });
    const meta = await getCachedModelMeta<{ loadedAt: number }>('model-1');
    expect(meta?.loadedAt).toBe(123);
  });

  it('stores and retrieves analysis results', async () => {
    const result = { summary: 'hello' };
    await cacheAnalysisResult('hash-1', result);
    const cached = await getCachedAnalysisResult<typeof result>('hash-1');
    expect(cached).toEqual(result);
  });
});
