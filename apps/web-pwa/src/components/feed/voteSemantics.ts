export type Agreement = -1 | 0 | 1;

/**
 * Executive decision (WS8): clamp per-user topic impact strictly below 2.
 * This keeps individual influence bounded while still rewarding participation.
 */
export const MAX_TOPIC_ENGAGEMENT_IMPACT = 1.95;

/**
 * Shared diminishing-returns factor used for topic engagement decay.
 */
export const TOPIC_ENGAGEMENT_DECAY_ALPHA = 0.3;

/**
 * Legacy parity toggle semantics:
 * - same vote => neutral
 * - opposite vote => switch
 */
export function resolveNextAgreement(current: Agreement, desired: Exclude<Agreement, 0>): Agreement {
  return current === desired ? 0 : desired;
}

function clampWeight(value: number): number {
  return Math.max(0, Math.min(MAX_TOPIC_ENGAGEMENT_IMPACT, value));
}

/**
 * Shared civic-decay step used by read/engagement trackers.
 * Formula: E_new = E_current + alpha * (cap - E_current)
 */
export function decayTowardsTopicImpactCap(current: number): number {
  if (!Number.isFinite(current)) {
    return 0;
  }

  return clampWeight(
    current + TOPIC_ENGAGEMENT_DECAY_ALPHA * (MAX_TOPIC_ENGAGEMENT_IMPACT - current),
  );
}

/**
 * Per-user stance impact by active non-neutral cell count.
 *
 * Uses the same civic-decay profile as `decayTowardsTopicImpactCap`, but
 * closed-form by active-count so repeated toggles on the same cell cannot
 * inflate influence. Monotonic, diminishing, and capped at <2.
 */
export function legacyWeightForActiveCount(count: number): number {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  const normalizedCount = Math.floor(count);
  const retainedGap = Math.pow(1 - TOPIC_ENGAGEMENT_DECAY_ALPHA, normalizedCount - 1);
  const weight =
    MAX_TOPIC_ENGAGEMENT_IMPACT -
    (MAX_TOPIC_ENGAGEMENT_IMPACT - 1) * retainedGap;

  return clampWeight(weight);
}
