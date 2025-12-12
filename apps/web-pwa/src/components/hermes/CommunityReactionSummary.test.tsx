/* @vitest-environment jsdom */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunityReactionSummary } from './CommunityReactionSummary';
import { useForumStore } from '../../store/hermesForum';

vi.mock('../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { nullifier: 'me' } } })
}));

const analyzeMock = vi.fn();
vi.mock('@vh/ai-engine', () => ({
  useAI: () => ({ analyze: analyzeMock })
}));

vi.mock('../../store/hermesForum', async () => {
  const actual = await vi.importActual('../../store/hermesForum');
  const store: any = (actual as any).useForumStore;
  return {
    ...actual,
    useForumStore: Object.assign(
      (selector?: (s: any) => any) => {
        const state = store.getState();
        return selector ? selector(state) : state;
      },
      { getState: store.getState, setState: store.setState }
    )
  };
});

// Helper to create n mock comments
function createMockComments(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    author: i % 2 === 0 ? 'me' : 'other',
    content: `Comment ${i}`,
    stance: i % 2 === 0 ? 'concur' : 'counter',
    parentId: null,
    threadId: 'thread-1',
    timestamp: i
  }));
}

describe('CommunityReactionSummary', () => {
  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ summary: 'The community is divided on this topic.' });
  });

  it('renders nothing when there are no comments', () => {
    useForumStore.setState({ comments: new Map([['thread-1', []]]) } as any);
    const { container } = render(<CommunityReactionSummary threadId="thread-1" />);
    expect(container.querySelector('[data-testid="community-summary"]')).not.toBeInTheDocument();
  });

  it('shows action icons when there are comments', () => {
    useForumStore.setState({ comments: new Map([['thread-1', createMockComments(2)]]) } as any);
    render(<CommunityReactionSummary threadId="thread-1" />);
    expect(screen.getByTestId('action-send')).toBeInTheDocument();
    expect(screen.getByTestId('action-proposal')).toBeInTheDocument();
    expect(screen.getByTestId('action-project')).toBeInTheDocument();
  });

  it('auto-generates summary when comment count reaches 10', async () => {
    useForumStore.setState({ comments: new Map([['thread-1', createMockComments(10)]]) } as any);
    render(<CommunityReactionSummary threadId="thread-1" />);
    await waitFor(() => expect(analyzeMock).toHaveBeenCalled());
    // Wait for the summary text to be updated with AI response
    await waitFor(() => {
      const summaries = screen.getAllByTestId('ai-summary');
      const summary = summaries[summaries.length - 1]; // Get the latest rendered one
      expect(summary.textContent).toContain('The community is divided');
    });
  });

  it('opens and closes coming soon modal', async () => {
    useForumStore.setState({ comments: new Map([['thread-1', createMockComments(2)]]) } as any);
    render(<CommunityReactionSummary threadId="thread-1" />);
    fireEvent.click(screen.getAllByTestId('action-send')[0]);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
