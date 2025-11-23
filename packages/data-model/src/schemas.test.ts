import { describe, expect, it } from 'vitest';
import { AnalysisSchema, CanonicalAnalysisSchema, CivicDecaySchema, MessageSchema, ProfileSchema } from './schemas';

describe('data-model schemas', () => {
  it('accepts a valid profile', () => {
    const result = ProfileSchema.parse({
      pubkey: 'pk',
      username: 'venn-user',
      bio: 'hello',
      avatarCid: 'cid'
    });
    expect(result.username).toBe('venn-user');
  });

  it('rejects too-short username', () => {
    expect(() =>
      ProfileSchema.parse({
        pubkey: 'pk',
        username: 'aa'
      })
    ).toThrow();
  });

  it('rejects too-long username', () => {
    expect(() =>
      ProfileSchema.parse({
        pubkey: 'pk',
        username: 'a'.repeat(31)
      })
    ).toThrow();
  });

  it('rejects message with invalid kind', () => {
    expect(() =>
      MessageSchema.parse({
        id: '1',
        timestamp: Date.now(),
        sender: 'pk',
        content: 'cipher',
        kind: 'video'
      })
    ).toThrow();
  });

  it('rejects invalid message timestamp', () => {
    expect(() =>
      MessageSchema.parse({
        id: '1',
        timestamp: -1,
        sender: 'pk',
        content: 'cipher',
        kind: 'text'
      })
    ).toThrow();
  });

  it('rejects analysis with out-of-range sentiment score', () => {
    expect(() =>
      AnalysisSchema.parse({
        canonicalId: 'abc',
        summary: 'test',
        biases: ['x'],
        counterpoints: ['y'],
        sentimentScore: -2,
        timestamp: Date.now()
      })
    ).toThrow();
  });

  it('rejects signal missing required fields', () => {
    expect(() =>
      SignalSchema.parse({
        topic_id: '',
        analysis_id: '',
        bias_vector: {},
        weight: 'bad'
      } as any)
    ).toThrow();
  });

  it('validates canonical analysis requires urlHash and url', () => {
    const valid = CanonicalAnalysisSchema.parse({
      url: 'https://example.com',
      urlHash: 'abc123',
      summary: 'summary',
      biases: ['bias'],
      counterpoints: ['counter'],
      sentimentScore: 0.1,
      timestamp: Date.now()
    });
    expect(valid.urlHash).toBe('abc123');

    expect(() =>
      CanonicalAnalysisSchema.parse({
        url: 'notaurl',
        urlHash: '',
        summary: 's',
        biases: [],
        counterpoints: [],
        sentimentScore: 0,
        timestamp: 0
      })
    ).toThrow();
  });

  it('enforces civic decay constraints', () => {
    const decay = CivicDecaySchema.parse({
      topicId: 'topic',
      interactions: 2,
      weight: 1,
      lastUpdated: Date.now()
    });
    expect(decay.weight).toBeGreaterThan(0);
    expect(() =>
      CivicDecaySchema.parse({
        topicId: '',
        interactions: -1,
        weight: -1,
        lastUpdated: -1
      })
    ).toThrow();
  });
});
