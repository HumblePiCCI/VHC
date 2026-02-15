/* @vitest-environment jsdom */

import { describe, expect, it, beforeEach } from 'vitest';
import { safeSetItem } from '../../utils/safeStorage';
import {
  createInviteToken,
  validateInviteToken,
  redeemInviteToken,
  listTokens,
  revokeToken,
  generateInviteToken,
  loadTokenStore,
  DEFAULT_TOKEN_EXPIRY_MS,
} from './inviteTokens';

const NOW = 1_700_000_000_000;

beforeEach(() => {
  safeSetItem('vh_invite_tokens', '');
});

describe('generateInviteToken', () => {
  it('creates a token with inv_ prefix', () => {
    const token = generateInviteToken('admin-1', NOW);
    expect(token.token).toMatch(/^inv_/);
  });

  it('sets correct expiry', () => {
    const token = generateInviteToken('admin-1', NOW);
    expect(token.expiresAt).toBe(NOW + DEFAULT_TOKEN_EXPIRY_MS);
  });

  it('starts with zero redemptions', () => {
    const token = generateInviteToken('admin-1', NOW);
    expect(token.redemptionCount).toBe(0);
    expect(token.redeemedAt).toBeNull();
    expect(token.redeemedBy).toBeNull();
  });

  it('records createdBy', () => {
    const token = generateInviteToken('admin-1', NOW);
    expect(token.createdBy).toBe('admin-1');
  });
});

describe('createInviteToken', () => {
  it('persists token to store', () => {
    const token = createInviteToken('admin-1', NOW);
    const store = loadTokenStore();
    expect(store.tokens).toHaveLength(1);
    expect(store.tokens[0]!.token).toBe(token.token);
  });

  it('appends multiple tokens', () => {
    createInviteToken('admin-1', NOW);
    createInviteToken('admin-2', NOW + 1000);
    expect(listTokens()).toHaveLength(2);
  });
});

describe('validateInviteToken', () => {
  it('validates a fresh token', () => {
    const token = createInviteToken('admin-1', NOW);
    const result = validateInviteToken(token.token, NOW + 1000);
    expect(result.valid).toBe(true);
  });

  it('rejects unknown token', () => {
    const result = validateInviteToken('inv_unknown', NOW);
    expect(result).toEqual({ valid: false, reason: 'Token not found' });
  });

  it('rejects expired token', () => {
    const token = createInviteToken('admin-1', NOW);
    const result = validateInviteToken(
      token.token,
      NOW + DEFAULT_TOKEN_EXPIRY_MS + 1,
    );
    expect(result).toEqual({ valid: false, reason: 'Token expired' });
  });

  it('rejects already redeemed token', () => {
    const token = createInviteToken('admin-1', NOW);
    redeemInviteToken(token.token, 'user-1', NOW + 1000);
    const result = validateInviteToken(token.token, NOW + 2000);
    expect(result).toEqual({
      valid: false,
      reason: 'Token already redeemed',
    });
  });
});

describe('redeemInviteToken', () => {
  it('redeems a valid token', () => {
    const token = createInviteToken('admin-1', NOW);
    const result = redeemInviteToken(token.token, 'user-1', NOW + 1000);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.token.redeemedBy).toBe('user-1');
      expect(result.token.redeemedAt).toBe(NOW + 1000);
      expect(result.token.redemptionCount).toBe(1);
    }
  });

  it('rejects double redemption', () => {
    const token = createInviteToken('admin-1', NOW);
    redeemInviteToken(token.token, 'user-1', NOW + 1000);
    const result = redeemInviteToken(token.token, 'user-2', NOW + 2000);
    expect(result.valid).toBe(false);
  });

  it('rejects expired token on redeem', () => {
    const token = createInviteToken('admin-1', NOW);
    const result = redeemInviteToken(
      token.token,
      'user-1',
      NOW + DEFAULT_TOKEN_EXPIRY_MS + 1,
    );
    expect(result).toEqual({ valid: false, reason: 'Token expired' });
  });

  it('rejects unknown token on redeem', () => {
    const result = redeemInviteToken('inv_nope', 'user-1', NOW);
    expect(result).toEqual({ valid: false, reason: 'Token not found' });
  });
});

describe('revokeToken', () => {
  it('revokes an existing token', () => {
    const token = createInviteToken('admin-1', NOW);
    expect(revokeToken(token.token)).toBe(true);
    const result = validateInviteToken(token.token, NOW + 1000);
    expect(result).toEqual({ valid: false, reason: 'Token expired' });
  });

  it('returns false for unknown token', () => {
    expect(revokeToken('inv_unknown')).toBe(false);
  });
});

describe('loadTokenStore', () => {
  it('returns empty store when localStorage is empty', () => {
    expect(loadTokenStore()).toEqual({ tokens: [] });
  });

  it('handles corrupted localStorage gracefully', () => {
    safeSetItem('vh_invite_tokens', 'not-json');
    expect(loadTokenStore()).toEqual({ tokens: [] });
  });

  it('handles malformed store gracefully', () => {
    safeSetItem('vh_invite_tokens', '{"tokens": "not-array"}');
    expect(loadTokenStore()).toEqual({ tokens: [] });
  });
});
