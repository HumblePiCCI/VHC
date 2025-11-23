import React from 'react';
import type { FeedItem, Perspective } from '../hooks/useFeedStore';
import { useCivicState } from '../hooks/useCivicState';

interface AnalysisViewProps {
  item: FeedItem;
}

function PerspectiveRow({ itemId, perspective }: { itemId: string; perspective: Perspective }) {
  const scoreKey = `${itemId}:${perspective.id}`;
  const score = useCivicState((s) => s.scores[scoreKey] ?? 0);
  const updateScore = useCivicState((s) => s.updateScore);

  return (
    <div className="grid grid-cols-2 gap-2 rounded border border-slate-600/50 bg-slate-900/40 p-3">
      <div className="text-sm text-slate-50">{perspective.frame}</div>
      <div className="text-sm text-slate-50">{perspective.reframe}</div>
      <div className="col-span-2 flex items-center justify-end gap-2 text-xs text-slate-300">
        <button
          type="button"
          className="rounded bg-slate-800 px-2 py-1 hover:bg-slate-700"
          onClick={() => updateScore(scoreKey, -0.2)}
          aria-label="Downvote"
        >
          –
        </button>
        <span className="min-w-[2rem] text-center" aria-label="Engagement score">
          {score.toFixed(1)}
        </span>
        <button
          type="button"
          className="rounded bg-slate-800 px-2 py-1 hover:bg-slate-700"
          onClick={() => updateScore(scoreKey, 0.2)}
          aria-label="Upvote"
        >
          +
        </button>
      </div>
    </div>
  );
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ item }) => {
  return (
    <div className="rounded-xl border border-slate-600/60 bg-slate-900/50 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-wide text-teal-200">Summary</p>
          <p className="text-base text-slate-50 leading-relaxed">{item.summary}</p>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-28 w-40 rounded-lg object-cover shadow-md"
          />
        )}
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-sm uppercase tracking-wide text-teal-200">Perspectives</p>
        <div className="space-y-2">
          {item.perspectives.map((p) => (
            <PerspectiveRow key={p.id} itemId={item.id} perspective={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
