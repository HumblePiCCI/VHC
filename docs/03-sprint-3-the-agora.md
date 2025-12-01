# Sprint 3: The Agora - Implementation Plan

**Context:** `System_Architecture.md` v0.2.0 (Sprint 3: The "Agora")
**Goal:** Implement the "Agora" – the civic action layer. This consists of **HERMES Messaging** (secure, private communication), **HERMES Docs** (collaborative editing), **HERMES Forum** (threaded civic discourse), and the **Sovereign Legislative Bridge** (automated delivery of verified constituent sentiment).
**Status:** [ ] Planning

---

## 1. Guiding Constraints & Quality Gates

- [ ] **Non-Negotiables:**
    - [ ] **LOC Cap:** Hard limit of **350 lines** per file (tests/types exempt).
    - [ ] **Coverage:** **100%** Line/Branch coverage for new/modified modules.
    - [ ] **Browser-Safe:** No `node:*` imports in client code (except in Electron/Tauri main process or Playwright scripts).
    - [ ] **Security:** E2EE (End-to-End Encryption) for all private messages and documents.
    - [ ] **Privacy:** No metadata leakage; "First-to-File" principles apply to public civic data.

---

## 2. Phase 1: HERMES Messaging (The Nervous System)

**Objective:** Enable secure, peer-to-peer, end-to-end encrypted messaging between verified identities.

### 2.1 Data Model & Schema (`packages/data-model`)
- [ ] **Schema Definition:** Create `packages/data-model/src/schemas/hermes/message.ts`.
    - `Message`: `{ id, sender, recipient, timestamp, content (encrypted), signature }`
    - `Channel`: `{ id, participants[], type: 'dm' | 'group', lastMessageAt }`
    - **Validation:** Zod schemas for strict runtime checking.
- [ ] **Types:** Export TypeScript types to `packages/types`.

### 2.2 Transport Layer (`packages/gun-client`)
- [ ] **Encryption Wrappers:** Implement SEA (Security, Encryption, Authorization) helpers.
    - `encryptMessage(content, sharedKey)`
    - `decryptMessage(encryptedContent, sharedKey)`
- [ ] **Storage Logic:** Implement `useChatStore` (Zustand + Gun).
    - `sendMessage(recipient, content)`: Encrypt -> Sign -> Put to Gun.
    - `subscribeToMessages(channelId)`: Live query for new messages.
    - **Privacy:** Ensure messages are stored in user-scoped, encrypted paths (`~user/hermes/chats/...`).

### 2.3 UI Implementation (`apps/web-pwa`)
- [ ] **Components:**
    - `ChatLayout`: Split view (Channel List / Message Thread).
    - `ChannelList`: Virtualized list of active conversations.
    - `MessageBubble`: Sent/Received styles, timestamp, status (sending/sent/read).
    - `Composer`: Input area with auto-expanding text, send button.
- [ ] **Features:**
    - **Direct Messages:** 1:1 flow. Lookup user by Nullifier/Handle -> Start Chat.
    - **Optimistic UI:** Display messages immediately while syncing in background.

---

## 3. Phase 2: HERMES Docs (Collaborative Editor)

**Objective:** Enable secure, real-time collaborative document editing (Google Docs style) over P2P infrastructure.

### 3.1 Data Model & CRDT (`packages/crdt`)
- [ ] **Schema Definition:** Create `packages/data-model/src/schemas/hermes/document.ts`.
    - `Document`: `{ id, title, owner, collaborators[], encryptedContent, lastModified }`
    - `Operation`: `{ docId, op: 'insert' | 'delete' | 'format', position, value, timestamp, author }`
- [ ] **CRDT Implementation:**
    - Leverage `yjs` or custom Gun-based CRDT for text synchronization.
    - Ensure operations are encrypted before propagation.

### 3.2 UI Implementation (`apps/web-pwa`)
- [ ] **Editor Component:**
    - Integrate a rich-text editor framework (e.g., TipTap, Slate, or Quill).
    - Bind editor state to CRDT/Gun store.
- [ ] **Features:**
    - **Live Cursors:** Show collaborator positions (ephemeral state).
    - **Rich Text:** Bold, Italic, Lists, Tables, Images (encrypted blobs).
    - **Access Control:** Share via public key (add to `collaborators` list).

---

## 4. Phase 3: HERMES Forum (The Agora)

**Objective:** A threaded conversation platform combining Reddit-style threads with VENN's bias/counterpoint tables.

