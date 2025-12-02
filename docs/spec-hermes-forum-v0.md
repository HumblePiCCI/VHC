# HERMES Forum Spec (v0)

**Version:** 0.1
**Status:** Canonical for Sprint 3
**Context:** Public, threaded civic discourse for TRINITY OS.

---

## 1. Core Principles

1.  **The Agora:** A public square for debate. Accessible to all, navigable from the global header.
2.  **Structured Debate:** Not just comments, but **Counterpoints**.
3.  **Sybil Resistance:** Posting and voting requires a verified `TrustScore` (e.g., ≥0.5).
4.  **Community Moderation:** Visibility is driven by `CivicXP` weighted voting and `CivicDecay`.

---

## 2. Data Model

### 2.1 Thread Schema
```typescript
interface Thread {
  id: string;               // UUID
  schemaVersion: 'hermes-thread-v0';
  title: string;            // ≤ 200 chars
  content: string;          // Markdown, ≤ 10,000 chars
  author: string;           // Author's Nullifier (identity key)
  timestamp: number;        // Unix timestamp (ms)
  tags: string[];           // e.g., ["Infrastructure", "Proposal"]
  
  // Optional: Link to VENN analysis
  sourceAnalysisId?: string; // Link to CanonicalAnalysis.topic_id or analysis_id
  
  // Engagement (raw counts, canonical)
  upvotes: number;
  downvotes: number;
  score: number;            // Computed: (upvotes - downvotes) * decayFactor
}
```

### 2.2 Comment Schema
```typescript
interface Comment {
  id: string;               // UUID
  schemaVersion: 'hermes-comment-v0';
  threadId: string;
  parentId: string | null;  // null if top-level reply to thread
  
  content: string;          // Markdown, ≤ 10,000 chars
  author: string;           // Author's Nullifier
  timestamp: number;
  
  // Type: distinguishes normal replies from counterpoints
  type: 'reply' | 'counterpoint';
  
  // For Counterpoints: the target being countered
  // Required when type === 'counterpoint', omitted for normal replies
  targetId?: string;
  
  // Engagement (raw counts, canonical)
  upvotes: number;
  downvotes: number;
}
```

**Note:** There is no separate `Counterpoint` interface; the `Comment` type with `type: 'counterpoint'` covers this use case. For counterpoints, `targetId` must be set; for replies, it should be omitted or null.

### 2.3 Content Size Limits

Client-side validation and Zod schemas enforce:
*   `title`: ≤ 200 characters.
*   `content` (thread or comment): ≤ 10,000 characters.
*   UI should truncate long content with "Show more" expansion.

---

## 3. UI & UX

### 3.1 The Feed
*   **Global View:** List of threads sorted by `Hot`, `New`, or `Top`.
*   **Navigation:** Forum is accessed under the HERMES section of the app (e.g., `/hermes/forum`), not under AGORA/governance.

**HERMES vs AGORA Distinction:**
*   **HERMES** = Communications layer: Messaging (DMs) + Forum (public civic discourse).
*   **AGORA** = Governance & projects (Sprint 4+): Collaborative document editing, project/policy development, decision-making.
*   Forum threads can be elevated into AGORA projects in future sprints (based on engagement, upvotes, tags).

### 3.2 The Discussion View
*   **Standard Replies:** Nested tree structure (Reddit style).
*   **Counterpoints (Side-by-Side):**
    *   If a comment has a `counterpoint` child, the UI renders a split view.
    *   **Left:** Original Argument.
    *   **Right:** The Counterpoint(s).
    *   **Source:** Counterpoints can be user-generated (flagged replies) OR AI-generated (linked to Analysis summaries).
*   **Content Sanitization:** All content (Markdown) must be sanitized before rendering (strip scripts, dangerous HTML) using a whitelisted renderer. This prevents XSS and injection attacks.

### 3.3 Score & Hot Ranking

**Decay Formula:**
```typescript
function computeThreadScore(thread: Thread, now: number): number {
  const ageHours = (now - thread.timestamp) / 3600_000;
  // λ chosen so decayFactor ≈ 0.5 at 48h
  // Half-life = ln(2) / λ = 48h → λ ≈ 0.0144
  const λ = 0.0144;
  const decayFactor = Math.exp(-λ * ageHours);
  return (thread.upvotes - thread.downvotes) * decayFactor;
}
```

**Sorting Options:**
*   **Hot:** Descending `score` (computed with decay).
*   **New:** Descending `timestamp`.
*   **Top:** Descending `(upvotes - downvotes)` (no decay applied).

---

## 4. Sybil Resistance & Moderation

### 4.1 Gating
*   **Read:** Open to all (Public).
*   **Write/Vote:** Requires `TrustScore >= 0.5` (Verified Human).
*   **Anonymous Mode (Future):** "Sister Forum" for low-trust/anon accounts (no legislative weight).

