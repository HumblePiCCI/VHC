import { z } from 'zod';

export const ProfileSchema = z.object({
  pubkey: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().optional(),
  avatarCid: z.string().optional()
});

export const MessageSchema = z.object({
  id: z.string().min(1),
  timestamp: z.number().int().nonnegative(),
  sender: z.string().min(1),
  content: z.string().min(1),
  kind: z.enum(['text', 'image'])
});

export const AnalysisSchema = z.object({
  summary: z.string().min(1),
  biases: z.array(z.string().min(1)),
  counterpoints: z.array(z.string().min(1)),
  sentimentScore: z.number().min(-1).max(1),
  canonicalId: z.string().min(1)
});

export const SignalSchema = z.object({
  topic_id: z.string().min(1),
  bias_vector: z.object({
    point_id: z.string().min(1),
    agreement: z.boolean()
  }),
  weight: z.number(),
  constituency_proof: z.object({
    district_hash: z.string().min(1),
    nullifier: z.string().min(1),
    merkle_root: z.string().min(1)
  })
});
