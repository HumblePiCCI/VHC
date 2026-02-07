# Spec: Governance Coverage Hardening (Issue #71)

**Status**: Draft  
**Author**: spec-agent  
**Date**: 2026-02-07  
**Target**: `apps/web-pwa/src/hooks/useGovernance.ts` (312 LOC)  
**Existing tests**: `apps/web-pwa/src/hooks/useGovernance.test.ts` (334 LOC, 13 tests)

---

## 1. Problem Statement

`useGovernance.ts` is currently **excluded** from the vitest coverage gate
(`vitest.config.ts` line 86) with the comment _"React Hooks (stateful wiring
validated via E2E)"_. Running coverage with the exclusion removed shows:

| Metric     | Current | Target |
|------------|---------|--------|
| Lines      | 90.62%  | 100%   |
| Branches   | 72.04%  | 100%   |
| Functions  | 83.33%  | 100%   |
| Statements | 90.62%  | 100%   |

21 uncovered lines, 26 uncovered branches, and 3 uncalled functions remain.
This spec maps every gap, provides an exact test plan, and defines acceptance
criteria for the implementation agent.

---

## 2. Non-Goals

- No production code changes (unless a branch is provably unreachable — see §8).
- No store API or UI contract changes.
- No runtime semantics changes.
- No changes to other hooks or stores.
- No E2E test additions (unit/integration only).

---

## 3. Assumptions & Constraints

- The file's public API is `useGovernance()` (React hook), `useGovernanceStore`
  (zustand store), `MIN_TRUST_TO_VOTE`, and type exports.
- jsdom environment is available (`@vitest-environment jsdom` pragma).
- `renderHook` from `@testing-library/react` is already imported.
- The zustand store methods (`getProposals`, `getVotedDirections`, `clearError`,
  etc.) are directly callable via `useGovernanceStore.getState().*` without React.
- `localStorage` / `sessionStorage` are available in jsdom and can be spied on.
- `useXpLedger` is already mocked in existing budget tests; the pattern is
  established.

---

## 4. Exact Uncovered Branch Map

### 4.1 Uncovered Lines (DA:line,0 in lcov)

