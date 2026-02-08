import { buildPrompt } from './prompts';
import { parseAnalysisResponse, type AnalysisResult } from './schema';
import { validateAnalysisAgainstSource } from './validation';
import { createDefaultEngine, EngineRouter, type JsonCompletionEngine } from './engines';

export interface PipelineResult {
  analysis: AnalysisResult;
  engine: {
    id: string;
    kind: 'remote' | 'local';
    modelName: string;
  };
  warnings: string[];
}

function createRouter(engine: JsonCompletionEngine) {
  if (engine.kind === 'remote') {
    return new EngineRouter(undefined, engine, 'remote-only');
  }
  return new EngineRouter(engine, undefined, 'local-only');
}

function toEngineMetadata(engine: JsonCompletionEngine): PipelineResult['engine'] {
  return {
    id: engine.name,
    kind: engine.kind,
    modelName: engine.modelName ?? engine.name
  };
}

export function createAnalysisPipeline(
  engine?: JsonCompletionEngine
): (articleText: string) => Promise<PipelineResult> {
  const activeEngine = engine ?? createDefaultEngine();
  const router = createRouter(activeEngine);

  return async (articleText: string): Promise<PipelineResult> => {
    const prompt = buildPrompt(articleText);
    const { text } = await router.generate(prompt);
    const analysis = parseAnalysisResponse(text);
    const warnings = validateAnalysisAgainstSource(articleText, analysis).map((warning) => warning.message);

    return {
      analysis,
      engine: toEngineMetadata(activeEngine),
      warnings
    };
  };
}
