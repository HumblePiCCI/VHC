import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConstituencyProofSchema } from '@vh/data-model';

async function loadModule() {
  vi.resetModules();
  return import('./constituencyProof');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getMockConstituencyProof', () => {
  it('returns a valid ConstituencyProof', async () => {
    const { getMockConstituencyProof } = await loadModule();
    const proof = getMockConstituencyProof('hash-ca-11');
    const parsed = ConstituencyProofSchema.safeParse(proof);

    expect(parsed.success).toBe(true);
  });

  it('uses provided districtHash and nullifier', async () => {
    const { getMockConstituencyProof } = await loadModule();
    const proof = getMockConstituencyProof('my-hash', 'my-nullifier');

    expect(proof.district_hash).toBe('my-hash');
    expect(proof.nullifier).toBe('my-nullifier');
    expect(proof.merkle_root).toBe('mock-root');
  });

  it('keeps backward compatibility when nullifier is omitted', async () => {
    const { getMockConstituencyProof } = await loadModule();
    const proof = getMockConstituencyProof('h');

    expect(proof.nullifier).toBe('mock-nullifier');
    expect(proof.merkle_root).toBe('mock-root');
  });
});

describe('isProofVerificationEnabled', () => {
  it('returns true when VITE_CONSTITUENCY_PROOF_REAL is true', async () => {
    vi.stubEnv('VITE_CONSTITUENCY_PROOF_REAL', 'true');
    const { isProofVerificationEnabled } = await loadModule();

    expect(isProofVerificationEnabled()).toBe(true);
  });

  it('returns false when VITE_CONSTITUENCY_PROOF_REAL is false', async () => {
    vi.stubEnv('VITE_CONSTITUENCY_PROOF_REAL', 'false');
    const { isProofVerificationEnabled } = await loadModule();

    expect(isProofVerificationEnabled()).toBe(false);
  });

  it('returns false when VITE_CONSTITUENCY_PROOF_REAL is missing', async () => {
    const { isProofVerificationEnabled } = await loadModule();

    expect(isProofVerificationEnabled()).toBe(false);
  });
});
