import { EngineRouter } from './engines';
import { parseAnalysisResponse } from './schema';
import { validateAnalysisAgainstSource } from './validation';
import { buildPrompt } from './prompts';

// Mock engine for now, will be replaced by real implementation
const mockEngine = {
  name: 'mock-engine',
  kind: 'local' as const,
  generate: async () => JSON.stringify({
    final_refined: {
      summary: 'Mock summary',
      bias_claim_quote: ['quote'],
      justify_bias_claim: ['justification'],
      biases: ['bias'],
      counterpoints: ['counter'],
      sentimentScore: 0.5,
      confidence: 0.9
    }
  })
};

const router = new EngineRouter(mockEngine, undefined, 'local-only');

export type WorkerMessage =
  | { type: "ANALYZE"; payload: { articleText: string; urlHash: string } };

export type WorkerResponse =
  | { type: "SUCCESS"; payload: { analysis: any; engine: string; warnings: any[] } }
  | { type: "ERROR"; payload: { message: string } };

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  if (type === 'ANALYZE') {
    try {
      const { articleText } = payload;
      const prompt = buildPrompt(articleText);

      // 1. Generate
      const { text, engine } = await router.generate(prompt);

      // 2. Parse
      const analysis = parseAnalysisResponse(text);

      // 3. Validate
      const warnings = validateAnalysisAgainstSource(articleText, analysis as any);

      self.postMessage({
        id,
        type: 'SUCCESS',
        payload: {
          analysis,
          engine,
          warnings
        }
      });
    } catch (err) {
      self.postMessage({
        id,
        type: 'ERROR',
        payload: { message: (err as Error).message }
      });
    }
  }
};
