import { describe, expect, it, vi } from 'vitest';
import { BridgeStub } from './index';

describe('BridgeStub', () => {
  it('logs attestation payload', async () => {
    const bridge = new BridgeStub();
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    await bridge.bridgeSession({ trustScore: 0.8, nullifier: 'n123', token: 't' }, '0xwallet');
    expect(logSpy).toHaveBeenCalled();
    const call = logSpy.mock.calls[0][1] as any;
    expect(call.scaledTrustScore).toBe(8000);
    expect(call.bytes32Nullifier).toBe('n123');
    logSpy.mockRestore();
  });
});
