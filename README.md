# TRINITY / VENN-HERMES Monorepo

This monorepo contains the Guardian Node stack, client applications, shared packages, and infrastructure for the TRINITY Bio-Economic OS. See `System_Architecture.md` (root) for the single source of truth.

## Quickstart (Guardian Node)

```bash
# 1) Install pnpm & Node 20 (via corepack)
# 2) Clone repo and cd into it

# Generate secrets
pnpm vh bootstrap init --force

# Start stack (Traefik, MinIO, relay, TURN, Anvil, attestation verifier)
pnpm vh bootstrap up

# Run the PWA in dev mode (stack should be up)
pnpm vh dev
```

Services exposed (default localhost):
- Traefik: http://localhost:8080 (dashboard: 8081)
- MinIO: http://localhost:9001
- TURN: 3478/udp,tcp
- Anvil: http://localhost:8545

## Documentation
- System architecture: `System_Architecture.md`
- Sprint 0 checklist: `docs/00-sprint-0-foundation.md`
- Architecture lock: `docs/ARCHITECTURE_LOCK.md`

## Contributing
See `CONTRIBUTING.md` for guardrails (200% coverage, 350 LOC cap) and workflow expectations.
