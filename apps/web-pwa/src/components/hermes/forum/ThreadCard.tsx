import React from 'react';
import { Link } from '@tanstack/react-router';
import type { HermesThread } from '@vh/types';
import { TrustGate } from './TrustGate';

interface Props {
  thread: HermesThread;
  onVote?: (direction: 'up' | 'down' | null) => void;
  userVote?: 'up' | 'down' | null;
}

export const ThreadCard: React.FC<Props> = ({ thread, onVote, userVote }) => {
  const score = thread.upvotes - thread.downvotes;
  return (
    <div
      className="rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: 'var(--thread-list-card-bg)', borderColor: 'var(--thread-list-card-border)', borderWidth: '1px', borderStyle: 'solid' }}
      data-testid={`thread-${thread.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Link
            to="/hermes/$threadId"
            params={{ threadId: thread.id }}
            className="text-lg font-semibold hover:opacity-80"
            style={{ color: 'var(--thread-title)' }}
          >
            {thread.title}
          </Link>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--thread-text)' }}>{thread.content}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--thread-muted)' }}>
            <span>By {thread.author.slice(0, 10)}…</span>
            <span>Score: {score.toFixed(2)}</span>
            <span>{new Date(thread.timestamp).toLocaleString()}</span>
            <div className="flex gap-1">
              {thread.tags.map((tag) => (
                <span key={tag} className="rounded-full px-2 py-[2px]" style={{ backgroundColor: 'var(--tag-bg)', color: 'var(--tag-text)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {onVote && (
          <TrustGate>
            <div className="flex flex-col items-center gap-1 text-sm" style={{ color: 'var(--thread-text)' }}>
              <button
                className="rounded border px-2 py-1 transition-colors"
                style={{
                  borderColor: userVote === 'up' ? 'var(--concur-button)' : 'var(--thread-muted)',
                  color: userVote === 'up' ? 'var(--concur-button)' : 'var(--thread-text)'
                }}
                onClick={() => onVote(userVote === 'up' ? null : 'up')}
              >
                ▲
              </button>
              <span className="text-xs">{score}</span>
              <button
                className="rounded border px-2 py-1 transition-colors"
                style={{
                  borderColor: userVote === 'down' ? 'var(--counter-button)' : 'var(--thread-muted)',
                  color: userVote === 'down' ? 'var(--counter-button)' : 'var(--thread-text)'
                }}
                onClick={() => onVote(userVote === 'down' ? null : 'down')}
              >
                ▼
              </button>
            </div>
          </TrustGate>
        )}
      </div>
    </div>
  );
};
