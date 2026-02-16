import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FETCH_TIMEOUT_MS,
  MIN_WORD_COUNT,
  fetchFullText,
} from './fullTextFetcher';

function makeWordText(wordCount: number): string {
  return Array.from({ length: wordCount }, (_, index) => `word${index}`).join(' ');
}

function makeArticleHtml(wordCount: number): string {
  return `<html><body><article><p>${makeWordText(wordCount)}</p></article></body></html>`;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('fetchFullText', () => {
  it('extracts eligible full text from article markup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(makeArticleHtml(MIN_WORD_COUNT + 10), {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
      ),
    );

    const result = await fetchFullText('https://example.com/story');

    expect(result.eligible).toBe(true);
    expect(result.extractionMethod).toBe('readability');
    expect(result.wordCount).toBe(MIN_WORD_COUNT + 10);
    expect(result.fullText.startsWith('word0 word1')).toBe(true);
    expect(result.fetchedAt).toBeTypeOf('number');
    expect(result.exclusionReason).toBeUndefined();
  });

  it.each([402, 403])('excludes paywalled sources for HTTP %i', async (statusCode) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('blocked', { status: statusCode })),
    );

    const result = await fetchFullText('https://example.com/paywall');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('paywall');
    expect(result.fullText).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('excludes sources when fetch times out', async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new Error('aborted')),
            { once: true },
          );
        });
      }),
    );

    const pending = fetchFullText('https://example.com/hanging-source');
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS + 1);
    const result = await pending;

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('fetch-error');
    expect(result.wordCount).toBe(0);
  });

  it('marks sources as truncated when body has fewer than 200 words', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(makeArticleHtml(MIN_WORD_COUNT - 1), { status: 200 })),
    );

    const result = await fetchFullText('https://example.com/truncated');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('truncated');
    expect(result.wordCount).toBe(MIN_WORD_COUNT - 1);
  });

  it('marks sources as empty when extracted text is below the minimum char count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<article><p>!!! ???</p></article>', { status: 200 })),
    );

    const result = await fetchFullText('https://example.com/empty');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('empty');
    expect(result.wordCount).toBe(0);
    expect(result.fullText.length).toBeLessThan(100);
  });

  it('falls back to raw-html extraction when article tags are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(`<html><body><div>${makeWordText(MIN_WORD_COUNT + 5)}</div></body></html>`, {
          status: 200,
        }),
      ),
    );

    const result = await fetchFullText('https://example.com/raw-html');

    expect(result.eligible).toBe(true);
    expect(result.extractionMethod).toBe('raw-html');
    expect(result.wordCount).toBe(MIN_WORD_COUNT + 5);
  });

  it('returns fetch-error for non-paywall HTTP failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('server error', { status: 500 })),
    );

    const result = await fetchFullText('https://example.com/error');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('fetch-error');
    expect(result.wordCount).toBe(0);
  });
});
