import { useMemo } from 'react';
import { useStore } from 'zustand';
import type { FeedItem, FilterChip, SortMode } from '@vh/data-model';
import {
  useDiscoveryStore,
  composeFeed,
  type DiscoveryState,
} from '../store/discovery';

/**
 * Derived discovery feed hook.
 *
 * Composes the visible feed from the discovery store by applying:
 * 1. Filter chip → kind subset
 * 2. Sort mode → ordering
 *
 * Spec: docs/specs/spec-topic-discovery-ranking-v0.md §2–4
 */

export interface UseDiscoveryFeedResult {
  /** The composed, filtered, sorted feed. */
  readonly feed: ReadonlyArray<FeedItem>;
  /** Active filter chip. */
  readonly filter: FilterChip;
  /** Active sort mode. */
  readonly sortMode: SortMode;
  /** Whether the store is loading. */
  readonly loading: boolean;
  /** Last error, if any. */
  readonly error: string | null;
  /** Change filter chip. */
  setFilter: (filter: FilterChip) => void;
  /** Change sort mode. */
  setSortMode: (mode: SortMode) => void;
}

// Selectors (stable references for zustand)
const selectItems = (s: DiscoveryState) => s.items;
const selectFilter = (s: DiscoveryState) => s.filter;
const selectSortMode = (s: DiscoveryState) => s.sortMode;
const selectRankingConfig = (s: DiscoveryState) => s.rankingConfig;
const selectLoading = (s: DiscoveryState) => s.loading;
const selectError = (s: DiscoveryState) => s.error;
const selectSetFilter = (s: DiscoveryState) => s.setFilter;
const selectSetSortMode = (s: DiscoveryState) => s.setSortMode;

export function useDiscoveryFeed(): UseDiscoveryFeedResult {
  const items = useStore(useDiscoveryStore, selectItems);
  const filter = useStore(useDiscoveryStore, selectFilter);
  const sortMode = useStore(useDiscoveryStore, selectSortMode);
  const rankingConfig = useStore(useDiscoveryStore, selectRankingConfig);
  const loading = useStore(useDiscoveryStore, selectLoading);
  const error = useStore(useDiscoveryStore, selectError);
  const setFilter = useStore(useDiscoveryStore, selectSetFilter);
  const setSortMode = useStore(useDiscoveryStore, selectSetSortMode);

  const feed = useMemo(
    () => composeFeed(items, filter, sortMode, rankingConfig, Date.now()),
    [items, filter, sortMode, rankingConfig],
  );

  return { feed, filter, sortMode, loading, error, setFilter, setSortMode };
}
