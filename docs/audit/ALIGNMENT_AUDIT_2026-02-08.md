# TRINITY Alignment Audit — Amalgamated Decision Matrix

**Date:** 2026-02-08  
**Auditors:** Chief of Ship + Docs Agent (independent parallel audits)  
**Source Set:** 22 foundational docs + specs  
**Baseline:** main at `662b7fa`

---

## Executive Summary

### Philosophical Alignment — Sound
TRINITY's philosophical foundation is **internally coherent and genuinely dignity-first**. The system explicitly rejects surveillance capitalism, centers human agency over extraction, and designs for oversight at every layer. The familiar/delegation model correctly subordinates agents. No extractive or coercive mechanics found. The REL "Attention Units" framing (GWC WP) deserves monitoring but is not yet implemented.

### Technical Alignment — Mostly Aligned, with Honest Gaps
The codebase is **well-aligned with specs for implemented features** — 751 tests, 100% coverage, all guardrails enforced. STATUS.md is the single best alignment document: brutally honest about gaps between vision and reality. The primary risk is that **whitepapers and Hero_Paths read as present-tense descriptions of unbuilt features**, which could mislead external readers.

### Verdict: **Mostly Aligned**
**Conditions for "Fully Aligned":**
1. Whitepapers must carry scope disclaimers (vision vs. implemented)
2. Hero_Paths needs temporal markers for unbuilt features
3. STATUS.md budget wording clarified (6/8 enforced, not 8/8)
4. Sprint roadmap in System_Architecture updated or marked historical
5. Terminology glossary created

---

## 1. Amalgamated Contradiction Register

Both audits identified overlapping and unique contradictions. Deduplicated and merged:

