export interface CuratedProject {
  proposalId: string;
  onChainId: number | string;
  title?: string;
}

/**
 * Season 0 mapping from local/off-chain proposal IDs to placeholder on-chain project IDs.
 * This keeps the PWA aware of curated projects without sending RVU on-chain.
 */
export const CURATED_PROJECTS: Record<string, CuratedProject> = {
  'proposal-1': { proposalId: 'proposal-1', onChainId: 101, title: 'Expand EV Charging Network' },
  'proposal-2': { proposalId: 'proposal-2', onChainId: 102, title: 'Civic Data Trust' }
};
