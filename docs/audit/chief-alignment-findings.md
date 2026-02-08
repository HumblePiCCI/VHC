# TRINITY Alignment Audit — Chief Findings

**Auditor:** Chief of Ship  
**Date:** 2026-02-08  
**Source Set:** 22 foundational docs + specs (full list in scope lock)  
**Baseline:** main at `662b7fa`

---

## Executive Summary

### Philosophical Alignment
TRINITY's philosophical foundation is **strong and internally coherent**. The dignity-first framing (human agency over extraction, verified intent as the scarce resource, local-first sovereignty) is consistent from the project brief through the whitepapers to the specs. The system explicitly rejects surveillance capitalism and designs for human oversight at every layer. The familiar/delegation model correctly subordinates agents to human principals with budget inheritance, scope attenuation, and revocability. **No extractive or coercive mechanics were found.**

The primary philosophical risk is the gap between LUMA's sovereignty promises (ZK residency, holographic vectors, hardware attestation) and the current stub reality (device-bound nullifier, token-length trust scoring). This is an **acknowledged, intentional gap** (Season 0 = rails first, real crypto later), but the whitepapers could be more explicit about the timeline dependency.

### Technical Alignment
The codebase is **well-aligned with specs for implemented features** (sentiment, XP ledger, budgets, forum, messaging, analysis pipeline) — 100% test coverage and strict guardrails are real. However, there is **significant drift between whitepaper ambitions and implementation reality** in identity (LUMA), economics (GWC deployment), and AI (engine mocked). STATUS.md does an excellent job surfacing these gaps honestly. The main risk is that the whitepapers read as present-tense claims when the features are future-tense.

### Verdict: **Mostly Aligned**, with conditions:
1. Whitepapers need temporal markers (vision vs. implemented vs. planned)
2. Sprint roadmap in System_Architecture is stale (still references week numbers from 2025)
3. A few terminology inconsistencies need standardization
4. The risks.md file is significantly underpowered vs. the actual risk landscape

---

## 1. Alignment Matrix

