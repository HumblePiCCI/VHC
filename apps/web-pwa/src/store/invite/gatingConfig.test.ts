/* @vitest-environment jsdom */

import { describe, expect, it, beforeEach } from 'vitest';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage';
import {
  isInviteOnlyEnabled,
  setKillSwitch,
  clearKillSwitch,
  getKillSwitchState,
} from './gatingConfig';

beforeEach(() => {
  safeSetItem('vh_invite_kill_switch', '');
});

describe('isInviteOnlyEnabled', () => {
  it('defaults to true when no env var or kill switch is set', () => {
    expect(isInviteOnlyEnabled()).toBe(true);
  });

  it('returns false when kill switch is disabled', () => {
    setKillSwitch(false);
    expect(isInviteOnlyEnabled()).toBe(false);
  });

  it('returns true when kill switch is enabled', () => {
    setKillSwitch(true);
    expect(isInviteOnlyEnabled()).toBe(true);
  });

  it('reverts to default after clearKillSwitch', () => {
    setKillSwitch(false);
    expect(isInviteOnlyEnabled()).toBe(false);
    clearKillSwitch();
    expect(isInviteOnlyEnabled()).toBe(true);
  });
});

describe('getKillSwitchState', () => {
  it('returns default when not set', () => {
    expect(getKillSwitchState()).toBe('default');
  });

  it('returns enabled when kill switch is on', () => {
    setKillSwitch(true);
    expect(getKillSwitchState()).toBe('enabled');
  });

  it('returns disabled when kill switch is off', () => {
    setKillSwitch(false);
    expect(getKillSwitchState()).toBe('disabled');
  });

  it('returns default after clear', () => {
    setKillSwitch(true);
    clearKillSwitch();
    expect(getKillSwitchState()).toBe('default');
  });
});

describe('setKillSwitch', () => {
  it('persists enabled state to localStorage', () => {
    setKillSwitch(true);
    expect(safeGetItem('vh_invite_kill_switch')).toBe('enabled');
  });

  it('persists disabled state to localStorage', () => {
    setKillSwitch(false);
    expect(safeGetItem('vh_invite_kill_switch')).toBe('disabled');
  });
});
