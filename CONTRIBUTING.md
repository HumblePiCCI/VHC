# Contributing

This project enforces strict guardrails to maintain security, clarity, and testability.

## Guardrails
- **200% Coverage Expectation:** Every requirement should have positive + negative tests. Aim for full coverage on new code; no net coverage drops are allowed.
- **350 LOC Hard Cap:** Source files must not exceed 350 lines (tests/types exempt). Warn at 250, fail at 350 in lint/CI. Split modules aggressively.
- **Zero-Trust / Local-First:** Do not introduce server-side statefulness or plaintext handling. All sensitive data stays local or is E2E encrypted.

## Workflow
- Use pnpm and Node 20 (see `.nvmrc` once added).
- Run `pnpm lint`, `pnpm test:quick`, and `pnpm build` before sending a PR.
- Avoid direct Node APIs in browser code (`apps/*`, `packages/ui`); keep module boundaries clean.

## Getting Started
```bash
pnpm install
pnpm vh bootstrap init --force
pnpm vh bootstrap up
pnpm vh dev
```

## Tests & CI
- Quick tests: `pnpm test:quick`
- Dependency graph check: `pnpm deps:check`
- CI mirrors these steps (see `.github/workflows/main.yml`).