| # | Area | Canonical Claim | Evidence | State | Severity | Action |
|---|------|----------------|----------|-------|----------|--------|
| A1 | Identity — Sybil Defense | "One human, one DDNA" (LUMA WP §2.1) | `main.rs:162` — SHA256(device_key), no uniqueness check (STATUS.md LUMA table) | **Drift** | Must | Add temporal disclaimer to LUMA WP; ensure STATUS warning propagates to any user-facing docs |
| A2 | Identity — Trust Score | "trustScore derived from hardware attestation" (System_Architecture §4.1.5) | `main.rs:105-116` — token length/prefix heuristic (STATUS.md "Current Trust Score Logic") | **Drift** | Must | Label attestation verifier as DEV ONLY in code + docs |
| A3 | Identity — VIO Liveness | "VIO scan signed by TEE" (LUMA WP §3.1, System_Architecture §4.1) | No VIO code exists (STATUS.md LUMA feature table) | **Acknowledged Gap** | Should | Already tracked in STATUS; no action needed beyond temporal markers in WP |
| A4 | Economics — RVU Deployment | "Season 0: Execution Phase" (GWC WP header) | Only localhost deployment exists (STATUS.md Deployment Status) | **Drift** | Should | GWC WP "Execution Phase" header is misleading — contracts exist but aren't deployed beyond localhost |
| A5 | Economics — Index Logic | "S(t)=I(t) through triple-lock" (GWC WP §2.2) | GWC WP §2.2 "Season 0 Implementation" correctly notes v0 is simplified | **Aligned** | — | No action — WP self-corrects |
| A6 | AI Engine | "WebLLM (WASM) running local inference" (System_Architecture §3.1) | `worker.ts:6-23` — hardcoded mock (STATUS.md VENN table) | **Drift** | Must | System_Architecture §3.1 states WebLLM as current tech; should note it's target, not current |
| A7 | Analysis — First-to-File | "Canonical analysis is first-to-file" (canonical-analysis-v1 §4) | `analysis.ts:30-48` — getOrGenerate implements first-to-file (STATUS.md) | **Aligned** | — | — |
| A8 | Sentiment — Civic Decay | Formula: `E_new = E_current + 0.3 * (2.0 - E_current)` (spec-civic-sentiment §4) | Implemented in decay.ts + tested (requirements-test-matrix) | **Aligned** | — | — |
| A9 | Budgets — All 8 Keys | "8 budget action keys" (spec-xp-ledger-v0 §4) | All 8 wired per STATUS.md (PRs #51-#107) | **Aligned** | — | — |
| A10 | Privacy — Topology | "SentimentSignal MUST NOT be stored in plaintext on mesh" (spec-data-topology-privacy §2) | topology.test.ts enforces this (requirements-test-matrix) | **Aligned** | — | — |
| A11 | Delegation — Familiar Types | "FamiliarRecord, DelegationGrant, OnBehalfOfAssertion" (spec-identity-trust-constituency §6) | Types + Zod schemas defined (PR #48, STATUS.md) | **Aligned** | — | Runtime pending but types are correct |
| A12 | Forum — Unified Topics | "Headlines and threads share topicId" (spec-hermes-forum §2.1.1) | Schema + derivation + Feed↔Forum integration done (PRs #78/#81, STATUS.md) | **Aligned** | — | — |
| A13 | Messaging — E2EE | "All private messages are E2EE" (spec-hermes-messaging §1) | SEA shared secret encryption implemented (hermesCrypto.ts, STATUS.md) | **Aligned** | — | — |
| A14 | CSP — Guardrails | "No inline scripts" (ARCHITECTURE_LOCK §2.4) | CSP meta tag enforced + tested (PR #45, CSP_HEADER_MIGRATION.md) | **Aligned** | — | — |
| A15 | Civic Action Kit | "Facilitation model (reports + native intents)" (spec-civic-action-kit §1) | Stub only (STATUS.md Bridge table) | **Acknowledged Gap** | — | Sprint 5 scope; properly tracked |
| A16 | HERMES Docs | "CRDT collaborative docs" (spec-hermes-docs §1) | Not implemented (STATUS.md) | **Acknowledged Gap** | — | Sprint 5 scope; properly tracked |
| A17 | Sprint Roadmap | "Sprint 1 (Weeks 7-12)" with specific deliverables (System_Architecture §5) | Sprint numbering and week ranges are 2025-era; current work is Sprint 4 | **Drift** | Should | Update roadmap or note it's historical planning, not current schedule |
| A18 | Governance — QF | "Quadratic Funding" (GWC WP §2, spec-rvu-economics §4) | Contract exists + tested; public UI is off-chain simulation only (STATUS.md) | **Aligned** | — | Correctly described in spec §4 Season 0 scope |
| A19 | Constituency — District Aggregates | "District-level sentiment aggregation" (Hero_Paths §1.1.5, spec-civic-sentiment §8) | No RegionProof generation or aggregation implemented (STATUS.md) | **Acknowledged Gap** | Should | Hero_Paths reads as if this works; needs "planned" markers |
| A20 | Reanalysis Epochs | "Frame/Reframe table updates after N posts" (Hero_Paths §1.2.2.1, canonical-analysis-v2 §4.3) | No reanalysis loop or digest types exist (STATUS.md "Docs vs Code" table) | **Acknowledged Gap** | — | Correctly tracked in STATUS outstanding work |

---

## 2. Contradiction Register

| # | Contradiction | File A (Authoritative) | File B (Stale/Misaligned) | Rationale |
|---|--------------|----------------------|--------------------------|-----------|
| C1 | Sprint roadmap uses week ranges ("Weeks 7-12") suggesting active timeline | `STATUS.md` Sprint Completion Status (authoritative — reflects reality) | `System_Architecture.md` §5 (stale — uses week numbers from initial planning) | STATUS is truth; System_Architecture roadmap should be marked historical |
| C2 | System_Architecture §3.1 lists "WebLLM (WASM)" under Client-Side as if current | `STATUS.md` VENN table + AI_ENGINE_CONTRACT implementation note (authoritative) | `System_Architecture.md` §3.1 (misleading — reads as current tech) | Add "(target)" annotation |
| C3 | GWC WP header says "Status: Execution Phase (Season 0)" | `STATUS.md` GWC section (authoritative — contracts undeployed beyond localhost) | `GWC_BriefWhitePaper.md` header (misleading — "Execution Phase" implies live) | WP should note execution phase = development, not production |
| C4 | Hero_Paths §1.1.5 describes district dashboard as user-visible feature | `STATUS.md` Constituency Proofs section (authoritative — not implemented) | `Hero_Paths.md` §1.1.5 (reads as current; should note "planned") | Hero Paths is a target storyboard but reads present-tense |
| C5 | risks.md has only 5 items; System_Architecture §7 has 11; STATUS has a detailed security section | `System_Architecture.md` §7 + `STATUS.md` Security Considerations (authoritative) | `risks.md` (significantly underpowered, missing major risks) | risks.md should be deprecated or brought to parity with System_Architecture §7 |
| C6 | TESTING_STRATEGY.md CI pipeline shows `node-version: 20` | Runtime info shows `node=v22.22.0` | `TESTING_STRATEGY.md` CI example (stale) | Update CI example to match actual node version |
| C7 | requirements-test-matrix references `useSentimentState.test.ts` path | Actual file location may have shifted during refactors | `requirements-test-matrix.md` (potentially stale paths) | Spot-check paths; matrix is draft status |
| C8 | spec-hermes-forum §7 shows "Comment Persistence (Phase 4.3 — IN PROGRESS)" | Forum implementation is marked 🟢 in STATUS.md | `spec-hermes-forum.md` §7 checklist (stale — still shows incomplete items) | Forum spec checklist should be updated to match STATUS reality |

---

## 3. Terminology Issues

| # | Term Variants | Files | Recommendation |
|---|--------------|-------|----------------|
| T1 | `trustScore` (0..1) vs `scaledTrustScore` (0..10000) | Consistently used across all specs ✅ | No action — well defined |
| T2 | `nullifier` / `principalNullifier` / `UniquenessNullifier` | spec-identity-trust-constituency defines all three; usage is mostly consistent | **Nit**: `principalNullifier` should always be used when discussing delegation context; `nullifier` alone when identity context. Document this in a terminology glossary. |
| T3 | `topicId` vs `urlHash` | spec-hermes-forum §2.1.1 clearly defines: topicId = urlHash for URL topics, sha256(prefix+threadId) for native threads | No action — well defined |
| T4 | `constituency_proof` (snake_case in TS interfaces) vs `ConstituencyProof` (PascalCase type) | Mixed across specs — interfaces use snake_case field, type alias uses PascalCase | **Nit**: This is standard TS practice (interface fields snake_case for wire format, type PascalCase for language-level). Acceptable. |
| T5 | `district_hash` vs `districtHash` | `SentimentSignal.constituency_proof.district_hash` (snake_case) vs `Representative.districtHash` (camelCase) | **Should**: Inconsistent casing between civic-sentiment spec and civic-action-kit spec. Standardize to one convention. |
| T6 | Budget key `analyses/day` — slash in key name | Used consistently as `analyses/day` across spec-xp-ledger and implementation | No action — slash convention is intentional and consistent |
| T7 | "Season 0" usage | Consistent across all docs ✅ | No action |
| T8 | `HERMES` vs `AGORA` distinction | spec-hermes-forum §3.1 defines HERMES = Communications, AGORA = Governance (Sprint 5+) | **Should**: System_Architecture doesn't mention AGORA at all. This term appears only in forum spec and civic-action-kit spec. Either formalize it in System_Architecture or remove it. |

---

## 4. Decision Log Proposal

### Source-of-Truth Precedence Order

1. **ARCHITECTURE_LOCK.md** — Non-negotiable guardrails (highest authority)
2. **Canonical specs** (`docs/specs/spec-*.md`, `canonical-analysis-*.md`) — Normative contracts for each subsystem
3. **AI_ENGINE_CONTRACT.md** — AI pipeline contract
4. **STATUS.md** — Ground truth for implementation state
5. **System_Architecture.md** — Target architecture (vision document)
6. **Hero_Paths.md** — User journey storyboards (target, not current)
7. **Whitepapers** (LUMA, GWC) — Vision documents (aspirational)
8. **Sprint docs** — Historical planning artifacts
9. **risks.md**, **requirements-test-matrix.md**, **TESTING_STRATEGY.md** — Supporting docs (draft/living)

### Editorial Guardrails (Proposed)

1. **Temporal markers required**: All feature descriptions in whitepapers and System_Architecture must carry one of: `[Implemented]`, `[In Progress]`, `[Planned]`, `[Vision]`.
2. **STATUS.md is truth**: Any merge that changes feature status must update STATUS.md in the same PR or a linked follow-up PR.
3. **Spec-first changes**: Any change to types, schemas, or invariants must update the canonical spec before or alongside the implementation PR.
4. **No present-tense for future features**: Hero_Paths and whitepapers must not describe unimplemented features in present tense without a temporal marker.
5. **Risk register parity**: risks.md must be at least as comprehensive as System_Architecture §7. If it can't be maintained, deprecate it and point to §7.
6. **Terminology glossary**: Create `docs/foundational/GLOSSARY.md` defining canonical forms of key terms (nullifier, trustScore, topicId, etc.) and reference it from CONTRIBUTING.md.
7. **Spec version headers**: All specs must include `Status:` (Canonical/Draft/Planned/Deprecated) and `Last Verified:` date.
8. **Cross-reference validation**: When a spec references another spec's section (e.g., "see §4"), CI or manual review should verify the reference is current.
9. **Stale checklist cleanup**: Implementation checklists in specs (e.g., forum spec §7) should be updated when work lands, or moved to a separate tracking doc.
10. **Whitepaper scope disclaimer**: Add a standard disclaimer to LUMA and GWC whitepapers: "This document describes the target protocol. For current implementation status, see STATUS.md."

---

## 5. Action Plan

### A. Docs-Only Quick Fixes (Same-Day)

| # | Item | Files | Priority | Blast Radius |
|---|------|-------|----------|-------------|
| QF1 | Add scope disclaimer to LUMA and GWC whitepapers | LUMA_BriefWhitePaper.md, GWC_BriefWhitePaper.md | Must | Low — header addition only |
| QF2 | Add "(target)" annotation to WebLLM mention in System_Architecture §3.1 | System_Architecture.md | Must | Low |
| QF3 | Mark System_Architecture §5 roadmap as historical | System_Architecture.md | Should | Low |
| QF4 | Add temporal markers to Hero_Paths district dashboard description | Hero_Paths.md §1.1.5 | Should | Low |
| QF5 | Update TESTING_STRATEGY.md CI node version | TESTING_STRATEGY.md | Nit | Low |
| QF6 | Update forum spec §7 checklist to reflect completed work | spec-hermes-forum-v0.md | Should | Low |

### B. Issue-Worthy Follow-Ups (New Tickets)

| # | Item | Priority | Blast Radius |
|---|------|----------|-------------|
| IF1 | Create `docs/foundational/GLOSSARY.md` (terminology standard) | Should | Medium — referenced from CONTRIBUTING |
| IF2 | Deprecate or upgrade risks.md to match System_Architecture §7 risk register | Should | Low |
| IF3 | Standardize `district_hash` vs `districtHash` casing across specs | Should | Medium — affects civic-action-kit and civic-sentiment specs |
| IF4 | Formalize AGORA terminology in System_Architecture or remove from specs | Should | Low |
| IF5 | Add temporal status markers (`[Implemented]`/`[Planned]`/`[Vision]`) across all foundational docs | Should | Medium — touches multiple files |

### C. Deeper Architecture/Spec Refactors (Future Sprints)

| # | Item | Priority | Blast Radius |
|---|------|----------|-------------|
| AR1 | LUMA WP phased implementation timeline alignment (Phase 1-5 vs actual sprint progress) | Should | Low — doc only |
| AR2 | System_Architecture §5 roadmap overhaul to match actual sprint structure | Should | Medium — System_Architecture is a core reference |
| AR3 | Cross-spec reference validation pass (all "see §X" references verified) | Nit | Medium — touches many files |

---

## 6. Philosophical Concerns

### 6.1 Dignity & Agency — ✅ Strong
The system's core design genuinely centers human dignity. Key evidence:
- XP is non-transferable and monotonic — no one can buy influence
- Budgets cap all actions per nullifier — no whale dominance
- Familiars inherit budgets, never multiply influence
- "Civic Facilitation" (not automation) for representative contact
- Privacy-by-default: SentimentSignals stay local, only aggregates published

### 6.2 Local-First Promise — ⚠️ Partially Delivered
The architecture is designed local-first and the implemented features honor this. However:
- Gun mesh is real-time sync, not true offline-first (depends on relays)
- AI engine is mocked — local inference (WebLLM) would fulfill the promise; currently there's no analysis generation capability offline
- This is an acknowledged gap, not a contradiction

### 6.3 Zero-Trust — ⚠️ Aspiration vs Reality
The architecture documents claim "zero trust" but:
- Trust scores are spoofable (token length heuristic)
- No sybil defense exists
- Anyone can create multiple identities
- **This is the single biggest philosophical gap**: the system's legitimacy claims (governance, economic distribution) depend on identity quality that doesn't exist yet

### 6.4 Governance Legitimacy — ⚠️ Conditional
The governance mechanics (QF, sentiment, constituency proofs) are well-designed in theory. But:
- Without real identity (LUMA gap), governance is vulnerable to sybil attacks
- Without real constituency proofs, district-level aggregation has no meaning
- Season 0's "XP now, money later" framing is honest and appropriate
- The system correctly gates high-stakes actions (QF votes require trustScore ≥ 0.7)

**Net assessment**: The philosophy is sound. The implementation gaps are acknowledged and honestly tracked. The main risk is that external readers of the whitepapers may not understand how much is aspirational vs. built.
