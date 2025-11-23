import { describe, expect, it } from 'vitest';
import { useFeedStore } from './useFeedStore';

describe('useFeedStore', () => {
  it('hydrates from seeds when no cache', () => {
    useFeedStore.getState().hydrate();
    expect(useFeedStore.getState().items.length).toBeGreaterThan(0);
  });

  it('loads more pages until cap', () => {
    useFeedStore.setState({ items: [], page: 0, hasMore: true, loading: false });
    useFeedStore.getState().hydrate();
    const initialCount = useFeedStore.getState().items.length;
    useFeedStore.getState().loadMore();
    expect(useFeedStore.getState().items.length).toBeGreaterThan(initialCount);
  });
});
