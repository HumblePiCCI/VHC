/** Device attestation payload sent during identity verification. */
export interface AttestationPayload {
  platform: 'ios' | 'android' | 'web';
  integrityToken: string;
  deviceKey: string;
  nonce: string;
}
