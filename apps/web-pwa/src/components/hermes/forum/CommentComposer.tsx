import React, { useState } from 'react';
import { useForumStore } from '../../../store/hermesForum';

interface Props {
  threadId: string;
  parentId?: string;
  targetId?: string;
  stance: 'concur' | 'counter';
  onSubmit?: (content: string) => Promise<void>;
}

export const CommentComposer: React.FC<Props> = ({ threadId, parentId, targetId, stance, onSubmit }) => {
  const { createComment } = useForumStore();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || busy) return;
    setBusy(true);
    try {
      // Always create the comment
      await createComment(threadId, content.trim(), stance, parentId, targetId);
      setContent('');
      // Then call onSubmit callback (e.g., to close the form)
      if (onSubmit) {
        await onSubmit(content.trim());
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setBusy(false);
    }
  };

  const btnVar = stance === 'concur' ? '--concur-button' : '--counter-button';

  return (
    <div className="space-y-2 rounded-lg p-3" style={{ backgroundColor: 'var(--comment-card-bg)' }}>
      <textarea
        className="w-full resize-none rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        style={{ backgroundColor: 'var(--summary-card-bg)', color: 'var(--comment-text)', borderColor: 'var(--thread-muted)' }}
        rows={3}
        placeholder={stance === 'counter' ? 'Add a counterpoint…' : 'Add a concur…'}
        value={content}
        data-testid="comment-composer"
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md disabled:opacity-50"
        style={{ backgroundColor: `var(${btnVar})`, color: '#ffffff' }}
        onClick={() => void handleSubmit()}
        disabled={!content.trim() || busy}
        data-testid="submit-comment-btn"
      >
        {busy ? 'Posting…' : 'Post'}
      </button>
    </div>
  );
};
