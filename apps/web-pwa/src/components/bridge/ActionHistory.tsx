/**
 * ActionHistory — List past civic actions per §8.1.
 *
 * Shows status, target representative, intent used, timestamps.
 *
 * Spec: spec-civic-action-kit-v0.md §8.1
 */

import React from 'react';
import type { CivicAction } from '@vh/data-model';
import { getAllActions } from '../../store/bridge/useBridgeStore';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  ready: 'bg-blue-100 text-blue-700',
  sent: 'bg-teal-100 text-teal-700',
  failed: 'bg-red-100 text-red-700',
};

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString();
}

export interface ActionHistoryProps {
  /** Override actions list for testing */
  readonly actions?: CivicAction[];
}

export const ActionHistory: React.FC<ActionHistoryProps> = ({ actions: overrideActions }) => {
  const actions = overrideActions ?? getAllActions();

  if (actions.length === 0) {
    return (
      <p data-testid="history-empty" className="text-sm text-gray-500">
        No civic actions yet. Compose your first action to get started.
      </p>
    );
  }

  const sorted = [...actions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div data-testid="action-history" className="space-y-2">
      {sorted.map((action) => (
        <article
          key={action.id}
          data-testid={`history-item-${action.id}`}
          className="rounded border border-gray-200 p-3"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">{action.topic}</span>
            <span
              data-testid={`history-status-${action.id}`}
              className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[action.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {action.status}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            <span data-testid={`history-rep-${action.id}`}>Rep: {action.representativeId}</span>
            <span className="mx-1">·</span>
            <span data-testid={`history-intent-${action.id}`}>Via: {action.intent}</span>
            <span className="mx-1">·</span>
            <span data-testid={`history-date-${action.id}`}>{formatTs(action.createdAt)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {action.stance} · {action.subject}
          </p>
        </article>
      ))}
    </div>
  );
};
