/* @vitest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { ThreadView } from './ThreadView';

const baseThread = {
  id: 'thread-1',
  schemaVersion: 'hermes-thread-v0' as const,
  title: 'Debate title',
  content: 'Thread body',
  author: 'alice-nullifier',
  timestamp: Date.now(),
  tags: [],
  upvotes: 0,
  downvotes: 0,
  score: 0
};

const mockStore = {
  threads: new Map<string, any>(),
  comments: new Map<string, any[]>(),
  loadComments: vi.fn().mockResolvedValue(undefined),
  createComment: vi.fn().mockResolvedValue(undefined),
  userVotes: new Map<string, 'up' | 'down' | null>(),
  vote: vi.fn()
};

vi.mock('../../../store/hermesForum', () => ({
  useForumStore: (selector?: (s: typeof mockStore) => any) => (selector ? selector(mockStore) : mockStore)
}));

vi.mock('../../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore: 1 } } })
}));

expect.extend(matchers);

describe('ThreadView debate layout', () => {
  beforeEach(() => {
    mockStore.threads = new Map([[baseThread.id, baseThread]]);
    mockStore.comments = new Map();
    mockStore.loadComments.mockClear();
    mockStore.createComment.mockClear();
    mockStore.vote.mockClear();
    mockStore.userVotes = new Map();
  });

  it('renders empty state with dual composers', async () => {
    render(<ThreadView threadId={baseThread.id} />);
    await waitFor(() => expect(mockStore.loadComments).toHaveBeenCalled());

    expect(screen.getByText('No discussion yet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a concur…')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a counterpoint…')).toBeInTheDocument();
  });

  it('splits top-level comments into concur and counter columns', async () => {
    mockStore.comments = new Map([
      [
        baseThread.id,
        [
          {
            id: 'c1',
            schemaVersion: 'hermes-comment-v1' as const,
            threadId: baseThread.id,
            parentId: null,
            content: 'Agree content',
            author: 'agree-author',
            timestamp: Date.now(),
            stance: 'concur' as const,
            upvotes: 0,
            downvotes: 0
          },
          {
            id: 'c2',
            schemaVersion: 'hermes-comment-v1' as const,
            threadId: baseThread.id,
            parentId: null,
            content: 'Counter content',
            author: 'counter-author',
            timestamp: Date.now(),
            stance: 'counter' as const,
            upvotes: 0,
            downvotes: 0
          }
        ]
      ]
    ]);

    render(<ThreadView threadId={baseThread.id} />);
    await waitFor(() => expect(mockStore.loadComments).toHaveBeenCalled());

    expect(screen.getByText(/Concur \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Counter \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Agree content')).toBeInTheDocument();
    expect(screen.getByText('Counter content')).toBeInTheDocument();
  });
});
