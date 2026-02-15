/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RepresentativeSelector } from './RepresentativeSelector';
import type { Representative } from '@vh/data-model';

let trustScore = 1;
const onSelectMock = vi.fn();

vi.mock('../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore } } }),
}));

const mockReps: Representative[] = [
  {
    id: 'us-house-ca-11',
    name: 'Jane Doe',
    title: 'Representative',
    office: 'house',
    country: 'US',
    state: 'CA',
    district: '11',
    districtHash: 'hash-ca-11',
    contactMethod: 'both',
    email: 'jane@house.gov',
    phone: '+12025551234',
    contactUrl: 'https://house.gov/contact',
    lastVerified: 1_700_000_000_000,
    party: 'Independent',
  },
  {
    id: 'us-senate-ca-1',
    name: 'John Smith',
    title: 'Senator',
    office: 'senate',
    country: 'US',
    state: 'CA',
    districtHash: 'hash-ca-s1',
    contactMethod: 'email',
    email: 'john@senate.gov',
    lastVerified: 1_700_000_000_000,
  },
];

let mockRepsList: Representative[] = mockReps;

vi.mock('../../store/bridge/representativeDirectory', () => ({
  findRepresentatives: () => mockRepsList,
}));

beforeEach(() => {
  trustScore = 1;
  mockRepsList = mockReps;
  onSelectMock.mockClear();
});

afterEach(() => cleanup());

describe('RepresentativeSelector', () => {
  it('renders rep cards when trust sufficient', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    expect(screen.getByTestId('rep-selector')).toBeInTheDocument();
    expect(screen.getByTestId('rep-card-us-house-ca-11')).toBeInTheDocument();
    expect(screen.getByTestId('rep-card-us-senate-ca-1')).toBeInTheDocument();
  });

  it('shows trust gate when score below 0.5', () => {
    trustScore = 0.3;
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    expect(screen.getByTestId('rep-trust-gate')).toBeInTheDocument();
    expect(screen.getByText(/0\.30/)).toBeInTheDocument();
  });

  it('renders rep details: name, title, office, party, district, state', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    const card = screen.getByTestId('rep-card-us-house-ca-11');
    expect(card.textContent).toContain('Representative');
    expect(card.textContent).toContain('house');
    expect(card.textContent).toContain('Independent');
    expect(card.textContent).toContain('District 11');
    expect(card.textContent).toContain('CA');
  });

  it('renders channel badges', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    // Jane has email + phone + contactUrl
    const card = screen.getByTestId('rep-card-us-house-ca-11');
    expect(card.textContent).toContain('email');
    expect(card.textContent).toContain('phone');
    expect(card.textContent).toContain('web');
  });

  it('shows manual badge when no channels available', () => {
    mockRepsList = [{
      id: 'rep-no-contact',
      name: 'No Contact',
      title: 'Rep',
      office: 'house',
      country: 'US',
      districtHash: 'h',
      contactMethod: 'manual',
      lastVerified: Date.now(),
    }];
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    const card = screen.getByTestId('rep-card-rep-no-contact');
    expect(card.textContent).toContain('manual');
  });

  it('calls onSelect with rep id when clicked', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    fireEvent.click(screen.getByTestId('rep-card-us-house-ca-11'));
    expect(onSelectMock).toHaveBeenCalledWith('us-house-ca-11');
  });

  it('shows empty state when no reps loaded', () => {
    mockRepsList = [];
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    expect(screen.getByTestId('rep-empty')).toBeInTheDocument();
  });

  it('displays Verified date', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    const card = screen.getByTestId('rep-card-us-house-ca-11');
    expect(card.textContent).toContain('Verified');
  });

  it('omits party when absent', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    const card = screen.getByTestId('rep-card-us-senate-ca-1');
    expect(card.textContent).not.toContain('Independent');
  });

  it('omits district when absent', () => {
    render(<RepresentativeSelector onSelect={onSelectMock} />);
    const card = screen.getByTestId('rep-card-us-senate-ca-1');
    expect(card.textContent).not.toContain('District');
  });
});
