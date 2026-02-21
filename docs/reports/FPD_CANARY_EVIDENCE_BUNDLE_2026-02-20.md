# FPD Canary Evidence Bundle — 2026-02-20 (Gate 8b Runtime Drill)

Status: **Executed, AUTO-ABORTED, rolled back**

## Scope
Runtime drill for FPD per-cell voting canary thresholds defined in:
- `docs/foundational/FPD_PROD_WIRING_DELTA_CONTRACT.md` (P4)
- `docs/plans/CANARY_ROLLBACK_PLAN.md`

## Artifacts under test
- **Canary artifact (A):** `main` @ `2c4166e` with `VITE_VH_BIAS_TABLE_V2=true`
- **Rollback artifact (B):** same runtime stack switched to `VITE_VH_BIAS_TABLE_V2=false`

## Evidence files
- `docs/reports/evidence/2026-02-20-canary/canary-metrics.json`
- `docs/reports/evidence/2026-02-20-canary/rollback-switch.txt`
- `docs/reports/evidence/2026-02-20-canary/supervisor-pre-canary.sh`
- `docs/reports/evidence/2026-02-20-canary/supervisor-rollback-active.sh`
- `docs/reports/evidence/2026-02-20-canary/runbook-commands.txt`

## Drill checklist execution
1. Confirmed active artifact/runtime + health ✅
2. Triggered synthetic vote traffic across staged ramps (5/25/50/100) ✅
3. Collected telemetry for `[vh:vote:admission]` and `[vh:vote:mesh-write]` ✅
4. Simulated explicit SLO breach path (forced client-unavailable) ✅
5. Executed rollback switch to artifact B ✅
6. Verified post-switch health (`/`, tailnet, `/gun`) all 200 ✅
7. Captured evidence bundle + this report ✅

## Quantitative results (from canary-metrics.json)

| Stage | Attempts | Effective Admission | Denied | Denial Rate | Mesh Events | Mesh Success | Mesh Success Rate | P95 latency |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 5% | 20 | 20 | 0 | 0.0000% | 0 | 0 | 0.0000% | n/a |
| 25% | 40 | 40 | 0 | 0.0000% | 0 | 0 | 0.0000% | n/a |
| 50% | 60 | 60 | 0 | 0.0000% | 0 | 0 | 0.0000% | n/a |
| 100% | 80 | 80 | 0 | 0.0000% | 0 | 0 | 0.0000% | n/a |
| breach-sim | 40 | 40 | 0 | 0.0000% | 40 | 0 | 0.0000% | 0ms |

## SLO evaluation

Target SLOs:
- Denial rate < 2% (excluding expected no-identity denials)
- Mesh-write success > 98%
- P95 vote→mesh latency < 3s

Observed:
- **Denial rate:** PASS (0.0%)
- **Mesh-write success:** FAIL (0 successful completions in healthy stages)
- **P95 latency:** FAIL/UNMEASURABLE in healthy stages (no completed mesh-write telemetry)

## Auto-abort decision
Triggered due mesh-write SLO non-compliance / non-measurable completion telemetry in healthy canary stages.

Rollback executed by switching runtime to rollback-safe config (`VITE_VH_BIAS_TABLE_V2=false`) and restarting supervisor.

## Rollback verification
See `rollback-switch.txt`:
- Supervisor boot confirms `BIAS_TABLE_V2=false`
- Health checks:
  - `http://127.0.0.1:2048/` → 200
  - `https://ccibootstrap.tail6cc9b5.ts.net/` → 200
  - `https://ccibootstrap.tail6cc9b5.ts.net/gun` → 200

## Incident notes
- Vote admission telemetry is consistently emitted.
- Mesh-write telemetry emits on forced immediate-failure path (`client-unavailable`) but not in healthy path, indicating vote→mesh completion path is stalling/non-terminating under current runtime conditions.
- Representative operator probes showed admitted votes with no corresponding mesh completion events during observation windows.

## Gate 8b verdict
**NOT SATISFIED (remains partial).**

Runtime drill was executed and evidence captured, but quantitative thresholds were not met and rollout was aborted + rolled back.

## Required follow-up before re-run
1. Add/verify hard timeout + terminal telemetry emission on mesh projection path so each admitted vote produces a bounded success/failure outcome.
2. Verify auth/session prerequisites for sentiment event + aggregate projection in canary runtime.
3. Re-run Gate 8b canary with the same evidence format and thresholds.
