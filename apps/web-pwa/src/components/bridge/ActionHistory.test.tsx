/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ActionHistory } from './ActionHistory';
import type { CivicAction } from '@vh/data-model';

const proof = { district_hash: 'h', nullifier: 'n', merkle_root: 'r' };

const actions: CivicAction[] = [
  {
    id: 'action-1',
    schemaVersion: 'hermes-action-v1',
    author: 'null-1',
    sourceTopicId: 'topic-1',
    sourceSynthesisId: 'synth-1',
    sourceEpoch: 1,
    sourceArtifactId: 'brief-1',
    representativeId: 'rep-1',
    topic: 'Infrastructure',
    stance: 'support',
    subject: 'Support bill',
    body: 'X'.repeat(60),
    intent: 'email',
    constituencyProof: proof,
    status: 'sent',
    createdAt: 1_700_000_000_000,
    attempts: 1,
  },
  {
    id: 'action-2',
    schemaVersion: 'hermes-action-v1',
    author: 'null-1',
    sourceTopicId: 'topic-2',
    sourceSynthesisId: 'synth-2',
    sourceEpoch: 1,
    sourceArtifactId: 'brief-2',
    representativeId: 'rep-2',
    topic: 'Education',
    stance: 'oppose',
    subject: 'Oppose cuts',
    body: 'Y'.repeat(60),
    intent: 'phone',
    constituencyProof: proof,
    status: 'draft',
    createdAt: 1_700_001_000_000,
    attempts: 0,
  },
];

vi.mock('../../store/bridge/useBridgeStore', () => ({
  getAllActions: () => [],
}));

afterEach(() => cleanup());

describe('ActionHistory', () => {
  it('shows empty state when no actions', () => {
    render(<ActionHistory />);
    expect(screen.getByTestId('history-empty')).toBeInTheDocument();
  });

  it('renders action items when provided via prop', () => {
    render(<ActionHistory actions={actions} />);
    expect(screen.getByTestId('action-history')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-action-1')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-action-2')).toBeInTheDocument();
  });

  it('sorts actions by createdAt descending (newest first)', () => {
    render(<ActionHistory actions={actions} />);
    const items = screen.getByTestId('action-history').querySelectorAll('article');
    expect(items[0].getAttribute('data-testid')).toBe('history-item-action-2');
    expect(items[1].getAttribute('data-testid')).toBe('history-item-action-1');
  });

  it('displays topic, status, representative, intent, date', () => {
    render(<ActionHistory actions={actions} />);
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByTestId('history-status-action-1').textContent).toBe('sent');
    expect(screen.getByTestId('history-rep-action-1').textContent).toContain('rep-1');
    expect(screen.getByTestId('history-intent-action-1').textContent).toContain('email');
    expect(screen.getByTestId('history-date-action-1').textContent).toBeTruthy();
  });

  it('displays stance and subject in detail line', () => {
    render(<ActionHistory actions={actions} />);
    const item = screen.getByTestId('history-item-action-1');
    expect(item.textContent).toContain('support');
    expect(item.textContent).toContain('Support bill');
  });

  it('renders with unknown status gracefully', () => {
    const custom = [{ ...actions[0], status: 'unknown' as any }];
    render(<ActionHistory actions={custom} />);
    expect(screen.getByTestId('history-status-action-1').textContent).toBe('unknown');
  });
});
