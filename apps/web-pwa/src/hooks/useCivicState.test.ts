import { describe, expect, it } from 'vitest';
import { useCivicState } from './useCivicState';

describe('useCivicState', () => {
  it('updates and clamps scores', () => {
    useCivicState.setState({ scores: {} });
    useCivicState.getState().updateScore('item-1', 1);
    expect(useCivicState.getState().getScore('item-1')).toBeCloseTo(1);
    useCivicState.getState().updateScore('item-1', 5);
    expect(useCivicState.getState().getScore('item-1')).toBe(2);
    useCivicState.getState().updateScore('item-1', -10);
    expect(useCivicState.getState().getScore('item-1')).toBe(-2);
  });
});
