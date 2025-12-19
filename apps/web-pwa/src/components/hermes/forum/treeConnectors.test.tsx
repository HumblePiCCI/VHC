/* @vitest-environment jsdom */

import React from 'react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import {
  BranchConnector,
  getBranchWidth,
  getConnectorSide,
  getTrunkOffset,
  INDENT_PX,
  LINE_WIDTH
} from './treeConnectors';

describe('treeConnectors', () => {
  it('returns branch widths by stance', () => {
    expect(getBranchWidth('discuss')).toBe(11);
    expect(getBranchWidth('concur')).toBe(28);
    expect(getBranchWidth('counter')).toBe(28);
  });

  it('returns trunk offsets by stance', () => {
    expect(getTrunkOffset('discuss')).toBe(17);
    expect(getTrunkOffset('concur')).toBe(0);
    expect(getTrunkOffset('counter')).toBe(0);
  });

  it('returns connector sides by stance', () => {
    expect(getConnectorSide('counter')).toBe('right');
    expect(getConnectorSide('concur')).toBe('left');
    expect(getConnectorSide('discuss')).toBe('left');
  });

  it('renders a single-curve path when trunk offsets match', () => {
    const { container } = render(
      <BranchConnector side="right" trunkOffset={0} parentTrunkOffset={0} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-trunk-offset', '0');
    expect(svg).toHaveAttribute('data-parent-trunk-offset', '0');
    const svgWidth = INDENT_PX - LINE_WIDTH;
    expect(svg).toHaveStyle({ right: `-${svgWidth}px` });

    const path = container.querySelector('path');
    const d = path?.getAttribute('d') ?? '';
    expect((d.match(/Q/g) ?? []).length).toBe(1);
  });

  it('renders a double-curve path when trunk offsets differ', () => {
    const { container } = render(
      <BranchConnector side="left" trunkOffset={17} parentTrunkOffset={0} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-trunk-offset', '17');
    expect(svg).toHaveAttribute('data-parent-trunk-offset', '0');
    const svgWidth = INDENT_PX - LINE_WIDTH;
    expect(svg).toHaveStyle({ left: `-${svgWidth}px` });

    const path = container.querySelector('path');
    const d = path?.getAttribute('d') ?? '';
    expect((d.match(/Q/g) ?? []).length).toBe(3);
  });
});
