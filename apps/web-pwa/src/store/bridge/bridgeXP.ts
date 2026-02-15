/**
 * Bridge XP emissions — civic action rewards.
 *
 * Emission amounts per spec §9.1:
 * - action_completed (first per rep/week): +3 civicXP
 * - action_completed (subsequent same rep/week): +1 civicXP
 * - elevation_forwarded: +1 civicXP
 *
 * All emissions bounded by weekly cap (enforced by xpLedger).
 *
 * Spec: spec-civic-action-kit-v0.md §9
 */

import { useXpLedger } from '../../store/xpLedger';

/* ── Constants ───────────────────────────────────────────────── */

export const XP_FIRST_ACTION = 3;
export const XP_SUBSEQUENT_ACTION = 1;
export const XP_ELEVATION_FORWARDED = 1;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/* ── State: rep/week dedup ───────────────────────────────────── */

/** Track which reps received their first action this week. Key: `{repId}:{weekStart}` */
const repWeekSet = new Set<string>();

function weekStart(now: number): number {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // Sunday start
  return d.getTime();
}

function repWeekKey(repId: string, now: number): string {
  return `${repId}:${weekStart(now)}`;
}

/* ── Emitters ────────────────────────────────────────────────── */

/**
 * Emit XP for completing a civic action.
 * First action per representative per week earns +3, subsequent earn +1.
 */
export function emitActionCompleted(representativeId: string, now?: number): number {
  const ts = now ?? Date.now();
  const key = repWeekKey(representativeId, ts);
  const isFirst = !repWeekSet.has(key);
  const amount = isFirst ? XP_FIRST_ACTION : XP_SUBSEQUENT_ACTION;

  if (isFirst) repWeekSet.add(key);
  useXpLedger.getState().addXp('civic', amount);
  return amount;
}

/**
 * Emit XP for forwarding an elevation artifact.
 */
export function emitElevationForwarded(): number {
  useXpLedger.getState().addXp('civic', XP_ELEVATION_FORWARDED);
  return XP_ELEVATION_FORWARDED;
}

/* ── Pruning (GC old week entries) ───────────────────────────── */

/**
 * Prune rep/week entries older than 2 weeks.
 * Called periodically or at hydration.
 */
export function pruneStaleEntries(now?: number): number {
  const ts = now ?? Date.now();
  const cutoff = ts - 2 * WEEK_MS;
  let pruned = 0;
  for (const key of repWeekSet) {
    const weekTs = Number(key.split(':').pop());
    if (weekTs < cutoff) {
      repWeekSet.delete(key);
      pruned++;
    }
  }
  return pruned;
}

/* ── Test utilities ──────────────────────────────────────────── */

/** @internal */
export function _resetXPForTesting(): void {
  repWeekSet.clear();
}

/** @internal — expose for testing */
export function _getRepWeekSetSize(): number {
  return repWeekSet.size;
}
