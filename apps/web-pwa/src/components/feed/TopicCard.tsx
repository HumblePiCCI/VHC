import React from 'react';
import type { FeedItem } from '@vh/data-model';
import { useSynthesis } from '../../hooks/useSynthesis';
import { useInView } from '../../hooks/useInView';
import { SynthesisSummary } from './SynthesisSummary';

export interface TopicCardProps {
  /** Discovery feed item; expected kind: USER_TOPIC. */
  readonly item: FeedItem;
}

function formatActivityScore(score: number | undefined): string {
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return '0.0';
  }
  return score.toFixed(1);
}

/**
 * User topic/thread card for discovery feed USER_TOPIC items.
 *
 * When the card enters the viewport, synthesis hydration starts via
 * `useSynthesis(item.topic_id)`. If synthesis data is available, the card
 * displays `facts_summary`, collapsible `frames`, and divergence indicators.
 * When synthesis is unavailable (loading, error, or absent), the card
 * preserves its original engagement-only rendering.
 *
 * Hydration containment: `useInView` defers Gun subscription until the card
 * is within 200px of the viewport, preventing burst subscriptions for
 * off-screen items in long feed lists.
 *
 * Spec: docs/specs/spec-topic-discovery-ranking-v0.md §3 (USER_TOPIC)
 */
export const TopicCard: React.FC<TopicCardProps> = ({ item }) => {
  const [ref, isVisible] = useInView<HTMLElement>();
  const { synthesis, loading, error } = useSynthesis(isVisible ? item.topic_id : null);
  const myActivity = formatActivityScore(item.my_activity_score);

  return (
    <article
      ref={ref}
      data-testid={`topic-card-${item.topic_id}`}
      className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
      aria-label="User topic"
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
          Topic
        </span>
        <span className="text-xs text-emerald-900" data-testid={`topic-card-activity-${item.topic_id}`}>
          My activity {myActivity}
        </span>
      </header>

      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>

      {/* Synthesis content: loading → error → summary → fallback */}
      <SynthesisSection synthesis={synthesis} loading={loading} error={error} />

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
        <span data-testid={`topic-card-eye-${item.topic_id}`}>👁️ {item.eye}</span>
        <span data-testid={`topic-card-lightbulb-${item.topic_id}`}>💡 {item.lightbulb}</span>
        <span data-testid={`topic-card-comments-${item.topic_id}`}>💬 {item.comments}</span>
      </div>
    </article>
  );
};

// ---- Internal synthesis state renderer ----

interface SynthesisSectionProps {
  readonly synthesis: ReturnType<typeof useSynthesis>['synthesis'];
  readonly loading: boolean;
  readonly error: string | null;
}

const SynthesisSection: React.FC<SynthesisSectionProps> = ({ synthesis, loading, error }) => {
  if (loading) {
    return (
      <p className="mt-1 text-xs text-slate-400" data-testid="topic-card-synthesis-loading">
        Loading synthesis…
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-1 text-xs text-red-400" data-testid="topic-card-synthesis-error">
        Synthesis unavailable.
      </p>
    );
  }

  if (synthesis) {
    return <SynthesisSummary synthesis={synthesis} />;
  }

  // Fallback: no synthesis available — original static text
  return (
    <p className="mt-1 text-xs text-slate-600">Active thread with community responses.</p>
  );
};

export default TopicCard;
