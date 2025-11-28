import React from 'react';
import type { FeedItem, Perspective } from '../hooks/useFeedStore';
import { useSentimentState } from '../hooks/useSentimentState';
import { useRegion } from '../hooks/useRegion';

interface AnalysisViewProps {
  item: FeedItem;
}

function PerspectiveRow({ itemId, perspective }: { itemId: string; perspective: Perspective }) {
  const agreement = useSentimentState((s) => s.getAgreement(itemId, perspective.id));
  const setAgreement = useSentimentState((s) => s.setAgreement);
  const lightbulb = useSentimentState((s) => s.getLightbulbWeight(itemId));
  const { proof } = useRegion();

  const handleSet = (desired: -1 | 0 | 1) => {
    setAgreement({
      topicId: itemId,
      pointId: perspective.id,
      analysisId: itemId,
      desired,
      constituency_proof: proof || undefined
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 rounded border border-slate-600/50 bg-slate-900/40 p-3">
      <div className="text-sm text-slate-50">{perspective.frame}</div>
      <div className="text-sm text-slate-50">{perspective.reframe}</div>
      <div className="col-span-2 flex items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <ToggleButton label="Disagree" active={agreement === -1} onClick={() => handleSet(-1)} ariaLabel="Disagree" variant="disagree">
            –
          </ToggleButton>
          <ToggleButton label="Neutral" active={agreement === 0} onClick={() => handleSet(0)} ariaLabel="Neutral">
            ○
          </ToggleButton>
          <ToggleButton label="Agree" active={agreement === 1} onClick={() => handleSet(1)} ariaLabel="Agree" variant="agree">
            +
          </ToggleButton>
        </div>
        <span className="min-w-[4rem] text-right" aria-label="Engagement score">
          💡 {lightbulb.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ToggleButton({
  children,
  active,
  onClick,
  ariaLabel,
  label,
  variant = 'default'
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  label: string;
  variant?: 'agree' | 'disagree' | 'default';
}) {
  const activeColor = variant === 'agree' ? 'bg-emerald-600' : variant === 'disagree' ? 'bg-red-600' : 'bg-teal-600';
  return (
    <button
      type="button"
      className={`rounded px-2 py-1 ${active ? `${activeColor} text-white` : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
      onClick={onClick}
      aria-label={ariaLabel}
      title={label}
    >
      {children}
    </button>
  );
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ item }) => {
  // Note: recordRead is called by HeadlineCard when expanded, not here
  return (
    <div className="rounded-xl border border-slate-600/60 bg-slate-900/50 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-wide text-teal-200">Summary</p>
          <p className="text-base leading-relaxed text-slate-50">{item.summary}</p>
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
