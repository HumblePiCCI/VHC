import React, { useMemo, useState } from 'react';
import type { HermesComment } from '@vh/types';
import { Button } from '@vh/ui';
import { useForumStore } from '../../store/hermesForum';
import { renderMarkdown } from '../../utils/markdown';
import { CommentComposer } from './forum/CommentComposer';
import { TrustGate } from './forum/TrustGate';
import { useSentimentState } from '../../hooks/useSentimentState';
import { EngagementIcons } from '../EngagementIcons';
import { useViewTracking } from '../../hooks/useViewTracking';

interface Props {
  comment: HermesComment;
  allComments: HermesComment[];
  onSelect?: (id: string) => void;
  isExpanded?: boolean; // When true, show full nested content
}

const EMPTY_COMMENTS: readonly HermesComment[] = [];

export const CommentCard: React.FC<Props> = ({ comment, allComments, onSelect, isExpanded = false }) => {
  const userVotes = useForumStore((s) => s.userVotes);
  const vote = useForumStore((s) => s.vote);
  const [showConcur, setShowConcur] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const eyeWeight = useSentimentState((s) => s.getEyeWeight(comment.id));
  const lightbulbWeight = useSentimentState((s) => s.getLightbulbWeight(comment.id));
  useViewTracking(comment.id, isExpanded);

  const score = comment.upvotes - comment.downvotes;

  const { concurChildren, counterChildren } = useMemo(() => {
    const children = allComments.filter((c) => c.parentId === comment.id);
    return {
      concurChildren: children.filter((c) => c.stance === 'concur'),
      counterChildren: children.filter((c) => c.stance === 'counter')
    };
  }, [allComments, comment.id]);

  const handleCardClick = () => {
    // Only zoom when NOT already expanded - prevents re-zooming to self
    if (!isExpanded && onSelect) {
      onSelect(comment.id);
    }
  };

  return (
    <div
      className={`space-y-3 rounded-xl p-3 shadow-sm ${
        !isExpanded ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''
      }`}
      style={{ backgroundColor: 'var(--comment-card-bg)' }}
      role="article"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--comment-meta)' }}>
            <span className="font-semibold" style={{ color: 'var(--comment-author)' }}>{comment.author.slice(0, 10)}…</span>
            <span>{new Date(comment.timestamp).toLocaleString()}</span>
          </div>
          <div
            className="prose prose-sm max-w-none"
            style={{ color: 'var(--comment-text)' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }}
          />
        </div>
        {isExpanded && <EngagementIcons eyeWeight={eyeWeight} lightbulbWeight={lightbulbWeight} />}
        <TrustGate
          fallback={<span className="text-[11px] text-slate-500" data-testid="trust-gate-msg">Verify to vote</span>}
        >
          <div className="flex flex-col items-center gap-1 text-xs">
            <button
              className={`rounded px-1 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${
                userVotes.get(comment.id) === 'up' ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-200'
              }`}
              data-testid={`vote-up-${comment.id}`}
              onClick={(e) => {
                e.stopPropagation();
                vote(comment.id, userVotes.get(comment.id) === 'up' ? null : 'up');
              }}
            >
              ▲
            </button>
            <span>{score}</span>
            <button
              className={`rounded px-1 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 ${
                userVotes.get(comment.id) === 'down' ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-200'
              }`}
              data-testid={`vote-down-${comment.id}`}
              onClick={(e) => {
                e.stopPropagation();
                vote(comment.id, userVotes.get(comment.id) === 'down' ? null : 'down');
              }}
            >
              ▼
            </button>
          </div>
        </TrustGate>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          className="rounded-lg px-3 py-2 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
          style={{ backgroundColor: 'var(--concur-button)', color: '#ffffff' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowConcur((v) => !v);
          }}
        >
          Add Concur
        </button>
        <button
          className="rounded-lg px-3 py-2 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
          style={{ backgroundColor: 'var(--counter-button)', color: '#ffffff' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowCounter((v) => !v);
          }}
        >
          Add Counter
        </button>
      </div>

      {(showConcur || showCounter) && (
        <div className="grid gap-3 md:grid-cols-2">
          {showConcur && (
            <CommentComposer
              threadId={comment.threadId}
              parentId={comment.id}
              stance="concur"
              targetId={comment.id}
              onSubmit={async () => setShowConcur(false)}
            />
          )}
          {showCounter && (
            <CommentComposer
              threadId={comment.threadId}
              parentId={comment.id}
              stance="counter"
              targetId={comment.id}
              onSubmit={async () => setShowCounter(false)}
            />
          )}
        </div>
      )}

      {/* Show nested discussion pills (collapsed) or full content (expanded) */}
      {(concurChildren.length > 0 || counterChildren.length > 0) && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {concurChildren.length > 0 && (
            <button
              className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-800/60"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(comment.id);
              }}
              aria-label={`${concurChildren.length} concur replies`}
            >
              👍 {concurChildren.length} Concur
            </button>
          )}
          {counterChildren.length > 0 && (
            <button
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-800/60"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(comment.id);
              }}
              aria-label={`${counterChildren.length} counter replies`}
            >
              👎 {counterChildren.length} Counter
            </button>
          )}
        </div>
      )}

      {/* Only show full nested content when expanded */}
      {isExpanded && (concurChildren.length > 0 || counterChildren.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Concur</p>
            {concurChildren.length === 0 && <p className="text-xs text-slate-500">No concurs yet.</p>}
            {concurChildren.map((child) => (
              <CommentCard key={child.id} comment={child} allComments={allComments} onSelect={onSelect} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Counter</p>
            {counterChildren.length === 0 && <p className="text-xs text-slate-500">No counters yet.</p>}
            {counterChildren.map((child) => (
              <CommentCard key={child.id} comment={child} allComments={allComments} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
