import { describe, expect, it } from 'vitest';
import {
  HermesCommentSchema,
  HermesCommentWriteSchema,
  HermesThreadSchema,
  ModerationEventSchema,
  migrateCommentToV1,
  computeThreadScore
} from './forum';

const now = Date.now();

const baseThread = {
  id: 'thread-1',
  schemaVersion: 'hermes-thread-v0',
  title: 'A civic conversation',
  content: 'Markdown content',
  author: 'alice-nullifier',
  timestamp: now - 1_000,
  tags: ['infrastructure'],
  upvotes: 10,
  downvotes: 2,
  score: 0
};

const baseCommentV0 = {
  id: 'comment-1',
  schemaVersion: 'hermes-comment-v0' as const,
  threadId: 'thread-1',
  parentId: null,
  content: 'Nice point',
  author: 'bob-nullifier',
  timestamp: now,
  type: 'reply' as const,
  upvotes: 1,
  downvotes: 0
};

const baseCommentV1 = {
  id: 'comment-v1',
  schemaVersion: 'hermes-comment-v1' as const,
  threadId: 'thread-1',
  parentId: null,
  content: 'Structured comment',
  author: 'carol-nullifier',
  timestamp: now,
  stance: 'concur' as const,
  upvotes: 0,
  downvotes: 0
};

describe('HermesThreadSchema', () => {
  it('accepts a valid thread', () => {
    const parsed = HermesThreadSchema.parse(baseThread);
    expect(parsed.title).toBe('A civic conversation');
  });

  it('rejects title over 200 chars', () => {
    const result = HermesThreadSchema.safeParse({
      ...baseThread,
      title: 'a'.repeat(201)
    });
    expect(result.success).toBe(false);
  });

  it('rejects content over 10k chars', () => {
    expect(() =>
      HermesThreadSchema.parse({
        ...baseThread,
        content: 'b'.repeat(10_001)
      })
    ).toThrow();
  });
});

describe('computeThreadScore', () => {
  it('decays score for older threads', () => {
    const freshScore = computeThreadScore(
      {
        ...baseThread,
        timestamp: now,
        score: 0
      },
      now
    );
    const oldScore = computeThreadScore(
      {
        ...baseThread,
        timestamp: now - 72 * 3_600_000,
        score: 0
      },
      now
    );

    expect(oldScore).toBeLessThan(freshScore);
  });
});

