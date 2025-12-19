import React from 'react';
import type { HermesComment } from '@vh/types';

type Stance = HermesComment['stance'];

export function cardMaxWidth(depth: number): string {
  if (depth === 0) return '92%';
  if (depth === 1) return '90%';
  if (depth === 2) return '88%';
  return '85%';
}

export function stanceMeta(stance: Stance) {
  if (stance === 'concur') {
    return { icon: '👍', label: 'Support', border: 'var(--concur-button)' };
  }
  if (stance === 'counter') {
    return { icon: '👎', label: 'Oppose', border: 'var(--counter-button)' };
  }
  return { icon: '💬', label: 'Discuss', border: 'var(--discuss-border)' };
}

export const ChildrenContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative mt-3">{children}</div>
);
