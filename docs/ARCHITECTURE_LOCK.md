# Architecture Lock

This document summarizes the non-negotiable guardrails for the TRINITY Bio-Economic OS.

## Zero-Trust
- Assume all network paths are untrusted; authenticate and authorize every request.
- Secrets are local; no plaintext leaves the device. Use hardware-bound keys where available.
- Services treat each other as hostile by default; prefer capability-scoped tokens.

## Local-First
- Data is authored, stored, and processed on the user’s device; the cloud is a relay only.
- Sync is opt-in and encrypted end-to-end; never rely on server-side truth.
- Offline operation is mandatory; hydration barriers prevent clobbering local state with empty remote graphs.

## 350 LOC Limit
- Hard cap: 350 lines per source file (tests/types exempt). Soft warn at 250.
- Enforce via lint/CI; split modules aggressively to maintain clarity and reviewability.

## 4. CI/CD & Tooling Guardrails (Added Sprint 0)

### 4.1 Single Source of Truth for Tooling
- Rule: Never hardcode package manager versions in YAML workflows.
- Implementation: `package.json` defines `packageManager: "pnpm@x.y.z"`. CI workflows must use `pnpm/action-setup` with no version argument to respect this lock.

### 4.2 Source-Based Testing (The "No-Build" Rule)
- Problem: Monorepos often fail in CI because Package A tests run before Package B is built.
- Rule: Unit tests (`pnpm test:quick`) must run against TypeScript source (`src/`), not built artifacts (`dist/`).
- Implementation:
  - `vitest.config.ts` must configure aliases mapping `@vh/*` -> `./packages/*/src/index.ts`.
  - This keeps tests fast and eliminates dependency on prebuilt artifacts.

### 4.3 Strict Test Segmentation
- Rule: Unit Tests (Vitest) and E2E Tests (Playwright) must never overlap.
- Implementation:
  - `vitest.config.ts` explicitly excludes `packages/e2e` and `node_modules`.
  - `test:quick` runs Vitest. `test:e2e` runs Playwright. They share no config.
