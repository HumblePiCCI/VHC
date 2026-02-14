/**
 * RepresentativeSelector — Representative cards per §8.2.
 *
 * Renders name, title, party, office, district, channels, lastVerified.
 * Trust gate: >= 0.5 to view rep list.
 *
 * Spec: spec-civic-action-kit-v0.md §8.2
 */

import React from 'react';
import type { Representative } from '@vh/data-model';
import { TRUST_MINIMUM } from '@vh/data-model';
import { useIdentity } from '../../hooks/useIdentity';
import { findRepresentatives } from '../../store/bridge/representativeDirectory';

export interface RepresentativeSelectorProps {
  readonly onSelect: (repId: string) => void;
}

function channelBadges(rep: Representative): string[] {
  const channels: string[] = [];
  if (rep.email) channels.push('email');
  if (rep.phone) channels.push('phone');
  if (rep.contactUrl) channels.push('web');
  if (channels.length === 0) channels.push('manual');
  return channels;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString();
}

export const RepresentativeSelector: React.FC<RepresentativeSelectorProps> = ({ onSelect }) => {
  const { identity } = useIdentity();
  const trustScore = identity?.session?.trustScore ?? 0;

  if (trustScore < TRUST_MINIMUM) {
    return (
      <p data-testid="rep-trust-gate" className="text-sm text-amber-600">
        Trust score ({trustScore.toFixed(2)}) below 0.50 — verify identity to view representatives.
      </p>
    );
  }

  const reps = findRepresentatives('');

  if (reps.length === 0) {
    return (
      <p data-testid="rep-empty" className="text-sm text-gray-500">
        No representatives loaded. Directory will sync when available.
      </p>
    );
  }

  return (
    <div data-testid="rep-selector" className="space-y-2">
      {reps.map((rep) => (
        <button
          key={rep.id}
          data-testid={`rep-card-${rep.id}`}
          className="w-full rounded border border-gray-200 p-3 text-left hover:border-teal-400"
          onClick={() => onSelect(rep.id)}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{rep.name}</span>
            <span className="text-xs text-gray-400">Verified {formatDate(rep.lastVerified)}</span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {rep.title} · {rep.office}
            {rep.party && ` · ${rep.party}`}
            {rep.district && ` · District ${rep.district}`}
            {rep.state && ` · ${rep.state}`}
          </div>
          <div className="mt-1 flex gap-1">
            {channelBadges(rep).map((ch) => (
              <span
                key={ch}
                data-testid={`rep-channel-${ch}`}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
              >
                {ch}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};
