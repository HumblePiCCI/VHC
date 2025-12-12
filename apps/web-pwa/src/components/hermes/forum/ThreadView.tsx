import React, { useEffect, useMemo, useState } from 'react';
import { useForumStore } from '../../../store/hermesForum';
import { CommentComposer } from './CommentComposer';
import { TrustGate } from './TrustGate';
import { renderMarkdown } from '../../../utils/markdown';
import { DebateColumn } from '../DebateColumn';
import { useZoomNavigation } from '../../../hooks/useZoomNavigation';
import { ZoomableCard } from '../ZoomableCard';
import { CommentCard } from '../CommentCard';
import { CommunityReactionSummary } from '../CommunityReactionSummary';
import { EngagementIcons } from '../../EngagementIcons';
import { useSentimentState } from '../../../hooks/useSentimentState';
import { useViewTracking } from '../../../hooks/useViewTracking';

interface Props {
  threadId: string;
}

const EMPTY_COMMENTS: readonly any[] = [];
const borderlessButton =
  'inline-flex items-center gap-2 rounded-lg px-4 py-2 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500';

// Keyframe animation for smooth zoom-in effect
const zoomInAnimation = `
@keyframes threadZoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;

// Inject the animation styles once
if (typeof document !== 'undefined') {
  const styleId = 'thread-zoom-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = zoomInAnimation;
    document.head.appendChild(style);
  }
}

export const ThreadView: React.FC<Props> = ({ threadId }) => {
  // Use individual selectors for proper reactivity
  const thread = useForumStore((s) => s.threads.get(threadId));
  const loadComments = useForumStore((s) => s.loadComments);
  const commentsForThread = useForumStore((s) => s.comments.get(threadId));
  const allComments = commentsForThread ?? EMPTY_COMMENTS;
  const eyeWeight = useSentimentState((s) => s.getEyeWeight(threadId));
  const lightbulbWeight = useSentimentState((s) => s.getLightbulbWeight(threadId));
  
  const [loaded, setLoaded] = useState(false);
  const zoomNav = useZoomNavigation();
  useViewTracking(threadId, true);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    void loadComments(threadId).then(() => setLoaded(true));
  }, [threadId, loadComments]);

  const roots = useMemo(() => {
    const rootsOnly = allComments.filter((c) => c.parentId === null);
    return {
      concur: rootsOnly.filter((c) => c.stance === 'concur'),
      counter: rootsOnly.filter((c) => c.stance === 'counter')
    };
  }, [allComments]);

  const activeZoomComment = zoomNav.activeId ? allComments.find((c) => c.id === zoomNav.activeId) : null;

  if (!thread) {
    return <p className="text-sm text-slate-500">Thread not found.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Single unified thread card with zoom-in animation */}
      <div
        className="rounded-2xl p-5 shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--thread-surface)',
          borderColor: 'var(--section-container-border)',
          borderWidth: '1px',
          borderStyle: 'solid',
          animation: prefersReducedMotion ? 'none' : 'threadZoomIn 0.3s ease-out forwards',
          transformOrigin: 'center top'
        }}
      >
        {/* Thread header - no separate card, just content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-semibold" style={{ color: 'var(--thread-title)' }}>{thread.title}</p>
            <EngagementIcons eyeWeight={eyeWeight} lightbulbWeight={lightbulbWeight} />
          </div>
          <div
            className="prose prose-sm max-w-none"
            style={{ color: 'var(--thread-text)' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(thread.content) }}
          />
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thread-muted)' }}>
            <span>By {thread.author.slice(0, 10)}…</span>
            <span>{new Date(thread.timestamp).toLocaleString()}</span>
            <span>Score: {(thread.upvotes - thread.downvotes).toFixed(2)}</span>
          </div>
        </div>

        {/* Conversation summary with debate threads inside */}
        <CommunityReactionSummary threadId={threadId}>
          {/* Debate columns - rendered inside the summary card */}
          {!loaded && <p className="text-sm text-slate-500">Loading comments…</p>}

          {roots.concur.length === 0 && roots.counter.length === 0 ? (
            <div className="space-y-3 text-sm" style={{ color: 'var(--thread-text)' }}>
              <p className="font-semibold" style={{ color: 'var(--thread-title)' }}>No discussion yet</p>
              <p>Be the first to share your stance.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <TrustGate>
                  <CommentComposer threadId={threadId} stance="concur" />
                </TrustGate>
                <TrustGate>
                  <CommentComposer threadId={threadId} stance="counter" />
                </TrustGate>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <DebateColumn
                threadId={threadId}
                stance="concur"
                comments={roots.concur}
                allComments={allComments}
                onSelect={zoomNav.zoomTo}
              />
              <DebateColumn
                threadId={threadId}
                stance="counter"
                comments={roots.counter}
                allComments={allComments}
                onSelect={zoomNav.zoomTo}
              />
            </div>
          )}
        </CommunityReactionSummary>

        {/* Back button inside container */}
        <div className="flex justify-start pt-2">
          <button
            className={borderlessButton}
            onClick={() => window.history.back()}
            aria-label="Back to forum"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
          >
            ← Back to Forum
          </button>
        </div>
      </div>

      {/* Zoom overlay (outside container) */}
      <ZoomableCard
        isOpen={!!activeZoomComment}
        onClose={zoomNav.zoomOut}
        breadcrumbs={zoomNav.stack.map((id, idx) => ({
          id,
          label: `Depth ${idx + 1}`,
          onClick: () => zoomNav.zoomOutTo(idx)
        }))}
      >
        {activeZoomComment && (
          <div className="space-y-4">
            <CommentCard comment={activeZoomComment} allComments={allComments} onSelect={zoomNav.zoomTo} isExpanded />
          </div>
        )}
      </ZoomableCard>
    </div>
  );
};
