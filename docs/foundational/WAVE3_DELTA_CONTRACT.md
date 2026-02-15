# Wave 3 Delta Contract

Companion to:
- `docs/foundational/WAVE2_DELTA_CONTRACT.md` (all 16 policies carry forward)
- `docs/foundational/CE_DUAL_REVIEW_CONTRACTS.md`
- `docs/foundational/WAVE3_KICKOFF_COMMAND_SHEET.md`

Status: Binding for Wave 3 execution.

Last updated: 2026-02-14

---

## Policy Inheritance

All 16 binding policies from `WAVE2_DELTA_CONTRACT.md` remain in effect for Wave 3.
This document captures additional Wave 3-specific policies and amendments only.

## Wave 3 Runtime Constants

Source of truth: `docs/foundational/WAVE_RUNTIME_CONSTANTS.json`

## Wave 3 Amendments

### A1. Team namespace continuity

Wave 3 uses new branch prefixes (`w3b/*`, `w3c/*`) but agents carry forward from Wave 2 (`w2b-chief`, `w2g-chief`). The ownership map has separate `w3b`/`w3c` entries to maintain clean wave boundaries while preserving path continuity.

### A2. Shared-file pre-approvals (Policy 3)

The following shared-file expansions are pre-approved for Wave 3:

| File | Team | Justification |
|------|------|---------------|
| `packages/data-model/src/index*.ts` | w3c | Barrel re-exports for CAK schemas (additive only) |
| `packages/gun-client/src/index*.ts` | w3c | Barrel re-export for bridgeAdapters (additive only) |

These files are also in w3b scope (inherited from w2b). Conflict is unlikely — w3b touches docs-related exports, w3c touches bridge-related exports. If a merge conflict arises, coordinator resolves.

### A3. Topology path updates

Coordinator owns `topology.ts` updates for Wave 3 bridge paths. Pre-dispatch coordinator PRs will register:
- `vh/bridge/stats/<repId>` (public, aggregate counters)
- `~<devicePub>/hermes/bridge/actions/<actionId>` (auth)
- `~<devicePub>/hermes/bridge/receipts/<receiptId>` (auth)
- `~<devicePub>/hermes/bridge/reports/<reportId>` (auth)

Per spec-civic-action-kit-v0.md §5.1.

### A4. Chief agents are orchestration-only (CEO directive 2026-02-14)

**Effective immediately.** All chief agents (`w1a-chief`, `w1b-chief`, `w1c-chief`, `w2a-chief`, `w2b-chief`, `w2g-chief`) are restricted to orchestration roles:

- **Allowed:** Plan, scope, review, dispatch to impl agents, route QA/maint gating, recommend merge.
- **Denied:** Direct code/test editing, exec commands, file writes. Tools `write`, `edit`, `exec`, `process` are denied in config.
- **Enforcement:** If a chief task requires code/test changes, the chief must spawn the appropriate impl agent (`sessions_spawn`) with the implementation prompt.
- **Workflow:** Chief → impl agent (code/PR) → QA agent (gate) → chief (merge recommendation) → coordinator.

Config enforcement: `tools.deny: ["write", "edit", "exec", "process"]` on all chief agent entries.

This policy supersedes any prior implicit permission for chiefs to execute code directly.