### 4.1 Data Model (`packages/data-model`)
- [ ] **Schema Definition:** Create `packages/data-model/src/schemas/hermes/forum.ts`.
    - `Thread`: `{ id, title, content, author, timestamp, tags[], upvotes, downvotes }`
    - `Comment`: `{ id, threadId, parentId, content, author, timestamp, upvotes, counterpoints[] }`
    - `Counterpoint`: `{ id, commentId, content, author, timestamp, upvotes }`

### 4.2 UI Implementation (`apps/web-pwa`)
- [ ] **Components:**
    - `ForumFeed`: List of active threads sorted by engagement/time.
    - `ThreadView`: Main post + nested comment tree.
    - `CommentNode`: The comment content + "Counterpoints" side-panel or expandable section.
- [ ] **Features:**
    - **Structured Debate:** Users can reply normally OR post a "Counterpoint" which appears distinctly next to the original point.
    - **Voting:** Upvote/Downvote logic (using `civicXP` weight if applicable).

---

## 5. Phase 4: Sovereign Legislative Bridge (The Voice)

**Objective:** Enable users to send verified sentiment reports and community-derived policy proposalsdirectly to legislators (e.g., congress.gov contact forms, governmenet emails, etc.) using local automation, bypassing API blocks.

### 5.1 Data Model & Schema (`packages/data-model`)
- [ ] **Schema Definition:** Create `packages/data-model/src/schemas/hermes/bridge.ts`.
    - `LegislativeAction`: `{ id, targetUrl, formFields: Record<string, string>, sentiment: 'support' | 'oppose', timestamp }`
    - `DeliveryReceipt`: `{ actionId, status: 'pending' | 'success' | 'failed', proofOfDelivery (screenshot/hash), timestamp }`
- [ ] **Constituency Proof:** Integrate `RegionProof` (from Sprint 2) to attach ZK-proof of residency to the action.

### 5.2 Automation Engine (Desktop/Electron)
- [ ] **Playwright Integration:**
    - Set up a "Headless Runner" service in the Desktop app.
    - **Script:** Create generic form-filler script (`fill-legislative-form.ts`).
        - Inputs: Target URL, Field Mapping, User Data.
        - Action: Navigate -> Fill -> Submit -> Capture Screenshot.
- [ ] **Security Sandbox:** Ensure automation scripts cannot exfiltrate data or access unauthorized domains.

### 5.3 UI Implementation (`apps/web-pwa`)
- [ ] **Action Center:**
    - "Write to Representative" flow.
    - Template selection (Topic -> Stance -> Message).
- [ ] **Status Tracking:**
    - View history of sent letters.
    - View delivery receipts (screenshots of success).

---

## 6. Phase 5: Verification & Hardening

### 6.1 Automated Tests
- [ ] **Unit Tests:** 100% coverage for Schema, Encryption, and CRDT logic.
- [ ] **E2E Tests:**
    - **Messaging:** Simulator "Alice" sends message to "Bob". Verify delivery and decryption.
    - **Docs:** Simulator "Alice" and "Bob" edit same doc. Verify eventual consistency.
    - **Bridge:** Mock form server. Verify Playwright script correctly fills and submits form.

### 6.2 Manual Verification Plan
- [ ] **Messaging:**
    1. Open App in two browser windows (Incognito).
    2. Create two identities.
    3. Start DM.
    4. Exchange messages.
    5. Verify persistence (reload page).
- [ ] **Docs:**
    1. Alice creates doc, shares with Bob.
    2. Both type simultaneously.
    3. Verify text merges correctly.
- [ ] **Forum:**
    1. Create Thread.
    2. Post Comment.
    3. Add Counterpoint to Comment.
    4. Verify visual layout (side-by-side or distinct).
- [ ] **Bridge:**
    1. Select "Test Representative" (mock target).
    2. Fill form.
    3. Click "Send".
    4. Verify "Success" receipt and screenshot generation.

---

## 7. Risks & Mitigations
- **Risk:** GunDB sync latency for real-time chat/docs.
    - *Mitigation:* Aggressive local caching, optimistic UI, and conflict resolution (CRDTs).
- **Risk:** CAPTCHAs on legislative forms.
    - *Mitigation:* "Human-in-the-loop" mode where the user solves the CAPTCHA in the embedded browser view.
- **Risk:** CRDT complexity (overhead/conflicts).
    - *Mitigation:* Use established libraries (Yjs) over Gun if custom implementation proves too brittle.
