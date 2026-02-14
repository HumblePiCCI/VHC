/* @vitest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConstituencyProof } from '@vh/types';

const useIdentityMock = vi.hoisted(() => vi.fn());
const getMockConstituencyProofMock = vi.hoisted(() => vi.fn());

vi.mock('./useIdentity', () => ({
  useIdentity: () => useIdentityMock(),
}));

vi.mock('../store/bridge/constituencyProof', () => ({
  getMockConstituencyProof: (...args: unknown[]) =>
    getMockConstituencyProofMock(...(args as [string, string | undefined])),
}));

import { useRegion } from './useRegion';

describe('useRegion', () => {
  beforeEach(() => {
    useIdentityMock.mockReset();
    getMockConstituencyProofMock.mockReset();
    getMockConstituencyProofMock.mockImplementation(
      (districtHash: string, nullifier?: string): ConstituencyProof => ({
        district_hash: districtHash,
        nullifier: nullifier ?? 'mock-nullifier',
        merkle_root: 'mock-root',
      }),
    );
  });

  it.each([
    { identity: null },
    { identity: {} },
    { identity: { session: {} } },
  ])('returns null proof when nullifier is unavailable (%j)', ({ identity }) => {
    useIdentityMock.mockReturnValue({ identity });

    const { result } = renderHook(() => useRegion());

    expect(result.current.proof).toBeNull();
    expect(getMockConstituencyProofMock).not.toHaveBeenCalled();
  });

  it('uses centralized proof builder with identity session nullifier', () => {
    const expectedProof: ConstituencyProof = {
      district_hash: 'mock-district-hash',
      nullifier: 'session-nullifier-1',
      merkle_root: 'mock-root',
    };

    useIdentityMock.mockReturnValue({
      identity: { session: { nullifier: 'session-nullifier-1' } },
    });
    getMockConstituencyProofMock.mockReturnValue(expectedProof);

    const { result } = renderHook(() => useRegion());

    expect(getMockConstituencyProofMock).toHaveBeenCalledWith(
      'mock-district-hash',
      'session-nullifier-1',
    );
    expect(result.current.proof).toEqual(expectedProof);
  });
});
