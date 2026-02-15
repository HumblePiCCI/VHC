import React from 'react';
import { useDiscoveryFeed } from '../hooks/useDiscoveryFeed';
import FeedShell from './feed/FeedShell';

/**
 * FeedList — renders the discovery feed.
 *
 * V2 feed is now the permanent path. Wave 1 legacy feed removed.
 */
export const FeedList: React.FC = () => {
  const feedResult = useDiscoveryFeed();
  return <FeedShell feedResult={feedResult} />;
};

export default FeedList;
