import { z } from 'zod';

export const AttestationPayloadSchema = z.object({
  deviceIdentifier: z.string().min(1),
  timestamp: z.number().int().nonnegative(),
  nonce: z.string().min(16),
  payload: z.string().optional(),
  signature: z.string().optional()
});

export type AttestationPayload = z.infer<typeof AttestationPayloadSchema>;

export type UniquenessNullifier = string;

export interface SentimentSignal {
  actorId: string;
  targetId: string;
  magnitude: number;
  confidence: number;
  createdAt: number;
}

export { z };
