# Docs-Agent Independent Alignment Audit

**Date:** 2026-02-08  
**Auditor:** docs-agent (subagent)  
**Scope:** All 22 foundational docs + specs  
**Method:** Full read of every file; cross-referenced claims, types, terminology, and lifecycle states

---

## 1. Alignment Matrix

| # | Area | Canonical Claim (quote + file:line) | Evidence (file:line) | State | Severity | Recommended Action |
|---|------|--------------------------------------|----------------------|-------|----------|-------------------|
| A1 | Identity — Sybil | LUMA WP: "One human, one Digital DNA (DDNA). This is not enforced by a central list of faces, but by a decentralized uniqueness index" (LUMA_BriefWhitePaper.md:16) | STATUS.md:303 — "No sybil defense" severity 🔴; `main.rs:162` — nullifier = `SHA256(device_key + salt)` (device-bound, not human-bound) | **Conflict** | **Must** | STATUS correctly flags this. Ensure all consumer-facing docs carry ⚠️ caveats until uniqueness index exists. Add explicit "NOT HUMAN-BOUND" label to `derive_nullifier` in spec-identity-trust-constituency.md §2. |
| A2 | Identity — VIO Liveness | LUMA WP: "The Flight Path: The user follows a moving target… Sensor Fusion…" (LUMA_BriefWhitePaper.md:33–38) | STATUS.md:278 — "VIO liveness detection: ❌ Not implemented" | **Conflict** | **Must** | Acceptable for Season 0 prototyping, but whitepapers must carry a "Target Architecture" banner. Currently LUMA WP has no such caveat. |
| A3 | Identity — BioKey/CAPoW | LUMA WP: "BioKey ($20 hardware)… algorithm tuned to take exactly 300ms" (LUMA_BriefWhitePaper.md:41–46) | STATUS.md:280 — "BioKey hardware: ❌ Not implemented" | **Conflict** | **Should** | Phase 3 roadmap item. Flag as aspirational in whitepaper. |
| A4 | Identity — ZK Privacy | LUMA WP: "Pedersen Vector Commitments… Homomorphic Encryption… Zero-Knowledge Proofs" (LUMA_BriefWhitePaper.md:49–53) | STATUS.md:279 — "Holographic vectors: ❌ Not implemented" | **Conflict** | **Must** | Core privacy promise. Without this, the "mathematically private" claim is false. Add timeline estimate or caveat. |
| A5 | Identity — Trust Score | SysArch §4.1.5: "TrustScore (0–1)… thresholds: 0.5 for session/UBE/Faucet, 0.7 for QF" (System_Architecture.md:108–109) | spec-identity-trust-constituency.md §2: matches. STATUS.md:287–294 — stub logic returns 0.0/0.5/0.8/1.0 based on token prefix/length | **Drift** | **Must** | Threshold values are consistent across docs. The problem is implementation: any token >8 chars gets 0.8 (passes all gates). Label as DEV ONLY. |
| A6 | Economics — RVU v0 | GWC WP: "Season 0 Implementation: RVU runs in a simplified 'v0' mode—an inflationary ERC-20 with tightly controlled minters" (GWC_BriefWhitePaper.md:53–55) | spec-rvu-economics-v0.md §1: matches. STATUS.md:189–195 — contracts exist, localhost-only deployment | **Aligned** | **Nit** | Whitepaper and spec agree. Deployment gap is tracked. |
| A7 | Economics — UBE | trinity_project_brief.md §5: "UBE… Enforces trust + expiry + cooldown, Mints a fixed RVU amount per interval" (line ~115) | spec-rvu-economics-v0.md §2: "dripAmount ~25 RVU", matches. STATUS.md:193 — "UBE Distribution: ✅ `UBE.sol` ✅ Tests ❌ Not deployed" | **Aligned** | **Nit** | Contract ready but undeployed. Tracked. |
| A8 | Analysis — First-to-File | SysArch §4.3: "at most one CanonicalAnalysis… first successfully validated analysis… reused" (System_Architecture.md:167–171) | canonical-analysis-v1.md §4: matches. STATUS.md:247–252 — "vulnerable to poisoning… Single attacker can publish misleading canonical analysis" | **Aligned** | **Should** | Known risk, v2 quorum synthesis planned. Risk is documented but v2 implementation is entirely missing (STATUS confirms). |
| A9 | Analysis — AI Engine | AI_ENGINE_CONTRACT.md §3: "Season 0 prod = `local-only` by default; `remote-*` requires explicit user opt-in" (line 24) | STATUS.md:237 — "No real engine is wired — worker.ts uses mockEngine with 'local-only' policy" | **Conflict** | **Must** | The engine contract promises local AI; the implementation provides mock output. Core UX promise (canonical analysis) is hollow without this. |
| A10 | Analysis — Quorum/Re-synthesis | canonical-analysis-v2.md §4: "first N candidate analyses… synthesize… N verified comments" | STATUS.md:259–266 — all v2 features are "❌ Missing" | **Drift** | **Should** | Expected — v2 is "Planned (Direction Locked)". Ensure Hero_Paths.md reanalysis narrative doesn't imply current availability. Hero_Paths.md §1.1.3 uses present tense ("each analysis re-reads"), which is misleading. |
| A11 | Sentiment — Constituency Proofs | spec-civic-sentiment.md §2: "constituency_proof is derived from a RegionProof… district_hash MUST come from a valid RegionProof" | STATUS.md:268–270 — "No RegionProof generation or aggregates"; useSentimentState.ts short-circuits without it | **Conflict** | **Must** | District-level dashboards (a key value prop in project_brief §3.1.5) cannot function. All "constituent dashboard" language in Hero_Paths.md §1.1.5 is aspirational. |
| A12 | Privacy — Mesh Topology | spec-data-topology-privacy-v0.md §2: "district_hash and nullifier never appear together in any public structure" | SysArch §4.5 table + spec §1 table: consistent | **Aligned** | — | Privacy topology is well-specified and consistent. |
| A13 | Privacy — XP Exposure | spec-xp-ledger-v0.md §5: "Never publish { district_hash, nullifier, XP } together" | spec-data-topology-privacy-v0.md §5: cohort thresholds N=20. SysArch §4.2.2: matches | **Aligned** | — | Good cross-spec consistency. |
| A14 | Governance — QF Season 0 | spec-rvu-economics-v0.md §4: "public UX is off-chain (seeded proposals, local-only votes/voice credits); on-chain QF rounds are run only by curators/dev accounts" | Hero_Paths.md §2.2.3: matches. STATUS.md:207–211 — "On-chain QF: ❌ Not exposed to public users" | **Aligned** | — | Good alignment. |
| A15 | Familiars — Subordination | SysArch §Prime Directive 6: "Familiars… never hold independent influence" (System_Architecture.md:28) | spec-identity-trust-constituency.md §6: "Familiars MUST NOT have their own trustScore; they inherit the principal's session gating" | **Aligned** | — | Consistent across all docs. |
| A16 | Familiars — Implementation | SysArch §3.3 Familiar Runtime: describes suggest/act/high-impact tiers | STATUS.md:176–180 — "Types + schemas defined; runtime not implemented" | **Drift** | **Should** | Types landed (PR #48), runtime pending. Expected for Sprint 4 in-progress. |
| A17 | Budget — Budget Keys | spec-xp-ledger-v0.md §4: lists 8 keys (posts/day, comments/day, sentiment_votes/day, governance_votes/day, moderation/day, analyses/day, civic_actions/day, shares/day) | STATUS.md:185 — "all 8 Season 0 budget keys now wired"; but then STATUS.md:126 — "remaining budget enforcement (moderation, civic_actions) pending" | **Ambiguous** | **Should** | Contradiction within STATUS itself. Issue #106 closed shares/day as "last dormant Season 0 budget key — all 8 budget keys now fully wired", but moderation/day and civic_actions/day enforcement is listed as pending. Clarify: types exist for all 8, but only 6 are enforced in store code. |
| A18 | Hermes Messaging — Trust Gate | spec-hermes-messaging-v0.md §4.1: "HERMES Messaging does not introduce any additional trustScore threshold beyond whatever the session gate uses" | STATUS.md:155 — "Trust gating: ⚠️ Forum-only; Forum checks trustScore ≥ 0.5; chat does not" | **Aligned** | — | By spec design, messaging only requires a valid session (no threshold). STATUS note is consistent. |
| A19 | Civic Action Kit | spec-civic-action-kit-v0.md §1: "We provide reports + contact channels; the user initiates delivery" | SysArch Prime Directive 5: "We enable verified constituents to speak through user-initiated channels… We do not automate form submission by default" | **Aligned** | — | Facilitation model is consistent. |
| A20 | Civic Action Kit — Trust Thresholds | spec-civic-action-kit-v0.md §7.1: "Generate report: 0.7, Mark as sent: 0.7" | spec-identity-trust-constituency.md §2: 0.7 is QF threshold. No explicit mention of civic action 0.7 threshold in identity spec | **Ambiguous** | **Nit** | The identity spec lists "Future high-privilege: 0.7–0.8 range" but doesn't enumerate civic actions. Add civic action trust gating to the identity spec's threshold table. |
| A21 | HERMES Docs — Status | spec-hermes-docs-v0.md §1–12: fully specified | STATUS.md:131 — "HERMES Docs: ⚪ Planned (Sprint 5) ❌ No" | **Aligned** | — | Spec exists, implementation planned for Sprint 5. |
| A22 | Sprint Roadmap — Sprint 1 | SysArch §5 Sprint 1: "VENN: Canonical Analysis Protocol & Civic Decay Logic; LUMA: Region Notary" | STATUS.md:97 — "Sprint 1: ⚠️ 90% Complete. Testnet deployment never done; attestation is stub" | **Drift** | **Should** | Region Notary was a Sprint 1 goal; still missing. Sprint marked 90% but key LUMA deliverable absent. |
| A23 | CSP Guardrails | ARCHITECTURE_LOCK.md §2.4: "script-src must never include 'unsafe-inline' or 'unsafe-eval'" | STATUS.md:55 — "CSP meta tag + secure storage policy enforcement: added restrictive <meta> CSP to index.html" | **Aligned** | — | CSP enforcement is active and documented. Migration to HTTP headers tracked. |
| A24 | Local-First Promise | SysArch Prime Directive 1: "Canonical identity and civic state live on the user's device" | spec-data-topology-privacy-v0.md §1 table: IdentityRecord in IndexedDB vault + in-memory provider; Sentiment in localStorage; XP in localStorage | **Aligned** | — | Data topology faithfully implements local-first. |
| A25 | Testing — 100% Coverage | ARCHITECTURE_LOCK.md §2.2: "100% Line/Branch coverage required" | STATUS.md:313–320 — "Statements: 100%, Branches: 100%, Functions: 100%, Lines: 100%" with 751 tests | **Aligned** | — | Gate passing. |

---

## 2. Contradiction Register

### C1: Budget Enforcement — "All 8 wired" vs "moderation/civic_actions pending"

- **Source A:** STATUS.md:59 (Issue #106 entry) — "Last dormant Season 0 budget key — all 8 budget keys now fully wired"
- **Source B:** STATUS.md:126 — "remaining budget enforcement slices (moderation, civic_actions)"
- **Source C:** STATUS.md:186 — "remaining action types (moderation, civic_actions) pending"
- **Authoritative:** Source B/C (the later, more detailed statements). Issue #106 completed `shares/day`, making 6 of 8 enforced in running code. The remaining 2 have types/schemas but no store-level enforcement.
- **Rationale:** "Budget keys defined" ≠ "budget enforcement wired". The Issue #106 comment is technically about types being registered, not enforcement being active.
- **Action:** Amend STATUS.md Issue #106 summary to say "all 8 budget key types and defaults defined; 6 of 8 enforced in store code" and move moderation/civic_actions to an explicit outstanding item.

### C2: Hero_Paths.md present-tense for unimplemented features

- **Source A:** Hero_Paths.md §1.1.3: "During the first N opens (default: 5), each analysis re-reads the original article/post and critiques/refines the prior summary"
- **Source B:** STATUS.md:106 — "Topic Reanalysis Epochs: Not implemented. No reanalysis loop or digest types in app state"
- **Authoritative:** STATUS.md.
- **Rationale:** Hero_Paths explicitly says "These loops must remain consistent with…" specs but uses present/imperative tense that reads as describing current behavior.
- **Action:** Add a caveat banner to Hero_Paths.md similar to System_Architecture.md's "This document describes the target architecture, not current implementation."

### C3: Nullifier semantics — "per-human" vs "per-device"

- **Source A:** LUMA_BriefWhitePaper.md:16 — "One real human → one nullifier (stable per-human key, reused everywhere)"
- **Source B:** trinity_project_brief.md §3.1.1 — "A unique nullifier (one per human)"
- **Source C:** spec-identity-trust-constituency.md §2 — "derive_nullifier(device_key: string)" and STATUS.md:287 — "SHA256(device_key + salt)"
- **Source D:** STATUS.md:303 — "device-only nullifier"
- **Authoritative:** STATUS.md (reflects implementation reality).
- **Rationale:** Whitepapers, project brief, and identity spec all promise per-human nullifiers. Implementation delivers per-device nullifiers. Multi-device linking (§5 of identity spec) would unify them, but it's unimplemented.
- **Action:** Identity spec §2 should explicitly note: "v0 derives nullifier from device_key; true per-human binding requires multi-device linking or biometric binding (Phase 4)."

### C4: GWC Whitepaper — "MACI Governance" claimed for Season 0

- **Source A:** GWC_BriefWhitePaper.md Season 0 deliverables: "MACI Governance"
- **Source B:** SysArch §5 Sprint 6: "MACI Governance (Mainnet)" — Sprint 6 = Weeks 41–48
- **Source C:** STATUS.md: No mention of MACI implementation anywhere
- **Authoritative:** SysArch (places MACI in Sprint 6, not Season 0 deliverables).
- **Rationale:** GWC whitepaper lists MACI as a Season 0 deliverable, but the architecture roadmap places it in the final sprint.
- **Action:** Either clarify GWC whitepaper Season 0 scope or add a note: "MACI governance is a Season 0 design goal, not a launch deliverable."

### C5: Lightbulb derivation — Civic Decay vs stance-count model

- **Source A:** spec-civic-sentiment.md §4: "first active stance sets weight to 1.0, each additional active stance applies the decay step toward 2.0; clearing stances decrements accordingly (all neutral → 0)"
- **Source B:** SysArch §4.3.1: "Derived from the count of active stances on that topic: first active stance sets weight to 1.0, each additional active stance applies the Civic Decay step toward 2.0; clearing stances decrements (all neutral → 0)."
- **Source C:** trinity_project_brief.md §3.1.4: "The first active stance on a topic sets Lightbulb to 1.0; additional active stances decay toward 2.0"
- **Assessment:** These are consistent. The model is: first stance → 1.0, then decay formula applies for additional stances, stances can be cleared. The word "decay" is slightly misleading (it's actually *growth* toward 2.0), but the formula is consistent. Not a contradiction per se, but terminology could be clearer.
- **Action:** Nit — consider renaming "Civic Decay" to "Civic Saturation" or "Civic Diminishing-Returns" to avoid confusion with time-based decay (which is used for forum thread scores).

### C6: Sprint roadmap numbering — Sprint 4 scope

- **Source A:** SysArch §5 Sprint 4: "Delegation grants + familiar runtime (scopes, budgets); Quorum synthesis + comment-driven re-synthesis; Unified Topics model"
- **Source B:** STATUS.md:100–101 — Sprint 4: "In Progress". Delegation types landed, unified topics done, but quorum synthesis and familiar runtime NOT started.
- **Authoritative:** STATUS.md (reflects reality).
- **Rationale:** Sprint 4 scope in SysArch includes v2 quorum synthesis and familiar runtime, but STATUS shows only the type/schema groundwork was done.
- **Action:** Either acknowledge Sprint 4 will be split across multiple cycles or update SysArch sprint descriptions to match actual pace.

---

## 3. Terminology Issues

### T1: `trustScore` vs `scaledTrustScore` — **Consistent ✓ (with one gap)**

- **Used consistently in:** spec-identity-trust-constituency.md §1–2, SysArch §4.1.5, trinity_project_brief.md §3.1.1, Hero_Paths.md §1.2.1
- **Scaling invariant:** `scaled = Math.round(trustScore * 10000)` — stated identically in all specs
- **Gap:** GWC_BriefWhitePaper.md:106 uses only "trustScores" without explaining the scaling. Add a cross-reference or brief note.
- **Recommendation:** ✅ Good. Minor: add scaling note to GWC whitepaper.

### T2: `nullifier` / `principalNullifier` / `UniquenessNullifier` — **Mostly clear, some drift**

| Term | Meaning | Used in |
|------|---------|---------|
| `UniquenessNullifier` | Formal type name (the stable per-human key) | SysArch §4.1.5, spec-identity-trust-constituency.md §1, spec-civic-sentiment.md §1 |
| `nullifier` | Short form of UniquenessNullifier (field name in most interfaces) | All specs, all stores, STATUS |
| `principalNullifier` | Human's nullifier (as opposed to an agent's) | SysArch §4.1.5 terminology standard, spec-identity-trust-constituency.md §6 (`DelegationGrant.principalNullifier`), spec-xp-ledger-v0.md §4 |

- **Issue:** `SentimentSignal.constituency_proof.nullifier` is documented as equaling `UniquenessNullifier`, but the field name is just `nullifier`. This is clear in context but a reader scanning types could confuse it with a separate nullifier.
- **Issue:** LUMA whitepaper uses "DDNA" (Digital DNA) as the identity concept, but no spec or code uses this term. It's whitepaper-only branding.
- **Recommendation:** Add a glossary entry to ARCHITECTURE_LOCK.md or a shared glossary file: `DDNA = UniquenessNullifier = principalNullifier (for humans)`. Consider deprecating "DDNA" outside the whitepaper.

### T3: `topicId` vs `urlHash` — **Clear and consistent**

| Term | Meaning | Used in |
|------|---------|---------|
| `urlHash` | Hash of a normalized URL; used as the key for canonical analyses | canonical-analysis-v1.md §1, SysArch §4.3, spec-data-topology-privacy-v0.md §1 |
| `topicId` | Stable topic key: equals `urlHash` for URL topics, `sha256("thread:" + threadId)` for native threads | spec-hermes-forum-v0.md §2.1.1, spec-civic-sentiment.md §1, SysArch §4.3.1 |
| `topic_id` | Snake_case form used in `SentimentSignal` and `AggregateSentiment` interfaces | spec-civic-sentiment.md §2–3 |

- **Issue:** Casing inconsistency: `topicId` (camelCase) in forum/Thread schema vs `topic_id` (snake_case) in SentimentSignal. Both are TypeScript interfaces, so this is a style inconsistency within the same codebase.
- **Recommendation:** Standardize on `topicId` (camelCase, TypeScript convention) or document the snake_case in SentimentSignal as intentional (e.g., to match a wire format).

### T4: `constituency_proof` / `ConstituencyProof` — **Minor casing mismatch**

| Form | Context | File |
|------|---------|------|
| `constituency_proof` (snake_case) | Field name in `SentimentSignal` interface | spec-civic-sentiment.md §2, SysArch §6.2 |
| `ConstituencyProof` (PascalCase) | Type name | spec-identity-trust-constituency.md §1 |
| `constituencyProof` (camelCase) | Field name in `LegislativeAction` interface | spec-civic-action-kit-v0.md §2.2 |

- **Issue:** Three casing conventions for the same concept across three specs. `SentimentSignal` uses `constituency_proof` (snake_case), `LegislativeAction` uses `constituencyProof` (camelCase), and the type itself is `ConstituencyProof` (PascalCase).
- **Recommendation:** Standardize field names to camelCase (`constituencyProof`) per TypeScript convention. The PascalCase type name is fine. Update `SentimentSignal.constituency_proof` → `SentimentSignal.constituencyProof`.

### T5: Budget key names — **Consistent ✓**

- spec-xp-ledger-v0.md §4 lists: `posts/day`, `comments/day`, `sentiment_votes/day`, `governance_votes/day`, `moderation/day`, `analyses/day`, `civic_actions/day`, `shares/day`
- STATUS.md references the same 8 keys throughout
- SysArch §4.3.3 references "Action Budget (Spam Governor)" and "Compute/Analysis Budget (Analysis Governor)" but doesn't list individual keys (delegates to spec)
- **Recommendation:** ✅ Consistent. No action needed.

### T6: `DDNA` — Whitepaper-only term

- LUMA_BriefWhitePaper.md:16 — "One human, one Digital DNA (DDNA)"
- No other document uses "DDNA"
- **Recommendation:** Either adopt across docs or note it as marketing terminology in the whitepaper only.

### T7: `analysis_id` vs `urlHash` for keying sentiment

- `SentimentSignal` has both `topic_id` and `analysis_id` (spec-civic-sentiment.md §2)
- `CanonicalAnalysisV1` is keyed by `urlHash` (canonical-analysis-v1.md §4)
- The relationship is: `analysis_id = hash of canonical analysis object`, while `topic_id = urlHash` for URL topics
- **Issue:** What is `analysis_id`? Is it `urlHash`? A separate hash? Spec says "Hash of the Canonical Analysis Object" but doesn't define the hash function.
- **Recommendation:** Define `analysis_id` derivation explicitly. Is it `urlHash`? Is it `sha256(JSON.stringify(canonicalAnalysis))`? This matters for signal integrity.

---

## 4. Philosophical Concerns

### P1: Human Dignity vs Extractive Mechanics — **Generally Sound**

The system's design is explicitly anti-extractive:
- UBE is a floor ("modest payout"), not a performance incentive (spec-rvu-economics-v0.md §2)
- XP is monotonic and non-transferable — no "losing" XP (spec-xp-ledger-v0.md §1)
- Sentiment is capped per user ([0, 2]) — no brigading (spec-civic-sentiment.md §4)
- "Civic Dignity Loop" explicitly frames participation as recognition, not labor (trinity_project_brief.md §3.1)

**Concern:** The REL (Resource Exchange Layer) described in GWC_BriefWhitePaper.md §3.1 frames human attention as "Attention Units" monetized via "single-price auctions" — this edges toward extractive framing. "Data as Labor" and "Global Data Labor Union" are aspirational but could become extractive if implementation pressures toward engagement maximization.

**Severity:** Low (Season 0 doesn't implement REL). Monitor for Season 1+.

### P2: Familiar Subordination — **Well-Guarded**

Multiple layers of protection:
- ARCHITECTURE_LOCK.md §1.1: "Deny-by-Default Tools", "Human-in-the-Loop for High Impact"
- spec-identity-trust-constituency.md §6: "Familiars MUST NOT have their own trustScore"
- spec-xp-ledger-v0.md §4: Agents consume same budgets as humans
- SysArch Prime Directive 6: "never hold independent influence"
- Tier 3 requires explicit human approval at action time

**Assessment:** The delegation model is one of the best-specified parts of the system. The key risk is runtime implementation: if the familiar runtime isn't built with deny-by-default, the type system alone won't prevent overreach.

### P3: Privacy — Topology Is Sound, Implementation Lags

The privacy topology (spec-data-topology-privacy-v0.md) is well-designed:
- Clear public/sensitive classification
- No `{district_hash, nullifier}` pairs in public structures
- Cohort thresholds (N=20) for aggregate exposure
- XP ledger stays local

**Concern:** Without RegionProof (unimplemented), the `ConstituencyProof` requirement in `SentimentSignal` is satisfied only by stubs. This means:
1. District-level dashboards cannot exist yet
2. The privacy topology for constituency data is untested in practice
3. When RegionProofs are implemented, the transition will need careful review

**Severity:** Medium. The design is right; execution is lagging.

### P4: Governance Legitimacy — Identity Quality Gap

The project brief promises representatives "Signals they can trust more than anonymous social media noise" (trinity_project_brief.md §6.3). But:
- Trust scores are spoofable (STATUS.md:303)
- Nullifiers are device-bound not human-bound (STATUS.md:303)
- No sybil resistance exists (STATUS.md:303)

This means the "verified human" claim that underpins governance legitimacy is currently hollow. One person with multiple devices = multiple "verified humans."

**Severity:** High. This is the most fundamental philosophical gap. The system's claim to democratic legitimacy depends on identity quality that doesn't exist yet.

### P5: First-to-File Poisoning and Shared Reality

SysArch Prime Directive 4 promises "Shared Reality" via canonical analysis. But:
- v1 first-to-file is vulnerable to poisoning (STATUS.md:247)
- Mock AI engine means all analyses are identical placeholders (STATUS.md:237)
- No challenge/supersession path exists

A malicious actor could be the first to "analyze" a URL and establish a misleading canonical record that cannot be corrected in v1.

**Severity:** High for the "Shared Reality" promise. Mitigated by the fact that Season 0 is prototyping, but should be prominently flagged.

---

## 5. Technical Gaps

### G1: LUMA Is Entirely Aspirational

| Feature | Whitepaper Status | Implementation |
|---------|------------------|----------------|
| VIO liveness | Core promise | ❌ |
| BioKey/CAPoW | Core promise | ❌ |
| Holographic vectors | Core promise | ❌ |
| ZK-SNARKs | Core promise | ❌ |
| Social recovery (Lazarus) | Core promise | ❌ |
| Canary system | Core promise | ❌ |
| Region Notary / DBA | Core promise | ❌ |
| Acoustic fingerprinting | Core promise | ❌ |
| Intent-Based Decryption | Core promise | ❌ |

**Evidence:** STATUS.md:275–297 comprehensively documents all gaps. The LUMA whitepaper describes a system that is 0% implemented.

**Recommendation:** The LUMA whitepaper should carry a prominent "VISION DOCUMENT — No features described here are implemented" caveat, or be moved to a `docs/vision/` directory separate from `docs/foundational/`.

### G2: AI Engine — Mock Only

| Feature | Spec Status | Implementation |
|---------|-------------|----------------|
| Prompt builder | Specified | ✅ |
| Response parser | Specified | ✅ |
| Hallucination guardrails | Specified | ✅ |
| First-to-file logic | Specified | ✅ |
| Engine router | Specified | ✅ |
| WebLLM integration | Specified | ❌ |
| Remote API engine | Specified | ❌ |
| Real AI output | Required | ❌ (mock returns static data) |

**Evidence:** STATUS.md:224–239, AI_ENGINE_CONTRACT.md note: "Worker currently uses a mock engine"

**Impact:** The entire canonical analysis experience — the core differentiator of the product — produces identical mock output for every URL.

### G3: Testnet Deployment Gap

- SysArch Sprint 1 goal: "Contracts deployed to Sepolia/Base with verified sources"
- Reality: `deployments/localhost.json` only (STATUS.md:197–200)
- Script exists (`deploy-testnet.ts`) but was never run against a public testnet

### G4: Mesh Aggregation Not Implemented

- Spec-civic-sentiment.md §3 defines `AggregateSentiment` for mesh projection
- STATUS.md:243 — "Mesh aggregation: ❌ Not implemented"
- All civic signals are local-only; no cross-user aggregation exists

### G5: Forum Proposal Migration Incomplete

- STATUS.md:205–207: Legacy `ProposalSchema` deprecated, but "migration to proposal-threads pending"
- Governance voting still uses `localStorage vh_governance_votes` against legacy proposals
- `useGovernance.ts` still seeds legacy `ProposalSchema` objects

### G6: Docs & Civic Action Kit — Sprint 5 Not Started

- spec-hermes-docs-v0.md and spec-civic-action-kit-v0.md are fully specified
- STATUS.md:131–133 — "HERMES Docs: ⚪ Planned; HERMES Bridge (Civic Action Kit): ⚪ Planned/Redesign"
- Zero implementation exists for either

### G7: HERMES Messaging — Trust Gate Missing

- spec-hermes-messaging-v0.md §4.1: "Messaging requires a valid LUMA session (identity + attestation)"
- STATUS.md:155: "Trust gating: ⚠️ Forum-only; chat does not"
- By spec, messaging only requires a *session* (not a trust threshold), so this is technically not a violation
- **However:** Without sybil defense, "valid session" = "any device with any token", making messaging open to abuse

### G8: Comment-Driven Re-Synthesis — Entirely Missing

- canonical-analysis-v2.md §4.3 and Hero_Paths.md §1.1.3 describe a comment-triggered reanalysis loop
- STATUS.md:106 — "Topic Reanalysis Epochs: Not implemented. No reanalysis loop or digest types in app state"
- This is the mechanism that keeps Frame/Reframe tables evolving with discussion — without it, canonical analyses are static

### G9: risks.md Is Minimal Compared to System_Architecture.md Risk Table

- risks.md lists 5 risks (Lamport overflow, TURN costs, AI drift, storage limits, key management)
- SysArch §7 lists 11 risks (R-01 through R-11) with specific mitigation strategies
- The two documents don't cross-reference and have no overlapping risk IDs
- **Recommendation:** Consolidate into a single risk register or make risks.md explicitly a "supplementary operational risks" document that references SysArch §7 as the primary register.

### G10: Testing Strategy vs Requirements Matrix — Different Granularity

- TESTING_STRATEGY.md describes 6 test layers (unit → cross-device) with infrastructure details
- requirements-test-matrix.md maps spec requirements to test files
- Neither document references the other
- requirements-test-matrix.md is marked "draft helper" — it should either be promoted to canonical or deprecated
- **Recommendation:** Cross-reference these documents. The test matrix is valuable but orphaned.

---

## 6. Summary of Critical Findings

### Must-Fix (Blocking Integrity Claims)

1. **A1/C3:** Nullifier is device-bound not human-bound — all "one human, one identity" claims are false in current implementation
2. **A4:** ZK privacy promises (holographic vectors, ZK-SNARKs) — zero implementation against core LUMA privacy guarantee
3. **A9:** AI engine is mocked — core product experience (canonical analysis) is non-functional
4. **A11:** No RegionProof/constituency proofs — district dashboards and constituent voice features are inoperable
5. **A5:** Trust scores are trivially spoofable — all economic/governance gates are bypassed

### Should-Fix (Spec/Doc Coherence)

6. **C1:** STATUS.md self-contradicts on budget enforcement (6/8 vs 8/8)
7. **C2:** Hero_Paths.md uses present tense for unimplemented features (reanalysis, constituency dashboards)
8. **C4:** GWC whitepaper claims MACI for Season 0; architecture places it in Sprint 6
9. **C6:** Sprint 4 scope in SysArch exceeds what's been delivered
10. **T4:** `constituency_proof` casing inconsistency across specs
11. **T7:** `analysis_id` derivation is undefined

### Nit (Polish)

12. **T3:** `topicId` vs `topic_id` casing across TypeScript interfaces
13. **T6:** "DDNA" is whitepaper-only terminology with no spec backing
14. **C5:** "Civic Decay" is a misnomer (it's actually growth toward a ceiling)

---

## Appendix: File Reading Manifest

All 22 files were read in full:

| # | File | Read | Size |
|---|------|------|------|
| 1 | docs/foundational/trinity_project_brief.md | ✅ | ~8K |
| 2 | docs/foundational/LUMA_BriefWhitePaper.md | ✅ | ~5K |
| 3 | docs/foundational/GWC_BriefWhitePaper.md | ✅ | ~6K |
| 4 | docs/foundational/System_Architecture.md | ✅ | ~20K |
| 5 | docs/foundational/Hero_Paths.md | ✅ | ~18K |
| 6 | docs/foundational/ARCHITECTURE_LOCK.md | ✅ | ~4K |
| 7 | docs/foundational/AI_ENGINE_CONTRACT.md | ✅ | ~3K |
| 8 | docs/foundational/STATUS.md | ✅ | ~18K |
| 9 | docs/foundational/TESTING_STRATEGY.md | ✅ | ~6K |
| 10 | docs/foundational/requirements-test-matrix.md | ✅ | ~2K |
| 11 | docs/foundational/risks.md | ✅ | ~1K |
| 12 | docs/specs/spec-identity-trust-constituency.md | ✅ | ~5K |
| 13 | docs/specs/spec-rvu-economics-v0.md | ✅ | ~3K |
| 14 | docs/specs/spec-civic-sentiment.md | ✅ | ~5K |
| 15 | docs/specs/spec-xp-ledger-v0.md | ✅ | ~3K |
| 16 | docs/specs/spec-data-topology-privacy-v0.md | ✅ | ~4K |
| 17 | docs/specs/canonical-analysis-v1.md | ✅ | ~5K |
| 18 | docs/specs/canonical-analysis-v2.md | ✅ | ~4K |
| 19 | docs/specs/spec-hermes-forum-v0.md | ✅ | ~14K |
| 20 | docs/specs/spec-hermes-messaging-v0.md | ✅ | ~10K |
| 21 | docs/specs/spec-civic-action-kit-v0.md | ✅ | ~10K |
| 22 | docs/specs/spec-hermes-docs-v0.md | ✅ | ~8K |