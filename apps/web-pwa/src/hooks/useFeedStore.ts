import { create } from 'zustand';
import type { FeedItem as DiscoveryFeedItem, FeedKind } from '@vh/data-model';
import { composeFeed, useDiscoveryStore } from '../store/discovery';

export interface Perspective {
  id: string;
  frame: string;
  reframe: string;
}

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  imageUrl?: string;
  engagementScore: number;
  readCount: number;
  perspectives: Perspective[];
}

interface FeedState {
  items: FeedItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  hydrate: () => void;
  loadMore: () => void;
  setItems: (items: FeedItem[]) => void;
}

const DISCOVERY_SUMMARY_BY_KIND: Record<FeedKind, string> = {
  NEWS_STORY: 'Trending in discovery feed.',
  USER_TOPIC: 'Community topic update.',
  SOCIAL_NOTIFICATION: 'Social activity update.',
  ARTICLE: 'Published community article.'
};

const DISCOVERY_SOURCE_BY_KIND: Record<FeedKind, string> = {
  NEWS_STORY: 'Discovery · News',
  USER_TOPIC: 'Discovery · Topics',
  SOCIAL_NOTIFICATION: 'Discovery · Social',
  ARTICLE: 'Discovery · Articles'
};

function normalizeTimestamp(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return Date.now();
  }
  return Math.floor(value);
}

function toLegacyFeedItem(item: DiscoveryFeedItem): FeedItem {
  return {
    id: item.topic_id,
    title: item.title,
    summary: DISCOVERY_SUMMARY_BY_KIND[item.kind],
    source: DISCOVERY_SOURCE_BY_KIND[item.kind],
    timestamp: normalizeTimestamp(item.latest_activity_at),
    engagementScore: Math.max(0, item.lightbulb),
    readCount: Math.max(0, item.eye),
    perspectives: []
  };
}

function inferDiscoveryKind(item: FeedItem): FeedKind {
  const source = item.source.toLowerCase();
  if (source.includes('social')) {
    return 'SOCIAL_NOTIFICATION';
  }
  if (source.includes('topic')) {
    return 'USER_TOPIC';
  }
  return 'NEWS_STORY';
}

function toDiscoveryFeedItem(item: FeedItem): DiscoveryFeedItem {
  const timestamp = normalizeTimestamp(item.timestamp);
  return {
    topic_id: item.id,
    kind: inferDiscoveryKind(item),
    title: item.title,
    created_at: timestamp,
    latest_activity_at: timestamp,
    hotness: Math.max(0, item.engagementScore),
    eye: Math.max(0, Math.floor(item.readCount)),
    lightbulb: Math.max(0, Math.floor(item.engagementScore)),
    comments: 0
  };
}

function selectDiscoveryFeedItems(): FeedItem[] {
  const discovery = useDiscoveryStore.getState();
  const composed = composeFeed(
    discovery.items,
    discovery.filter,
    discovery.sortMode,
    discovery.rankingConfig,
    Date.now()
  );
  return composed.map(toLegacyFeedItem);
}

/**
 * Feed store backed by the discovery store.
 *
 * V2 discovery feed is now the permanent path. Legacy seed-data
 * and localStorage caching removed in Wave 3 flag retirement.
 */
export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  page: 0,
  hasMore: false,
  loading: false,
  hydrate() {
    const discoveryState = useDiscoveryStore.getState();
    set({
      items: selectDiscoveryFeedItems(),
      page: 1,
      hasMore: false,
      loading: discoveryState.loading
    });
  },
  setItems(items) {
    useDiscoveryStore.getState().setItems(items.map(toDiscoveryFeedItem));
    const discoveryState = useDiscoveryStore.getState();
    set({
      items: selectDiscoveryFeedItems(),
      page: 1,
      hasMore: false,
      loading: discoveryState.loading
    });
  },
  loadMore() {
    const discoveryState = useDiscoveryStore.getState();
    set({
      items: selectDiscoveryFeedItems(),
      hasMore: false,
      loading: discoveryState.loading
    });
  }
}));
