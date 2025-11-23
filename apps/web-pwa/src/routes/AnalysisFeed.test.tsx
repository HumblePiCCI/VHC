/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AnalysisFeed } from './AnalysisFeed';
import '@testing-library/jest-dom/vitest';

describe('AnalysisFeed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('generates a local analysis and caches by url hash', async () => {
    render(<AnalysisFeed />);
    fireEvent.change(screen.getByTestId('analysis-url-input'), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('Analyze'));

    await waitFor(() => expect(screen.getByText(/Analysis ready/)).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('vh_canonical_analyses') ?? '[]')).toHaveLength(1);

    fireEvent.change(screen.getByTestId('analysis-url-input'), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('Analyze'));

    await waitFor(() =>
      expect(screen.getByText(/Analysis already exists/)).toBeInTheDocument()
    );
    expect(JSON.parse(localStorage.getItem('vh_canonical_analyses') ?? '[]')).toHaveLength(1);
  });
});
