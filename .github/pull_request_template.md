## Summary
- [ ] Briefly describe what changed and why.

## Scope
- [ ] No unrelated file changes in this PR.
- [ ] This PR stays within one coherent slice.

## Wave 1 Branch/Ownership Contract
- [ ] Branch name uses allowed prefix: `team-a/*`, `team-b/*`, `team-c/*`, `team-d/*`, `team-e/*`, or `coord/*`.
- [ ] If using `coord/*`, coordinator rationale is included below.
- [ ] Changed files are within owned paths per `.github/ownership-map.json`.
- [ ] `Ownership Scope` check is expected to pass for this branch.

## Target Branch
- [ ] Wave 1 implementation PR targets `integration/wave-1` (not `main`).
- [ ] If this PR targets `main`, explain why it is not a Wave 1 implementation slice.

## Feature Flags (if applicable)
- [ ] New V2 behavior is guarded by required flags:
  - `VITE_TOPIC_SYNTHESIS_V2_ENABLED`
  - `VITE_FEED_V2_ENABLED`
- [ ] Existing behavior remains intact when flags are `false`.

## Testing
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test:quick`
- [ ] `pnpm test:coverage` (or justified exception)

## Coordinator Rationale (required for `coord/*` branches)
<!-- Explain why this change crosses team boundaries or needs coordinator ownership. -->
