export interface ArticleContent {
  fullText: string;
  wordCount: number;
  extractionMethod: 'readability' | 'raw-html' | 'feed-content';
  fetchedAt: number;
  eligible: boolean;
  exclusionReason?: 'paywall' | 'truncated' | 'fetch-error' | 'empty' | 'robots-blocked';
}

export const MIN_WORD_COUNT = 200;
export const FETCH_TIMEOUT_MS = 10_000;
export const MIN_CHAR_COUNT = 100;

const WORD_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Strip HTML tags and normalize whitespace. */
export function stripHtml(html: string): string {
  return normalizeWhitespace(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'"),
  );
}

/** Count words in text. */
export function countWords(text: string): number {
  return text.match(WORD_RE)?.length ?? 0;
}

function excluded(reason: NonNullable<ArticleContent['exclusionReason']>): ArticleContent {
  return {
    fullText: '',
    wordCount: 0,
    extractionMethod: 'raw-html',
    fetchedAt: Date.now(),
    eligible: false,
    exclusionReason: reason,
  };
}

/** Fetch article URL, extract readable text, determine eligibility. */
export async function fetchFullText(url: string): Promise<ArticleContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const finish = (result: ArticleContent): ArticleContent => {
    clearTimeout(timeout);
    return result;
  };

  try {
    const response = await globalThis.fetch(url, { signal: controller.signal });

    if (response.status === 402 || response.status === 403) {
      return finish(excluded('paywall'));
    }

    if (!response.ok) {
      return finish(excluded('fetch-error'));
    }

    const fullText = stripHtml(await response.text());
    const wordCount = countWords(fullText);
    const fetchedAt = Date.now();

    if (fullText.length < MIN_CHAR_COUNT) {
      return finish({
        fullText,
        wordCount,
        extractionMethod: 'raw-html',
        fetchedAt,
        eligible: false,
        exclusionReason: 'empty',
      });
    }

    if (wordCount < MIN_WORD_COUNT) {
      return finish({
        fullText,
        wordCount,
        extractionMethod: 'raw-html',
        fetchedAt,
        eligible: false,
        exclusionReason: 'truncated',
      });
    }

    return finish({
      fullText,
      wordCount,
      extractionMethod: 'raw-html',
      fetchedAt,
      eligible: true,
    });
  } catch {
    return finish(excluded('fetch-error'));
  }
}
