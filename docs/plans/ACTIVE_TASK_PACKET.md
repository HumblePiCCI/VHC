# ACTIVE TASK PACKET

Last updated: 2026-02-20
Status: Active (WS8b runtime canary remediation pending)
Owner: Lou + main/coord

## Task ID
FPD-PROD-WIRING-WS8B-CANARY-DRILL

## Objective
Execute Gate 8b runtime canary ceremony for per-cell voting and produce an evidence bundle with quantitative SLO evaluation + rollback proof.

## Source of truth
- `docs/foundational/FPD_PROD_WIRING_DELTA_CONTRACT.md`
- `docs/plans/CANARY_ROLLBACK_PLAN.md`
- `docs/reports/FPD_CANARY_EVIDENCE_BUNDLE_2026-02-20.md`

## Reporting contract
Use: `state now / done / next / blockers / artifacts`

## Execution packet

### state now
- WS8 merged on `main` (`2c4166e`), CI green.
- Runtime canary drill executed; rollout auto-aborted and rollback activated.
- Gate 8b remains partial.

### done
1. Ran staged synthetic canary traffic (5/25/50/100 + explicit breach simulation) and captured SLO metrics.
2. Recorded evidence bundle under `docs/reports/evidence/2026-02-20-canary/`.
3. Executed rollback switch (`VITE_VH_BIAS_TABLE_V2=false`) and verified health (`/`, tailnet `/`, `/gun` all 200).
4. Published runtime drill report: `docs/reports/FPD_CANARY_EVIDENCE_BUNDLE_2026-02-20.md`.
5. Updated Gate 8b contract line to reflect executed-but-aborted status and evidence links.

### next
1. Fix vote→mesh projection completion behavior so every admitted vote terminates with telemetry (success/failure) in bounded time.
2. Verify auth/session prerequisites for sentiment event + aggregate writes in canary runtime.
3. Re-run Gate 8b canary with the same evidence format and target SLOs.

### blockers
- Mesh-write completion telemetry is absent in healthy canary stages (0 completion events), making mesh success and p95 latency fail/unmeasurable.
- Without bounded completion + telemetry, Gate 8b cannot be marked satisfied.

### artifacts
- `docs/reports/FPD_CANARY_EVIDENCE_BUNDLE_2026-02-20.md`
- `docs/reports/evidence/2026-02-20-canary/canary-metrics.json`
- `docs/reports/evidence/2026-02-20-canary/rollback-switch.txt`
- `docs/reports/evidence/2026-02-20-canary/supervisor-pre-canary.sh`
- `docs/reports/evidence/2026-02-20-canary/supervisor-rollback-active.sh`
- `docs/reports/evidence/2026-02-20-canary/runbook-commands.txt`
- `docs/foundational/FPD_PROD_WIRING_DELTA_CONTRACT.md`
