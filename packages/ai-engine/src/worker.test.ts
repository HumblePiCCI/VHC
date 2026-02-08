import { beforeEach, describe, expect, it, vi } from 'vitest';

const posts: any[] = [];
(globalThis as any).self = globalThis;
(globalThis as any).postMessage = (data: unknown) => {
  posts.push(data);
};

const loadWorker = () => import('./worker');

function setupWorkerMocks() {
  const pipelineRun = vi.fn();
  const createDefaultEngine = vi.fn().mockReturnValue({
    name: 'mock-local-engine',
    kind: 'local',
    modelName: 'mock-local-v1',
    generate: vi.fn()
  });

  const createAnalysisPipeline = vi.fn().mockReturnValue(pipelineRun);

  vi.doMock('./engines', () => ({
    createDefaultEngine
  }));

  vi.doMock('./pipeline', () => ({
    createAnalysisPipeline
  }));

  return {
    pipelineRun,
    createDefaultEngine,
    createAnalysisPipeline
  };
}

describe('worker', () => {
  beforeEach(() => {
    posts.length = 0;
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('handles ANALYZE success through pipeline', async () => {
    const { pipelineRun, createAnalysisPipeline, createDefaultEngine } = setupWorkerMocks();
    pipelineRun.mockResolvedValue({
      analysis: {
        summary: 'Mock summary',
        bias_claim_quote: ['quote'],
        justify_bias_claim: ['justification'],
        biases: ['bias'],
        counterpoints: ['counter'],
        sentimentScore: 0.5,
        confidence: 0.9
      },
      engine: {
        id: 'mock-local-engine',
        kind: 'local',
        modelName: 'mock-local-v1'
      },
      warnings: []
    });

    await loadWorker();

    await (globalThis as any).onmessage({
      data: {
        id: '1',
        type: 'ANALYZE',
        payload: { articleText: 'text', urlHash: 'abc' }
      }
    });

    expect(createDefaultEngine).toHaveBeenCalledTimes(1);
    expect(createAnalysisPipeline).toHaveBeenCalledTimes(1);
    expect(pipelineRun).toHaveBeenCalledWith('text');
    expect(posts).toContainEqual({
      id: '1',
      type: 'SUCCESS',
      payload: {
        analysis: {
          summary: 'Mock summary',
          bias_claim_quote: ['quote'],
          justify_bias_claim: ['justification'],
          biases: ['bias'],
          counterpoints: ['counter'],
          sentimentScore: 0.5,
          confidence: 0.9
        },
        engine: 'mock-local-engine',
        warnings: []
      }
    });
  });

  it('handles ANALYZE failures from pipeline', async () => {
    const { pipelineRun } = setupWorkerMocks();
    pipelineRun.mockRejectedValue(new Error('Engine failed'));

    await loadWorker();

    await (globalThis as any).onmessage({
      data: {
        id: '2',
        type: 'ANALYZE',
        payload: { articleText: 'text', urlHash: 'abc' }
      }
    });

    expect(posts).toContainEqual({
      id: '2',
      type: 'ERROR',
      payload: { message: 'Engine failed' }
    });
  });
});
