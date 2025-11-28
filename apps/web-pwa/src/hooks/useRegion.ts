import { useIdentity } from './useIdentity';
import type { ConstituencyProof } from '@vh/types';
import { useMemo } from 'react';

const MOCK_DISTRICT_HASH = 'mock-district-hash';

export function useRegion(): { proof: ConstituencyProof | null } {
  const { identity } = useIdentity();

  const proof = useMemo(() => {
    if (!identity?.session?.nullifier) return null;
    return {
      district_hash: MOCK_DISTRICT_HASH,
      nullifier: identity.session.nullifier,
      merkle_root: 'mock-root'
    };
  }, [identity?.session?.nullifier]);

  return { proof };
}
