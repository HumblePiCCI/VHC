/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CommentStream } from './CommentStream';

const voteMock = vi.fn();
const createCommentMock = vi.fn(async () => undefined);
let trustScore = 1;

const c = (overrides: any) => ({
  id: 'id',
  schemaVersion: 'hermes-comment-v1',
  threadId: 't',
  parentId: null,
  content: '',
  author: 'a',
  timestamp: 0,
  stance: 'discuss',
  upvotes: 0,
  downvotes: 0,
  ...overrides
});

const mockStore = {
  userVotes: new Map<string, 'up' | 'down' | null>(),
  vote: voteMock,
  createComment: createCommentMock
};

vi.mock('../../store/hermesForum', () => ({
  useForumStore: (selector?: (s: typeof mockStore) => any) => (selector ? selector(mockStore) : mockStore)
}));

vi.mock('../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore } } })
}));

describe('CommentStream', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    mockStore.userVotes = new Map();
    voteMock.mockReset();
    createCommentMock.mockReset();
    trustScore = 1;
  });

  it('renders root comments in chronological order', () => {
    const comments: any[] = [
      c({ id: 'b', content: 'Second', author: 'bob', timestamp: 2, stance: 'counter' }),
      c({ id: 'a', content: 'First', author: 'alice', timestamp: 1, stance: 'concur' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('First');
    expect(articles[1]).toHaveTextContent('Second');
  });

  it('aligns root comments by stance using flex containers', () => {
    const comments: any[] = [
      c({ id: 'a', content: 'Support', author: 'alice', timestamp: 1, stance: 'concur' }),
      c({ id: 'b', content: 'Oppose', author: 'bob', timestamp: 2, stance: 'counter' }),
      c({ id: 'c', content: 'Discuss', author: 'carol', timestamp: 3, stance: 'discuss' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Root comments have max-width (92% at depth 0) and are aligned via flex container
    expect(screen.getByTestId('comment-frame-a')).toHaveStyle({ maxWidth: '92%' });
    expect(screen.getByTestId('comment-frame-b')).toHaveStyle({ maxWidth: '92%' });
    expect(screen.getByTestId('comment-frame-c')).toHaveStyle({ maxWidth: '92%' });

    // Check flex containers have correct alignment classes
    const wrapA = screen.getByTestId('comment-wrap-a');
    const wrapB = screen.getByTestId('comment-wrap-b');
    const wrapC = screen.getByTestId('comment-wrap-c');

    expect(wrapA.querySelector('.justify-start')).toBeInTheDocument();
    expect(wrapB.querySelector('.justify-end')).toBeInTheDocument();
    expect(wrapC.querySelector('.justify-center')).toBeInTheDocument();
  });

  it('nested comments inherit root stance for tree direction', () => {
    const comments: any[] = [
      c({ id: 'a', content: 'Support', author: 'alice', timestamp: 1, stance: 'concur' }),
      c({ id: 'n1', parentId: 'a', content: 'Nested reply', author: 'nest', timestamp: 2, stance: 'counter' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Nested comment exists and has its own stance background
    const nested = screen.getByTestId('comment-n1');
    expect(nested).toBeInTheDocument();
    expect(nested).toHaveStyle({ backgroundColor: 'var(--stream-counter-bg)' });

    // But tree direction follows root (left-aligned tree)
    const nestedWrap = screen.getByTestId('comment-wrap-n1');
    expect(nestedWrap.querySelector('.justify-start')).toBeInTheDocument();
  });

  it('collapses children by default at depth >= 3', () => {
    const comments: any[] = [
      c({ id: 'r', content: 'Root', timestamp: 1, stance: 'concur' }),
      c({ id: 'c1', parentId: 'r', content: 'L1', timestamp: 2 }),
      c({ id: 'c2', parentId: 'c1', content: 'L2', timestamp: 3 }),
      c({ id: 'c3', parentId: 'c2', content: 'L3', timestamp: 4 }),
      c({ id: 'c4', parentId: 'c3', content: 'L4', timestamp: 5 })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Depth 3+ should be collapsed by default
    expect(screen.queryByText('L4')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show 1 replies/i }));
    expect(screen.getByText('L4')).toBeInTheDocument();
  });

  it('does not override user collapse toggle on live updates', async () => {
    const base: any[] = [
      c({ id: 'r', content: 'Root', timestamp: 1, stance: 'concur' }),
      c({ id: 'c1', parentId: 'r', content: 'L1', timestamp: 2 }),
      c({ id: 'c2', parentId: 'c1', content: 'L2', timestamp: 3 }),
      c({ id: 'c3', parentId: 'c2', content: 'L3', timestamp: 4 })
    ];

    const { rerender } = render(<CommentStream threadId="t" comments={base as any} />);
    expect(screen.queryByText('L4')).not.toBeInTheDocument();

    // Live update adds a child at depth 4: depth>=3 should auto-collapse.
    rerender(
      <CommentStream
        threadId="t"
        comments={[
          ...base,
          c({ id: 'c4', parentId: 'c3', content: 'L4', timestamp: 5 })
        ] as any}
      />
    );

    // Should be collapsed by default after live update (until user expands).
    await waitFor(() => expect(screen.queryByText('L4')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /show 1 replies/i }));
    expect(screen.getByText('L4')).toBeInTheDocument();

    // Another live update should not auto-collapse after the user toggles.
    rerender(
      <CommentStream
        threadId="t"
        comments={[
          ...base,
          c({ id: 'c4', parentId: 'c3', content: 'L4', timestamp: 5 }),
          c({ id: 'c5', parentId: 'c3', content: 'L5', timestamp: 6 })
        ] as any}
      />
    );
    expect(screen.getByText('L5')).toBeInTheDocument();
  });

  it('shows a TrustGate fallback when unverified', () => {
    trustScore = 0.2;
    const comments: any[] = [c({ id: 'a', content: 'First', author: 'alice', timestamp: 1, stance: 'concur' })];

    render(<CommentStream threadId="t" comments={comments as any} />);
    expect(screen.getByTestId('reply-trust-gate')).toHaveTextContent('Verify to reply');
    expect(screen.queryByTestId('reply-btn-a')).not.toBeInTheDocument();
  });

  it('opens an inline composer when Reply is clicked', () => {
    const comments: any[] = [c({ id: 'a', content: 'First', author: 'alice', timestamp: 1, stance: 'concur' })];

    render(<CommentStream threadId="t" comments={comments as any} />);
    fireEvent.click(screen.getByTestId('reply-btn-a'));
    expect(screen.getByTestId('comment-composer')).toBeInTheDocument();
  });

  it('renders tree connectors for nested comments on left side for support', () => {
    const comments: any[] = [
      c({ id: 'a', content: 'Support root', author: 'alice', timestamp: 1, stance: 'concur' }),
      c({ id: 'n1', parentId: 'a', content: 'Nested', author: 'nest', timestamp: 2, stance: 'concur' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Nested comment should have an SVG branch connector positioned on the left
    const nestedWrap = screen.getByTestId('comment-wrap-n1');
    const svg = nestedWrap.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveStyle({ left: '-28px' }); // INDENT_PX = 28
  });

  it('renders tree connectors for nested comments on right side for oppose', () => {
    const comments: any[] = [
      c({ id: 'b', content: 'Oppose root', author: 'bob', timestamp: 1, stance: 'counter' }),
      c({ id: 'n1', parentId: 'b', content: 'Nested', author: 'nest', timestamp: 2, stance: 'counter' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Nested comment should have an SVG branch connector positioned on the right
    const nestedWrap = screen.getByTestId('comment-wrap-n1');
    const svg = nestedWrap.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveStyle({ right: '-28px' }); // INDENT_PX = 28
  });

  it('renders border on correct side based on tree direction', () => {
    const comments: any[] = [
      c({ id: 'a', content: 'Support', author: 'alice', timestamp: 1, stance: 'concur' }),
      c({ id: 'b', content: 'Oppose', author: 'bob', timestamp: 2, stance: 'counter' })
    ];

    render(<CommentStream threadId="t" comments={comments as any} />);

    // Support card should have left border (rounded-r-lg border-l-[3px])
    const supportCard = screen.getByTestId('comment-a');
    expect(supportCard).toHaveClass('rounded-r-lg', 'border-l-[3px]');

    // Oppose card should have right border (rounded-l-lg border-r-[3px])
    const opposeCard = screen.getByTestId('comment-b');
    expect(opposeCard).toHaveClass('rounded-l-lg', 'border-r-[3px]');
  });
});
