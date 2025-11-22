# @vh/gun-client

Gun client wrapper enforcing isolation, hydration barriers, and testability.

## Hydration Barrier
- All reads/writes await `hydrationBarrier.prepare()` to prevent stale local state from overwriting remote data.
- Writes perform a `once` read (wait-for-remote) before `put`.

## Session & Linking
- `createSession` (in `auth.ts`) gates usage on trustScore.
- `linkDevice(deviceKey)`:
  - Requires a ready session (unless `requireSession === false`).
  - Waits for remote hydration, then writes to `user.devices.<deviceKey>` with a `linkedAt` timestamp.

## True Offline Mode
- Pass `requireSession: false` and `peers: []` in E2E/Offline contexts to avoid network.

## Development Notes
- Do not import `gun` elsewhere; this package remains the single Gun entry point.
- Tests run against `src/` via Vitest with strict mocks; no dist usage.
