import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FETCH_TIMEOUT_MS,
  MIN_WORD_COUNT,
  countWords,
  fetchFullText,
  stripHtml,
} from './fullTextFetcher';

function words(total: number): string {
  return Array.from({ length: total }, (_, index) => `word${index}`).join(' ');
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('fetchFullText', () => {
  it('returns eligible content for successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(`<html><body><article><p>${words(MIN_WORD_COUNT)}</p></article></body></html>`, {
          status: 200,
        }),
      ),
    );

    const result = await fetchFullText('https://example.com/a');

    expect(result.eligible).toBe(true);
    expect(result.extractionMethod).toBe('raw-html');
    expect(result.wordCount).toBe(MIN_WORD_COUNT);
    expect(result.fullText.startsWith('word0 word1 word2')).toBe(true);
    expect(result.exclusionReason).toBeUndefined();
    expect(result.fetchedAt).toBeTypeOf('number');
  });

  it('marks HTTP 402 as paywall', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('paywall', { status: 402 })));

    const result = await fetchFullText('https://example.com/paywall-402');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('paywall');
    expect(result.fullText).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('marks HTTP 403 as paywall', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('forbidden', { status: 403 })));

    const result = await fetchFullText('https://example.com/paywall-403');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('paywall');
  });

  it('marks other non-OK HTTP statuses as fetch-error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 500 })));

    const result = await fetchFullText('https://example.com/http-error');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('fetch-error');
    expect(result.fullText).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('marks timeout as fetch-error', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
        });
      }),
    );

    const pending = fetchFullText('https://example.com/slow');
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS + 1);
    const result = await pending;

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('fetch-error');
    expect(result.fullText).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('marks network error as fetch-error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await fetchFullText('https://example.com/network-fail');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('fetch-error');
    expect(result.fullText).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('marks short extracted text as empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html><body><p>tiny text</p></body></html>', { status: 200 })),
    );

    const result = await fetchFullText('https://example.com/empty');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('empty');
    expect(result.fullText.length).toBeLessThan(100);
  });

  it('marks low-word content as truncated', async () => {
    const text = `${words(MIN_WORD_COUNT - 1)} ${'!'.repeat(120)}`;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(`<html><body><div>${text}</div></body></html>`, { status: 200 })),
    );

    const result = await fetchFullText('https://example.com/truncated');

    expect(result.eligible).toBe(false);
    expect(result.exclusionReason).toBe('truncated');
    expect(result.wordCount).toBe(MIN_WORD_COUNT - 1);
  });
});

describe('stripHtml', () => {
  it('strips tags/scripts/comments and normalizes whitespace', () => {
    const html = `
      <html>
        <body>
          <!-- hidden -->
          <script>const secret = 1;</script>
          <p>Hello <b>world</b> &amp; team</p>
          <div>line 2</div>
        </body>
      </html>
    `;

    expect(stripHtml(html)).toBe('Hello world & team line 2');
  });
});

describe('countWords', () => {
  it('counts words correctly', () => {
    expect(countWords("One, two three! isn't four?" )).toBe(5);
    expect(countWords('')).toBe(0);
  });
});
