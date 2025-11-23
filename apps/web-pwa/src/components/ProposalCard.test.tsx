/* @vitest-environment jsdom */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import ProposalCard from './ProposalCard';
import type { Proposal } from '../hooks/useGovernance';

const sample: Proposal = {
  id: 'p1',
  title: 'Test Proposal',
  summary: 'Summary text',
  author: '0xabc',
  fundingRequest: 100,
  recipient: '0xrecipient',
  votesFor: 1,
  votesAgainst: 0
};

describe('ProposalCard', () => {
  it('renders content and calls vote', () => {
    const onVote = vi.fn().mockResolvedValue(undefined);
    render(<ProposalCard proposal={sample} onVote={onVote} />);
    expect(screen.getByText(/Test Proposal/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Submit Vote/));
    expect(onVote).toHaveBeenCalledWith('p1', 1, 'for');
  });
});
