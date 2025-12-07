/* @vitest-environment jsdom */

import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { FlippableCard } from './FlippableCard';

const Wrapper = () => {
  const [flipped, setFlipped] = useState(false);
  return (
    <FlippableCard
      headline="Headline"
      front={<div>Front Face</div>}
      back={<div>Back Face</div>}
      isFlipped={flipped}
      onFlip={() => setFlipped((prev) => !prev)}
    />
  );
};

describe('FlippableCard', () => {
  it('renders headline and toggles faces', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('flip-headline')).toHaveTextContent('Headline');
    expect(screen.getByTestId('flip-front')).toBeVisible();
    expect(screen.getByTestId('flip-back')).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(screen.getByTestId('flip-to-forum'));
    expect(screen.getByTestId('flip-back')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByTestId('flip-front')).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(screen.getByTestId('flip-to-analysis'));
    expect(screen.getByTestId('flip-front')).toHaveAttribute('aria-hidden', 'false');
  });
});
