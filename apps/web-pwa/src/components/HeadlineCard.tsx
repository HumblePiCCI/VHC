import React, { useMemo, useState } from 'react';
import type { FeedItem } from '../hooks/useFeedStore';
import AnalysisView from './AnalysisView';

interface HeadlineCardProps {
  item: FeedItem;
}

export const HeadlineCard: React.FC<HeadlineCardProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dateLabel = useMemo(() => new Date(item.timestamp).toLocaleString(), [item.timestamp]);

  return (
    <article
      className="relative overflow-hidden rounded-xl border border-slate-600/40 bg-slate-900/50 p-4 shadow-lg backdrop-blur transition-transform duration-150"
      style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)', zIndex: hovered ? 10 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded((prev) => !prev);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-slate-50">{item.title}</h3>
          <p className="text-sm text-slate-300">{item.summary}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {item.source} • {dateLabel}
          </p>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-20 w-28 rounded-lg object-cover shadow-md"
          />
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
        <span aria-label="Read count">👁️ {item.readCount}</span>
        <span aria-label="Engagement score">💡 {item.engagementScore.toFixed(1)}</span>
        <span className="ml-auto text-slate-400">{expanded ? 'Tap to collapse' : 'Tap to expand'}</span>
      </div>
      {expanded && (
        <div className="mt-4">
          <AnalysisView item={item} />
        </div>
      )}
    </article>
  );
};

export default HeadlineCard;
