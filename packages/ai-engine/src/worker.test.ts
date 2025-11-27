import { beforeEach, describe, expect, it, vi } from 'vitest';

const posts: any[] = [];
globalThis.self = globalThis as any;
globalThis.postMessage = (data: any) => {
  posts.push(data);
};

const loadWorker = () => import('./worker');

const successMocks = () => {
  vi.doMock('./engines', () => ({
    EngineRouter: vi.fn().mockImplementation(() => ({
      generate: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          final_refined: {
            summary: 'Mock summary',
            bias_claim_quote: ['quote'],
            justify_bias_claim: ['justification'],
            biases: ['bias'],
            counterpoints: ['counter'],
            sentimentScore: 0.5,
            confidence: 0.9
          }
        }),
        engine: 'mock-engine'
      })
    }))
  }));

  vi.doMock('./prompts', () => ({
    buildPrompt: vi.fn().mockReturnValue('Mock Prompt')
  }));

  vi.doMock('./schema', () => ({
    parseAnalysisResponse: vi.fn().mockReturnValue({
      summary: 'Mock summary',
      bias_claim_quote: ['quote'],
      justify_bias_claim: ['justification'],
      biases: ['bias'],
      counterpoints: ['counter'],
      sentimentScore: 0.5,
      confidence: 0.9
    })
  }));

  vi.doMock('./validation', () => ({
    validateAnalysisAgainstSource: vi.fn().mockReturnValue([])
  }));
};

const failingEngineMock = () => {
  vi.doMock('./engines', () => ({
    EngineRouter: vi.fn().mockImplementation(() => ({
      generate: vi.fn().mockRejectedValue(new Error('Engine failed'))
    }))
  }));

  vi.doMock('./prompts', () => ({
    buildPrompt: vi.fn().mockReturnValue('Mock Prompt')
  }));

  vi.doMock('./schema', () => ({
    parseAnalysisResponse: vi.fn().mockReturnValue({})
  }));

  vi.doMock('./validation', () => ({
    validateAnalysisAgainstSource: vi.fn().mockReturnValue([])
  }));
};

describe('worker', () => {
  beforeEach(() => {
    posts.length = 0;
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('handles ANALYZE message success', async () => {
    successMocks();
    await loadWorker();

    const msg = {
      id: '1',
      type: 'ANALYZE',
      payload: { articleText: 'text', urlHash: 'abc' }
    };

    await (globalThis as any).onmessage({ data: msg });

    // Allow async worker processing to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(posts.some(p =>
      p.type === 'SUCCESS' &&
      p.id === '1' &&
      p.payload.engine === 'mock-engine'
    )).toBe(true);
  });

  it('handles ANALYZE message failure', async () => {
    failingEngineMock();
    await loadWorker();

    const msg = {
      id: '2',
      type: 'ANALYZE',
      payload: { articleText: 'text', urlHash: 'abc' }
    };

    await (globalThis as any).onmessage({ data: msg });

    expect(posts.some(p =>
      p.type === 'ERROR' &&
      p.id === '2' &&
      p.payload.message === 'Engine failed'
    )).toBe(true);
  });
});