| # | Contradiction | Authoritative Source | Stale Source | Severity | Action |
|---|--------------|---------------------|-------------|----------|--------|
| **C1** | Nullifier is "per-human" in whitepapers/specs but per-device in implementation | STATUS.md (reality) | LUMA WP §2.1, project_brief §3.1.1 | **Must** | Add "v0: device-bound; per-human binding requires Phase 4" to identity spec §2 + WP caveat |
| **C2** | Hero_Paths uses present tense for unimplemented features (reanalysis, district dashboards) | STATUS.md | Hero_Paths.md §1.1.3, §1.1.5 | **Must** | Add target-architecture banner to Hero_Paths (mirror SysArch's disclaimer) |
| **C3** | System_Architecture §3.1 lists WebLLM as current client tech | STATUS.md (mock engine) | System_Architecture.md §3.1 | **Must** | Add "(target; current: mock)" annotation |
| **C4** | GWC WP header says "Execution Phase (Season 0)" | STATUS.md (localhost-only) | GWC_BriefWhitePaper.md header | **Should** | Clarify "Execution Phase = development, not production deployment" |
| **C5** | GWC WP lists "MACI Governance" as Season 0 deliverable | SysArch §5 (Sprint 6) | GWC_BriefWhitePaper.md Season 0 | **Should** | Note MACI is a design goal, not a Season 0 launch deliverable |
| **C6** | STATUS.md: "all 8 budget keys wired" (Issue #106) vs "moderation/civic_actions pending" (§ Active Follow-ups) | STATUS.md detailed sections (6/8 enforced in store code) | STATUS.md Issue #106 summary | **Should** | Amend #106 summary: "all 8 types defined; 6 of 8 enforced in store code" |
| **C7** | Sprint 4 scope in SysArch includes quorum synthesis + familiar runtime | STATUS.md (neither started) | System_Architecture.md §5 Sprint 4 | **Should** | Mark SysArch sprint descriptions as original planning scope, not delivery commitment |
| **C8** | Forum spec §7 checklist shows items "IN PROGRESS" | STATUS.md (Forum: 🟢 Implemented) | spec-hermes-forum-v0.md §7 | **Should** | Update checklist to match completed status |
| **C9** | risks.md has 5 items; SysArch §7 has 11; no overlap or cross-reference | SysArch §7 (more comprehensive) | risks.md (underpowered) | **Should** | Deprecate risks.md or consolidate into SysArch §7 |
| **C10** | requirements-test-matrix references potentially stale file paths (e.g., `useXpLedger.test.ts` in hooks/ vs store/) | Actual file locations in repo | requirements-test-matrix.md (draft, paths may have drifted during refactors) | **Should** | Spot-check all paths in matrix against current repo layout |
| **C11** | TESTING_STRATEGY.md CI shows `node-version: 20` | Runtime: node v22.22.0 | TESTING_STRATEGY.md | **Nit** | Update example |
| **C12** | "Civic Decay" naming implies decrease, but formula is growth toward ceiling | N/A (naming issue) | All docs using the term | **Nit** | Consider "Civic Saturation" or document that "decay" refers to diminishing marginal returns, not decrease |

---

## 2. Amalgamated Terminology Issues

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| **T1** | `constituency_proof` (snake_case in SentimentSignal) vs `constituencyProof` (camelCase in LegislativeAction) vs `ConstituencyProof` (PascalCase type) | **Should** | Standardize field names to camelCase (`constituencyProof`). PascalCase type is fine. |
| **T2** | `topic_id` (snake_case in SentimentSignal) vs `topicId` (camelCase in Thread schema) | **Should** | Standardize to `topicId` (camelCase, TS convention) or document snake_case as intentional wire format |
| **T3** | `district_hash` (snake_case in SentimentSignal) vs `districtHash` (camelCase in Representative schema) | **Should** | Standardize to one convention across specs |
| **T4** | `DDNA` used only in LUMA WP; no spec or code reference | **Nit** | Note as marketing term or add to glossary as alias for UniquenessNullifier |
| **T5** | `analysis_id` derivation undefined — is it urlHash? Object hash? | **Should** | Define explicitly in canonical-analysis-v1.md |
| **T6** | `AGORA` mentioned in forum spec and civic-action-kit but not in System_Architecture | **Should** | Either formalize in System_Architecture or remove from specs |
| **T7** | `nullifier` / `principalNullifier` / `UniquenessNullifier` — clear but not formally glossaried | **Nit** | Create glossary with canonical forms |

---

## 3. Source-of-Truth Precedence Order (Agreed)

1. **ARCHITECTURE_LOCK.md** — Non-negotiable guardrails
2. **Canonical specs** (`docs/specs/spec-*.md`, `canonical-analysis-*.md`) — Normative subsystem contracts
3. **AI_ENGINE_CONTRACT.md** — AI pipeline contract
4. **STATUS.md** — Ground truth for implementation state
5. **System_Architecture.md** — Target architecture (vision)
6. **Hero_Paths.md** — User journey storyboards (target)
7. **Whitepapers** (LUMA, GWC) — Vision documents (aspirational)
8. **Sprint docs** — Historical planning
9. **risks.md**, **requirements-test-matrix.md**, **TESTING_STRATEGY.md** — Supporting (draft/living)

---

## 4. Editorial Guardrails (10 Proposed)

1. **Temporal markers**: Feature descriptions in whitepapers/SysArch must carry `[Implemented]`, `[In Progress]`, `[Planned]`, or `[Vision]`.
2. **STATUS.md is truth**: Any merge changing feature status must update STATUS.md in the same or linked PR.
3. **Spec-first**: Type/schema/invariant changes must update the canonical spec alongside implementation.
4. **No present-tense for future features**: Hero_Paths and whitepapers must use future tense or temporal markers for unbuilt features.
5. **Risk register parity**: risks.md must match or exceed SysArch §7, or be deprecated.
6. **Terminology glossary**: Create `docs/foundational/GLOSSARY.md` with canonical term definitions.
7. **Spec status headers**: All specs must include `Status:` and `Last Verified:` fields.
8. **Cross-reference validation**: Spec §X references should be verified when either spec changes.
9. **Checklist hygiene**: Implementation checklists in specs must be updated when work lands.
10. **Whitepaper scope disclaimer**: LUMA and GWC whitepapers must carry "Vision Document — see STATUS.md for current implementation" banners.

---

## 5. Action Plan

### A. Docs-Only Quick Fixes (Same-Day PR)

| # | Fix | Files | Priority |
|---|-----|-------|----------|
| QF1 | Add scope disclaimer banner to LUMA and GWC whitepapers | `LUMA_BriefWhitePaper.md`, `GWC_BriefWhitePaper.md` | **Must** |
| QF2 | Add target-architecture banner to Hero_Paths.md | `Hero_Paths.md` | **Must** |
| QF3 | Add "(target; current: mock)" to WebLLM mention in SysArch §3.1 | `System_Architecture.md` | **Must** |
| QF4 | Mark SysArch §5 roadmap as historical planning | `System_Architecture.md` | **Should** |
| QF5 | Add "v0: device-bound" note to identity spec §2 | `spec-identity-trust-constituency.md` | **Should** |
| QF6 | Clarify GWC WP "Execution Phase" = development | `GWC_BriefWhitePaper.md` | **Should** |
| QF7 | Fix STATUS.md budget wording: "6 of 8 enforced, 2 types-only" | `STATUS.md` | **Should** |
| QF8 | Update forum spec §7 checklist to reflect completed work | `spec-hermes-forum-v0.md` | **Should** |
| QF9 | Note MACI as design goal, not Season 0 deliverable | `GWC_BriefWhitePaper.md` | **Should** |
| QF10 | Spot-check requirements-test-matrix.md file paths against current repo | `requirements-test-matrix.md` | **Should** |
| QF11 | Update TESTING_STRATEGY.md CI node version | `TESTING_STRATEGY.md` | **Nit** |

### B. Issue-Worthy Follow-Ups

| # | Issue | Priority | Owner |
|---|-------|----------|-------|
| IF1 | Create `docs/foundational/GLOSSARY.md` | **Should** | docs agent |
| IF2 | Deprecate or upgrade risks.md | **Should** | docs agent |
| IF3 | Standardize casing: `constituency_proof` → `constituencyProof`, `topic_id` → `topicId`, `district_hash` → `districtHash` across specs | **Should** | spec + impl |
| IF4 | Define `analysis_id` derivation in canonical-analysis-v1.md | **Should** | spec |
| IF5 | Formalize AGORA terminology or remove | **Should** | docs |
| IF6 | Add temporal status markers across all foundational docs | **Should** | docs |
| IF7 | Cross-reference TESTING_STRATEGY.md and requirements-test-matrix.md | **Nit** | docs |
| IF8 | Add civic action trust thresholds (0.7) to identity spec threshold table | **Nit** | spec |

### C. Deeper Architecture/Spec Refactors

| # | Item | Priority | Blast Radius |
|---|------|----------|-------------|
| AR1 | System_Architecture §5 roadmap overhaul | **Should** | Medium |
| AR2 | Cross-spec reference validation pass | **Nit** | Medium |
| AR3 | LUMA WP phased timeline alignment with actual sprints | **Should** | Low |

---

## 6. Technical Gaps Inventory

Both audits identified significant implementation gaps against spec/whitepaper claims. STATUS.md honestly tracks all of these. Consolidated:

| # | Gap | Spec/WP Promise | Current Reality (STATUS.md) | Severity |
|---|-----|----------------|---------------------------|----------|
| **G1** | LUMA is entirely aspirational | VIO, BioKey, holographic vectors, ZK-SNARKs, social recovery, canary system, region notary, acoustic fingerprinting, intent-based decryption | 0% implemented. Nullifier = SHA256(device_key). Trust = token-length heuristic. | **Critical** |
| **G2** | AI engine is mock-only | WebLLM local inference, remote API engine, real AI output | `worker.ts` returns static mock data for every URL. Prompt builder, response parser, hallucination guardrails, first-to-file logic, and engine router all exist but produce no real output. | **Critical** |
| **G3** | Testnet deployment gap | Sprint 1: "Contracts deployed to Sepolia/Base with verified sources" | `deployments/localhost.json` only. Deploy script exists (`deploy-testnet.ts`) but was never run against a public testnet. | **High** |
| **G4** | Mesh aggregation not implemented | `AggregateSentiment` for mesh projection (spec-civic-sentiment §3) | All civic signals are local-only; no cross-user aggregation exists. | **High** |
| **G5** | Forum proposal migration incomplete | Legacy `ProposalSchema` deprecated, proposal-threads are the new model | Migration to proposal-threads pending. `useGovernance.ts` still seeds legacy `ProposalSchema` objects. Governance voting still uses `localStorage vh_governance_votes` against legacy proposals. | **Medium** |
| **G6** | Docs & Civic Action Kit — Sprint 5 not started | spec-hermes-docs-v0.md and spec-civic-action-kit-v0.md fully specified | Zero implementation for either. STATUS: ⚪ Planned. | **Medium** |
| **G7** | Messaging trust gate missing | spec-hermes-messaging §4.1: "requires a valid LUMA session" | By spec, messaging only requires a session (not a trust threshold), so no violation. But without sybil defense, "valid session" = "any device with any token", making messaging open to abuse. | **Medium** |
| **G8** | Comment-driven re-synthesis entirely missing | canonical-analysis-v2 §4.3 + Hero_Paths §1.1.3: comment-triggered reanalysis loop | No reanalysis loop or digest types in app state. Canonical analyses are static once created. | **Medium** |
| **G9** | Familiar runtime not implemented | SysArch §3.3: suggest/act/high-impact tiers | Types + schemas defined (PR #48). Runtime pending. | **Medium** |
| **G10** | Testing docs not cross-referenced | TESTING_STRATEGY.md (6 test layers) and requirements-test-matrix.md (spec→test mapping) | Neither document references the other. requirements-test-matrix.md is marked "draft helper" — should be promoted or deprecated. | **Low** |

**Note:** All gaps are acknowledged in STATUS.md. The concern is not hidden debt — it's that whitepapers and Hero_Paths read as if these features exist.

---

## 7. Philosophical Assessment (Amalgamated)

### ✅ Strengths
- **Dignity-first design**: XP is non-transferable/monotonic, budgets cap influence, familiars never multiply weight
- **Facilitation over automation**: Civic Action Kit correctly uses "user-initiated channels" — "We do not automate form submission by default"
- **Privacy by topology**: SentimentSignals local-only, aggregates public, cohort thresholds (N=20) enforced, no `{district_hash, nullifier}` pairs in public structures
- **Familiar subordination well-guarded**: Multiple defensive layers — ARCHITECTURE_LOCK deny-by-default, spec-level budget inheritance, Tier 3 requires human approval at action time. One of the best-specified parts of the system.
- **Honest status tracking**: STATUS.md is the gold standard for implementation truthfulness — every gap is surfaced with severity ratings and cross-references

### ⚠️ Risks (Ranked by Severity)

1. **Identity quality gap (Critical)**: The system's governance legitimacy, economic distribution, and "verified constituent" claims all depend on sybil resistance that doesn't exist. One person with multiple devices = multiple "verified humans". Trust scores are trivially spoofable (any token >8 chars gets 0.8, passing all gates). This is the single most fundamental philosophical gap.

2. **First-to-file poisoning (High)**: "Shared Reality" promise (SysArch Prime Directive 4) is vulnerable. A malicious actor can be first to "analyze" a URL and establish a misleading canonical record that cannot be corrected in v1. No challenge/supersession path exists until v2 quorum synthesis.

3. **Local AI gap (High)**: The core differentiator (canonical analysis via local inference) produces mock output. The entire analysis experience is non-functional. Without this, the "think for yourself" promise is aspirational.

4. **Privacy topology untested in practice (Medium)**: The privacy design is sound on paper (spec-data-topology-privacy), but without RegionProofs the constituency data flow is untested. When real RegionProofs are implemented, the transition will need careful review to ensure no de-anonymization leaks.

5. **REL framing risk (Low — future)**: GWC WP §3.1 frames human attention as "Attention Units" monetized via "single-price auctions". "Data as Labor" and "Global Data Labor Union" language could become extractive if implementation pressures toward engagement maximization. Not implemented in Season 0 — monitor for Season 1+.

### Net Assessment
The philosophy is **sound and well-intentioned**. The implementation gaps are **acknowledged and honestly tracked**. The main risk is that **external readers may not distinguish vision from reality** when reading the whitepapers and Hero_Paths. The identity quality gap is the single biggest threat to the system's credibility claims.

---

## Approval

This audit is ready for Phase 2 (docs-only implementation PR) upon approval. The quick fixes (QF1–QF10) can be applied in a single docs-only PR with no runtime impact.
