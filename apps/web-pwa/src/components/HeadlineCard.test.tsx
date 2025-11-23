/* @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
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
  it('renders metrics and expands on click', () => {
    render(<HeadlineCard item={sample} />);
    expect(screen.getByText(/Sample Headline/)).toBeInTheDocument();
    expect(screen.getByText(/👁️/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Sample Headline/));
    expect(screen.getByText(/Frame view/)).toBeInTheDocument();
  });
});
