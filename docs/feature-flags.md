# Feature Flags (Season 0)

This document defines compile-time flags used by the web PWA for FPD rollout.

## Critical note

`VITE_*` variables are compile-time values. They are baked into the bundle at build time and cannot be changed dynamically at runtime.

## Flags

- **`VITE_CONSTITUENCY_PROOF_REAL`**
  - **Default:** `false`
  - **Description:** Selects proof-provider mode.
    - `false`: transitional shim path (dev/staging/E2E only)
    - `true`: real attestation-bound provider path
  - **Production requirement:** `true`

- **`VITE_E2E_MODE`**
  - **Default:** `false`
  - **Description:** Enables E2E-mode stores/wiring used for deterministic browser tests.
  - **Production requirement:** `false`
  - **Note:** E2E mode uses transitional proof behavior and is never valid for production builds.

- **`VITE_DEFAULT_DISTRICT_HASH`**
  - **Default:** empty
  - **Description:** District hash used by proof verification in Season 0 real mode.
  - **Production requirement:** must be explicitly configured to the deployment district value.

- **`VITE_VH_ANALYSIS_PIPELINE`**
  - **Default:** `false`
  - **Description:** Enables analysis pipeline generation/consumption paths.
  - **Production requirement:** set per release plan; leave `false` until rollout gate approval.

- **`VITE_VH_ANALYSIS_DAILY_LIMIT`**
  - **Default:** `20`
  - **Description:** Daily analysis generation cap (`0` means unlimited).
  - **Production requirement:** non-zero finite limit unless explicit exception approved.

- **`VITE_VH_BIAS_TABLE_V2`**
  - **Default:** `false`
  - **Description:** Enables Bias Table v2 UX behavior.
  - **Production requirement:** set per rollout decision.

## Deployment guardrails

1. Production builds must enforce `VITE_CONSTITUENCY_PROOF_REAL=true`.
2. E2E-mode (`VITE_E2E_MODE=true`) is test-only and cannot ship.
3. Any flag change requires a new build artifact because flags are compile-time constants.
