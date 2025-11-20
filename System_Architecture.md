SYSTEM_ARCHITECTURE.md:


VENN/HERMES – System & Development Plan (Source of Truth)

Version: 0.0.1
Status: APPROVED FOR DEVELOPMENT


1. Purpose & Scope

VENN/HERMES is a privacy-first, peer-to-peer (P2P) communication and civic engagement platform.
This document is the Single Source of Truth for the system. It assumes a greenfield start. To ensure high-velocity development via AI agents, strict adherence to the modularization and testing constraints defined here is mandatory.
The Goal: By the completion of Milestone F, the system must be running, shippable, and production-ready.
Visual Context:


2. Core Principles & Constraints


2.1 Zero-Trust Architecture

	•	Untrusted Transport: Servers (Relays, TURN, Aggregators) are treated as hostile. They transport encrypted blobs but must never possess the keys to decrypt them.
	•	E2EE Invariant: Compromise of any infrastructure component must not allow decryption of current or historical data.
	•	Forward Secrecy: Implementation of Double Ratchet is mandatory. If a user’s device key is compromised today, past messages must remain unreadable.

2.2 Local-First Data

	•	Primary Source: The client device (IndexedDB + CRDT) is the source of truth.
	•	Offline-First: The application must be fully functional (read/write) while offline. Writes are queued and synchronized opportunistically.
	•	Conflict Resolution:
	◦	Lamport Timestamps + Last-Write-Wins (LWW) for general data.
	◦	CRDT sets for lists.
	◦	HRW (Highest Random Weight) actor for sentiment aggregation.

