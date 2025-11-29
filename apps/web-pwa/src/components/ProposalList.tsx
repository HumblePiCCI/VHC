import React from 'react';
import useGovernance from '../hooks/useGovernance';
import ProposalCard from './ProposalCard';
import { useIdentity } from '../hooks/useIdentity';

export const ProposalList: React.FC = () => {
  const { identity } = useIdentity();
  const voterId = identity?.session?.nullifier ?? null;
  const { proposals, loading, error, submitVote, lastAction, votedDirections } = useGovernance(voterId);

  if (loading) return <p className="text-sm text-slate-500">Loading proposals...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (proposals.length === 0) return <p className="text-sm text-slate-500">No proposals yet.</p>;

  return (
    <div className="space-y-4">
      {lastAction && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {lastAction}
        </div>
      )}
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} onVote={submitVote} votedDirection={votedDirections[p.id]} />
      ))}
    </div>
  );
};

export default ProposalList;
