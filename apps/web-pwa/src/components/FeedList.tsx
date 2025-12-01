import React, { useEffect, useMemo, useRef } from 'react';
import { useFeedStore } from '../hooks/useFeedStore';
import HeadlineCard from './HeadlineCard';

export const FeedList: React.FC = () => {
  const { items, hydrate, loadMore, hasMore, loading } = useFeedStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const itemData = useMemo(() => items, [items]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (!hasMore || loading) return;
      const { scrollTop, clientHeight, scrollHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore, loading]);

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No stories yet.</p>;
  }

  return (
    <div ref={containerRef} className="h-[80vh] w-full space-y-3 overflow-y-auto px-1">
      {itemData.map((item) => (
        <HeadlineCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default FeedList;
