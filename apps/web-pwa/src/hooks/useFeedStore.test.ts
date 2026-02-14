import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeedStore } from './useFeedStore';
import { useDiscoveryStore } from '../store/discovery';

describe('useFeedStore', () => {
  beforeEach(() => {
    useFeedStore.setState({ items: [], page: 0, hasMore: false, loading: false });
    useDiscoveryStore.getState().setItems([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates from discovery store', () => {
    useDiscoveryStore.getState().setItems([
      {
        topic_id: 'disc-1',
        kind: 'NEWS_STORY',
        title: 'Discovery Item',
        created_at: Date.now(),
        latest_activity_at: Date.now(),
        hotness: 1.0,
        eye: 5,
        lightbulb: 3,
        comments: 0,
      },
    ]);
    useFeedStore.getState().hydrate();
    const state = useFeedStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].id).toBe('disc-1');
    expect(state.items[0].title).toBe('Discovery Item');
    expect(state.page).toBe(1);
    expect(state.hasMore).toBe(false);
  });

  it('returns empty feed from empty discovery store', () => {
    useFeedStore.getState().hydrate();
    expect(useFeedStore.getState().items).toHaveLength(0);
  });

  it('setItems routes through discovery store', () => {
    useFeedStore.getState().setItems([
      {
        id: 'legacy-1',
        title: 'Legacy Item',
        summary: 'Test',
        source: 'Discovery · News',
        timestamp: Date.now(),
        engagementScore: 1.0,
        readCount: 5,
        perspectives: [],
      },
    ]);
    const disc = useDiscoveryStore.getState().items;
    expect(disc.length).toBe(1);
    expect(disc[0].topic_id).toBe('legacy-1');
  });

  it('loadMore re-reads from discovery store', () => {
    useDiscoveryStore.getState().setItems([
      {
        topic_id: 'disc-2',
        kind: 'USER_TOPIC',
        title: 'Topic Update',
        created_at: Date.now(),
        latest_activity_at: Date.now(),
        hotness: 0.5,
        eye: 2,
        lightbulb: 1,
        comments: 0,
      },
    ]);
    useFeedStore.getState().loadMore();
    expect(useFeedStore.getState().items.length).toBe(1);
    expect(useFeedStore.getState().hasMore).toBe(false);
  });
});
