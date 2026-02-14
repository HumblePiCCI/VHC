import { describe, expect, it } from 'vitest';
import type { ConstituencyProof } from './index';
import {
  type ProofVerificationError,
  type ProofVerificationResult,
  verifyConstituencyProof,
} from './constituency-verification';
import {
  verifyConstituencyProof as verifyConstituencyProofFromIndex,
  type ProofVerificationError as ProofVerificationErrorFromIndex,
  type ProofVerificationResult as ProofVerificationResultFromIndex,
} from './index';

const EXPECTED_NULLIFIER = 'nullifier-1';
const EXPECTED_DISTRICT = 'district-1';

function makeProof(overrides: Partial<ConstituencyProof> = {}): ConstituencyProof {
  return {
    district_hash: EXPECTED_DISTRICT,
    nullifier: EXPECTED_NULLIFIER,
    merkle_root: 'root-1',
    ...overrides,
  };
}

describe('verifyConstituencyProof', () => {
  it('returns valid=true for a matching and fresh proof', () => {
    const result = verifyConstituencyProof(
      makeProof(),
      EXPECTED_NULLIFIER,
      EXPECTED_DISTRICT,
    );

    expect(result).toEqual({ valid: true });
  });

  it('returns nullifier_mismatch when proof nullifier differs', () => {
    const result = verifyConstituencyProof(
      makeProof({ nullifier: 'other-nullifier' }),
      EXPECTED_NULLIFIER,
      EXPECTED_DISTRICT,
    );

    expect(result).toEqual({ valid: false, error: 'nullifier_mismatch' });
  });

  it('returns district_mismatch when proof district differs', () => {
    const result = verifyConstituencyProof(
      makeProof({ district_hash: 'other-district' }),
      EXPECTED_NULLIFIER,
      EXPECTED_DISTRICT,
    );

    expect(result).toEqual({ valid: false, error: 'district_mismatch' });
  });

  it.each(['', '   \n\t'])(
    'returns stale_proof when merkle_root is blank (%j)',
    (merkleRoot) => {
      const result = verifyConstituencyProof(
        makeProof({ merkle_root: merkleRoot }),
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      );

      expect(result).toEqual({ valid: false, error: 'stale_proof' });
    },
  );

  it('returns malformed_proof for null/undefined proof', () => {
    expect(
      verifyConstituencyProof(null, EXPECTED_NULLIFIER, EXPECTED_DISTRICT),
    ).toEqual({ valid: false, error: 'malformed_proof' });

    expect(
      verifyConstituencyProof(undefined, EXPECTED_NULLIFIER, EXPECTED_DISTRICT),
    ).toEqual({ valid: false, error: 'malformed_proof' });
  });

  it('returns malformed_proof for missing required fields', () => {
    const missingDistrict = {
      nullifier: EXPECTED_NULLIFIER,
      merkle_root: 'root-1',
    } as ConstituencyProof;

    const missingNullifier = {
      district_hash: EXPECTED_DISTRICT,
      merkle_root: 'root-1',
    } as ConstituencyProof;

    const missingMerkleRoot = {
      district_hash: EXPECTED_DISTRICT,
      nullifier: EXPECTED_NULLIFIER,
    } as ConstituencyProof;

    expect(
      verifyConstituencyProof(
        missingDistrict,
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      ),
    ).toEqual({ valid: false, error: 'malformed_proof' });

    expect(
      verifyConstituencyProof(
        missingNullifier,
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      ),
    ).toEqual({ valid: false, error: 'malformed_proof' });

    expect(
      verifyConstituencyProof(
        missingMerkleRoot,
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      ),
    ).toEqual({ valid: false, error: 'malformed_proof' });
  });

  it('returns malformed_proof for empty required fields', () => {
    expect(
      verifyConstituencyProof(
        makeProof({ district_hash: '' }),
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      ),
    ).toEqual({ valid: false, error: 'malformed_proof' });

    expect(
      verifyConstituencyProof(
        makeProof({ nullifier: '' }),
        EXPECTED_NULLIFIER,
        EXPECTED_DISTRICT,
      ),
    ).toEqual({ valid: false, error: 'malformed_proof' });
  });

  it('treats null merkle_root as malformed_proof', () => {
    const result = verifyConstituencyProof(
      makeProof({ merkle_root: null as unknown as string }),
      EXPECTED_NULLIFIER,
      EXPECTED_DISTRICT,
    );

    expect(result).toEqual({ valid: false, error: 'malformed_proof' });
  });
});

describe('constituency verification re-exports', () => {
  it('re-exports runtime and types from index', () => {
    const errorFromIndex: ProofVerificationErrorFromIndex = 'stale_proof';
    const resultFromIndex: ProofVerificationResultFromIndex = {
      valid: false,
      error: errorFromIndex,
    };

    const errorLocal: ProofVerificationError = errorFromIndex;
    const resultLocal: ProofVerificationResult = resultFromIndex;

    expect(errorLocal).toBe('stale_proof');
    expect(resultLocal).toEqual({ valid: false, error: 'stale_proof' });
    expect(verifyConstituencyProofFromIndex).toBe(verifyConstituencyProof);
  });
});
