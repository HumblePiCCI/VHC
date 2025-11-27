# Civic Sentiment & Engagement Spec

Version: 0.1  
Status: Canonical for Sprints 2–3

This document is the normative contract for engagement and sentiment across client, mesh, and chain. All implementations must conform to the types, formulas, and invariants defined here.

## 1. Domain Concepts

- `topic_id` – hash of canonical URL.
- `analysis_id` – stable ID/hash of the canonical analysis object.
- `point_id` – ID for a bias/counterpoint/perspective cell.
- `user_id` / `nullifier` – identity linkage via LHID.
- `weight` – per-user-per-topic Lightbulb engagement weight in `[0, 2]`.
- `agreement` – per `(topic_id, point_id)` stance in `{-1, 0, +1}`.

## 2. Event-Level Contract: SentimentSignal

```ts
// One user, one point, one interaction
interface SentimentSignal {
  topic_id: string;       // Hash of Canonical URL
  analysis_id: string;    // Hash of the Canonical Analysis Object
  point_id: string;       // ID of the bias/counterpoint/perspective
  agreement: 1 | 0 | -1;  // 3-state Agree / None / Disagree
  weight: number;         // User’s per-topic Lightbulb, in [0, 2]

  constituency_proof: {
    district_hash: string;
    nullifier: string;
    merkle_root: string;
  };

  emitted_at: number;     // Unix timestamp
}
```

Invariants:

- `0 ≤ weight ≤ 2`.
- For any topic and user, `weight` is updated only via the Civic Decay function.
- `agreement` is a 3-state toggle; there is no partial sentiment.

Emission rules:

- Emit on any change to `agreement` for a `(topic_id, point_id)`.
- Emit on first read/expand of an analysis to capture initial Eye/Lightbulb contributions.
- Emit when constituency proof changes for the user to preserve rollup integrity.

## 3. Aggregate Contract: AggregateSentiment

```ts
interface AggregateSentiment {
  topic_id: string;
  analysis_id: string;

  // For each point_id, the dominant stance or distribution
  bias_vector: Record<string, 1 | 0 | -1>;

  // Global engagement signal (function of all user weights)
  weight: number;          // Aggregate Lightbulb (sum or average of weights)
  engagementScore: number; // Optional metric (entropy/variance) to show spread
}
```

Computation guidelines:

- `bias_vector` is derived from the stream of `SentimentSignal` events (majority stance or stored distribution).
- Aggregate Lightbulb should be deterministic (e.g., sum of weights or averaged per unique user) and documented in the consuming service.

## 4. Civic Decay

Formula: `E_new = E_current + 0.3 * (2.0 - E_current)`.

Pseudocode:

```ts
export function calculateDecay(current: number): number {
  return current + 0.3 * (2.0 - current);
}

export function applyDecay(current: number): number {
  return Math.min(2, Math.max(0, calculateDecay(current)));
}
```

Example progression (starting at `0.0`): `0.0 → 0.6 → 1.02 → 1.414 → 1.6898 → 1.8829 → …` approaching `2.0`.

Invariants:

- Monotonic increase per step; cannot exceed `2.0`.
- Idempotent per interaction: one qualifying interaction = one decay step.
- Only this function may update `weight`.

## 5. Lifecycle & Storage

- **Client state:** `useSentimentState` stores `agreement` per `(topic_id, point_id)`; `useEngagementState` stores per-topic `weight`; `useReadTracker` records first read per `topic_id`.
- **Types:** `packages/types` exports `SentimentSignal` and `AggregateSentiment`.
- **Schemas:** `packages/data-model` hosts `SentimentSignalSchema` and `AggregateSentimentSchema` (Zod) mirroring the above.
- **Engine:** `packages/ai-engine/src/decay.ts` implements `calculateDecay` / `applyDecay` using this spec.
- **Persistence:** Local store → Gun mesh → chain/ledger projections consume the same validated events.

## 6. Test Invariants

- All emitted events validate via `SentimentSignalSchema.parse`.
- Civic Decay tests prove monotonic, bounded progression and clamp behavior at 0 and 2.
- Eye increments only once per user per `topic_id`; Lightbulb uses the decay output.
- UI tests enforce 3-state sentiment toggles and persistence across reloads.
- Integration tests round-trip: UI interaction → `SentimentSignal` → `AggregateSentiment` projection with deterministic results.
