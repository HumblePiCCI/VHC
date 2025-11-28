/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import HeadlineCard from './HeadlineCard';
import type { FeedItem } from '../hooks/useFeedStore';

const sample: FeedItem = {
  id: 'card-1',
  title: 'Sample Headline',
  summary: 'Sample summary body',
  source: 'Test Wire',
  timestamp: Date.now(),
  imageUrl: 'https://placekitten.com/200/200',
  engagementScore: 1.2,
  readCount: 4,
  perspectives: [
    { id: 'p1', frame: 'Frame view', reframe: 'Reframe view' }
  ]
};

describe('HeadlineCard', () => {
  it('renders metrics and expands on click', async () => {
    render(<HeadlineCard item={sample} />);
    expect(screen.getByText(/Sample Headline/)).toBeInTheDocument();
    const readCount = screen.getByTestId('read-count');
    expect(readCount).toHaveTextContent('👁️ 4.0');
    fireEvent.click(screen.getByText(/Sample Headline/));

    // Shows loading state initially
    expect(screen.getByTestId('analysis-loading')).toBeInTheDocument();

    // Wait for content to appear after loading delay (300ms)
    await waitFor(() => {
      expect(screen.getByText(/Frame view/)).toBeInTheDocument();
    }, { timeout: 500 });

    // Read count should increment on first expansion
    expect(screen.getByTestId('read-count')).toHaveTextContent('👁️ 5.0');
  });
});
