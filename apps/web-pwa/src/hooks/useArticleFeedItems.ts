/**
 * useArticleFeedItems — converts published HermesDocuments into FeedItem format.
 *
 * Returns items when VITE_HERMES_DOCS_ENABLED is true.
 *
 * This hook bridges the hermesDocs store (w2b) with the discovery feed (team-c).
 */

import { useMemo } from 'react';
import type { FeedItem } from '@vh/data-model';
import type { HermesDocument } from '@vh/data-model';
import { useDocsStore } from '../store/hermesDocs';

/** Convert a published HermesDocument to a FeedItem. */
export function docToFeedItem(doc: HermesDocument): FeedItem {
  return {
    topic_id: doc.publishedArticleId ?? doc.id,
    kind: 'ARTICLE',
    title: doc.title,
    created_at: doc.publishedAt ?? doc.createdAt,
    latest_activity_at: doc.lastModifiedAt,
    hotness: 0,
    eye: 0,
    lightbulb: 0,
    comments: 0,
  };
}

const EMPTY_ITEMS: ReadonlyArray<FeedItem> = [];

/**
 * Returns published articles as FeedItem[] for integration with the discovery feed.
 * Returns empty array when docs feature flag is off.
 */
export function useArticleFeedItems(): ReadonlyArray<FeedItem> {
  const { enabled: docsEnabled, listPublished } = useDocsStore();

  return useMemo(() => {
    if (!docsEnabled) return EMPTY_ITEMS;
    return listPublished().map(docToFeedItem);
  }, [docsEnabled, listPublished]);
}
