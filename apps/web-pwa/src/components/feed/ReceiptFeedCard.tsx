import React from 'react';
import type { FeedItem } from '@vh/data-model';

export interface ReceiptFeedCardProps {
  readonly item: FeedItem;
}

/**
 * Placeholder card for ACTION_RECEIPT feed items.
 * Full receipt card UI will be implemented in W3-CAK Phase 3.
 *
 * Spec: docs/specs/spec-civic-action-kit-v0.md §8.4
 */
export const ReceiptFeedCard: React.FC<ReceiptFeedCardProps> = ({ item }) => {
  return (
    <article
      data-testid={`feed-receipt-${item.topic_id}`}
      className="rounded border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900"
    >
      <h3 className="font-medium">{item.title}</h3>
      <p className="mt-1 text-xs text-teal-600">
        Civic action receipt · {new Date(item.latest_activity_at).toLocaleDateString()}
      </p>
    </article>
  );
};