**UI Enforcement:** If `useIdentity().trustScore < 0.5`, disable "New Thread", "Reply", "Counterpoint", and all vote buttons. Show a "Verify identity to participate" message on interaction attempt.

### 4.2 Voting Power

**Raw Vote Storage (Canonical):**
*   **1 Person = 1 Vote:** Store raw `upvotes` / `downvotes` counts. No weighting at the storage layer.

**One-Vote-Per-User Semantics:**
*   For each `(user, targetId)` (thread or comment), only a single up/down/neutral vote is allowed.
*   Updating a vote overwrites the previous one; canonical `upvotes` / `downvotes` reflect the latest state.
*   Vote state per user: `{ targetId: 'up' | 'down' | null }`. Null = no vote / retracted.

**XP Weighting (Optional v0, Derived View Only):**
*   XP-weighted voting is a **derived view only** in v0.
*   Canonical stored fields remain raw `upvotes` / `downvotes`.
*   XP-weighted scores are computed **on-device** using the local XP ledger:
    ```typescript
    // Example: Simple monotonic weight function
    function xpWeight(civicXP: number, tag: string): number {
      const tagXP = getTagXP(civicXP, tag); // e.g., XP for "Infrastructure"
      return 1 + Math.log10(1 + tagXP);
    }
    
    // Weighted score (client-only, not stored)
    const weightedScore = votes.reduce((sum, vote) => {
      return sum + Math.sign(vote.value) * xpWeight(vote.userCivicXP, thread.tags[0]);
    }, 0);
    ```
*   **Privacy:** Never store per-nullifier XP alongside content in Gun. XP reads come from the local XP ledger only.

### 4.3 Moderation
*   **Default:** Community driven. Low score auto-collapses content in the UI.
*   **Admin Keys:** Hard-coded set of keys (Governance Council) can forcibly hide/remove illegal content (Child Safety, etc.).
*   **Civic Decay:** Old threads/votes lose weight over time (see `spec-civic-sentiment.md`).
*   **Moderation Events:**
    *   Moderator hide/remove actions must be represented as separate signed records (`ModerationEvent`).
    *   Validated against a hard-coded set of moderator keys in the client.
    *   This keeps moderation auditable and transparent.

```typescript
interface ModerationEvent {
  id: string;
  targetId: string;         // Thread or Comment ID
  action: 'hide' | 'remove';
  moderator: string;        // Moderator's public key
  reason: string;
  timestamp: number;
  signature: string;        // Signed by moderator key
}
```

---

## 5. Storage (GunDB)

*   **Namespace:**
    *   Threads: `vh/forum/threads/<threadId>`
    *   Comments: `vh/forum/threads/<threadId>/comments/<commentId>`
*   **Indexing:**
    *   `vh/forum/indexes/date` — Threads sorted by timestamp.
    *   `vh/forum/indexes/tags/<tag>/<threadId>` — Threads indexed by tag.
*   **Integrity:** Client validates the author's signature before rendering. Gating by trustScore is enforced at action time (creating threads/comments/votes) on the local device, not re-validated for remote content.

**Gun Access Rule:** All Gun operations must be performed via `@vh/gun-client`, respecting the Hydration Barrier. No direct `Gun()` calls in app code.

---

## 6. VENN Integration

*   **Discuss in Forum CTA:** From a Canonical Analysis view, users can click "Discuss in Forum" to:
    1.  Check if a Thread with `sourceAnalysisId` matching the analysis exists.
    2.  If exists: Navigate to that Thread.
    3.  If not: Pre-populate a new Thread form with:
        *   Title: Article headline.
        *   `sourceAnalysisId`: The analysis ID.
        *   Tags: Derived from analysis metadata.
*   **Counterpoints from Analysis:** AI-generated counterpoints from VENN analysis can be suggested as starting points for user-generated counterpoints in the forum.

---

## 7. Implementation Checklist

- [ ] Implement `Thread` and `Comment` schemas in `packages/data-model/src/schemas/hermes/forum.ts`.
- [ ] Implement `computeThreadScore` helper with documented λ value.
- [ ] Implement Gun storage adapters for threads, comments, and indexes.
- [ ] Implement `useForumStore` in `apps/web-pwa/src/store/hermesForum.ts`.
- [ ] Implement UI components: `ForumFeed`, `ThreadView`, `CommentNode`, `CounterpointPanel`.
- [ ] Implement trust gating in UI (disable write/vote when `trustScore < 0.5`).
- [ ] Implement Markdown sanitization for content rendering.
- [ ] Implement sorting (Hot/New/Top) and auto-collapse for low-score content.
- [ ] Implement one-vote-per-user semantics with vote state tracking.
- [ ] Implement content size limits (title ≤200, content ≤10,000).
- [ ] Implement VENN integration ("Discuss in Forum" CTA).
- [ ] Write unit tests for schemas and `computeThreadScore`.
- [ ] Write integration tests for trust gating and vote idempotency.
- [ ] Write E2E tests for forum flows.
