import React, { useMemo, useState } from 'react';
import type { FeedItem, Perspective } from '../hooks/useFeedStore';
import { useSentimentState } from '../hooks/useSentimentState';
import { useRegion } from '../hooks/useRegion';
import { useIdentity } from '../hooks/useIdentity';
import { useForumStore } from '../store/hermesForum';
import { useRouter } from '@tanstack/react-router';
import { FlippableCard } from './venn/FlippableCard';
import { ThreadView } from './hermes/forum/ThreadView';
import { EngagementIcons } from './EngagementIcons';
import { useViewTracking } from '../hooks/useViewTracking';

interface AnalysisViewProps {
  item: FeedItem;
}

interface PerspectiveRowProps {
  itemId: string;
  perspective: Perspective;
  onBlockedVote: () => void;
}

function PerspectiveRow({ itemId, perspective, onBlockedVote }: PerspectiveRowProps) {
  const framePointId = `${perspective.id}:frame`;
  const reframePointId = `${perspective.id}:reframe`;
  const frameAgreement = useSentimentState((s) => s.getAgreement(itemId, framePointId));
  const reframeAgreement = useSentimentState((s) => s.getAgreement(itemId, reframePointId));
  const setAgreement = useSentimentState((s) => s.setAgreement);
  const { proof } = useRegion();
  const { identity } = useIdentity();
  const canVote = Boolean(identity);

  const handleSet = (pointId: string, desired: -1 | 0 | 1) => {
    setAgreement({
      topicId: itemId,
      pointId,
      analysisId: itemId,
      desired,
      constituency_proof: proof || undefined
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-900/50 p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-slate-50">{perspective.frame}</div>
        <div className="relative flex items-center gap-1 text-xs text-slate-300">
          <ToggleButton
            label="Disagree"
            active={frameAgreement === -1}
            onClick={(e) => {
              e.stopPropagation();
              if (!canVote) {
                onBlockedVote();
                return;
              }
              handleSet(framePointId, frameAgreement === -1 ? 0 : -1);
            }}
            ariaLabel="Disagree frame"
            variant="disagree"
          >
              –
            </ToggleButton>
          <ToggleButton
            label="Agree"
            active={frameAgreement === 1}
            onClick={(e) => {
              e.stopPropagation();
              if (!canVote) {
                onBlockedVote();
                return;
              }
              handleSet(framePointId, frameAgreement === 1 ? 0 : 1);
            }}
            ariaLabel="Agree frame"
            variant="agree"
          >
            +
          </ToggleButton>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm text-slate-50">{perspective.reframe}</div>
        <div className="relative flex items-center gap-1 text-xs text-slate-300">
          <ToggleButton
            label="Disagree"
            active={reframeAgreement === -1}
            onClick={(e) => {
              e.stopPropagation();
              if (!canVote) {
                onBlockedVote();
                return;
              }
              handleSet(reframePointId, reframeAgreement === -1 ? 0 : -1);
            }}
            ariaLabel="Disagree reframe"
            variant="disagree"
          >
              –
            </ToggleButton>
          <ToggleButton
            label="Agree"
            active={reframeAgreement === 1}
            onClick={(e) => {
              e.stopPropagation();
              if (!canVote) {
                onBlockedVote();
                return;
              }
              handleSet(reframePointId, reframeAgreement === 1 ? 0 : 1);
            }}
            ariaLabel="Agree reframe"
            variant="agree"
          >
            +
          </ToggleButton>
        </div>
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
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  const { identity } = useIdentity();
  const canVote = Boolean(identity);
  const [warn, setWarn] = React.useState(false);
  const warnOnceRef = React.useRef<NodeJS.Timeout | null>(null);
  const forumStore = useForumStore();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const eyeWeight = useSentimentState((s) => s.getEyeWeight(item.id));
  const lightbulbWeight = useSentimentState((s) => s.getLightbulbWeight(item.id));
  useViewTracking(item.id, true);

  const linkedThread = useMemo(
    () => Array.from(forumStore.threads.values()).find((t) => t.sourceAnalysisId === item.id),
    [forumStore.threads, item.id]
  );

  const showWarn = () => {
    setWarn(true);
    if (warnOnceRef.current) {
      clearTimeout(warnOnceRef.current);
    }
    warnOnceRef.current = setTimeout(() => setWarn(false), 1500);
  };

  const front = (
    <div className="rounded-xl p-4 shadow-lg backdrop-blur" style={{ backgroundColor: 'var(--analysis-surface)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-wide" style={{ color: 'var(--analysis-label)' }}>Summary</p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--analysis-text)' }}>{item.summary}</p>
        </div>
        <EngagementIcons eyeWeight={eyeWeight} lightbulbWeight={lightbulbWeight} />
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} className="h-28 w-40 rounded-lg object-cover shadow-md" />
        )}
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-sm uppercase tracking-wide" style={{ color: 'var(--analysis-label)' }}>Perspectives</p>
          {!canVote && warn && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800 shadow-sm animate-pulse">
              Create an account to cast votes
            </span>
          )}
        </div>
        <div className="space-y-2 rounded-lg p-2" style={{ backgroundColor: 'var(--bias-table-bg)' }}>
          {item.perspectives.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                if (!canVote) {
                  showWarn();
                }
              }}
            >
              <PerspectiveRow itemId={item.id} perspective={p} onBlockedVote={showWarn} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const back = (
    <div className="surface-hermes p-4 shadow-md">
      {linkedThread ? (
        <ThreadView threadId={linkedThread.id} />
      ) : (
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <p className="font-semibold text-slate-900 dark:text-slate-100">No forum thread yet</p>
          <p>Start the discussion to mirror this analysis in HERMES Forum.</p>
          <button
            className="px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
            onClick={() =>
              router.navigate({ to: '/hermes', search: { sourceAnalysisId: item.id, title: item.title } as any })
            }
          >
            Create thread
          </button>
        </div>
      )}
    </div>
  );

  // Note: recordRead is called by HeadlineCard when expanded, not here
  return <FlippableCard front={front} back={back} isFlipped={isFlipped} onFlip={() => setIsFlipped((prev) => !prev)} />;
};

export default AnalysisView;
