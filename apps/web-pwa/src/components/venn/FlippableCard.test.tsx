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
      front={<div>Front Face</div>}
      back={<div>Back Face</div>}
      isFlipped={flipped}
      onFlip={() => setFlipped((prev) => !prev)}
    />
  );
};

describe('FlippableCard', () => {
  it('toggles between front and back faces', () => {
    render(<Wrapper />);
    
    // Faces are stacked via grid; back face is hidden via aria when not flipped
    const front = screen.getByTestId('flip-front');
    const back = screen.getByTestId('flip-back');
    expect(front).toBeVisible();
    expect(back).toHaveAttribute('aria-hidden', 'true');

    // Click to flip - shows back, hides front
    fireEvent.click(screen.getByTestId('flip-to-forum'));
    expect(screen.getByTestId('flip-front')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('flip-back')).not.toHaveAttribute('aria-hidden', 'true');

    // Click to flip back - shows front, hides back
    fireEvent.click(screen.getByTestId('flip-to-analysis'));
    expect(screen.getByTestId('flip-back')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('flip-front')).not.toHaveAttribute('aria-hidden', 'true');
  });
});
