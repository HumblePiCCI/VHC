import { describe, expect, it, vi } from 'vitest';

// Mock dependencies to avoid React/hook imports during barrel test
vi.mock('../../hooks/useIdentity', () => ({ useIdentity: () => ({}) }));
vi.mock('../../store/xpLedger', () => ({
  useXpLedger: { getState: () => ({ canPerformAction: () => ({ allowed: true }), addXp: vi.fn() }) },
}));
vi.mock('../../store/bridge/representativeDirectory', () => ({ findRepresentatives: () => [] }));
vi.mock('../../store/bridge/useBridgeStore', () => ({
  getAllActions: () => [],
  getReceipt: () => undefined,
  getReceiptsForAction: () => [],
}));

describe('components/bridge barrel', () => {
  it('re-exports all component modules', async () => {
    const barrel = await import('./index');
    expect(barrel.BridgeLayout).toBeDefined();
    expect(barrel.RepresentativeSelector).toBeDefined();
    expect(barrel.ActionComposer).toBeDefined();
    expect(barrel.validateComposer).toBeDefined();
    expect(barrel.ActionHistory).toBeDefined();
    expect(barrel.ReceiptViewer).toBeDefined();
    expect(barrel.buildRetryChain).toBeDefined();
  });
});