| Line(s) | Function | Code | Gap |
|---------|----------|------|-----|
| **68** | `readFromStorage` | `const parsed = JSON.parse(raw) as StoredVotes;` | Only reached when `raw` is truthy — but the `parsed && typeof parsed === 'object'` true-branch runs; the **false-branch** (line 70) never fires. |
| **70** | `readFromStorage` | `return {};` | The false-branch of `if (parsed && typeof parsed === 'object')` — triggers when JSON parses to a non-object (e.g., `"hello"`, `42`, `null`). |
| **84** | `readStoreMap` | `return {};` | Same pattern: `parsed` is not a truthy object after `JSON.parse`. |
| **97–98** | `loadAllStoredVotes` | `catch { return {}; }` | The outer try/catch in `loadAllStoredVotes` — fires only if `readStoreMap` itself throws (shouldn't, since `readStoreMap` has its own catch). |
| **177–180** | `getProposals` (store) | Entire function body | Store's `getProposals()` is never called directly — the hook uses its own `useMemo`-based derivation instead. |
| **183–189** | `getVotedDirections` (store) | Entire function body | Store's `getVotedDirections()` is never called directly — the hook uses its own `useMemo`-based derivation instead. |
| **207–209** | `submitVote` | `set({ error: 'Trust score below voting threshold' }); throw ...;` | The `normalizeTrustScore` returning `null` or `< 0.7` path — existing tests always pass `trustScore >= 0.9`. |
| **254–255** | `clearError` | `set({ error: null });` | `clearError()` is never called in any test. |

### 4.2 Uncovered Branches (BRDA with hit-count 0)

| Branch ID | Line | Condition | What's missing |
|-----------|------|-----------|----------------|
| **3** | 64 | `!storage` true-branch in `readFromStorage` | Calling `readFromStorage(undefined, key)` |
| **5** | 67 | `!raw` false-branch in `readFromStorage` | `raw` is always `null`; never hits the parse path with truthy `raw` **that isn't a valid object** |
| **6** | 69 | `parsed && typeof parsed === 'object'` false-branch | JSON parses to non-object (primitive, `null`) |
| **9** | 78 | `!storage` true-branch in `readStoreMap` | Calling `readStoreMap(undefined)` |
| **13** | 83 | `parsed && typeof parsed === 'object'` false in `readStoreMap` | JSON parses to non-object |
| **16** | 93 | `typeof sessionStorage !== 'undefined'` false (ternary → `undefined`) | `sessionStorage` is always defined in jsdom |
| **17** | 94 | `typeof localStorage !== 'undefined'` false (ternary → `undefined`) | `localStorage` is always defined in jsdom |
| **18** | 96 | Catch block in `loadAllStoredVotes` | Outer catch never fires |
| **20** | 103 | `typeof sessionStorage !== 'undefined'` false in `loadStoredVotes` | Same as #16 |
| **21** | 104 | `typeof localStorage !== 'undefined'` false in `loadStoredVotes` | Same as #17 |
| **22** | 106 | `mergedFallback ?? {}` RHS (`mergedFallback` is `undefined`) | `mergedFallback` is always an object from `mergeVoteStores` — **unreachable** |
| **24** | 117 | `typeof localStorage !== 'undefined'` false in `persistStoredVotes` | Same pattern |
| **26** | 118 | `typeof sessionStorage !== 'undefined'` false in `persistStoredVotes` | Same pattern |
| **29** | 112 | `!storage` true-branch in `save()` closure | `save()` called with `undefined` when storage global is missing |
| **39** | 137 | `Number.isNaN(trustScore)` true in `normalizeTrustScore` | Never called with `NaN` |
| **40** | 138 | `trustScore < 0` true in `normalizeTrustScore` | Never called with negative value |
| **41** | 139 | `trustScore > 1` true in `normalizeTrustScore` | Never called with value >1 |
| **44** | 171 | `!voterId` true in `getVotesForVoter` | Never called with `null`/`undefined`/`""` directly on store |
| **51** | 197 | `!amount \|\| amount <= 0` true in `submitVote` | Never called with amount 0 or negative |
| **54** | 206 | `normalizedTrust == null \|\| normalizedTrust < MIN_TRUST_TO_VOTE` true via normalization | Trust low/NaN/null path never fires (existing tests always pass 0.9+) |
| **57** | 215 | `budgetCheck.reason ?? 'Governance vote budget exhausted'` RHS | `budgetCheck.reason` is always provided in mocks |
| **58** | 216 | Same `??` RHS for throw | Same |
| **60** | 224 | `proposalTitle ?? curated.title ?? proposalId` — `curated.title` fallback | `proposalTitle` is always provided by the hook wrapper; `curated.title` is always present in seed data |
| **61** | 224 | `?? proposalId` fallback | Both `proposalTitle` and `curated.title` are always truthy |
| **62** | 233 | `proposalTitle ?? proposalId` — `proposalId` fallback | `proposalTitle` is always provided |
| **91** | 296 | `trustScore ?? null` — `null` fallback in hook wrapper's `submitVote` | `trustScore` is always provided as a number |

### 4.3 Uncovered Functions (FNDA:0)

| Function | Line | Why uncovered |
|----------|------|---------------|
| `getProposals` (store method) | 176 | Hook wrapper uses its own useMemo derivation, never calls store method |
| `getVotedDirections` (store method) | 182 | Same — hook uses its own useMemo derivation |
| `clearError` | 253 | Never called in any test |

---

## 5. Test Plan

All new tests go in `apps/web-pwa/src/hooks/useGovernance.test.ts`. Tests are
organized by group. Store-direct tests use `useGovernanceStore.getState().*`
(no React required). Hook tests use `renderHook`.

### 5.1 Storage Edge Cases — `readFromStorage` / `readStoreMap`

#### T1: `readFromStorage returns {} when storage contains non-object JSON`

- **Test name**: `readFromStorage returns {} for non-object JSON (string primitive)`
- **Setup**: `localStorage.setItem('vh_governance_votes:edge-voter', '"just a string"')`
- **Action**: Call `useGovernanceStore.getState().getVotesForVoter('edge-voter')`
- **Expected**: Returns `{}` — the `parsed && typeof parsed === 'object'` check
  returns false, hitting line 70.
- **Covers**: Lines 68 (parse executes), 70 (false-branch return); Branches 5, 6.
- **Refactor**: None.

#### T2: `readFromStorage returns {} for JSON number literal`

- **Test name**: `readFromStorage returns {} for JSON number literal`
- **Setup**: `localStorage.setItem('vh_governance_votes:num-voter', '42')`
- **Action**: Call `useGovernanceStore.getState().getVotesForVoter('num-voter')`
- **Expected**: Returns `{}`.
- **Covers**: Same branches, different primitive type for robustness.
- **Refactor**: None.

#### T3: `readStoreMap returns {} for non-object JSON in map key`

- **Test name**: `readStoreMap returns {} when map storage contains a JSON primitive`
- **Setup**: `localStorage.setItem('vh_governance_votes', '"not an object"')`; also set `sessionStorage` similarly.
- **Action**: Reset store with `useGovernanceStore.setState({ storedVotesMap: {}, ... })`; call `useGovernanceStore.getState().getVotesForVoter('any-voter')` — this invokes `loadStoredVotes` → `loadAllStoredVotes` → `readStoreMap`.
- **Expected**: Falls through to fallback, returns `{}`.
- **Covers**: Lines 84; Branch 13.
- **Refactor**: None.

#### T4: `readFromStorage returns {} when JSON parses to null`

- **Test name**: `readFromStorage returns {} when storage value is JSON null`
- **Setup**: `localStorage.setItem('vh_governance_votes:null-voter', 'null')`
- **Action**: Call `useGovernanceStore.getState().getVotesForVoter('null-voter')`
- **Expected**: Returns `{}` — `JSON.parse('null')` returns `null`, which fails
  the `parsed && typeof parsed === 'object'` check (falsy).
- **Covers**: Line 70; Branch 6 (reinforces).
- **Refactor**: None.

### 5.2 Storage Unavailability — `readFromStorage(undefined, ...)`, `readStoreMap(undefined)`, `save(undefined)`

#### T5: `readFromStorage returns {} when storage is undefined`

- **Test name**: `readFromStorage returns {} when storage is undefined`
- **Setup**: Mock `typeof sessionStorage` and `typeof localStorage` to be `'undefined'` — OR directly test by temporarily making globals undefined. In jsdom, can use `vi.stubGlobal('localStorage', undefined)`.
- **Action**: Reset store; access stored votes.
- **Expected**: All read paths gracefully return `{}`.
- **Covers**: Line 64 true-branch; Branch 3, 9, 29.
- **Note**: Stubbing globals is the most reliable approach. Alternatively, test
  `readFromStorage` and `readStoreMap` directly if exported (they're not — see §8).

> **Important**: These are private functions. The only way to reach them with
> `storage === undefined` is if `typeof localStorage === 'undefined'` or
> `typeof sessionStorage === 'undefined'`. In jsdom, both are always defined.
> This means branches 3, 9, 16, 17, 20, 21, 24, 26, 29 require either:
> (a) `vi.stubGlobal('localStorage', undefined)` + `vi.stubGlobal('sessionStorage', undefined)`, or
> (b) Exporting the functions for direct unit testing (minimal refactor).
>
> **Recommendation**: Use `vi.stubGlobal` approach — no production code changes needed.

#### T6: `storage globals undefined — full path`

- **Test name**: `gracefully handles undefined storage globals`
- **Setup**: `vi.stubGlobal('localStorage', undefined)` and `vi.stubGlobal('sessionStorage', undefined)`. Reset zustand store.
- **Action**: Call `useGovernanceStore.getState().getVotesForVoter('x')`.
- **Expected**: Returns `{}`.
- **Covers**: Branches 3, 9, 16, 17, 20, 21, 24, 26, 29.
- **Teardown**: `vi.unstubAllGlobals()`.
- **Refactor**: None.

#### T7: `persistStoredVotes is no-op when storage globals are undefined`

- **Test name**: `persistStoredVotes is no-op when storage globals are undefined`
- **Setup**: Stub globals undefined. Mock XP ledger. Use `useGovernanceStore.getState().submitVote(...)` with valid params.
- **Expected**: Vote succeeds in zustand state; no storage writes; no errors thrown.
- **Covers**: Branch 29 (`!storage` in `save()`); Branches 24, 26.
- **Refactor**: None.

### 5.3 `loadAllStoredVotes` Outer Catch (Lines 96–98)

#### T8: `loadAllStoredVotes outer catch returns {}`

- **Test name**: `loadAllStoredVotes catch returns {} on unexpected error`
- **Setup**: This catch block guards against errors from `readStoreMap` that
  shouldn't normally throw (it has its own catch). The only way to reach this
  is if the spread operator `{ ...localMap, ...sessionMap }` throws, or if
  `readStoreMap` somehow re-throws — both are practically unreachable.
- **Covers**: Lines 97–98; Branch 18.
- **Approach**: See §8 (Open Questions) — this branch is **likely unreachable**.
  Options: (a) mark as `/* istanbul ignore next */`, or (b) force it by mocking
  `Object.assign` to throw during the specific call (fragile), or (c) minor
  refactor to make testable.
- **Recommendation**: Mark as `/* v8 ignore next 2 */` with a code comment
  explaining the defensive nature. This is a 2-character production change.

### 5.4 `normalizeTrustScore` Branches (Lines 137–139)

#### T9: `normalizeTrustScore returns null for NaN`

- **Test name**: `submitVote rejects NaN trust score`
- **Setup**: Mock XP ledger. Call `useGovernanceStore.getState().submitVote({ ..., trustScore: NaN, voterId: 'v1' })`.
- **Expected**: Throws "Trust score below voting threshold"; store error is set.
- **Covers**: Line 137 (`Number.isNaN` true-branch); Branch 39; Lines 207–209.
- **Refactor**: None.

#### T10: `normalizeTrustScore clamps negative to 0 (below threshold)`

- **Test name**: `submitVote rejects negative trust score`
- **Setup**: Call `submitVote({ ..., trustScore: -0.5, voterId: 'v1' })`.
- **Expected**: `normalizeTrustScore(-0.5)` returns `0`, which is `< MIN_TRUST_TO_VOTE (0.7)` → throws.
- **Covers**: Line 138; Branch 40; Lines 207–209 (reinforced).
- **Refactor**: None.

#### T11: `normalizeTrustScore clamps >1 to 1 (above threshold, vote succeeds)`

- **Test name**: `submitVote accepts trust score > 1 (clamped to 1)`
- **Setup**: Mock XP ledger. Call `submitVote({ ..., trustScore: 5.0, voterId: 'v1' })`.
- **Expected**: `normalizeTrustScore(5.0)` returns `1`, which is `≥ 0.7` → vote succeeds.
- **Covers**: Line 139; Branch 41.
- **Refactor**: None.

#### T12: `submitVote rejects null trust score`

- **Test name**: `submitVote rejects null trust score`
- **Setup**: Call `submitVote({ ..., trustScore: null, voterId: 'v1' })`.
- **Expected**: Throws "Trust score below voting threshold".
- **Covers**: Branch 54 (`normalizedTrust == null`).
- **Refactor**: None.

#### T13: `submitVote rejects trust score below threshold (0.5)`

- **Test name**: `submitVote rejects trust score below MIN_TRUST_TO_VOTE`
- **Setup**: Mock XP ledger. Call `submitVote({ ..., trustScore: 0.5, voterId: 'v1' })`.
- **Expected**: `normalizeTrustScore(0.5)` returns `0.5`, which is `< 0.7` → throws.
- **Covers**: Branch 54 (the `< MIN_TRUST_TO_VOTE` sub-condition).
- **Refactor**: None.

### 5.5 Store Direct Methods — `getProposals`, `getVotedDirections`, `clearError`

#### T14: `store.getProposals returns seedProposals for null voterId`

- **Test name**: `store.getProposals returns seed proposals for null voterId`
- **Setup**: None (fresh store).
- **Action**: `useGovernanceStore.getState().getProposals(null)`.
- **Expected**: Returns the 2 seed proposals unchanged.
- **Covers**: Lines 177; Function `getProposals`.
- **Refactor**: None.

#### T15: `store.getProposals applies stored votes for valid voterId`

- **Test name**: `store.getProposals applies stored votes for valid voterId`
- **Setup**: Pre-populate `storedVotesMap` with a vote.
- **Action**: `useGovernanceStore.getState().getProposals('voter-x')`.
- **Expected**: Returns proposals with adjusted vote counts.
- **Covers**: Lines 178–180.
- **Refactor**: None.

#### T16: `store.getVotedDirections returns {} for null voterId`

- **Test name**: `store.getVotedDirections returns {} for null voterId`
- **Setup**: None.
- **Action**: `useGovernanceStore.getState().getVotedDirections(null)`.
- **Expected**: Returns `{}`.
- **Covers**: Lines 183; Function `getVotedDirections`.
- **Refactor**: None.

#### T17: `store.getVotedDirections returns directions for valid voterId`

- **Test name**: `store.getVotedDirections returns vote directions for valid voterId`
- **Setup**: Pre-populate `storedVotesMap`.
- **Action**: `useGovernanceStore.getState().getVotedDirections('voter-x')`.
- **Expected**: Returns `{ 'proposal-1': 'for' }` (or whatever was stored).
- **Covers**: Lines 184–189.
- **Refactor**: None.

#### T18: `store.clearError resets error to null`

- **Test name**: `store.clearError resets error to null`
- **Setup**: `useGovernanceStore.setState({ error: 'some error' })`.
- **Action**: `useGovernanceStore.getState().clearError()`.
- **Expected**: `useGovernanceStore.getState().error` is `null`.
- **Covers**: Lines 254–255; Function `clearError`.
- **Refactor**: None.

### 5.6 `submitVote` Edge Cases

#### T19: `submitVote returns void for amount 0`

- **Test name**: `submitVote is no-op for amount 0`
- **Setup**: Call `useGovernanceStore.getState().submitVote({ ..., amount: 0, voterId: 'v1', trustScore: 0.9 })`.
- **Expected**: Returns `undefined`; no state mutation.
- **Covers**: Line 197; Branch 51.
- **Refactor**: None.

#### T20: `submitVote returns void for negative amount`

- **Test name**: `submitVote is no-op for negative amount`
- **Setup**: Call with `amount: -5`.
- **Expected**: Returns `undefined`.
- **Covers**: Branch 51 (reinforces `amount <= 0`).
- **Refactor**: None.

#### T21: `getVotesForVoter returns {} for null/undefined/empty voterId`

- **Test name**: `store.getVotesForVoter returns {} for falsy voterId`
- **Setup**: None.
- **Action**: Call with `null`, `undefined`, and `""`.
- **Expected**: Returns `{}` each time.
- **Covers**: Branch 44 (`!voterId`).
- **Refactor**: None.

### 5.7 `??` Fallback Branches

#### T22: `budget denial uses default reason when reason is undefined`

- **Test name**: `submitVote uses default reason when budgetCheck.reason is undefined`
- **Setup**: Mock `canPerformAction` to return `{ allowed: false }` (no `reason`).
- **Expected**: Error message is `'Governance vote budget exhausted'`.
- **Covers**: Branches 57, 58 (lines 215–216 `?? 'Governance vote budget exhausted'`).
- **Refactor**: None.

#### T23: `curated title fallback chain — proposalTitle undefined, curated.title undefined`

- **Test name**: `submitVote falls through curated title fallback to proposalId`
- **Setup**: This requires a `proposalId` that exists in `CURATED_PROJECTS` but
  whose `curated.title` is undefined. Since `CURATED_PROJECTS` always has title
  set for proposal-1 and proposal-2, this branch is **unreachable** with current
  seed data.
- **Covers**: Branches 60, 61 (line 224).
- **Approach**: See §8 — either mark as `/* v8 ignore next */` or pass a
  non-curated `proposalId` to avoid entering the `if (curated)` block entirely
  (which doesn't help), or test via store direct call with `proposalTitle:
  undefined`.
- **Note**: Calling `submitVote` directly on the store bypasses the hook wrapper
  which always provides `proposalTitle`. So `proposalTitle` can be `undefined`.
  But `curated.title` is always truthy for seed proposals. To hit branch 61
  (`?? proposalId`), we need **both** `proposalTitle` and `curated.title` to be
  falsy, which can't happen with current `CURATED_PROJECTS` data. See §8.

#### T24: `proposalTitle ?? proposalId fallback (line 233)`

- **Test name**: `submitVote uses proposalId when proposalTitle is undefined`
- **Setup**: Call store's `submitVote` directly with `proposalTitle: undefined`
  and a non-curated proposalId (e.g., `'proposal-999'`).
- **Expected**: `lastAction` message uses the proposalId string.
- **Covers**: Branch 62 (line 233).
- **Refactor**: None.

#### T25: `trustScore ?? null in hook wrapper (line 296)`

- **Test name**: `hook submitVote passes null when trustScore is undefined`
- **Setup**: `renderHook(() => useGovernance('voter-1'))` — no `trustScore` arg.
- **Action**: Call `submitVote` — it will throw because trust is null.
- **Expected**: Throws "Trust score below voting threshold".
- **Covers**: Branch 91 (line 296 `trustScore ?? null`).
- **Refactor**: None.

### 5.8 `mergedFallback ?? {}` (Branch 22, Line 106)

#### T26: (Unreachable — see §8)

- `mergeVoteStores` always returns an object (`{ ...a, ...b }`). The `?? {}`
  is dead code.
- **Recommendation**: Add `/* v8 ignore next */` inline comment.

---

## 6. Acceptance Criteria

- [ ] 100% line coverage for `useGovernance.ts`
- [ ] 100% branch coverage for `useGovernance.ts`
- [ ] 100% function coverage for `useGovernance.ts`
- [ ] All global gates green: `pnpm typecheck`, `pnpm lint`, `pnpm test`
- [ ] Coverage threshold gate passes: `pnpm test --coverage`
- [ ] No behavior regressions (all 13 existing tests still pass)
- [ ] No store API or UI contract changes
- [ ] No runtime semantics changes (test-only additions)
- [ ] `vitest.config.ts` exclusion for `useGovernance.ts` is **removed** (line 86)
- [ ] Any `/* v8 ignore */` comments are documented and justified

---

## 7. Edge Cases / Abuse Cases

| Scenario | Expected Behavior | Test(s) |
|----------|-------------------|---------|
| Storage contains malformed JSON (`{broken`) | `readFromStorage` / `readStoreMap` catch fires, returns `{}` | Existing "survives storage errors" + T1–T4 |
| Storage contains JSON string `"hello"` | Non-object parse → `return {}` | T1 |
| Storage contains JSON number `42` | Non-object parse → `return {}` | T2 |
| Storage contains JSON `null` | `parsed` is falsy → `return {}` | T4 |
| `NaN` trust score | `normalizeTrustScore` returns `null` → rejects vote | T9 |
| Negative trust score (-0.5) | Clamped to 0 → below threshold → rejects vote | T10 |
| Trust score > 1 (e.g., 5.0) | Clamped to 1 → above threshold → vote succeeds | T11 |
| Null trust score | `normalizeTrustScore` returns `null` → rejects vote | T12 |
| Trust score just below threshold (0.69) | Normalized stays 0.69 → below 0.7 → rejects | T13 |
| Amount = 0 | `submitVote` early return, no mutation | T19 |
| Amount < 0 (e.g., -5) | `submitVote` early return, no mutation | T20 |
| Empty string voterId `""` | Falsy → returns `{}` / returns seed proposals | T21 |
| `localStorage` / `sessionStorage` undefined (SSR, non-browser) | All storage reads return `{}`, writes silently skip | T6, T7 |
| Budget denied without reason string | Falls back to `'Governance vote budget exhausted'` | T22 |
| `proposalTitle` undefined on store direct call | Falls back to `proposalId` in lastAction | T24 |
| `trustScore` arg omitted from hook | `undefined ?? null` → `null` → rejected | T25 |

---

## 8. Open Questions — Unreachable Branches

### 8.1 `loadAllStoredVotes` Outer Catch (Lines 96–98, Branch 18)

`readStoreMap` has its own try/catch and always returns an object. The only way
the outer catch fires is if the spread operator `{ ...localMap, ...sessionMap }`
throws — which cannot happen for plain objects.

**Recommendation**: Add `/* v8 ignore next 2 */` above line 96 with a comment:
```ts
} catch /* v8 ignore next 2 */ {
    return {};
  }
```
**Justification**: Defensive programming pattern. Removing the catch would be a
behavioral change; ignoring it is the least-invasive option.

### 8.2 `mergedFallback ?? {}` (Line 106, Branch 22)

`mergeVoteStores` always returns `{ ...a, ...b }` which is never `null` or
`undefined`. The `?? {}` is unreachable.

**Recommendation**: Add `/* v8 ignore next */` inline or change to:
```ts
return combinedMap[voterId] ?? mergedFallback;
```
(Removing the `?? {}` is safe since `mergeVoteStores` guarantees an object.)

### 8.3 Curated Title Triple-Fallback (Line 224, Branches 60–61)

```ts
const title = proposalTitle ?? curated.title ?? proposalId;
```
All entries in `CURATED_PROJECTS` have `title` defined. The `?? proposalId`
fallback is unreachable with current data. The `?? curated.title` path is
reachable by calling the store directly with `proposalTitle: undefined` (T24
handles the outer `proposalTitle ?? proposalId` on line 233).

**Recommendation**: For branch 60 (`curated.title` fallback), call store
directly with `proposalTitle: undefined` for a curated proposalId — this
will use `curated.title`. For branch 61 (`proposalId` fallback), add
`/* v8 ignore next */` since `curated.title` is always truthy for seed data,
OR add a test that temporarily patches `CURATED_PROJECTS` to have
`title: undefined` for a proposal. The patch approach is preferred for
genuine 100% coverage.

---

## 9. Touched-File Plan

| File | Change Type | Description |
|------|-------------|-------------|
| `apps/web-pwa/src/hooks/useGovernance.test.ts` | **Modified** | Add ~15–20 new test cases (estimated +150–200 LOC) |
| `vitest.config.ts` | **Modified** | Remove line 86 (`'apps/web-pwa/src/hooks/useGovernance.ts'` exclusion) |
| `apps/web-pwa/src/hooks/useGovernance.ts` | **Minimally modified** | Add 2–3 `/* v8 ignore */` comments for provably unreachable branches (§8.1, §8.2, optionally §8.3). **No behavioral changes.** |

---

## 10. Test Summary Matrix

| ID | Test Name | Target Lines | Target Branches | Requires Refactor |
|----|-----------|-------------|-----------------|-------------------|
| T1 | readFromStorage returns {} for non-object JSON (string) | 68, 70 | 5, 6 | No |
| T2 | readFromStorage returns {} for JSON number literal | 68, 70 | 5, 6 | No |
| T3 | readStoreMap returns {} for non-object JSON | 84 | 13 | No |
| T4 | readFromStorage returns {} for JSON null | 70 | 6 | No |
| T5 | readFromStorage returns {} when storage undefined | 64 | 3 | No |
| T6 | gracefully handles undefined storage globals | — | 3,9,16,17,20,21,24,26,29 | No (vi.stubGlobal) |
| T7 | persistStoredVotes no-op when globals undefined | — | 24,26,29 | No (vi.stubGlobal) |
| T8 | loadAllStoredVotes outer catch (UNREACHABLE) | 97–98 | 18 | v8 ignore |
| T9 | submitVote rejects NaN trust score | 207–209 | 39, 54 | No |
| T10 | submitVote rejects negative trust score | 207–209 | 40, 54 | No |
| T11 | submitVote accepts trust > 1 (clamped) | 139 | 41 | No |
| T12 | submitVote rejects null trust score | 207–209 | 54 | No |
| T13 | submitVote rejects trust below threshold | 207–209 | 54 | No |
| T14 | store.getProposals returns seeds for null | 177 | — | No |
| T15 | store.getProposals applies stored votes | 178–180 | — | No |
| T16 | store.getVotedDirections returns {} for null | 183 | — | No |
| T17 | store.getVotedDirections returns directions | 184–189 | — | No |
| T18 | store.clearError resets error | 254–255 | — | No |
| T19 | submitVote no-op for amount 0 | 197 | 51 | No |
| T20 | submitVote no-op for negative amount | 197 | 51 | No |
| T21 | store.getVotesForVoter returns {} for falsy | — | 44 | No |
| T22 | budget denial default reason fallback | 215–216 | 57, 58 | No |
| T23 | curated title fallback (PARTIALLY UNREACHABLE) | 224 | 60, 61 | v8 ignore for 61 |
| T24 | proposalTitle ?? proposalId fallback | 233 | 62 | No |
| T25 | hook trustScore ?? null fallback | 296 | 91 | No |
| T26 | mergedFallback ?? {} (UNREACHABLE) | 106 | 22 | v8 ignore |

---

## 11. Rollout / Migration Notes

- **No feature flags** required — this is a test-only change.
- **Back-compatibility**: No API changes; the hook and store signatures are unchanged.
- **Failure modes**: None — only test file and coverage config are modified.
- **CI impact**: Removing the `useGovernance.ts` exclusion from `vitest.config.ts`
  means coverage will now be enforced for this file. If any future change breaks
  coverage, CI will catch it.
- **v8 ignore comments**: If the implementation uses `/* v8 ignore */` for
  unreachable branches (§8), those must be reviewed in PR to ensure they are
  genuinely unreachable and not masking real gaps.

---

## 12. Implementation Priority

Recommended order for the implementation agent:

1. **Remove exclusion** from `vitest.config.ts` (line 86).
2. **Add store-direct tests** (T14–T18, T19–T21) — easiest, no mocks needed.
3. **Add normalizeTrustScore tests** (T9–T13) — straightforward store calls.
4. **Add storage edge-case tests** (T1–T4) — localStorage manipulation.
5. **Add storage-undefined tests** (T6, T7) — `vi.stubGlobal` pattern.
6. **Add ?? fallback tests** (T22, T24, T25) — mock setup.
7. **Add v8 ignore comments** for unreachable branches (T8, T23/branch-61, T26).
8. **Verify**: Run `pnpm vitest run apps/web-pwa/src/hooks/useGovernance.test.ts --coverage` and confirm 100%/100%/100%.
9. **Run full gates**: `pnpm typecheck && pnpm lint && pnpm test --coverage`.