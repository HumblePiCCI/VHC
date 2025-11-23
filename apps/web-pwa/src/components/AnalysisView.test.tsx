/* @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import AnalysisView from './AnalysisView';
import type { FeedItem } from '../hooks/useFeedStore';
import { useCivicState } from '../hooks/useCivicState';

const sample: FeedItem = {
  id: 'analysis-1',
  title: 'Story',
  summary: 'Narrative summary',
  source: 'Test',
  timestamp: Date.now(),
  imageUrl: undefined,
  engagementScore: 0.5,
  readCount: 1,
  perspectives: [
    { id: 'pa', frame: 'frame text', reframe: 'reframe text' }
  ]
};

describe('AnalysisView', () => {
  it('renders perspectives and updates scores', () => {
    useCivicState.setState({ scores: {} });
    render(<AnalysisView item={sample} />);
    const upvote = screen.getByLabelText('Upvote');
    fireEvent.click(upvote);
    expect(screen.getByLabelText('Engagement score')).toHaveTextContent('0.2');
  });
});
