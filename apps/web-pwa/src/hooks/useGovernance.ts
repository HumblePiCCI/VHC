import { useEffect, useMemo, useState } from 'react';
import { CURATED_PROJECTS } from '@vh/data-model';
import { isE2EMode } from '../store';

export interface Proposal {
  id: string;
  title: string;
  summary: string;
  author: string;
  fundingRequest: number;
  recipient: string;
  votesFor: number;
  votesAgainst: number;
}

export interface VoteInput {
  proposalId: string;
  amount: number;
  direction: 'for' | 'against';
  voterId?: string | null;
}
export type VoteResult = 'recorded' | 'updated' | 'switched';

const seedProposals: Proposal[] = [
  {
    id: 'proposal-1',
    title: 'Expand EV Charging Network',
    summary: 'Fund community-owned charging hubs in underserved areas.',
    author: '0xabc',
    fundingRequest: 1500,
    recipient: '0xrecipient1',
    votesFor: 12,
    votesAgainst: 3
  },
  {
    id: 'proposal-2',
    title: 'Civic Data Trust',
    summary: 'Create a public data trust for local governance metrics.',
    author: '0xdef',
    fundingRequest: 2300,
    recipient: '0xrecipient2',
    votesFor: 8,
    votesAgainst: 1
  }
];

export function useGovernance(voterId?: string | null) {
  const e2e = isE2EMode();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [votesByProposal, setVotesByProposal] = useState<
    Record<string, Record<string, { amount: number; direction: 'for' | 'against' }>>
  >({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Mocked fetch; replace with contract call later
    setProposals(seedProposals);
    setLoading(false);
  }, [e2e]);

  const totalVotes = useMemo(
    () => proposals.reduce((acc, p) => acc + p.votesFor + p.votesAgainst, 0),
    [proposals]
  );

  const votedDirections = useMemo(() => {
    if (!voterId) return {};
    return Object.entries(votesByProposal).reduce<Record<string, 'for' | 'against'>>((acc, [pid, votes]) => {
      const vote = votes[voterId];
      if (vote) acc[pid] = vote.direction;
      return acc;
    }, {});
  }, [votesByProposal, voterId]);

  const submitVote = async ({ proposalId, amount, direction }: VoteInput): Promise<VoteResult | void> => {
    if (!amount || amount <= 0) {
      return;
    }
    const voterKey = voterId ?? '__anon__';
    const prevVote = votesByProposal[proposalId]?.[voterKey];

    const curated = CURATED_PROJECTS[proposalId];
    if (curated) {
      const title = proposals.find((p) => p.id === proposalId)?.title ?? curated.title ?? proposalId;
      console.info(
        `[Season 0] Vote recorded locally for "${title}" (On-chain ID: ${curated.onChainId}). No RVU transaction sent.`
      );
    }

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        let votesFor = p.votesFor;
        let votesAgainst = p.votesAgainst;
        if (prevVote) {
          if (prevVote.direction === 'for') votesFor -= prevVote.amount;
          else votesAgainst -= prevVote.amount;
        }
        if (direction === 'for') votesFor += amount;
        else votesAgainst += amount;
        return { ...p, votesFor, votesAgainst };
      })
    );
    const title = proposals.find((p) => p.id === proposalId)?.title ?? proposalId;
    setLastAction(`Vote recorded for "${title}" (${direction}, ${amount} RVU)`);
    setVotesByProposal((prev) => {
      const next = { ...prev };
      next[proposalId] = { ...(next[proposalId] ?? {}), [voterKey]: { amount, direction } };
      return next;
    });
    if (prevVote) {
      if (prevVote.direction !== direction) {
        return 'switched';
      }
      return 'updated';
    }
    return 'recorded';
  };

  return {
    proposals,
    loading,
    error,
    totalVotes,
    submitVote,
    lastAction,
    votedDirections
  };
}

export default useGovernance;
