import { describe, expect, it } from 'vitest';
import {
  TRUST_MINIMUM,
  TRUST_ELEVATED,
  TRUST_MINIMUM_SCALED,
  TRUST_ELEVATED_SCALED,
} from './trust';

describe('trust constants', () => {
  it('TRUST_MINIMUM is 0.5', () => {
    expect(TRUST_MINIMUM).toBe(0.5);
  });

  it('TRUST_ELEVATED is 0.7', () => {
    expect(TRUST_ELEVATED).toBe(0.7);
  });

  it('TRUST_MINIMUM_SCALED is 5000', () => {
    expect(TRUST_MINIMUM_SCALED).toBe(5000);
  });

  it('TRUST_ELEVATED_SCALED is 7000', () => {
    expect(TRUST_ELEVATED_SCALED).toBe(7000);
  });

  it('scaled values are 10000× float values', () => {
    expect(TRUST_MINIMUM_SCALED).toBe(TRUST_MINIMUM * 10000);
    expect(TRUST_ELEVATED_SCALED).toBe(TRUST_ELEVATED * 10000);
  });

  it('TRUST_MINIMUM < TRUST_ELEVATED', () => {
    expect(TRUST_MINIMUM).toBeLessThan(TRUST_ELEVATED);
  });

  it('all values are finite numbers', () => {
    for (const v of [TRUST_MINIMUM, TRUST_ELEVATED, TRUST_MINIMUM_SCALED, TRUST_ELEVATED_SCALED]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});
