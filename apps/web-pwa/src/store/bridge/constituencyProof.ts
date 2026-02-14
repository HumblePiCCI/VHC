import type { ConstituencyProof } from '@vh/data-model';

export function isProofVerificationEnabled(): boolean {
  try {
    const importMetaEnv = (import.meta as any).env;
    const processEnv = (globalThis as any).process?.env;
    return (importMetaEnv?.VITE_CONSTITUENCY_PROOF_REAL ?? processEnv?.VITE_CONSTITUENCY_PROOF_REAL) === 'true';
  } catch {
    return false;
  }
}

export function getMockConstituencyProof(
  districtHash: string,
  nullifier?: string,
): ConstituencyProof {
  return {
    district_hash: districtHash,
    nullifier: nullifier ?? 'mock-nullifier',
    merkle_root: 'mock-root',
  };
}
