/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import ProposalList from './ProposalList';

describe('ProposalList', () => {
  it('renders proposals', async () => {
    render(<ProposalList />);
    expect(await screen.findByText(/Expand EV Charging/)).toBeInTheDocument();
  });
});
