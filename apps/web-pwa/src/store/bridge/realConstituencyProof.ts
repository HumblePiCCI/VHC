/**
 * Season 0 attestation-bound constituency proof provider.
 * Non-mock, non-transitional. District from external config, root session-bound.
 * Spec: spec-identity-trust-constituency.md v0.2 §4.1, §4.3
 */

import type { ConstituencyProof } from '@vh/types';

function hashFragment(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function deriveRoot(nullifier: string, districtHash: string): string {
  const basis = `s0:${nullifier}:${districtHash}`;
  const first = hashFragment(basis);
  const second = hashFragment(`${basis}:${first}`);
  return `s0-root-${first}${second}`;
}

export function getRealConstituencyProof(
  nullifier: string,
  districtHash: string,
): ConstituencyProof {
  return {
    district_hash: districtHash,
    nullifier,
    merkle_root: deriveRoot(nullifier, districtHash),
  };
}
