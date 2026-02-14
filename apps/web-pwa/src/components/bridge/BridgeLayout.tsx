/**
 * BridgeLayout — Container/routing for the civic action center.
 *
 * Gates entire component behind VITE_ELEVATION_ENABLED.
 * Shows trust gating reason if below threshold.
 *
 * Spec: spec-civic-action-kit-v0.md §8
 */

import React, { useState } from 'react';
import { useIdentity } from '../../hooks/useIdentity';
import { RepresentativeSelector } from './RepresentativeSelector';
import { ActionComposer } from './ActionComposer';
import { ActionHistory } from './ActionHistory';

/* ── Feature flag ────────────────────────────────────────────── */

function isEnabled(): boolean {
  /* v8 ignore next 2 -- browser env resolves import.meta differently */
  const viteValue = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_ELEVATION_ENABLED;
  /* v8 ignore next 3 -- browser runtime may not expose process */
  const nodeValue =
    typeof process !== 'undefined' ? process.env?.VITE_ELEVATION_ENABLED : undefined;
  /* v8 ignore next 1 -- ?? fallback only reachable in-browser */
  return (nodeValue ?? viteValue) === 'true';
}

export type BridgeSection = 'representatives' | 'compose' | 'history';

export interface BridgeLayoutProps {
  readonly initialSection?: BridgeSection;
}

export const BridgeLayout: React.FC<BridgeLayoutProps> = ({ initialSection = 'representatives' }) => {
  const { identity } = useIdentity();
  const trustScore = identity?.session?.trustScore ?? 0;
  const [section, setSection] = useState<BridgeSection>(initialSection);
  const [selectedRepId, setSelectedRepId] = useState<string | undefined>();

  if (!isEnabled()) {
    return (
      <div data-testid="bridge-disabled" className="p-4 text-sm text-gray-500">
        Civic Action Center is not enabled.
      </div>
    );
  }

  if (trustScore < 0.5) {
    return (
      <div data-testid="bridge-trust-gate" className="p-4">
        <p className="text-sm text-amber-600">
          Your trust score ({trustScore.toFixed(2)}) is below the 0.50 threshold required
          to access the Civic Action Center. Complete identity verification to increase your score.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="bridge-layout" className="space-y-4 p-4">
      <nav className="flex gap-2" data-testid="bridge-nav">
        {(['representatives', 'compose', 'history'] as const).map((s) => (
          <button
            key={s}
            data-testid={`bridge-nav-${s}`}
            className={`rounded px-3 py-1 text-sm ${section === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setSection(s)}
          >
            {s === 'representatives' ? 'Representatives' : s === 'compose' ? 'Compose Action' : 'History'}
          </button>
        ))}
      </nav>

      {section === 'representatives' && (
        <RepresentativeSelector
          onSelect={(repId) => {
            setSelectedRepId(repId);
            setSection('compose');
          }}
        />
      )}

      {section === 'compose' && (
        <ActionComposer selectedRepId={selectedRepId} />
      )}

      {section === 'history' && <ActionHistory />}
    </div>
  );
};
