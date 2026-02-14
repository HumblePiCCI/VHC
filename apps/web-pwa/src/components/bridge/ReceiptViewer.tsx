/**
 * ReceiptViewer — Receipt detail with retry chain per §8.4.
 *
 * Shows target representative, intent, timestamp, status.
 * Traverses previousReceiptId for retry chain history.
 *
 * Spec: spec-civic-action-kit-v0.md §8.4
 */

import React from 'react';
import type { DeliveryReceipt } from '@vh/data-model';
import { getReceipt, getReceiptsForAction } from '../../store/bridge/useBridgeStore';

const STATUS_ICONS: Record<string, string> = {
  success: '✅',
  failed: '❌',
  'user-cancelled': '🚫',
};

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString();
}

/**
 * Build the retry chain by walking previousReceiptId backwards.
 */
export function buildRetryChain(receipt: DeliveryReceipt): DeliveryReceipt[] {
  const chain: DeliveryReceipt[] = [receipt];
  let current = receipt;
  const seen = new Set<string>([current.id]);

  while (current.previousReceiptId) {
    const prev = getReceipt(current.previousReceiptId);
    if (!prev || seen.has(prev.id)) break;
    seen.add(prev.id);
    chain.push(prev);
    current = prev;
  }

  return chain.reverse(); // oldest first
}

export interface ReceiptViewerProps {
  readonly actionId: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ actionId }) => {
  const receipts = getReceiptsForAction(actionId);

  if (receipts.length === 0) {
    return (
      <p data-testid="receipt-empty" className="text-sm text-gray-500">
        No delivery receipts for this action.
      </p>
    );
  }

  // Show the latest receipt with its chain
  const lastReceipt = receipts[receipts.length - 1];
  if (!lastReceipt) {
    return <p data-testid="receipt-empty" className="text-xs text-gray-400">No receipts available.</p>;
  }
  const latest = lastReceipt;
  const chain = buildRetryChain(latest);

  return (
    <div data-testid="receipt-viewer" className="space-y-2">
      <h3 className="text-sm font-medium">
        Delivery Receipt · {STATUS_ICONS[latest.status] ?? '❓'} {latest.status}
      </h3>

      <div data-testid="receipt-detail" className="rounded border border-gray-200 p-3">
        <div className="text-xs text-gray-600">
          <p>Representative: <span data-testid="receipt-rep">{latest.representativeId}</span></p>
          <p>Intent: <span data-testid="receipt-intent">{latest.intent}</span></p>
          <p>Time: <span data-testid="receipt-time">{formatTs(latest.timestamp)}</span></p>
          <p>Attested: {latest.userAttested ? 'Yes' : 'No'}</p>
          {latest.errorMessage && (
            <p className="text-red-500">Error: {latest.errorMessage}</p>
          )}
        </div>
      </div>

      {chain.length > 1 && (
        <div data-testid="receipt-chain">
          <h4 className="text-xs font-medium text-gray-500">Retry History ({chain.length} attempts)</h4>
          <div className="mt-1 space-y-1">
            {chain.map((r, i) => (
              <div
                key={r.id}
                data-testid={`chain-item-${i}`}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <span>{STATUS_ICONS[r.status] ?? '❓'}</span>
                <span>Attempt {i + 1}</span>
                <span>· {r.intent}</span>
                <span>· {formatTs(r.timestamp)}</span>
                {r.errorMessage && <span className="text-red-400">({r.errorMessage})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
