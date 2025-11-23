import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkerMessage } from './worker';

const mockReload = vi.fn();
const mockSetInitProgressCallback = vi.fn();
const mockCreate = vi.fn();

vi.mock('@mlc-ai/web-llm', () => ({
  MLCEngine: vi.fn().mockImplementation(() => ({
    reload: mockReload,
    setInitProgressCallback: mockSetInitProgressCallback,
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }))
}));

const posts: any[] = [];
globalThis.self = globalThis as any;
globalThis.postMessage = (data: any) => {
  posts.push(data);
};

const workerModule = () => import('./worker');

describe('worker', () => {
  beforeEach(() => {
    posts.length = 0;
    mockReload.mockReset();
    mockSetInitProgressCallback.mockReset();
    mockCreate.mockReset();
    vi.resetModules();
  });

  it('handles LOAD_MODEL', async () => {
    const { default: _ } = await workerModule();
    const msg: WorkerMessage = { type: 'LOAD_MODEL', payload: { modelId: 'm1' } };
    await (globalThis as any).onmessage({ data: msg });
    expect(mockReload).toHaveBeenCalledWith('m1');
    expect(posts.some((p) => p.type === 'MODEL_LOADED')).toBe(true);
  });

  it('handles GENERATE_ANALYSIS with chatty JSON', async () => {
    const { default: _ } = await workerModule();
    const fakeResult = { summary: 's', biases: [], counterpoints: [], bias_claim_quote: [], justify_bias_claim: [] };
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: `Preamble\n\n${JSON.stringify(fakeResult)}\nThanks!`
          }
        }
      ]
    });
    // initialize engine first
    await (globalThis as any).onmessage({ data: { type: 'LOAD_MODEL', payload: { modelId: 'm1' } } });
    const msg: WorkerMessage = { type: 'GENERATE_ANALYSIS', payload: { articleText: 'hello' } };
    await (globalThis as any).onmessage({ data: msg });
    expect(posts.some((p) => p.type === 'ANALYSIS_COMPLETE')).toBe(true);
  });

  it('returns cached analysis without re-querying engine', async () => {
    const { default: _ } = await workerModule();
    const fakeResult = { summary: 'cached', biases: [], counterpoints: [], bias_claim_quote: [], justify_bias_claim: [] };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(fakeResult) } }]
    });
    await (globalThis as any).onmessage({ data: { type: 'GENERATE_ANALYSIS', payload: { articleText: 'repeat me' } } });
    expect(posts.some((p) => p.type === 'ANALYSIS_COMPLETE')).toBe(true);

    posts.length = 0;
    mockCreate.mockClear();
    await (globalThis as any).onmessage({ data: { type: 'GENERATE_ANALYSIS', payload: { articleText: 'repeat me' } } });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(posts.some((p) => p.type === 'ANALYSIS_COMPLETE')).toBe(true);
  });

  it('emits error when JSON missing', async () => {
    const { default: _ } = await workerModule();
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: 'no json here' } }] });
    const msg: WorkerMessage = { type: 'GENERATE_ANALYSIS', payload: { articleText: 'hello' } };
    await (globalThis as any).onmessage({ data: msg });
    expect(posts.some((p) => p.type === 'ERROR')).toBe(true);
  });
});
