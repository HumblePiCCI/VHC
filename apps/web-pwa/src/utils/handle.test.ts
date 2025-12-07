import { describe, expect, it } from 'vitest';
import { isValidHandle, getHandleError } from './handle';

describe('handle validation', () => {
  describe('isValidHandle', () => {
    it('returns true for valid handles', () => {
      expect(isValidHandle('alice')).toBe(true);
      expect(isValidHandle('Bob123')).toBe(true);
      expect(isValidHandle('user_name')).toBe(true);
      expect(isValidHandle('abc')).toBe(true); // minimum length
      expect(isValidHandle('a'.repeat(20))).toBe(true); // maximum length
    });

    it('returns false for invalid handles', () => {
      expect(isValidHandle('ab')).toBe(false); // too short
      expect(isValidHandle('a'.repeat(21))).toBe(false); // too long
      expect(isValidHandle('user-name')).toBe(false); // invalid char
      expect(isValidHandle('user name')).toBe(false); // space
      expect(isValidHandle('')).toBe(false); // empty
      expect(isValidHandle('  ')).toBe(false); // whitespace only
    });

    it('trims whitespace before validation', () => {
      expect(isValidHandle('  alice  ')).toBe(true);
      expect(isValidHandle('\talice\n')).toBe(true);
    });
  });

  describe('getHandleError', () => {
    it('returns null for valid handles', () => {
      expect(getHandleError('alice')).toBeNull();
      expect(getHandleError('Bob_123')).toBeNull();
      expect(getHandleError('abc')).toBeNull();
    });

    it('returns error for empty handle', () => {
      expect(getHandleError('')).toBe('Handle is required');
      expect(getHandleError('   ')).toBe('Handle is required');
    });

    it('returns error for too short handle', () => {
      expect(getHandleError('ab')).toBe('Handle must be at least 3 characters');
      expect(getHandleError('a')).toBe('Handle must be at least 3 characters');
    });

    it('returns error for too long handle', () => {
      expect(getHandleError('a'.repeat(21))).toBe('Handle must be at most 20 characters');
    });

    it('returns error for invalid characters', () => {
      expect(getHandleError('user-name')).toBe('Handle can only contain letters, numbers, or underscores');
      expect(getHandleError('user@name')).toBe('Handle can only contain letters, numbers, or underscores');
      expect(getHandleError('user.name')).toBe('Handle can only contain letters, numbers, or underscores');
    });

    it('trims whitespace before validation', () => {
      expect(getHandleError('  alice  ')).toBeNull();
    });
  });
});

