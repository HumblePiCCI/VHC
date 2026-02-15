/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BridgeLayout } from './BridgeLayout';

let trustScore = 1;

vi.mock('../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore } } }),
}));

vi.mock('./RepresentativeSelector', () => ({
  RepresentativeSelector: ({ onSelect }: any) => (
    <div data-testid="rep-selector-mock">
      <button data-testid="select-rep-btn" onClick={() => onSelect('rep-1')}>Select</button>
    </div>
  ),
}));

vi.mock('./ActionComposer', () => ({
  ActionComposer: ({ selectedRepId }: any) => (
    <div data-testid="action-composer-mock">Rep: {selectedRepId ?? 'none'}</div>
  ),
}));

vi.mock('./ActionHistory', () => ({
  ActionHistory: () => <div data-testid="action-history-mock">History</div>,
}));

beforeEach(() => {
  trustScore = 1;
  vi.stubEnv('VITE_ELEVATION_ENABLED', 'true');
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('BridgeLayout', () => {
  it('renders layout when enabled and trust sufficient', () => {
    render(<BridgeLayout />);
    expect(screen.getByTestId('bridge-layout')).toBeInTheDocument();
    expect(screen.getByTestId('bridge-nav')).toBeInTheDocument();
  });

  it('shows disabled message when feature flag off', () => {
    vi.stubEnv('VITE_ELEVATION_ENABLED', 'false');
    render(<BridgeLayout />);
    expect(screen.getByTestId('bridge-disabled')).toBeInTheDocument();
  });

  it('shows trust gate when score below 0.5', () => {
    trustScore = 0.3;
    render(<BridgeLayout />);
    expect(screen.getByTestId('bridge-trust-gate')).toBeInTheDocument();
    expect(screen.getByText(/0\.30/)).toBeInTheDocument();
  });

  it('navigates sections via nav buttons', () => {
    render(<BridgeLayout />);

    // Default: representatives
    expect(screen.getByTestId('rep-selector-mock')).toBeInTheDocument();

    // Click compose
    fireEvent.click(screen.getByTestId('bridge-nav-compose'));
    expect(screen.getByTestId('action-composer-mock')).toBeInTheDocument();

    // Click history
    fireEvent.click(screen.getByTestId('bridge-nav-history'));
    expect(screen.getByTestId('action-history-mock')).toBeInTheDocument();

    // Back to representatives
    fireEvent.click(screen.getByTestId('bridge-nav-representatives'));
    expect(screen.getByTestId('rep-selector-mock')).toBeInTheDocument();
  });

  it('selecting a rep navigates to compose with repId', () => {
    render(<BridgeLayout />);
    fireEvent.click(screen.getByTestId('select-rep-btn'));
    expect(screen.getByTestId('action-composer-mock')).toBeInTheDocument();
    expect(screen.getByText('Rep: rep-1')).toBeInTheDocument();
  });

  it('renders with initialSection prop', () => {
    render(<BridgeLayout initialSection="history" />);
    expect(screen.getByTestId('action-history-mock')).toBeInTheDocument();
  });
});
