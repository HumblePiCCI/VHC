/* @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { TopicSynthesisV2 } from '@vh/data-model';
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

const mockUseSynthesis = vi.fn();
const composerWithArticlePropsMock = vi.fn();

function makeSynthesis(overrides: Partial<TopicSynthesisV2> = {}): TopicSynthesisV2 {
  return {
    schemaVersion: 'topic-synthesis-v2',
    topic_id: baseThread.id,
    epoch: 2,
    synthesis_id: 'synth-thread-1',
    inputs: {},
    quorum: {
      required: 3,
      received: 3,
      reached_at: Date.now(),
      timed_out: false,
      selection_rule: 'deterministic',
    },
    facts_summary: 'Synthesis summary for thread context.',
    frames: [{ frame: 'Budget lens', reframe: 'Target a phased rollout.' }],
    warnings: [],
    divergence_metrics: { disagreement_score: 0.2, source_dispersion: 0.2, candidate_count: 3 },
    provenance: { candidate_ids: ['c1', 'c2', 'c3'], provider_mix: [{ provider_id: 'local', count: 3 }] },
    created_at: Date.now(),
    ...overrides,
  };
}

vi.mock('../../../store/hermesForum', () => ({
  useForumStore: (selector?: (s: typeof mockStore) => any) => (selector ? selector(mockStore) : mockStore)
}));

vi.mock('../../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore: 1 } } })
}));

vi.mock('../../../hooks/useSentimentState', () => ({
  useSentimentState: (selector?: any) =>
    selector
      ? selector({ getEyeWeight: () => 0, getLightbulbWeight: () => 0 })
      : { getEyeWeight: () => 0, getLightbulbWeight: () => 0 }
}));

vi.mock('../../../hooks/useSynthesis', () => ({
  useSynthesis: (...args: unknown[]) => mockUseSynthesis(...args)
}));

vi.mock('../../../hooks/useViewTracking', () => ({
  useViewTracking: () => undefined
}));

vi.mock('../CommunityReactionSummary', () => ({
  CommunityReactionSummary: ({ children }: any) => <div data-testid="community-summary">{children}</div>
}));

vi.mock('./CommentComposerWithArticle', () => ({
  CommentComposerWithArticle: (props: any) => {
    composerWithArticlePropsMock(props);
    return <div data-testid="comment-composer-with-article">Composer with article</div>;
  }
}));

expect.extend(matchers);

describe('ThreadView threaded layout', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    mockStore.threads = new Map([[baseThread.id, baseThread]]);
    mockStore.comments = new Map();
    mockStore.loadComments.mockClear();
    mockStore.createComment.mockClear();
    mockStore.vote.mockClear();
    mockStore.userVotes = new Map();
    composerWithArticlePropsMock.mockClear();
    mockUseSynthesis.mockReturnValue({
      enabled: true,
      topicId: baseThread.id,
      epoch: null,
      synthesis: null,
      hydrated: false,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    window.localStorage.clear();
  });

  it('shows a one-time callout and dismisses it', async () => {
    render(<ThreadView threadId={baseThread.id} />);
    await waitFor(() => expect(mockStore.loadComments).toHaveBeenCalled());

    expect(screen.getByText(/Thread view updated/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss update notice/i }));
    expect(screen.queryByText(/Thread view updated/i)).not.toBeInTheDocument();
  });

  it('renders comments in a single stream', async () => {
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

    expect(screen.getByText('Agree content')).toBeInTheDocument();
    expect(screen.getByText('Counter content')).toBeInTheDocument();
  });

  it('toggles the root reply composer and wires source context', async () => {
    render(<ThreadView threadId={baseThread.id} />);
    await waitFor(() => expect(mockStore.loadComments).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /reply to thread/i }));
    expect(screen.getByTestId('comment-composer-with-article')).toBeInTheDocument();
    expect(composerWithArticlePropsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        threadId: baseThread.id,
        sourceContext: { sourceThreadId: baseThread.id },
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /reply to thread/i }));
    expect(screen.queryByTestId('comment-composer-with-article')).not.toBeInTheDocument();
  });

  it('renders synthesis lens panel when synthesis context is available', async () => {
    mockUseSynthesis.mockReturnValue({
      enabled: true,
      topicId: baseThread.id,
      epoch: 2,
      synthesis: makeSynthesis(),
      hydrated: true,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<ThreadView threadId={baseThread.id} />);
    await waitFor(() => expect(mockStore.loadComments).toHaveBeenCalled());

    expect(screen.getByTestId('thread-synthesis-panel')).toBeInTheDocument();
    expect(screen.getByText('Thread lens')).toBeInTheDocument();
    expect(screen.getByTestId('synthesis-summary')).toBeInTheDocument();
    expect(screen.getByText('Synthesis summary for thread context.')).toBeInTheDocument();
  });
});
