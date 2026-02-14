import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import {
  emitActionCompleted,
  emitElevationForwarded,
  pruneStaleEntries,
  XP_FIRST_ACTION,
  XP_SUBSEQUENT_ACTION,
  XP_ELEVATION_FORWARDED,
  _resetXPForTesting,
  _getRepWeekSetSize,
} from './bridgeXP';

/* ── Mock xpLedger ───────────────────────────────────────────── */

const addXpMock = vi.fn();

vi.mock('../../store/xpLedger', () => ({
  useXpLedger: {
    getState: () => ({ addXp: addXpMock }),
  },
}));

beforeEach(() => {
  _resetXPForTesting();
  addXpMock.mockClear();
});

/* ── emitActionCompleted ─────────────────────────────────────── */

describe('emitActionCompleted', () => {
  it('emits XP_FIRST_ACTION for first action per rep/week', () => {
    const amount = emitActionCompleted('rep-1');
    expect(amount).toBe(XP_FIRST_ACTION);
    expect(addXpMock).toHaveBeenCalledWith('civic', XP_FIRST_ACTION);
  });

  it('emits XP_SUBSEQUENT_ACTION for same rep in same week', () => {
    const now = Date.now();
    emitActionCompleted('rep-1', now);
    const amount = emitActionCompleted('rep-1', now + 1000);
    expect(amount).toBe(XP_SUBSEQUENT_ACTION);
    expect(addXpMock).toHaveBeenLastCalledWith('civic', XP_SUBSEQUENT_ACTION);
  });

  it('emits XP_FIRST_ACTION for different rep in same week', () => {
    const now = Date.now();
    emitActionCompleted('rep-1', now);
    const amount = emitActionCompleted('rep-2', now);
    expect(amount).toBe(XP_FIRST_ACTION);
  });

  it('emits XP_FIRST_ACTION for same rep in different week', () => {
    const now = Date.now();
    emitActionCompleted('rep-1', now);
    const nextWeek = now + 8 * 24 * 60 * 60 * 1000;
    const amount = emitActionCompleted('rep-1', nextWeek);
    expect(amount).toBe(XP_FIRST_ACTION);
  });

  it('uses Date.now() by default', () => {
    const amount = emitActionCompleted('rep-x');
    expect(amount).toBe(XP_FIRST_ACTION);
    expect(addXpMock).toHaveBeenCalledTimes(1);
  });
});

/* ── emitElevationForwarded ──────────────────────────────────── */

describe('emitElevationForwarded', () => {
  it('emits XP_ELEVATION_FORWARDED', () => {
    const amount = emitElevationForwarded();
    expect(amount).toBe(XP_ELEVATION_FORWARDED);
    expect(addXpMock).toHaveBeenCalledWith('civic', XP_ELEVATION_FORWARDED);
  });
});

/* ── pruneStaleEntries ───────────────────────────────────────── */

describe('pruneStaleEntries', () => {
  it('prunes entries older than 2 weeks', () => {
    const twoWeeksAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    emitActionCompleted('rep-old', twoWeeksAgo);
    emitActionCompleted('rep-new', Date.now());
    expect(_getRepWeekSetSize()).toBe(2);

    const pruned = pruneStaleEntries();
    expect(pruned).toBe(1);
    expect(_getRepWeekSetSize()).toBe(1);
  });

  it('returns 0 when nothing to prune', () => {
    emitActionCompleted('rep-1');
    expect(pruneStaleEntries()).toBe(0);
  });

  it('handles empty state', () => {
    expect(pruneStaleEntries()).toBe(0);
  });

  it('uses Date.now() by default', () => {
    const pruned = pruneStaleEntries();
    expect(pruned).toBe(0);
  });
});

/* ── Reset utility ───────────────────────────────────────────── */

describe('_resetXPForTesting', () => {
  it('clears all rep/week state', () => {
    emitActionCompleted('rep-1');
    emitActionCompleted('rep-2');
    expect(_getRepWeekSetSize()).toBe(2);
    _resetXPForTesting();
    expect(_getRepWeekSetSize()).toBe(0);
  });
});
