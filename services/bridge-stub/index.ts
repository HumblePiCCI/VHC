export interface AttestorBridge {
  bridgeSession(session: { trustScore: number; nullifier: string; token: string }, wallet: string): Promise<void>;
}

export class BridgeStub implements AttestorBridge {
  async bridgeSession(session: { trustScore: number; nullifier: string; token: string }, wallet: string): Promise<void> {
    const payload = {
      wallet,
      scaledTrustScore: Math.round(session.trustScore * 10000),
      bytes32Nullifier: session.nullifier,
      token: session.token
    };
    console.info('[vh:bridge-stub] would submit attestation payload:', payload);
  }
}
