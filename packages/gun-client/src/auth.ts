import { sha256 } from '@vh/crypto';
import type { AttestationPayload, UniquenessNullifier } from '@vh/types';

/**
 * Derive a deterministic session nullifier from attestation inputs.
 * This stays local (no network) to honor Zero-Trust / Local-First.
 */
export async function createSession(attestation: AttestationPayload): Promise<UniquenessNullifier> {
  const { deviceKey, nonce, integrityToken, platform } = attestation;
  const material = `${platform}:${deviceKey}:${nonce}:${integrityToken}`;
  return sha256(material);
}
