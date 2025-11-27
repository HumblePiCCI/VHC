import { z } from 'zod';

export interface AttestationPayload {
  platform: 'ios' | 'android' | 'web';
  integrityToken: string;
  deviceKey: string;
  nonce: string;
}

export interface VerificationResult {
  success: boolean;
  trustScore: number;
  issuedAt: number;
}

export interface SessionResponse {
  token: string;
  trustScore: number;
  nullifier: string;
}

export interface RegionProof {
  proof: string;
  publicSignals: string[];
  timestamp: number;
}

export const AttestationPayloadSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  integrityToken: z.string().min(1),
  deviceKey: z.string().min(1),
  nonce: z.string().min(1)
});

export const VerificationResultSchema = z.object({
  success: z.boolean(),
  trustScore: z.number().min(0).max(1),
  issuedAt: z.number().int().nonnegative()
});

export const SessionResponseSchema = z.object({
  token: z.string().min(1),
  trustScore: z.number().min(0).max(1),
  nullifier: z.string().min(1)
});

export const RegionProofSchema = z.object({
  proof: z.string().min(1),
  publicSignals: z.array(z.string().min(1)).min(1),
  timestamp: z.number().int().nonnegative()
});

export type UniquenessNullifier = string;
export type TrustScore = number; // 0 to 1
export type ScaledTrustScore = number; // 0 to 10000

export interface SentimentSignal {
  topic_id: string;
  analysis_id: string;
  point_id: string;
  agreement: 1 | 0 | -1;
  weight: number;
  constituency_proof: ConstituencyProof;
  emitted_at: number;
}

export type RegionProofTuple = [string, string, string]; // [district_hash, nullifier, merkle_root]

export interface ConstituencyProof {
  district_hash: string;
  nullifier: string;
  merkle_root: string;
}

export const ConstituencyProofSchema = z.object({
  district_hash: z.string().min(1),
  nullifier: z.string().min(1),
  merkle_root: z.string().min(1)
});

export const SentimentSignalSchema = z.object({
  topic_id: z.string().min(1),
  analysis_id: z.string().min(1),
  point_id: z.string().min(1),
  agreement: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
  weight: z.number().min(0).max(2),
  constituency_proof: ConstituencyProofSchema,
  emitted_at: z.number().int().nonnegative()
});

export { z };
