import { stripTags } from './ingest';

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

function stripNonContentHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function extractText(html: string): {
  fullText: string;
  extractionMethod: 'readability' | 'raw-html';
} {
  const sanitized = stripNonContentHtml(html);
  const articleMatch = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(sanitized);

  if (articleMatch?.[1]) {
    return {
      fullText: normalizeWhitespace(stripTags(articleMatch[1])),
      extractionMethod: 'readability',
    };
  }

  return {
    fullText: normalizeWhitespace(stripTags(sanitized)),
    extractionMethod: 'raw-html',
  };
}

function countWords(text: string): number {
  const matches = text.match(WORD_RE);
  return matches?.length ?? 0;
}

function excluded(
  reason: NonNullable<ArticleContent['exclusionReason']>,
): ArticleContent {
  return {
    fullText: '',
    wordCount: 0,
    extractionMethod: 'raw-html',
    fetchedAt: Date.now(),
    eligible: false,
    exclusionReason: reason,
  };
}

export async function fetchFullText(url: string): Promise<ArticleContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const done = (result: ArticleContent): ArticleContent => {
    clearTimeout(timeout);
    return result;
  };

  try {
    const response = await globalThis.fetch(url, { signal: controller.signal });

    if (response.status === 402 || response.status === 403) {
      return done(excluded('paywall'));
    }

    if (!response.ok) {
      return done(excluded('fetch-error'));
    }

    const html = await response.text();
    const { fullText, extractionMethod } = extractText(html);
    const wordCount = countWords(fullText);
    const fetchedAt = Date.now();

    if (fullText.length < MIN_CHAR_COUNT) {
      return done({
        fullText,
        wordCount,
        extractionMethod,
        fetchedAt,
        eligible: false,
        exclusionReason: 'empty',
      });
    }

    if (wordCount < MIN_WORD_COUNT) {
      return done({
        fullText,
        wordCount,
        extractionMethod,
        fetchedAt,
        eligible: false,
        exclusionReason: 'truncated',
      });
    }

    return done({
      fullText,
      wordCount,
      extractionMethod,
      fetchedAt,
      eligible: true,
    });
  } catch {
    return done(excluded('fetch-error'));
  }
}