describe('HermesCommentSchema', () => {
  it('accepts a v1 comment with stance', () => {
    const parsed = HermesCommentSchema.parse(baseCommentV1);
    expect(parsed.stance).toBe('concur');
  });

  it('accepts a v1 comment with discuss stance', () => {
    const parsed = HermesCommentSchema.parse({ ...baseCommentV1, stance: 'discuss' as const });
    expect(parsed.stance).toBe('discuss');
  });

  it('accepts a v0 reply without targetId', () => {
    const parsed = HermesCommentSchema.parse(baseCommentV0);
    expect(parsed.targetId).toBeUndefined();
  });

  it('requires targetId for v0 counterpoints', () => {
    const result = HermesCommentSchema.safeParse({ ...baseCommentV0, type: 'counterpoint' });
    expect(result.success).toBe(false);
  });

  it('rejects targetId on v0 replies', () => {
    const result = HermesCommentSchema.safeParse({ ...baseCommentV0, targetId: 'comment-2' });
    expect(result.success).toBe(false);
  });

  it('accepts a v0 counterpoint with targetId', () => {
    const parsed = HermesCommentSchema.parse({
      ...baseCommentV0,
      type: 'counterpoint',
      targetId: 'comment-2'
    });
    expect(parsed.type).toBe('counterpoint');
    expect(parsed.targetId).toBe('comment-2');
  });

  describe('V1 schema superRefine validations', () => {
    it('requires targetId for v1 comment with legacy type counterpoint', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'counter',
        type: 'counterpoint'
        // Missing targetId
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('targetId is required when legacy type is counterpoint');
      }
    });

    it('accepts v1 counterpoint with legacy type and targetId', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'counter',
        type: 'counterpoint',
        targetId: 'comment-target'
      });
      expect(result.success).toBe(true);
    });

    it('rejects targetId on v1 comment with legacy type reply', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'concur',
        type: 'reply',
        targetId: 'comment-2'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('targetId must be omitted for replies');
      }
    });

    it('accepts v1 reply with legacy type and no targetId', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'concur',
        type: 'reply'
      });
      expect(result.success).toBe(true);
    });

    it('warns when stance does not align with legacy type (concur vs counterpoint)', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'concur', // Should be 'counter' for counterpoint
        type: 'counterpoint',
        targetId: 'comment-target'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('stance should align with legacy type');
      }
    });

    it('warns when stance does not align with legacy type (counter vs reply)', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'counter', // Should be 'concur' for reply
        type: 'reply'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('stance should align with legacy type');
      }
    });

    it('accepts v1 comment without legacy type (no validation conflict)', () => {
      const result = HermesCommentSchema.safeParse({
        ...baseCommentV1,
        stance: 'counter'
        // No type field
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('HermesCommentWriteSchema', () => {
  it('rejects legacy type on write payloads', () => {
    const result = HermesCommentWriteSchema.safeParse({ ...baseCommentV1, type: 'reply' });
    expect(result.success).toBe(false);
  });

  it('accepts canonical v1 payload', () => {
    const parsed = HermesCommentWriteSchema.parse(baseCommentV1);
    expect(parsed.stance).toBe('concur');
    expect((parsed as any).type).toBeUndefined();
  });

  it('accepts canonical v1 payload with discuss stance', () => {
    const parsed = HermesCommentWriteSchema.parse({ ...baseCommentV1, stance: 'discuss' as const });
    expect(parsed.stance).toBe('discuss');
    expect((parsed as any).type).toBeUndefined();
  });
});

describe('migrateCommentToV1', () => {
  it('maps v0 reply to concur stance and strips type', () => {
    const migrated = migrateCommentToV1(baseCommentV0);
    expect(migrated.schemaVersion).toBe('hermes-comment-v1');
    expect(migrated.stance).toBe('concur');
    expect((migrated as any).type).toBeUndefined();
  });

  it('maps v0 counterpoint to counter stance and strips type', () => {
    const v0Counterpoint = {
      ...baseCommentV0,
      type: 'counterpoint' as const,
      targetId: 'comment-target'
    };
    const migrated = migrateCommentToV1(v0Counterpoint);
    expect(migrated.schemaVersion).toBe('hermes-comment-v1');
    expect(migrated.stance).toBe('counter');
    expect((migrated as any).type).toBeUndefined();
    expect(migrated.targetId).toBe('comment-target');
  });

  it('passes through v1 comments and removes legacy type', () => {
    const migrated = migrateCommentToV1({ ...baseCommentV1, type: 'reply' });
    expect(migrated).toMatchObject(baseCommentV1);
    expect((migrated as any).type).toBeUndefined();
  });
});

describe('ModerationEventSchema', () => {
  it('validates a moderation event', () => {
    const parsed = ModerationEventSchema.parse({
      id: 'mod-1',
      targetId: 'thread-1',
      action: 'hide',
      moderator: 'council-key',
      reason: 'inappropriate content',
      timestamp: now,
      signature: 'signed-moderation'
    });
    expect(parsed.action).toBe('hide');
  });

  it('rejects an invalid action', () => {
    const result = ModerationEventSchema.safeParse({
      id: 'mod-2',
      targetId: 'thread-1',
      action: 'flag',
      moderator: 'council-key',
      reason: 'spam',
      timestamp: now,
      signature: 'signed-moderation'
    });
    expect(result.success).toBe(false);
  });
});
