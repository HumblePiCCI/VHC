/* @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ReceiptFeedCard } from './ReceiptFeedCard';
import type { FeedItem } from '@vh/data-model';

const now = Date.now();

const receiptItem: FeedItem = {
  topic_id: 'receipt-abc-123',
  kind: 'ACTION_RECEIPT',
  title: 'Letter to Rep. Smith',
  created_at: now - 3_600_000,
  latest_activity_at: now,
  hotness: 0,
  eye: 0,
  lightbulb: 0,
  comments: 0,
};

describe('ReceiptFeedCard', () => {
  afterEach(() => cleanup());

  it('renders receipt title', () => {
    render(<ReceiptFeedCard item={receiptItem} />);
    expect(screen.getByText('Letter to Rep. Smith')).toBeDefined();
  });

  it('renders with correct test id', () => {
    render(<ReceiptFeedCard item={receiptItem} />);
    expect(screen.getByTestId('feed-receipt-receipt-abc-123')).toBeDefined();
  });

  it('displays civic action receipt label', () => {
    render(<ReceiptFeedCard item={receiptItem} />);
    const el = screen.getByTestId('feed-receipt-receipt-abc-123');
    expect(el.textContent).toContain('Civic action receipt');
  });

  it('displays formatted date', () => {
    render(<ReceiptFeedCard item={receiptItem} />);
    const el = screen.getByTestId('feed-receipt-receipt-abc-123');
    // Date should be rendered (exact format varies by locale)
    expect(el.textContent).toContain('/');
  });
});
