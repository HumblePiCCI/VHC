// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

describe('e2e-init', () => {
  it('sets the global E2E override flag from VITE_E2E_MODE', async () => {
    delete (window as any).__VH_E2E_OVERRIDE__;

    await import('./e2e-init');

    expect((window as any).__VH_E2E_OVERRIDE__).toBe(import.meta.env.VITE_E2E_MODE === 'true');
  });
});
