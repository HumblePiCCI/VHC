import React from 'react';
import useGovernance from '../hooks/useGovernance';
import ProposalCard from './ProposalCard';

export const ProposalList: React.FC = () => {
  const { proposals, loading, error, submitVote } = useGovernance();

  if (loading) return <p className="text-sm text-slate-500">Loading proposals...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (proposals.length === 0) return <p className="text-sm text-slate-500">No proposals yet.</p>;

  return (
    <div className="space-y-4">
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} onVote={submitVote} />
      ))}
    </div>
  );
};

export default ProposalList;
