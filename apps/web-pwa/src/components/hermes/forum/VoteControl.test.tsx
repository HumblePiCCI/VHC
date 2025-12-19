/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VoteControl } from './VoteControl';

const voteMock = vi.fn();
let trustScore = 1;

const mockStore = {
  userVotes: new Map<string, 'up' | 'down' | null>(),
  vote: voteMock
};

vi.mock('../../../store/hermesForum', () => ({
  useForumStore: (selector?: (s: typeof mockStore) => any) =>
    selector ? selector(mockStore) : mockStore
}));

vi.mock('../../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore } } })
}));

describe('VoteControl', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    mockStore.userVotes = new Map();
    voteMock.mockReset();
    trustScore = 1;
  });

  it('renders vote buttons with aria labels', () => {
    render(<VoteControl commentId="c1" score={3} />);
    expect(screen.getByLabelText('Upvote')).toBeInTheDocument();
    expect(screen.getByLabelText('Downvote')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls vote for up/down clicks when no current vote', () => {
    render(<VoteControl commentId="c1" score={0} />);

    fireEvent.click(screen.getByLabelText('Upvote'));
    expect(voteMock).toHaveBeenCalledWith('c1', 'up');

    fireEvent.click(screen.getByLabelText('Downvote'));
    expect(voteMock).toHaveBeenCalledWith('c1', 'down');
    expect(voteMock).toHaveBeenCalledTimes(2);
  });

  it('toggles off when clicking the same vote', () => {
    mockStore.userVotes = new Map([['c1', 'up']]);
    const { unmount } = render(<VoteControl commentId="c1" score={0} />);

    fireEvent.click(screen.getByLabelText('Upvote'));
    expect(voteMock).toHaveBeenCalledWith('c1', null);

    unmount();
    voteMock.mockReset();

    mockStore.userVotes = new Map([['c1', 'down']]);
    render(<VoteControl commentId="c1" score={0} />);

    fireEvent.click(screen.getByLabelText('Downvote'));
    expect(voteMock).toHaveBeenCalledWith('c1', null);
  });

  it('highlights the current vote state', () => {
    mockStore.userVotes = new Map([['c1', 'up']]);
    const { unmount } = render(<VoteControl commentId="c1" score={0} />);

    expect(screen.getByLabelText('Upvote')).toHaveClass('text-teal-600');
    expect(screen.getByLabelText('Downvote')).toHaveClass('text-slate-400');

    unmount();
    mockStore.userVotes = new Map([['c1', 'down']]);
    render(<VoteControl commentId="c1" score={0} />);

    expect(screen.getByLabelText('Downvote')).toHaveClass('text-amber-600');
    expect(screen.getByLabelText('Upvote')).toHaveClass('text-slate-400');
  });

  it('renders nothing when untrusted', () => {
    trustScore = 0.2;
    render(<VoteControl commentId="c1" score={0} />);

    expect(screen.queryByLabelText('Upvote')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Downvote')).not.toBeInTheDocument();
  });
});
