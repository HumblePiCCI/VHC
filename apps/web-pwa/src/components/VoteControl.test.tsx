/* @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import VoteControl from './VoteControl';

describe('VoteControl', () => {
  it('updates amount and voice credits', () => {
    const onSubmit = vi.fn();
    render(<VoteControl onSubmit={onSubmit} />);
    const amountInput = screen.getByTestId('vote-amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '4' } });
    expect(screen.getByTestId('voice-credits')).toHaveTextContent('16');
  });

  it('submits vote with direction', () => {
    const onSubmit = vi.fn();
    render(<VoteControl onSubmit={onSubmit} />);
    fireEvent.click(screen.getAllByTestId('vote-against')[0]);
    screen.getAllByTestId('submit-vote').forEach((btn) => fireEvent.click(btn));
    expect(onSubmit).toHaveBeenCalled();
  });
});
