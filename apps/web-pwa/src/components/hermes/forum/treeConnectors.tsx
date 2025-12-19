import React from 'react';
import type { HermesComment } from '@vh/types';

type Stance = HermesComment['stance'];

// Tree line constants
export const LINE_COLOR = 'var(--stream-thread-line)';
export const LINE_WIDTH = 1.5;
export const INDENT_PX = 28; // Card indent from parent (same for all)
export const DISCUSS_BRANCH_WIDTH = 11; // Discuss branch is 60% shorter
export const BRANCH_HEIGHT = 20;
export const STEP_Y = 7;

// Get how far the trunk is from the card edge (branch width)
// Support/oppose: trunk at container edge, 28px branch to card
// Discuss: trunk moved inward, only 11px branch to card
export function getBranchWidth(stance: Stance): number {
  return stance === 'discuss' ? DISCUSS_BRANCH_WIDTH : INDENT_PX;
}

// Get trunk offset from container edge (0 for support/oppose, 17px for discuss)
export function getTrunkOffset(stance: Stance): number {
  return INDENT_PX - getBranchWidth(stance);
}

export function getConnectorSide(stance: Stance): 'left' | 'right' {
  return stance === 'counter' ? 'right' : 'left';
}

// SVG branch connector (trunk → curve → horizontal)
export interface BranchProps {
  side: 'left' | 'right';
  trunkOffset: number; // Where this comment wants to connect (inner trunk)
  parentTrunkOffset: number; // Where the trunk actually is (outer trunk)
}

export const BranchConnector: React.FC<BranchProps> = ({ side, trunkOffset, parentTrunkOffset }) => {
  const isLeft = side === 'left';
  const branchY = BRANCH_HEIGHT;
  const stepY = STEP_Y;
  const needsStep = trunkOffset !== parentTrunkOffset;

  // SVG spans from container edge to card edge (INDENT_PX - LINE_WIDTH)
  // This aligns with the container's padding, ensuring perfect trunk alignment
  const svgWidth = INDENT_PX - LINE_WIDTH;

  const dir = isLeft ? 1 : -1;
  const innerBranchWidth = INDENT_PX - trunkOffset;
  const outerTrunkX = isLeft
    ? parentTrunkOffset + LINE_WIDTH / 2
    : svgWidth - parentTrunkOffset - LINE_WIDTH / 2;
  const innerTrunkX = isLeft ? trunkOffset + LINE_WIDTH / 2 : svgWidth - trunkOffset - LINE_WIDTH / 2;
  const cardX = isLeft ? svgWidth + LINE_WIDTH : -LINE_WIDTH;

  const dx = Math.abs(innerTrunkX - outerTrunkX);
  const stepRadius = Math.min(8, dx / 2, stepY - 1);
  const branchRadiusMax = Math.min(8, innerBranchWidth - 1);
  const maxBranchRadius = Math.max(2, branchY - (stepY + stepRadius) - 1);
  const branchRadius = Math.min(branchRadiusMax, maxBranchRadius);

  // Path: vertical from top → optional double-curve step → curve → horizontal to card
  const path = needsStep
    ? `M ${outerTrunkX} -2 L ${outerTrunkX} ${stepY - stepRadius} Q ${outerTrunkX} ${stepY} ${outerTrunkX + dir * stepRadius} ${stepY} L ${innerTrunkX - dir * stepRadius} ${stepY} Q ${innerTrunkX} ${stepY} ${innerTrunkX} ${stepY + stepRadius} L ${innerTrunkX} ${branchY - branchRadius} Q ${innerTrunkX} ${branchY} ${innerTrunkX + dir * branchRadius} ${branchY} L ${cardX} ${branchY}`
    : `M ${outerTrunkX} -2 L ${outerTrunkX} ${branchY - branchRadius} Q ${outerTrunkX} ${branchY} ${outerTrunkX + dir * branchRadius} ${branchY} L ${cardX} ${branchY}`;

  return (
    <svg
      className="absolute top-0 pointer-events-none overflow-visible"
      style={{
        width: svgWidth,
        height: branchY + 4,
        // Position SVG to align with container edge (not padded content)
        [isLeft ? 'left' : 'right']: -svgWidth
      }}
      aria-hidden="true"
      data-trunk-offset={trunkOffset}
      data-parent-trunk-offset={parentTrunkOffset}
    >
      {/* Main branch with smooth curve */}
      <path
        d={path}
        fill="none"
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
