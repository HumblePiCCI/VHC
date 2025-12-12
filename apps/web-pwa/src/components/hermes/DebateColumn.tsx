import React, { useState } from 'react';
import type { HermesComment } from '@vh/types';
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
  const title = stance === 'concur' ? 'Concur' : 'Counter';
  const bgVar = stance === 'concur' ? '--concur-bg' : '--counter-bg';
  const labelVar = stance === 'concur' ? '--concur-label' : '--counter-label';
  const btnVar = stance === 'concur' ? '--concur-button' : '--counter-button';

  return (
    <div className="space-y-3 p-3 shadow-sm rounded-lg" style={{ backgroundColor: `var(${bgVar})` }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: `var(${labelVar})` }}>
          {stance === 'concur' ? '👍 Concur' : '👎 Counter'} ({comments.length})
        </p>
        <button
          type="button"
          onClick={() => setShowComposer((v) => !v)}
          aria-label={`Add ${title}`}
          className="rounded-md px-3 py-1 text-sm font-medium transition-colors shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: `var(${btnVar})`, color: '#ffffff' }}
        >
          {showComposer ? '✕ Close' : `+ Add ${title}`}
        </button>
      </div>

      {showComposer && (
        <TrustGate>
          <CommentComposer
            threadId={threadId}
            stance={stance}
            onSubmit={async () => setShowComposer(false)}
          />
        </TrustGate>
      )}

      {comments.length === 0 && !showComposer && (
        <p className="text-sm" style={{ color: `var(${labelVar})`, opacity: 0.7 }}>Be the first to add a {title.toLowerCase()}.</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} allComments={allComments} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};
