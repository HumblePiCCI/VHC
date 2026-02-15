/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ActionComposer, validateComposer } from './ActionComposer';

let trustScore = 1;
let budgetAllowed = true;
let budgetReason = '';

vi.mock('../../hooks/useIdentity', () => ({
  useIdentity: () => ({ identity: { session: { trustScore } } }),
}));

vi.mock('../../store/xpLedger', () => ({
  useXpLedger: {
    getState: () => ({
      canPerformAction: () => ({ allowed: budgetAllowed, reason: budgetReason }),
      consumeAction: vi.fn(),
    }),
  },
}));

beforeEach(() => {
  trustScore = 1;
  budgetAllowed = true;
  budgetReason = '';
});

afterEach(() => cleanup());

/* ── validateComposer (pure function) ────────────────────────── */

describe('validateComposer', () => {
  const valid = { topic: 'Infrastructure', stance: 'support' as const, subject: 'Test subject', body: 'A'.repeat(60), intent: 'email' as const };

  it('returns empty errors for valid input', () => {
    expect(validateComposer(valid, 'rep-1')).toEqual({});
  });

  it('requires topic', () => {
    expect(validateComposer({ ...valid, topic: '' }, 'rep-1').topic).toBe('Topic is required');
  });

  it('caps topic at 100 chars', () => {
    expect(validateComposer({ ...valid, topic: 'x'.repeat(101) }, 'rep-1').topic).toContain('≤ 100');
  });

  it('requires subject', () => {
    expect(validateComposer({ ...valid, subject: '' }, 'rep-1').subject).toBe('Subject is required');
  });

  it('caps subject at 200 chars', () => {
    expect(validateComposer({ ...valid, subject: 'x'.repeat(201) }, 'rep-1').subject).toContain('≤ 200');
  });

  it('requires body ≥ 50 chars', () => {
    expect(validateComposer({ ...valid, body: 'short' }, 'rep-1').body).toContain('at least 50');
  });

  it('caps body at 5000 chars', () => {
    expect(validateComposer({ ...valid, body: 'x'.repeat(5001) }, 'rep-1').body).toContain('≤ 5000');
  });

  it('requires repId', () => {
    expect(validateComposer(valid).repId).toBe('Select a representative first');
  });
});

/* ── Component rendering ─────────────────────────────────────── */

describe('ActionComposer', () => {
  it('renders composer when trust sufficient', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('action-composer')).toBeInTheDocument();
    expect(screen.getByTestId('composer-topic')).toBeInTheDocument();
    expect(screen.getByTestId('composer-stance')).toBeInTheDocument();
    expect(screen.getByTestId('composer-subject')).toBeInTheDocument();
    expect(screen.getByTestId('composer-body')).toBeInTheDocument();
    expect(screen.getByTestId('composer-intent')).toBeInTheDocument();
    expect(screen.getByTestId('composer-send')).toBeInTheDocument();
  });

  it('shows trust gate when score below 0.5', () => {
    trustScore = 0.3;
    render(<ActionComposer />);
    expect(screen.getByTestId('composer-trust-gate')).toBeInTheDocument();
  });

  it('shows send trust gate when score between 0.5 and 0.7', () => {
    trustScore = 0.6;
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('send-trust-gate')).toBeInTheDocument();
    expect(screen.getByText(/0\.60/)).toBeInTheDocument();
  });

  it('disables send when trust below 0.7', () => {
    trustScore = 0.6;
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('composer-send')).toBeDisabled();
  });

  it('shows budget exhausted message', () => {
    budgetAllowed = false;
    budgetReason = 'Daily limit of 3 reached';
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('budget-info').textContent).toContain('Daily limit of 3 reached');
  });

  it('shows budget available message', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('budget-info').textContent).toContain('Budget available');
  });

  it('shows rep error when no rep selected', () => {
    render(<ActionComposer />);
    expect(screen.getByTestId('error-rep')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByTestId('error-topic')).toBeInTheDocument();
    expect(screen.getByTestId('error-subject')).toBeInTheDocument();
    expect(screen.getByTestId('error-body')).toBeInTheDocument();
  });

  it('updates fields on user input', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    fireEvent.change(screen.getByTestId('composer-topic'), { target: { value: 'Climate' } });
    fireEvent.change(screen.getByTestId('composer-subject'), { target: { value: 'Subject text' } });
    fireEvent.change(screen.getByTestId('composer-body'), { target: { value: 'B'.repeat(60) } });

    // After filling valid data, topic error should be gone
    expect(screen.queryByTestId('error-topic')).not.toBeInTheDocument();
  });

  it('updates stance selection', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    fireEvent.change(screen.getByTestId('composer-stance'), { target: { value: 'oppose' } });
    expect((screen.getByTestId('composer-stance') as HTMLSelectElement).value).toBe('oppose');
  });

  it('updates intent selection', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    fireEvent.change(screen.getByTestId('composer-intent'), { target: { value: 'phone' } });
    expect((screen.getByTestId('composer-intent') as HTMLSelectElement).value).toBe('phone');
  });

  it('enables send when all conditions met', () => {
    trustScore = 0.8;
    render(<ActionComposer selectedRepId="rep-1" />);
    fireEvent.change(screen.getByTestId('composer-topic'), { target: { value: 'Topic' } });
    fireEvent.change(screen.getByTestId('composer-subject'), { target: { value: 'Subject' } });
    fireEvent.change(screen.getByTestId('composer-body'), { target: { value: 'X'.repeat(60) } });

    expect(screen.getByTestId('composer-send')).not.toBeDisabled();
  });

  it('disables send when budget exhausted even with valid form', () => {
    trustScore = 0.8;
    budgetAllowed = false;
    budgetReason = 'limit reached';
    render(<ActionComposer selectedRepId="rep-1" />);
    fireEvent.change(screen.getByTestId('composer-topic'), { target: { value: 'Topic' } });
    fireEvent.change(screen.getByTestId('composer-subject'), { target: { value: 'Subject' } });
    fireEvent.change(screen.getByTestId('composer-body'), { target: { value: 'X'.repeat(60) } });

    expect(screen.getByTestId('composer-send')).toBeDisabled();
  });

  it('shows body character count', () => {
    render(<ActionComposer selectedRepId="rep-1" />);
    expect(screen.getByText('Body (0/5000)')).toBeInTheDocument();
  });
});
