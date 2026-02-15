import { useIdentity } from './useIdentity';
import type { ConstituencyProof } from '@vh/types';
import { useMemo } from 'react';
import { getMockConstituencyProof } from '../store/bridge/constituencyProof';

const MOCK_DISTRICT_HASH = 'mock-district-hash';

export function useRegion(): { proof: ConstituencyProof | null } {
  const { identity } = useIdentity();

  const proof = useMemo(() => {
    if (!identity?.session?.nullifier) return null;
    return getMockConstituencyProof(MOCK_DISTRICT_HASH, identity.session.nullifier);
  }, [identity?.session?.nullifier]);

  return { proof };
}
