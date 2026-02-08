# Spec: Issue #98 — consumeAction called on null analysis result

**Status:** APPROVED  
**Baseline:** `a73d05a` (main)  
**Author:** Chief (inline spec — scope too narrow for full spec ritual)

## Problem

In `AnalysisFeed.tsx` line ~162, the `.then()` handler after `getOrGenerate()` calls:

```typescript
if (!result.reused && nullifier) {
  useXpLedger.getState().consumeAction('analyses/day', 1, topicId);
}
```

This does NOT check whether `result.analysis` is non-null. After PR #96 (Issue #69), `getOrGenerate` can return `{ analysis: null, reused: false }` when generation is denied/fails. The current code incorrectly consumes a budget unit for a null analysis.

Additionally, the existing test at line ~267 **asserts this buggy behavior**: it expects `mockConsumeAction` to have been called when analysis is null. This test must be corrected.

## Fix

**Single-line code change:**
```typescript
// Before:
if (!result.reused && nullifier) {
// After:
if (!result.reused && nullifier && result.analysis) {
```

**Test correction:**
Change the existing null-analysis test assertion from:
```typescript
expect(mockConsumeAction).toHaveBeenCalledWith('analyses/day', 1, hashUrl(targetUrl));
```
to:
```typescript
expect(mockConsumeAction).not.toHaveBeenCalled();
```

## Acceptance Criteria

1. **AC-1:** Fresh valid analysis generation with identity → `consumeAction` called exactly once
2. **AC-2:** Reused/cached analysis → `consumeAction` NOT called (regression guard)
3. **AC-3:** Null/invalid analysis result → `consumeAction` NOT called (core #98 fix)
4. **AC-4:** Budget-denied path → `consumeAction` NOT called (regression guard)
5. **AC-5:** Generation error/rejection → `consumeAction` NOT called (regression guard)
6. **AC-6:** All gates green: typecheck, lint, test:quick, test:coverage
7. **AC-7:** Coverage remains 100% lines/branches/functions/statements

## Edge Cases

- `result.analysis` is `undefined` vs `null` → truthiness check covers both
- `result.analysis` is empty object `{}` → truthy, would consume (correct — object exists)
- Double-submit race → out of scope (#68 TOCTOU)

## Touched Files

| File | Change |
|------|--------|
| `apps/web-pwa/src/routes/AnalysisFeed.tsx` | Add `&& result.analysis` to consume guard (~1 line) |
| `apps/web-pwa/src/routes/AnalysisFeed.test.tsx` | Fix null-analysis test assertion; add explicit consume-guard tests |

## Test Plan

All in `apps/web-pwa/src/routes/AnalysisFeed.test.tsx`:

1. **Existing T1** (allowed path): verify `consumeAction` called once — already passes, keep as regression
2. **Existing T3** (denied path): verify `consumeAction` NOT called — already passes, keep as regression
3. **Existing T4** (reused path): verify `consumeAction` NOT called — already passes, keep as regression
4. **Fix existing null-analysis test** (~line 267): change assertion to `not.toHaveBeenCalled()`
5. **Existing T9** (generation error): verify `consumeAction` NOT called — already passes, keep as regression

## Out of Scope

- #68 TOCTOU budget hardening
- #47 CSP hardening  
- #61 ProposalList cleanup
- Broader denial UX redesign
