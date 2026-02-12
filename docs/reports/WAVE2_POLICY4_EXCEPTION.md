# Wave 2 Policy 4 Exception Record

**Date:** 2026-02-11
**Policy:** WAVE2_DELTA_CONTRACT.md §4 — "Merge queue is mandatory"
**Status:** POLICY4_EXCEPTION__SERIALIZED_FLOW

---

## Finding

GitHub merge queue feature is **not available** on this repository.

### Pre-transfer (historical)
- **Owner:** HumblePiCCI (personal user account, GitHub Free plan)
- **Repo:** HumblePiCCI/VHC (public)
- **Root cause:** Merge queue requires GitHub Teams, Enterprise, or Organization-level plan

### Post-transfer (2026-02-12 re-verification)
- **Owner:** CarbonCasteInc (Organization)
- **Repo:** CarbonCasteInc/VHC
- **API evidence:**
  - `mergeQueue` GraphQL query returns `null` for both `main` and `integration/wave-2`
  - Org plan field returns `null` (likely free-tier org or plan not exposed via API)
  - Rulesets API shows one active ruleset (`main`) with no `merge_queue` rule type
  - Branch protection on `integration/wave-2` is `protected: true` (via branches API)
- **Root cause:** Organization exists but merge queue is still not enabled (requires org-level plan upgrade or explicit admin enablement)

## Branch Protection in Place (Fallback Controls)

| Control | Status |
|---------|--------|
| `requiresStrictStatusChecks` | ✅ true |
| `enforce_admins` | ✅ true |
| Required checks | Ownership Scope, Quality Guard, Test & Build, E2E Tests, Bundle Size |
| `allow_auto_merge` | ✅ true |
| `allow_force_pushes` | ❌ false |
| `allow_deletions` | ❌ false |

## Serialized Fallback Merge Mode

Since GitHub merge queue is unavailable, Wave 2 adopts serialized merge flow:

1. **One PR merge at a time only.** Coordinator sequences merges; no concurrent merge attempts.
2. **Required checks + strict up-to-date always enforced.** GitHub branch protection ensures PRs must be current and all 5 checks green before merge.
3. **CE approval before each merge action.** CE dual-review gate remains mandatory for Director-bound prompts; Coordinator confirms check status before each `gh pr merge --merge --auto`.
4. **`gh pr merge --merge --auto` remains the invocation mechanism.** Auto-merge waits for required checks, then merges. With serialized flow, only one PR is in auto-merge state at a time.
5. **Coordinator owns merge ordering.** Dependency-safe sequence (per staffing plan) is enforced by dispatch timing, not by queue batching.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Rebase cascades from concurrent PRs | Serialized flow: one merge at a time eliminates cascades |
| Broken merge commits (untested combination) | `strict_up_to_date=true` forces re-test after rebase |
| Throughput drag | Acceptable at 3-team concurrency level; merge serialization adds ~10min latency per PR |

## Exception Approval

- **Rationale:** Platform limitation (GitHub Free plan), not a process choice
- **Blast radius:** Merge latency increased; no safety degradation vs merge queue at this concurrency level
- **Rollback plan:** Upgrade to GitHub Teams/org plan to enable merge queue if concurrency becomes a bottleneck
- **Follow-up owner:** CEO (plan upgrade decision)
- **CE review:** Both ce-opus and ce-codex agreed serialized flow is acceptable (conditional AGREED, 2026-02-11)

---

## Resolution

Merge freeze on `integration/wave-2` is **lifted** under serialized fallback mode.
Wave 2 execution proceeds with POLICY4_EXCEPTION__SERIALIZED_FLOW.
