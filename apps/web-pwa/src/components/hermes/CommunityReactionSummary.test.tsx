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

describe('CommunityReactionSummary', () => {
  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ summary: 'AI summary text' });
    useForumStore.setState({
      comments: new Map([
        [
          'thread-1',
          [
            { id: 'c1', author: 'me', content: 'I agree', stance: 'concur', parentId: null, threadId: 'thread-1', timestamp: 1 },
            { id: 'c2', author: 'other', content: 'I disagree', stance: 'counter', parentId: null, threadId: 'thread-1', timestamp: 2 }
          ] as any
        ]
      ])
    } as any);
  });

  it('shows participant metrics and user participation', () => {
    render(<CommunityReactionSummary threadId="thread-1" />);
    expect(screen.getByText(/2 participants/)).toBeInTheDocument();
    expect(screen.getByText(/1 Concur/)).toBeInTheDocument();
    expect(screen.getByText(/1 Counter/)).toBeInTheDocument();
    expect(screen.getByTestId('user-participated')).toHaveTextContent('concur');
  });

  it('refreshes AI summary on demand', async () => {
    render(<CommunityReactionSummary threadId="thread-1" />);
    fireEvent.click(screen.getAllByTestId('refresh-summary')[0]);
    await waitFor(() => expect(analyzeMock).toHaveBeenCalled());
    const summaries = await screen.findAllByTestId('ai-summary');
    expect(summaries.some((el) => el.textContent?.includes('AI summary text'))).toBe(true);
  });

  it('opens and closes coming soon modal', async () => {
    render(<CommunityReactionSummary threadId="thread-1" />);
    fireEvent.click(screen.getAllByTestId('action-send')[0]);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
