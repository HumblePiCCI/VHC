/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGovernance } from './useGovernance';

describe('useGovernance', () => {
  it('loads proposals and tracks totals', () => {
    const { result } = renderHook(() => useGovernance());
    expect(result.current.proposals.length).toBeGreaterThan(0);
    expect(result.current.totalVotes).toBeGreaterThan(0);
  });

  it('submits votes and updates counts', async () => {
    const { result } = renderHook(() => useGovernance());
    const proposalId = result.current.proposals[0].id;
    await act(async () => {
      await result.current.submitVote({ proposalId, amount: 2, direction: 'for' });
    });
    expect(result.current.proposals.find((p) => p.id === proposalId)?.votesFor).toBeGreaterThan(12);
  });
});
