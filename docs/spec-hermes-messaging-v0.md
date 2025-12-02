# HERMES Messaging Spec (v0)

**Version:** 0.1
**Status:** Canonical for Sprint 3
**Context:** Secure, local-first, peer-to-peer messaging for TRINITY OS.

---

## 1. Core Principles

1.  **Physics is Trust:** Identity is rooted in hardware (LUMA).
2.  **E2EE Default:** All private messages are End-to-End Encrypted. No plaintext on the wire or mesh.
3.  **Local-First:** Messages live on the user's device. The mesh is for transport and backup (encrypted).
4.  **Out-of-Band Discovery:** No central user directory. Users connect via QR code or direct Public Key sharing.

---

## 2. Data Model

### 2.1 Message Schema
```typescript
interface Message {
  id: string;               // UUID — canonical across all copies (inbox/outbox/chats/devices)
  schemaVersion: 'hermes-message-v0';
  channelId: string;        // Derived from sorted participant identity keys
  
  // Identity Keys (routing & UI)
  // In v0, sender and recipient are set to the session nullifier
  // (SessionResponse.nullifier from packages/types), which is the
  // canonical identity key across TRINITY.
  sender: string;           // Sender's session nullifier (identity key)
  recipient: string;        // Recipient's session nullifier (identity key)
  
  timestamp: number;        // Unix timestamp (client-generated)
  
  // Encrypted Payload (SEA.encrypt)
  content: string;          // "ct" string from SEA (never plaintext)
  
  // Metadata (Unencrypted but minimal)
  type: 'text' | 'image' | 'file';
  
  // Integrity
  signature: string;        // SEA.sign(id + timestamp + content, senderDeviceKey)
  
  // Optional: Multi-device support
  deviceId?: string;        // Originating device identifier (for multi-device UX)
}
```

**Implementation Note:** In v0, encryption uses per-device SEA keypairs (from LUMA). The `sender` / `recipient` fields use identity-level keys (nullifiers) for routing and UI. Devices maintain a mapping `{ identityKey -> deviceKey }` locally. Device-level SEA keys are used for encryption/signing; nullifier is for routing & civic identity.

### 2.2 Channel Schema
```typescript
interface Channel {
  id: string;               // Deterministic: sha256(sort([identityKeyA, identityKeyB]).join('|'))
  schemaVersion: 'hermes-channel-v0';
  participants: string[];   // List of identity keys / nullifiers (not device keys)
  lastMessageAt: number;    // Timestamp of last activity
  type: 'dm';               // v0 is strictly 1:1; 'group' is v1+
}
```

**Channel ID Derivation:**
```typescript
function deriveChannelId(participants: string[]): string {
  const sorted = [...participants].sort();
  return sha256(sorted.join('|'));
}
```

All messaging code must use this canonical derivation to ensure deterministic channel identification.

**Browser-Safe Crypto:** `sha256` must use existing browser-safe crypto utilities (e.g., WebCrypto / `@noble/hashes`) via `packages/crypto`. Do not use `node:crypto` in packages consumed by the web app.

---

## 3. Transport & Storage (GunDB)

### 3.1 Namespace Topology
*   **User Inbox:** `~<recipient_identityKey>/hermes/inbox`
    *   Sender writes encrypted message reference here.
*   **User Outbox:** `~<sender_identityKey>/hermes/outbox`
    *   Sender writes copy here for their own multi-device sync.
*   **Chat History:** `~<user_identityKey>/hermes/chats/<channelId>`
    *   Local view of the conversation.

**Gun Access Rule:** All Gun operations must be performed via `@vh/gun-client`, respecting the Hydration Barrier (no writes before `hydrate()` completes). No direct `Gun()` calls in app code.

**Gun Adapters:** Expose helpers using identity keys (nullifiers):
```typescript
getHermesInboxChain(identityKey: string): ChainWithGet<Message>
getHermesOutboxChain(identityKey: string): ChainWithGet<Message>
getHermesChatChain(identityKey: string, channelId: string): ChainWithGet<Message>
```

### 3.2 Encryption (SEA)
*   **Shared Secret:** ECDH (Elliptic Curve Diffie-Hellman).
    *   `secret = SEA.secret(recipientDevicePub, senderDevicePair)`
