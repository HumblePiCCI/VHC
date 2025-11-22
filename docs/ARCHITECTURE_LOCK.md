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
