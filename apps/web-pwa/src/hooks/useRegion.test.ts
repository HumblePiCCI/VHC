/* @vitest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConstituencyProof } from '@vh/types';

const useIdentityMock = vi.hoisted(() => vi.fn());
const isProofVerificationEnabledMock = vi.hoisted(() => vi.fn());
const getConfiguredDistrictMock = vi.hoisted(() => vi.fn());
const getTransitionalConstituencyProofMock = vi.hoisted(() => vi.fn());
const getRealConstituencyProofMock = vi.hoisted(() => vi.fn());

vi.mock('./useIdentity', () => ({
  useIdentity: () => useIdentityMock(),
}));

vi.mock('../store/bridge/constituencyProof', () => ({
  isProofVerificationEnabled: () => isProofVerificationEnabledMock(),
}));

vi.mock('../store/bridge/districtConfig', () => ({
  getConfiguredDistrict: () => getConfiguredDistrictMock(),
}));

vi.mock('../store/bridge/transitionalConstituencyProof', () => ({
  getTransitionalConstituencyProof: (...args: unknown[]) =>
    getTransitionalConstituencyProofMock(...(args as [string])),
}));

vi.mock('../store/bridge/realConstituencyProof', () => ({
  getRealConstituencyProof: (...args: unknown[]) =>
    getRealConstituencyProofMock(...(args as [string, string])),
}));

import { useRegion } from './useRegion';

describe('useRegion', () => {
  beforeEach(() => {
    useIdentityMock.mockReset();
    isProofVerificationEnabledMock.mockReset();
    getConfiguredDistrictMock.mockReset();
    getTransitionalConstituencyProofMock.mockReset();
    getRealConstituencyProofMock.mockReset();

    isProofVerificationEnabledMock.mockReturnValue(false);
    getConfiguredDistrictMock.mockReturnValue('season0-default-district');

    getTransitionalConstituencyProofMock.mockImplementation(
      (nullifier: string): ConstituencyProof => ({
        district_hash: 't9n-district-a',
        nullifier,
        merkle_root: 't9n-root-a',
      }),
    );

    getRealConstituencyProofMock.mockImplementation(
      (nullifier: string, districtHash: string): ConstituencyProof => ({
        district_hash: districtHash,
        nullifier,
        merkle_root: 's0-root-abcd1234',
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
    expect(getTransitionalConstituencyProofMock).not.toHaveBeenCalled();
    expect(getRealConstituencyProofMock).not.toHaveBeenCalled();
  });

  it('uses real provider when proof verification is enabled', () => {
    const expectedProof: ConstituencyProof = {
      district_hash: 'season0-default-district',
      nullifier: 'session-nullifier-1',
      merkle_root: 's0-root-abcd1234',
    };

    useIdentityMock.mockReturnValue({
      identity: { session: { nullifier: 'session-nullifier-1' } },
    });
    isProofVerificationEnabledMock.mockReturnValue(true);
    getRealConstituencyProofMock.mockReturnValue(expectedProof);

    const { result } = renderHook(() => useRegion());

    expect(getConfiguredDistrictMock).toHaveBeenCalledTimes(1);
    expect(getRealConstituencyProofMock).toHaveBeenCalledWith(
      'session-nullifier-1',
      'season0-default-district',
    );
    expect(getTransitionalConstituencyProofMock).not.toHaveBeenCalled();
    expect(result.current.proof).toEqual(expectedProof);
  });

  it('uses transitional proof builder when proof verification is disabled', () => {
    const expectedProof: ConstituencyProof = {
      district_hash: 't9n-district-x',
      nullifier: 'session-nullifier-1',
      merkle_root: 't9n-root-x',
    };

    useIdentityMock.mockReturnValue({
      identity: { session: { nullifier: 'session-nullifier-1' } },
    });
    isProofVerificationEnabledMock.mockReturnValue(false);
    getTransitionalConstituencyProofMock.mockReturnValue(expectedProof);

    const { result } = renderHook(() => useRegion());

    expect(getTransitionalConstituencyProofMock).toHaveBeenCalledWith('session-nullifier-1');
    expect(getRealConstituencyProofMock).not.toHaveBeenCalled();
    expect(getConfiguredDistrictMock).not.toHaveBeenCalled();
    expect(result.current.proof).toEqual(expectedProof);
  });
});
