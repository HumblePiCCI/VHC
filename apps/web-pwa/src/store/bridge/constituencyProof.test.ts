import { describe, expect, it } from 'vitest';
import { ConstituencyProofSchema } from '@vh/data-model';
import { getMockConstituencyProof } from './constituencyProof';

describe('getMockConstituencyProof', () => {
  it('returns a valid ConstituencyProof', () => {
    const proof = getMockConstituencyProof('hash-ca-11');
    const parsed = ConstituencyProofSchema.safeParse(proof);
    expect(parsed.success).toBe(true);
  });

  it('uses the provided districtHash', () => {
    const proof = getMockConstituencyProof('my-hash');
    expect(proof.district_hash).toBe('my-hash');
  });

  it('returns deterministic mock fields', () => {
    const proof = getMockConstituencyProof('h');
    expect(proof.nullifier).toBe('mock-nullifier');
    expect(proof.merkle_root).toBe('mock-root');
  });
});
