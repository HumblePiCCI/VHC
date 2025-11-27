/* @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import type { FeedItem } from '../hooks/useFeedStore';
import AnalysisView from './AnalysisView';
import { useSentimentState } from '../hooks/useSentimentState';

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
  it('renders perspectives and updates 3-state sentiment', () => {
    useSentimentState.setState({
      ...useSentimentState.getState(),
      agreements: {},
      lightbulb: {},
      eye: {},
      signals: []
    });
    render(<AnalysisView item={sample} />);
    const agree = screen.getByLabelText('Agree');
    fireEvent.click(agree);
    expect(screen.getByLabelText('Engagement score')).toHaveTextContent('💡');
    expect(useSentimentState.getState().getAgreement(sample.id, sample.perspectives[0].id)).toBe(1);

    fireEvent.click(agree);
    expect(useSentimentState.getState().getAgreement(sample.id, sample.perspectives[0].id)).toBe(0);
  });
});
