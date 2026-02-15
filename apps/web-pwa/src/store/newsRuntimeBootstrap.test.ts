import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  startNewsRuntimeMock,
  stopMock,
  writeStoryBundleMock,
} = vi.hoisted(() => ({
  startNewsRuntimeMock: vi.fn(),
  stopMock: vi.fn(),
  writeStoryBundleMock: vi.fn(),
}));

vi.mock('@vh/ai-engine', async () => {
  const actual = await vi.importActual<typeof import('@vh/ai-engine')>('@vh/ai-engine');
  return {
    ...actual,
    startNewsRuntime: (...args: unknown[]) => startNewsRuntimeMock(...args),
  };
});

vi.mock('@vh/gun-client', () => ({
  writeStoryBundle: (...args: unknown[]) => writeStoryBundleMock(...args),
}));

import {
  __resetNewsRuntimeForTesting,
  ensureNewsRuntimeStarted,
} from './newsRuntimeBootstrap';

function makeHandle(running = true) {
  return {
    stop: stopMock,
    isRunning: () => running,
    lastRun: () => null,
  };
}

describe('ensureNewsRuntimeStarted', () => {
  beforeEach(() => {
    __resetNewsRuntimeForTesting();
    startNewsRuntimeMock.mockReset();
    stopMock.mockReset();
    writeStoryBundleMock.mockReset();
    vi.unstubAllEnvs();
    startNewsRuntimeMock.mockReturnValue(makeHandle(true));
  });

  afterEach(() => {
    __resetNewsRuntimeForTesting();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('is a no-op when VITE_NEWS_RUNTIME_ENABLED is false', () => {
    vi.stubEnv('VITE_NEWS_RUNTIME_ENABLED', 'false');

    ensureNewsRuntimeStarted({ id: 'client-1' } as any);

    expect(startNewsRuntimeMock).not.toHaveBeenCalled();
  });

  it('boots runtime with parsed env config and gun write adapter when enabled', () => {
    vi.stubEnv('VITE_NEWS_RUNTIME_ENABLED', 'true');
    vi.stubEnv(
      'VITE_NEWS_FEED_SOURCES',
      JSON.stringify([
        {
          id: 'source-1',
          name: 'Source One',
          rssUrl: 'https://example.com/rss.xml',
          enabled: true,
        },
      ]),
    );
    vi.stubEnv(
      'VITE_NEWS_TOPIC_MAPPING',
      JSON.stringify({
        defaultTopicId: 'topic-news',
        sourceTopics: { 'source-1': 'topic-news' },
      }),
    );
    vi.stubEnv('VITE_NEWS_POLL_INTERVAL_MS', '60000');

    const client = { id: 'client-2' } as any;
    ensureNewsRuntimeStarted(client);

    expect(startNewsRuntimeMock).toHaveBeenCalledTimes(1);
    expect(startNewsRuntimeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gunClient: client,
        pollIntervalMs: 60_000,
      }),
    );

    const runtimeConfig = startNewsRuntimeMock.mock.calls[0]?.[0] as {
      writeStoryBundle: unknown;
      feedSources: unknown[];
      topicMapping: { defaultTopicId: string };
    };

    expect(runtimeConfig.writeStoryBundle).toBeTypeOf('function');
    expect(runtimeConfig.feedSources).toHaveLength(1);
    expect(runtimeConfig.topicMapping.defaultTopicId).toBe('topic-news');
  });

  it('is idempotent across repeated calls with the same client', () => {
    vi.stubEnv('VITE_NEWS_RUNTIME_ENABLED', 'true');

    const client = { id: 'stable-client' } as any;
    ensureNewsRuntimeStarted(client);
    ensureNewsRuntimeStarted(client);

    expect(startNewsRuntimeMock).toHaveBeenCalledTimes(1);
    expect(stopMock).not.toHaveBeenCalled();
  });
});
