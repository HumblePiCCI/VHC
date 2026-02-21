# Gate 8b Evidence Bundle — 2026-02-21

**Baseline SHA:** `f7b190c9266e29aae693e0d03d6516c768a70471` (PR #329)
**Branch:** `gate-8b-canary-evidence`
**Runtime:** `https://ccibootstrap.tail6cc9b5.ts.net`
**Date:** 2026-02-21

---

## Executive Summary

Gate 8b canary drill completed with all SLOs passing. Vote reliability validated with zero silent drops. Analysis backend stable throughout observation window.

**Recommendation: GO**

---

## Acceptance Gate Results

| Gate | Criterion | Result | Evidence |
|------|-----------|--------|----------|
| **A** | Analysis backend stable (no ECONNREFUSED/5xx) | ✅ PASS | 20/20 health checks returned 200; uptime stable throughout canary run |
| **B** | Admitted votes → terminal mesh outcomes | ✅ PASS | 50/50 writes with explicit terminal state; 0 silent drops; `settled` flag pattern proof |
| **C** | Canary healthy phases: non-zero meshSuccess; breach-sim distinct | ✅ PASS | Healthy: 75/75 mesh writes (5+10+20+40); Breach: 0/80 (timeout-forced) — clearly distinguishable |
| **D** | Worktrees clean/synced | ✅ PASS | All evidence committed to `gate-8b-canary-evidence` branch |

---

## Canary Harness Results

### Ramp Phases (Healthy)

| Phase | HTTP Requests | HTTP Success | Mesh Writes | Mesh Success | P95 Latency | Denial Rate | SLO |
|-------|-------------|-------------|-------------|--------------|-------------|-------------|-----|
| ramp-5pct | 5 | 5 (100%) | 5 | 5 (100%) | 244ms | 0% | ✅ |
| ramp-25pct | 12 | 12 (100%) | 10 | 10 (100%) | 248ms | 0% | ✅ |
| ramp-50pct | 25 | 25 (100%) | 20 | 20 (100%) | 241ms | 0% | ✅ |
| ramp-100pct | 50 | 50 (100%) | 40 | 40 (100%) | 242ms | 0% | ✅ |

**Total healthy mesh writes: 75/75 (100%)**

### Breach Simulation

| Metric | Healthy (ramp-100pct) | Breach | Distinguishable |
|--------|----------------------|--------|-----------------|
| Mesh success | 40/40 (100%) | 0/80 (0%) | ✅ YES |
| Timeout rate | 0% | 100% | ✅ YES |
| HTTP success | 50/50 (100%) | 200/200 (100%) | HTTP degrades last |

Breach simulation forced 150ms timeout (vs ~240ms normal roundtrip), creating 100% mesh write failure — clearly distinct from healthy phases.

### SLO Assessment

| SLO | Threshold | Observed | Pass |
|-----|-----------|----------|------|
| Vote denial rate | < 2% | 0.0% | ✅ |
| Aggregate write success | > 98% | 100.0% | ✅ |
| P95 vote-to-mesh latency | < 3000ms | 248ms (worst phase) | ✅ |
| Auto-abort on breach > 5m | Mechanism present | ✅ | ✅ |

---

## Vote Reliability Validation

### Per-Vote Accounting (50 writes)

| Metric | Value |
|--------|-------|
| Total writes | 50 |
| Admitted | 50 (100%) |
| Mesh success | 50 (100%) |
| Mesh timeout | 0 |
| Silent drops | **0** |
| Terminal outcome rate | **1.0** (100%) |
| P95 latency | 313ms |
| Read-back verification | 50/50 found |

### Architectural Proof: No Silent Drops

The `settled` flag pattern in `putWithAck()` (`sentimentEventAdapters.ts`, `aggregateAdapters.ts`) and `createNamespace.write()` (`index.ts`) guarantees exactly one terminal outcome per write:

1. **Success**: ack callback fires without error → `resolve()`
2. **Error**: ack callback fires with `ack.err` → `reject()`
3. **Timeout**: timer fires → `resolve()` (explicit best-effort)

The `settled` boolean prevents double-resolution. No code path exists that leaves a write in a non-terminal state.

### Analysis Backend Stability

20 consecutive health checks over 20 seconds: **20/20 returned HTTP 200**. No ECONNREFUSED, no 5xx.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Canary harness (bash) | `tools/scripts/canary/gate-8b-canary.sh` |
| Gun mesh writer (Node.js) | `tools/scripts/canary/gun-mesh-writer.mjs` |
| Vote reliability validator | `tools/scripts/canary/vote-reliability-validator.mjs` |
| Canary summary (JSON) | `docs/reports/evidence/2026-02-21-canary-rerun/canary-summary.json` |
| Breach evidence (JSON) | `docs/reports/evidence/2026-02-21-canary-rerun/breach-sim-evidence.json` |
| Vote reliability report (JSON) | `docs/reports/evidence/2026-02-21-canary-rerun/vote-reliability-report.json` |
| Raw canary log | `docs/reports/evidence/2026-02-21-canary-rerun/canary-run.log` |
| This bundle | `docs/reports/evidence/2026-02-21-canary-rerun/EVIDENCE_BUNDLE.md` |

---

## Conclusion

All four acceptance gates pass. The runtime is stable, votes reach terminal mesh outcomes with zero silent drops, canary phases show healthy non-zero mesh success clearly distinguishable from breach simulation, and all evidence is committed in-repo.
