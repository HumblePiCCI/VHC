# ACTIVE TASK PACKET

Last updated: 2026-02-20
Status: Active (WS8 execution in progress)
Owner: Lou + main/coord

## Task ID
FPD-PROD-WIRING-WS8-CLOSURE

## Objective
Close production-readiness gaps after WS7 by executing WS8 alignment + hardening work for per-cell frame/reframe voting:

1. Resolve spec/implementation drift on per-user engagement decay.
2. Enforce anti-gaming bounded influence (`< 2`) with diminishing returns.
3. Align proof-policy docs with post-WS7 runtime reality.
4. Reconcile Gate 8b status language to reflect code-complete vs runtime-drill-complete phases.

## Executive decisions (WS8)
- **D1 — Decay model:** Use civic-decay curve with `alpha = 0.3`.
- **D2 — Hard cap:** Clamp per-user topic engagement impact to `1.95` (strictly `< 2`).
- **D3 — Anti-gaming stance:** Vote impact is keyed by active non-neutral stance count per `(topic_id, synthesis_id, epoch)` rather than raw click count.
- **D4 — Contract truthfulness:** Gate 8b remains runtime-dependent until a real canary drill evidence bundle exists.

## Source of truth
- `docs/foundational/FPD_PROD_WIRING_DELTA_CONTRACT.md`
- `docs/plans/FPD-PROD-WIRING-RFC-20260219.md`
- `docs/specs/spec-civic-sentiment.md`
- `docs/feature-flags.md`

## Reporting contract
Use: `state now / done / next / blockers / artifacts`

## Execution packet

### state now
- `main` includes WS4–WS7 (`#322`–`#325`), CI green.
- Remaining readiness work is alignment/hardening (no new architecture slice required).

### done (this packet)
- Decay/cap decision encoded in code and spec/docs.
- Proof-flag + env docs reconciled to post-WS7 behavior.
- Gate 8b status language reconciled to runtime-evidence reality.

### next
1. Run targeted tests for updated vote semantics + sentiment state.
2. Run lint/typecheck scope needed for changed files.
3. Open PR with WS8 closure diff and explicit acceptance evidence.
4. Queue runtime canary drill ceremony (ops env) to move Gate 8b from partial → satisfied.

### blockers
- Runtime canary drill evidence requires deployment/runtime environment and cannot be fully completed in repo-only context.

### artifacts
- `apps/web-pwa/src/components/feed/voteSemantics.ts`
- `apps/web-pwa/src/hooks/useSentimentState.ts`
- `apps/web-pwa/src/components/feed/voteSemantics.test.ts`
- `apps/web-pwa/src/hooks/useSentimentState.test.ts`
- `docs/specs/spec-civic-sentiment.md`
- `docs/feature-flags.md`
- `apps/web-pwa/.env.example`
- `docs/foundational/FPD_PROD_WIRING_DELTA_CONTRACT.md`
