import { describe, expect, it } from 'vitest';
import { createSession } from './auth';
import type { AttestationPayload } from '@vh/types';

describe('createSession', () => {
  const payload: AttestationPayload = {
    platform: 'web',
    deviceKey: 'dev-key',
    integrityToken: 'token',
    nonce: 'nonce'
  };

  it('produces a deterministic nullifier', async () => {
    const n1 = await createSession(payload);
    const n2 = await createSession(payload);
    expect(n1).toBe(n2);
  });

  it('changes when attestation changes', async () => {
    const n1 = await createSession(payload);
    const n2 = await createSession({ ...payload, nonce: 'other' });
    expect(n1).not.toBe(n2);
  });
});
