/**
 * Constituency proof — stub for Phase 3 development.
 *
 * Real proof acquisition deferred to W3-LUMA identity hardening workstream.
 * Spec: spec-civic-action-kit-v0.md §7.2
 */

import type { ConstituencyProof } from '@vh/data-model';

/**
 * Return a mock constituency proof for development/testing.
 * The district_hash matches the provided value to satisfy Zod validation.
 */
export function getMockConstituencyProof(districtHash: string): ConstituencyProof {
  return {
    district_hash: districtHash,
    nullifier: 'mock-nullifier',
    merkle_root: 'mock-root',
  };
}
