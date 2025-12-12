import React, { useEffect, useMemo, useState } from 'react';
import type { FeedItem } from '../hooks/useFeedStore';
import { useSentimentState } from '../hooks/useSentimentState';
import AnalysisView from './AnalysisView';
import { EyeIcon as EyeOutline, LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';
import { EyeIcon as EyeSolid, LightBulbIcon as LightBulbSolid } from '@heroicons/react/24/solid';

interface HeadlineCardProps {
  item: FeedItem;
}

export const HeadlineCard: React.FC<HeadlineCardProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dateLabel = useMemo(() => new Date(item.timestamp).toLocaleString(), [item.timestamp]);

  // Get eye weight from sentiment store for this item
  const eyeWeight = useSentimentState((s) => s.getEyeWeight(item.id));
  const lightbulbWeight = useSentimentState((s) => s.getLightbulbWeight(item.id));
  const recordRead = useSentimentState((s) => s.recordRead);

  // Calculate displayed read count: base + eye weight contribution (decayed toward 2)
  const displayedReadCount = useMemo(() => {
    return (item.readCount + eyeWeight).toFixed(1);
  }, [item.readCount, eyeWeight]);

  // Aggregate Lightbulb = seeded engagementScore (other users) + local per-user weight
  const displayedLightbulb = useMemo(() => {
    const base = Number.isFinite(item.engagementScore) ? item.engagementScore : 0;
    return (base + lightbulbWeight).toFixed(2);
  }, [item.engagementScore, lightbulbWeight]);

  // Simulate brief loading state when expanding (for UX feedback)
  useEffect(() => {
    if (expanded) {
      setLoading(true);
      // Record the read when card is expanded
      recordRead(item.id);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [expanded, item.id, recordRead]);

  // Z-index priority: expanded cards always on top, then hovered cards
  const zIndex = expanded ? 100 : hovered ? 10 : 1;

  return (
    <article
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: 'var(--headline-card-bg)',
        borderColor: 'var(--headline-card-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
        transform: hovered && !expanded ? 'scale(1.01)' : 'scale(1)',
        zIndex
      }}
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
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold tracking-[0.01em]" style={{ color: 'var(--headline-card-text)' }}>{item.title}</h3>
          <p className="text-sm" style={{ color: 'var(--headline-card-text)', opacity: 0.85 }}>{item.summary}</p>
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--headline-card-muted)' }}>
            {item.source} • {dateLabel}
          </p>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-20 w-28 rounded-xl object-cover shadow-sm"
          />
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs" style={{ color: 'var(--headline-card-muted)' }}>
        <span className="flex items-center gap-1" aria-label="Read count" data-testid="read-count">
          {eyeWeight > 0 ? (
            <EyeSolid
              className="h-4 w-4"
              style={{ color: 'var(--icon-engaged)', filter: `drop-shadow(var(--icon-shadow-x) var(--icon-shadow-y) var(--icon-shadow-blur) var(--icon-shadow)) drop-shadow(0 0 4px var(--icon-glow)) drop-shadow(0 0 8px var(--icon-glow))` }}
            />
          ) : (
            <EyeOutline className="h-4 w-4" style={{ color: 'var(--icon-default)' }} />
          )}
          {displayedReadCount}
        </span>
        <span className="flex items-center gap-1" aria-label="Engagement score">
          {lightbulbWeight > 0 ? (
            <LightBulbSolid
              className="h-4 w-4"
              style={{ color: 'var(--icon-engaged)', filter: `drop-shadow(var(--icon-shadow-x) var(--icon-shadow-y) var(--icon-shadow-blur) var(--icon-shadow)) drop-shadow(0 0 4px var(--icon-glow)) drop-shadow(0 0 8px var(--icon-glow))` }}
            />
          ) : (
            <LightBulbOutline className="h-4 w-4" style={{ color: 'var(--icon-default)' }} />
          )}
          {displayedLightbulb}
        </span>
        <span className="ml-auto" style={{ color: 'var(--headline-card-muted)' }}>{expanded ? 'Tap to collapse' : 'Tap to expand'}</span>
      </div>
      {expanded && (
        <div 
          className="mt-4"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center py-6 text-slate-500 dark:text-slate-200" data-testid="analysis-loading">
              <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing…</span>
            </div>
          ) : (
            <AnalysisView item={item} />
          )}
        </div>
      )}
    </article>
  );
};

export default HeadlineCard;