*   **Encryption:** `SEA.encrypt(text, secret)`
*   **Decryption:** `SEA.decrypt(ciphertext, secret)`

**Payload Structure:**
```typescript
interface HermesPayload {
  text?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}
```

The plaintext `HermesPayload` is serialized to JSON and encrypted before storage. Only the ciphertext is written to Gun.

### 3.3 Multi-Device Deduplication

*   `id` is canonical for a message across inbox/outbox/chats and across devices.
*   Clients must de-duplicate by `id` when building channel history (messages may exist in multiple Gun locations).
*   `deviceId` is for UX/diagnostics only in v0; it does not affect `id` or dedupe logic.

### 3.4 Attachments
*   **Small (<100KB):** Base64 encoded inside the encrypted `content` payload.
*   **Large (>100KB):**
    1.  Upload encrypted blob to MinIO (Cloud Relay).
    2.  Send `content` as a link/hash: `minio://<bucket>/<key>`.
    3.  Recipient downloads and decrypts using the chat's shared secret.

**Season 0 Storage:** "Large" attachments are stored in the existing MinIO deployment via a thin `@vh/blob-service` wrapper (IPFS is a possible future backend). Do not spin up a separate, incompatible blob service.

---

## 4. Gating & Trust

### 4.1 Session Gating

*   **Requirement:** Messaging requires a valid LUMA session (identity + attestation).
*   **No Additional Threshold:** HERMES Messaging does not introduce any additional trustScore threshold beyond whatever the session gate uses (per `System_Architecture.md` §4.1.5).
*   **UI Enforcement:** If `useIdentity()` returns no active session, the Messaging UI shows a "Create identity to start messaging" gate.

---

## 5. Discovery & Connection (v0)

*   **Mechanism:** Strictly Out-of-Band.
*   **Flow:**
    1.  Alice shows QR Code (identity key / nullifier) to Bob.
    2.  Bob scans QR Code.
    3.  App derives `channelId` using `deriveChannelId([aliceKey, bobKey])` → Starts Chat.
    4.  Bob sends first message → Alice receives in `inbox`.

**No Central Directory:** In v0, there is no global user search or handle lookup. Users must exchange keys directly (QR scan, manual paste, or external share).

---

## 6. Offline & Sync

*   **Relays:** Gun relays hold the encrypted graph data.
*   **Sync:** When Bob comes online, his client subscribes to `~<bob_identityKey>/hermes/inbox`.
*   **Persistence:** `localStorage` + IndexedDB (via `gun-client` adapter) stores the decrypted history locally.

---

## 7. Error Handling

*   **Gun Put Error (`ack.err`):** Mark message as `status: 'failed'` in the local store. Do not retry automatically.
*   **Timeout:** Follow the "proceed without ack" model from `gun-client`. Keep `status: 'pending'` until the message is reflected in inbox/history.
*   **Decryption Failure:** Log warning, display placeholder message ("Unable to decrypt"). Do not crash.

---

## 8. Future Proofing (v1+)

*   **Group Chats:** Will require Multi-Cast Encryption (sender encrypts N times or uses a shared group key rotated on membership change). `Channel.type: 'group'` is reserved.
*   **Push Notifications:** Encrypted push payloads via a blind relay service.
*   **Device Sync Protocol:** Formal protocol for syncing chat history across devices beyond basic Gun replication.

---

## 9. Implementation Checklist

- [ ] Implement `Message` and `Channel` schemas in `packages/data-model/src/schemas/hermes/message.ts`.
- [ ] Implement `deriveChannelId` helper in `packages/data-model` using `@vh/crypto` (browser-safe).
- [ ] Implement encryption wrappers in `packages/gun-client/src/hermesCrypto.ts`.
- [ ] Implement Gun adapters: `getHermesInboxChain`, `getHermesOutboxChain`, `getHermesChatChain`.
- [ ] Implement `useChatStore` in `apps/web-pwa/src/store/hermesMessaging.ts`.
- [ ] Implement UI components: `ChatLayout`, `ChannelList`, `MessageBubble`, `Composer`, `ContactQR`, `ScanContact`.
- [ ] Implement message deduplication by `id` in channel history builder.
- [ ] Write unit tests for schemas, `deriveChannelId`, and encryption round-trips.
- [ ] Write E2E tests for message flow with mock attestation.
