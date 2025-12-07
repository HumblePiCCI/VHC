import React, { useState } from 'react';
import { Button } from '@vh/ui';
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

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-card p-3 dark:border-slate-700">
      <textarea
        className="w-full resize-none rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
        rows={3}
        placeholder={stance === 'counter' ? 'Add a counterpoint…' : 'Add a concur…'}
        value={content}
        data-testid="comment-composer"
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        size="sm"
        onClick={() => void handleSubmit()}
        disabled={!content.trim() || busy}
        data-testid="submit-comment-btn"
      >
        {busy ? 'Posting…' : 'Post'}
      </Button>
    </div>
  );
};