2.3 AI-Driven Development Constraints

	•	Strict Modularization: AI agents degrade in performance as context grows.1 Small, self-contained modules allow agents to work with perfect context.
	•	LOC Caps (Strictly Enforced):
	◦	Soft Cap: 250 lines per file.
	◦	Hard Cap: 350 lines per file.
	◦	Exemptions: *.test.ts, *.test.tsx, *.stories.tsx, and pure types/*.ts files are exempt from the hard cap to allow for exhaustive testing and type definitions.
	•	Test-Led: No code is written without a failing test defined first.


3. Tech Stack


3.1 Core Runtime

	•	Language: TypeScript 5.x (Strict Mode + noImplicitAny + noUncheckedIndexedAccess).
	•	Runtime: Node.js 20 LTS (Dev/Build), Browser (Production).
	•	Bundler: Vite 5.x.
	•	Test Runner:
	◦	Vitest: Unit and Integration tests (replacing Jest).
	◦	Playwright: E2E browser tests.

3.2 Frontend (Apps)

	•	Framework: React 18.
	•	Routing: TanStack Router (Type-safe).2
	•	State Management:
	◦	Zustand: Transient UI state (modals, inputs).
	◦	TanStack Query: Async server interactions (health checks).
	◦	useVennStore: Custom hooks wrapping the CRDT/GUN layer.
	•	Platforms:
	◦	Web PWA (Primary).
	◦	Mobile: Capacitor (wrapping PWA).
	◦	Desktop: Tauri (wrapping PWA).

3.3 Data & Cryptography

	•	Sync Engine: GUN (wrapped strictly in @venn-hermes/gun-client).
	•	CRDTs: Custom LWW and Sets layered over GUN.
	•	Crypto Primitives: @venn-hermes/crypto.
	◦	Web: window.crypto.subtle.3
	◦	Tests: node:crypto.
	◦	Algorithms: X3DH, Double Ratchet, XChaCha20-Poly1305 / AES-GCM.

3.4 Secure Storage (Key Material)

	•	Web: IndexedDB (standard) or Origin-Private File System.
	•	Mobile (Capacitor): capacitor-secure-storage (Required for root keys).
	•	Desktop (Tauri): OS Keychain via Tauri plugin.


4. Repository Layout (Monorepo)

Managed via pnpm workspaces.
Plaintext

/
├── apps/
│   ├── web-pwa/            # Main React Application
│   ├── mobile/             # Capacitor Shell
│   └── desktop/            # Tauri Shell
├── packages/
│   ├── types/              # Zod schemas & TS Interfaces (No dependencies)
│   ├── crypto/             # E2EE primitives (Deps: types)
│   ├── crdt/               # Lamport, LWW, Vector Clocks (Deps: types)
│   ├── gun-client/         # The ONLY package allowed to touch 'gun'
│   ├── data-model/         # High-level Entities (Msg, Post) (Deps: crdt)
│   ├── ui/                 # Atomic Design Components (Deps: types)
│   └── e2e/                # Playwright Specs
├── services/               # Dockerized Microservices
│   ├── bootstrap-relay/    # Initial peer discovery
│   ├── turn/               # CoTURN config
│   └── object-store/       # MinIO config
├── infra/                  # Terraform, K8s, Docker Compose
├── config/                 # Shared runtime configuration
└── tools/                  # CLI, Scripts, Linting


5. Coding Standards & Quality Gates


5.1 The "250/350" Rule

	•	Enforcement: Custom ESLint rule or pre-commit hook.
	•	Remediation: If a file hits 350 lines:
	1	Extract sub-components into separate files.
	2	Move utility functions to utils.ts.
	3	Move types to types.ts.
	4	Create custom hooks for logic extraction.

5.2 Module Boundaries

	•	Barrel Files: index.ts only exports. No implementation.
	•	Circular Dependencies: Strictly forbidden. Validated by madge or dpdm in CI.
	•	Browser Discipline: No Node.js built-ins (Buffer, process, fs) allowed in apps/* or packages/ui.

5.3 "200% Coverage" Strategy

To achieve the goal of 200% coverage, we distinguish between two metrics:
	1	100% Code Coverage: Every line, branch, and function is executed by Vitest.
	2	100% Behavior Coverage: Every requirement in the feature spec has a corresponding positive test (it works) and negative test (it fails gracefully).


6. Infrastructure & Services


6.1 Home Server Stack (Dev/Prod Pattern)

Defined via infra/docker/docker-compose.yml:
	•	Reverse proxy + ACME
	•	bootstrap-relay
	•	gun-peer (Super-peer, cannot decrypt data)
	•	aggregator-headlines
	•	analysis-relay
	•	coturn
	•	minio
	•	ca

6.2 vh CLI

Located in tools/scripts/vh:
	•	vh bootstrap init: Generate secrets and config.
	•	vh bootstrap up: Start Docker stack.
	•	vh bootstrap check: Validate HTTPS, WS, TURN, MinIO.
	•	vh bootstrap join: Fetch registries and join mesh.
	•	vh keys rotate: Key rotation.
	•	vh dev: Start stack + PWA.
	•	vh test:quick: Typecheck + Lint + Unit Tests.


7. Key Packages Implementation Details


7.1 @venn-hermes/gun-client (The Anti-Corruption Layer)

	•	Strict Isolation: This is the ONLY package allowed to import gun.
	•	Responsibilities:
	◦	Configure/Connect to GUN peers.
	◦	Wire Storage Adapters (IndexedDB).
	◦	Manage "Hydration Barrier" (Read before Write).
	◦	Implement Graph Pruning (Memory management).
	•	Sub-modules:
	◦	messaging/gateway.ts: Ingest, De-dup, Status Upgrade.
	◦	messaging/sessions.ts: X3DH, Double Ratchet.
	◦	messaging/attachments.ts: Chunking, Encryption, Pointer Fallback.
	◦	outbox/: Queue, Caps, Backoff.

7.2 @venn-hermes/crypto

	•	Primitives: Ed25519, X25519, XChaCha20-Poly1305, AES-GCM, HKDF.
	•	Envelopes: Versioned (v1/v2) with deterministic AADs.
	•	Validation: All signatures verified before use. Negative tests required.


8. Milestones & Deliverables


Milestone A – Home Server Bring-Up

Objective: Provision a repeatable, secure home server stack.
	•	DoD: vh bootstrap check passes. Two independent peers reachable. TURN verified.

Milestone B – Communication Vertical

Objective: E2EE Messaging, Attachments, Forums, Docs.
	•	DoD: Two peers can exchange E2EE DMs and Attachments (with pointer fallback) while offline/online. 100% coverage.

Milestone C – Headlines, Analysis, Sentiment

Objective: Privacy-preserving feed and sentiment aggregation.
	•	DoD: Client functions without aggregator (Peer-only). Sentiment aggregates deterministically.

Milestone D – Moderation & Verified Identity

Objective: Verifiable Credentials (VCs) and Moderation.
	•	DoD: Users can present VCs. Revocation works. Moderation is explainable client-side.

Milestone E – Unified UX

Objective: Unified Feed, Navigation, Offline/Logout semantics.
	•	DoD: Unified entrypoint. Clear offline indicators. Secure Logout/Wipe.

Milestone F – Hardening

Objective: Performance, A11y, Acceptance Harness.
	•	DoD: Perf budgets met. axe-core clean. Chaos tests passing. SLSA-3 provenance.


9. CI/CD & Quality Gates


9.1 Commands

	•	pnpm test:quick: Typecheck, Lint, Unit Tests.
	•	pnpm test:workflow: Full CI run via Act.
	•	pnpm test:e2e: Playwright against local stack.

9.2 PR Blocking Gates

	•	Build: All workspaces build.
	•	Lint: Zero ESLint errors. No LOC violations. No Circular Deps.
	•	Tests: 100% Line/Branch coverage on changed packages.
	•	Web Vitals: Lighthouse ≥ 90 (Perf, A11y, SEO).
	•	Bundle Size: PWA ≤ 1 MiB gzipped.


10. Risks & Mitigations

	1	Lamport Overflow: Hard bounds and guards in @venn-hermes/crdt.
	2	TURN Costs: Autoscaling, pointer fallback, rate limits.
	3	GUN Complexity: Strict isolation via gun-client wrapper.
	4	AI Code Drift: Enforce module boundaries and LOC caps via CI.


11. Prompting Context for AI Agents

Copy and paste this section as the System Prompt for any AI agent working on this codebase.
Plaintext

You are an expert TypeScript developer working on VENN/HERMES.

Constraint Checklist & Confidence Score:
1. Privacy-First: User data is E2EE. Servers are untrusted.
2. Modular: Files MUST NOT exceed 350 LOC (Hard Cap). Exemptions: Tests and Types.
3. Tech Stack: React, Vite, Vitest, Playwright, Zustand, TanStack Query.
4. GUN Isolation: GUN may ONLY be imported inside @venn-hermes/gun-client.
5. Testing: 100% coverage required. Write tests BEFORE implementation.
6. No Node.js APIs in frontend code. Use Web Standards.

Current Task: [Insert Task]
Provide the file structure first, then the implementation.
