import React, { useState } from 'react';
import type { HermesComment } from '@vh/types';
import { Button } from '@vh/ui';
import { CommentCard } from './CommentCard';
import { CommentComposer } from './forum/CommentComposer';
import { TrustGate } from './forum/TrustGate';

interface Props {
  threadId: string;
  stance: 'concur' | 'counter';
  comments: HermesComment[];
  allComments: HermesComment[];
  onSelect?: (id: string) => void;
}

export const DebateColumn: React.FC<Props> = ({ threadId, stance, comments, allComments, onSelect }) => {
  const [showComposer, setShowComposer] = useState(false);
  const accent =
    stance === 'concur'
      ? 'border-teal-300 bg-teal-50 dark:border-teal-500/50 dark:bg-teal-900/20'
      : 'border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-900/20';
  const title = stance === 'concur' ? 'Concur' : 'Counter';

  return (
    <div className={`space-y-3 rounded-xl border p-3 shadow-sm ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {stance === 'concur' ? '👍 Concur' : '👎 Counter'} ({comments.length})
        </p>
        <Button size="sm" variant="ghost" onClick={() => setShowComposer((v) => !v)} aria-label={`Add ${title}`}>
          {showComposer ? 'Close' : `Add ${title}`}
        </Button>
      </div>

      {showComposer && (
        <TrustGate>
          <CommentComposer threadId={threadId} stance={stance} />
        </TrustGate>
      )}

      {comments.length === 0 && !showComposer && (
        <p className="text-sm text-slate-600 dark:text-slate-300">Be the first to add a {title.toLowerCase()}.</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} allComments={allComments} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};
