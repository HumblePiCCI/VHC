# FPD Canary + Rollback Plan (Gate 8a)

Status: PR-satisfiable planning artifact (runtime drill execution is Gate 8b)

## SLOs

- Vote denial rate (excluding expected no-identity denials): **< 2%**
- Aggregate mesh-write success rate: **> 98%**
- P95 vote-to-mesh latency: **< 3s**

## Auto-abort condition

If any SLO is violated continuously for **> 5 minutes** during canary, immediately stop rollout and switch to rollback artifact.

## Canary ramp

1. **5% internal cohort** — hold 24h
2. **25% cohort** — hold 24h
3. **50% cohort** — hold 24h
4. **100% rollout**

Advance only when all SLOs remain healthy for the full hold window.

## Rollback mechanism

- Build and retain two production-ready artifacts in advance:
  - Artifact A: proof-real mode build (`VITE_CONSTITUENCY_PROOF_REAL=true`)
  - Artifact B: rollback-safe prior stable build
- Rollback executes via infrastructure-level traffic switch to Artifact B.
- No in-place hotfixing during incident response window.

## Drill checklist (Gate 8b runtime ceremony)

1. Confirm current canary stage and active artifact hash.
2. Trigger synthetic vote traffic in monitoring cohort.
3. Validate telemetry ingestion for:
   - `[vh:vote:admission]`
   - `[vh:vote:mesh-write]`
4. Simulate one SLO breach and verify auto-abort procedure.
5. Execute traffic switch to rollback artifact.
6. Verify post-switch health and vote-path integrity.
7. Capture evidence bundle and update post-drill report.

## Evidence required

- Timestamped SLO charts for denial rate, mesh-write success, and P95 latency
- Canary stage transitions with operator approvals
- Rollback switch command log + resulting traffic confirmation
- Incident timeline (if any) and mitigation notes

## Monitoring queries (telemetry)

- Vote admission denied ratio:
  - Filter tag: `[vh:vote:admission]`
  - Formula: denied / total (excluding reason = "Identity nullifier unavailable; create/sign in before voting")

- Mesh-write success ratio:
  - Filter tag: `[vh:vote:mesh-write]`
  - Formula: success=true / total

- Vote-to-mesh latency P95:
  - Filter tag: `[vh:vote:mesh-write]`
  - Metric: `latency_ms` p95

## Ownership

- Coordinator: rollout orchestration + gate decisions
- QA: telemetry validation + drill execution evidence
- Director (Lou): final production-enablement approval
