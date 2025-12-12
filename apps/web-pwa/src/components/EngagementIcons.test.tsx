/* @vitest-environment jsdom */

import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, afterEach } from 'vitest';
import { EngagementIcons } from './EngagementIcons';

describe('EngagementIcons', () => {
  afterEach(() => cleanup());

  it('shows outline icons when not engaged', () => {
    render(<EngagementIcons eyeWeight={0} lightbulbWeight={0} />);
    // Outline icons rendered when not engaged
    expect(screen.getByTestId('eye-outline')).toBeInTheDocument();
    expect(screen.getByTestId('bulb-outline')).toBeInTheDocument();
    expect(screen.queryByTestId('eye-engaged')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulb-engaged')).not.toBeInTheDocument();
  });

  it('shows solid icons with glow when engaged', () => {
    render(<EngagementIcons eyeWeight={1} lightbulbWeight={1} />);
    // Solid icons rendered when engaged
    const eyeEngaged = screen.getByTestId('eye-engaged');
    const bulbEngaged = screen.getByTestId('bulb-engaged');
    expect(eyeEngaged).toBeInTheDocument();
    expect(bulbEngaged).toBeInTheDocument();
    // Glow applied via filter
    expect(eyeEngaged.style.filter).toContain('drop-shadow');
    expect(bulbEngaged.style.filter).toContain('drop-shadow');
  });
});
