/**
 * ReceiptFeedCard — Feed card for ACTION_RECEIPT items.
 *
 * Displays receipt summary inline in the feed.
 * topic_id = receipt.actionId, title = action.topic.
 * Appears under ALL filter only.
 *
 * Spec: spec-civic-action-kit-v0.md §8.4
 */

import React from 'react';
import type { FeedItem } from '@vh/data-model';

export interface ReceiptFeedCardProps {
  readonly item: FeedItem;
}

const STATUS_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  success: { icon: '✅', label: 'Delivered', color: 'text-teal-700' },
  failed: { icon: '❌', label: 'Failed', color: 'text-red-600' },
  'user-cancelled': { icon: '🚫', label: 'Cancelled', color: 'text-gray-500' },
};

function getReceiptMeta(item: FeedItem): { status: string; intent: string } | null {
  const meta = (item as Record<string, unknown>).meta;
  if (meta && typeof meta === 'object') {
    const m = meta as Record<string, unknown>;
    return {
      status: typeof m.status === 'string' ? m.status : 'success',
      intent: typeof m.intent === 'string' ? m.intent : '',
    };
  }
  return null;
}

export const ReceiptFeedCard: React.FC<ReceiptFeedCardProps> = ({ item }) => {
  const meta = getReceiptMeta(item);
  const statusInfo = STATUS_LABELS[meta?.status ?? ''] ?? STATUS_LABELS['success'];

  return (
    <article
      data-testid={`feed-receipt-${item.topic_id}`}
      className="rounded border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium">{item.title}</h3>
        {meta && statusInfo && (
          <span data-testid="receipt-status" className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-teal-600">
        Civic action receipt · {new Date(item.latest_activity_at).toLocaleDateString()}
        {meta?.intent && ` · via ${meta.intent}`}
      </p>
    </article>
  );
};
