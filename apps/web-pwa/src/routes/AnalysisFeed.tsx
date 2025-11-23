import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@vh/ui';
import type { AnalysisResult } from '../../../../packages/ai-engine/src/prompts';
import { getOrGenerate, hashUrl, type CanonicalAnalysis } from '../../../../packages/ai-engine/src/analysis';

const FEED_KEY = 'vh_canonical_analyses';

interface FeedStore {
  data: CanonicalAnalysis[];
  save: (items: CanonicalAnalysis[]) => void;
}

function loadFeed(): FeedStore {
  try {
    const raw = localStorage.getItem(FEED_KEY);
    const data = raw ? (JSON.parse(raw) as CanonicalAnalysis[]) : [];
    return {
      data,
      save(items: CanonicalAnalysis[]) {
        localStorage.setItem(FEED_KEY, JSON.stringify(items));
      }
    };
  } catch {
    return {
      data: [],
      save: () => {}
    };
  }
}

async function getFromFeed(urlHash: string, feed: CanonicalAnalysis[]) {
  const existing = feed.find((item) => item.urlHash === urlHash);
  return existing ?? null;
}

export const AnalysisFeed: React.FC = () => {
  const [url, setUrl] = useState('');
  const [feed, setFeed] = useState<CanonicalAnalysis[]>(() => loadFeed().data);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const store = useMemo(() => loadFeed(), []);

  const sortedFeed = useMemo(
    () => [...feed].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10),
    [feed]
  );

  const runAnalysis = useCallback(
    async (targetUrl: string) => {
      setBusy(true);
      const urlHash = hashUrl(targetUrl);
      const existing = await getFromFeed(urlHash, feed);
      if (existing) {
        setMessage('Analysis already exists. Showing cached result.');
        setBusy(false);
        return existing;
      }

      return new Promise<CanonicalAnalysis>((resolve) => {
        const generate = async (): Promise<AnalysisResult> =>
          new Promise((res) =>
            setTimeout(
              () =>
                res({
                  summary: `Local analysis for ${targetUrl}`,
                  biases: ['Local-first'],
                  counterpoints: ['None'],
                  sentimentScore: 0,
                  bias_claim_quote: [],
                  justify_bias_claim: [],
                  confidence: 0.6
                }),
              80
            )
          );

        void getOrGenerate(
          targetUrl,
          {
            async getByHash(hash) {
              return getFromFeed(hash, feed);
            },
            async save(record) {
              const next = [record, ...feed];
              setFeed(next);
              store.save(next);
            },
            async listRecent() {
              return feed;
            }
          },
          generate
        )
          .then((result) => {
            resolve(result.analysis);
          })
          .finally(() => setBusy(false));
      });
    },
    [feed, store]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const targetUrl = url.trim();
    if (!targetUrl) {
      setMessage('Enter a valid URL');
      return;
    }
    try {
      const analysis = await runAnalysis(targetUrl);
      setMessage(`Analysis ready for ${analysis.url}`);
      setUrl('');
    } catch (err) {
      setMessage((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Canonical Analysis</p>
          <p className="text-xs text-slate-600">Local-only WebLLM · First-to-File</p>
        </div>
        {message && <span className="text-xs text-slate-700">{message}</span>}
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          placeholder="Paste URL to analyze"
          value={url}
      onChange={(e) => setUrl(e.target.value)}
      data-testid="analysis-url-input"
    />
        <Button type="submit" disabled={busy}>
          {busy ? 'Analyzing…' : 'Analyze'}
        </Button>
      </form>

      <div className="grid gap-3">
        {sortedFeed.length === 0 && <p className="text-sm text-slate-600">No analyses yet.</p>}
        {sortedFeed.map((item) => (
          <div key={item.urlHash} className="rounded border border-slate-100 bg-slate-50 p-3 space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
            <p className="text-sm font-semibold text-slate-900">{item.url}</p>
            <p className="text-sm text-slate-700">{item.summary}</p>
            <p className="text-xs text-slate-600">Biases: {item.biases.join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
