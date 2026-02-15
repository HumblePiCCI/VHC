/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ReceiptViewer, buildRetryChain } from './ReceiptViewer';
import type { DeliveryReceipt } from '@vh/data-model';

/* ── Mock bridge store ───────────────────────────────────────── */

const receiptStore = new Map<string, DeliveryReceipt>();
const actionReceipts = new Map<string, DeliveryReceipt[]>();

vi.mock('../../store/bridge/useBridgeStore', () => ({
  getReceipt: (id: string) => receiptStore.get(id) ?? undefined,
  getReceiptsForAction: (actionId: string) => actionReceipts.get(actionId) ?? [],
}));

const baseReceipt: DeliveryReceipt = {
  id: 'receipt-1',
  schemaVersion: 'hermes-receipt-v1',
  actionId: 'action-1',
  representativeId: 'rep-1',
  status: 'success',
  timestamp: 1_700_000_000_000,
  intent: 'email',
  userAttested: true,
  retryCount: 0,
};

const failedReceipt: DeliveryReceipt = {
  id: 'receipt-0',
  schemaVersion: 'hermes-receipt-v1',
  actionId: 'action-1',
  representativeId: 'rep-1',
  status: 'failed',
  timestamp: 1_699_999_000_000,
  intent: 'email',
  userAttested: true,
  retryCount: 0,
  errorMessage: 'connection refused',
};

const retriedReceipt: DeliveryReceipt = {
  ...baseReceipt,
  id: 'receipt-1',
  retryCount: 1,
  previousReceiptId: 'receipt-0',
};

beforeEach(() => {
  receiptStore.clear();
  actionReceipts.clear();
});

afterEach(() => cleanup());

/* ── buildRetryChain ─────────────────────────────────────────── */

describe('buildRetryChain', () => {
  it('returns single-item chain for receipt without previous', () => {
    const chain = buildRetryChain(baseReceipt);
    expect(chain).toHaveLength(1);
    expect(chain[0].id).toBe('receipt-1');
  });

  it('builds chain from previousReceiptId', () => {
    receiptStore.set('receipt-0', failedReceipt);
    const chain = buildRetryChain(retriedReceipt);
    expect(chain).toHaveLength(2);
    expect(chain[0].id).toBe('receipt-0'); // oldest first
    expect(chain[1].id).toBe('receipt-1');
  });

  it('handles circular references gracefully', () => {
    const circular: DeliveryReceipt = { ...baseReceipt, previousReceiptId: 'receipt-1' };
    receiptStore.set('receipt-1', circular);
    const chain = buildRetryChain(circular);
    expect(chain).toHaveLength(1); // Does not loop
  });

  it('handles missing previous receipt', () => {
    const chain = buildRetryChain(retriedReceipt);
    expect(chain).toHaveLength(1); // receipt-0 not in store
  });
});

/* ── ReceiptViewer component ─────────────────────────────────── */

describe('ReceiptViewer', () => {
  it('shows empty state when no receipts for action', () => {
    render(<ReceiptViewer actionId="no-such-action" />);
    expect(screen.getByTestId('receipt-empty')).toBeInTheDocument();
  });

  it('renders receipt detail', () => {
    actionReceipts.set('action-1', [baseReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-detail')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-rep').textContent).toBe('rep-1');
    expect(screen.getByTestId('receipt-intent').textContent).toBe('email');
    expect(screen.getByTestId('receipt-time').textContent).toBeTruthy();
  });

  it('shows success status icon', () => {
    actionReceipts.set('action-1', [baseReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer').textContent).toContain('✅');
  });

  it('shows failed status icon', () => {
    actionReceipts.set('action-1', [failedReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer').textContent).toContain('❌');
  });

  it('shows error message for failed receipt', () => {
    actionReceipts.set('action-1', [failedReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer').textContent).toContain('connection refused');
  });

  it('shows user-cancelled status', () => {
    const cancelled: DeliveryReceipt = { ...baseReceipt, status: 'user-cancelled' };
    actionReceipts.set('action-1', [cancelled]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer').textContent).toContain('🚫');
  });

  it('renders retry chain when present', () => {
    receiptStore.set('receipt-0', failedReceipt);
    actionReceipts.set('action-1', [failedReceipt, retriedReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-chain')).toBeInTheDocument();
    expect(screen.getByTestId('chain-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('chain-item-1')).toBeInTheDocument();
  });

  it('does not show chain section for single receipt', () => {
    actionReceipts.set('action-1', [baseReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.queryByTestId('receipt-chain')).not.toBeInTheDocument();
  });

  it('shows chain error messages', () => {
    receiptStore.set('receipt-0', failedReceipt);
    actionReceipts.set('action-1', [failedReceipt, retriedReceipt]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-chain').textContent).toContain('connection refused');
  });

  it('shows unknown status icon for unrecognized status', () => {
    const unknown: DeliveryReceipt = { ...baseReceipt, status: 'pending' as any };
    actionReceipts.set('action-1', [unknown]);
    render(<ReceiptViewer actionId="action-1" />);
    expect(screen.getByTestId('receipt-viewer').textContent).toContain('❓');
  });
});
