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

interface Props {
  threadId: string;
}

const EMPTY_COMMENTS: readonly any[] = [];

export const ThreadView: React.FC<Props> = ({ threadId }) => {
  // Use individual selectors for proper reactivity
  const thread = useForumStore((s) => s.threads.get(threadId));
  const loadComments = useForumStore((s) => s.loadComments);
  const commentsForThread = useForumStore((s) => s.comments.get(threadId));
  const allComments = commentsForThread ?? EMPTY_COMMENTS;
  
  const [loaded, setLoaded] = useState(false);
  const zoomNav = useZoomNavigation();

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
      <div className="rounded-xl border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-700">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{thread.title}</p>
        <div
          className="prose prose-sm mt-2 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(thread.content) }}
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span>By {thread.author.slice(0, 10)}…</span>
          <span>{new Date(thread.timestamp).toLocaleString()}</span>
          <span>Score: {(thread.upvotes - thread.downvotes).toFixed(2)}</span>
        </div>
      </div>

      <CommunityReactionSummary threadId={threadId} />

      {!loaded && <p className="text-sm text-slate-500">Loading comments…</p>}

      {roots.concur.length === 0 && roots.counter.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">No discussion yet</p>
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
