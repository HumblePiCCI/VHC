import React, { useState } from 'react';
import { useForumStore } from '../../../store/hermesForum';
import { SlideToPost } from './SlideToPost';

interface Props {
  threadId: string;
  parentId?: string;
  onSubmit?: () => Promise<void> | void;
}

export const CommentComposer: React.FC<Props> = ({ threadId, parentId, onSubmit }) => {
  const { createComment } = useForumStore();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div
      className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
      style={{ backgroundColor: 'var(--comment-card-bg)' }}
      data-testid="comment-composer-container"
    >
      <textarea
        className="w-full resize-none rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        style={{ backgroundColor: 'var(--summary-card-bg)', color: 'var(--comment-text)', borderColor: 'var(--thread-muted)' }}
        rows={3}
        placeholder="Write your reply..."
        value={content}
        data-testid="comment-composer"
        disabled={busy}
        onChange={(e) => setContent(e.target.value)}
      />

      <SlideToPost
        disabled={!content.trim() || busy}
        onPost={async (stance) => {
          if (!content.trim() || busy) {
            throw new Error('Cannot post: content empty or busy');
          }

          setBusy(true);
          try {
            await createComment(threadId, content.trim(), stance, parentId);
            setContent('');
            await onSubmit?.();
          } catch (err) {
            console.warn('[vh:forum] Comment post failed:', err);
            throw err;
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
};
