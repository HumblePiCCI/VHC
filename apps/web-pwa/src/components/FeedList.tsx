import React, { useEffect, useMemo } from 'react';
import { FixedSizeList, type ListOnItemsRenderedProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useFeedStore } from '../hooks/useFeedStore';
import HeadlineCard from './HeadlineCard';

const ITEM_HEIGHT = 240;

export const FeedList: React.FC = () => {
  const { items, hydrate, loadMore, hasMore, loading } = useFeedStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const itemData = useMemo(() => items, [items]);

  const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
    if (hasMore && !loading && visibleStopIndex >= items.length - 2) {
      loadMore();
    }
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No stories yet.</p>;
  }

  return (
    <div className="h-[80vh] w-full">
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={itemData.length}
            itemSize={ITEM_HEIGHT}
            onItemsRendered={handleItemsRendered}
          >
            {({ index, style }) => (
              <div style={{ ...style, padding: '8px' }}>
                <HeadlineCard item={itemData[index]} />
              </div>
            )}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default FeedList;
