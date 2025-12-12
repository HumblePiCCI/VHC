import React, { useMemo } from 'react';
import { EyeIcon as EyeOutline, LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';
import { EyeIcon as EyeSolid, LightBulbIcon as LightBulbSolid } from '@heroicons/react/24/solid';

interface Props {
  eyeWeight: number;
  lightbulbWeight: number;
  className?: string;
}

export const EngagementIcons: React.FC<Props> = ({ eyeWeight, lightbulbWeight, className }) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const eyeEngaged = eyeWeight > 0;
  const bulbEngaged = lightbulbWeight > 0;

  // Shadow behind (for edge definition) + glow on top
  const glowStyle = prefersReducedMotion ? {} : {
    filter: `drop-shadow(var(--icon-shadow-x) var(--icon-shadow-y) var(--icon-shadow-blur) var(--icon-shadow)) drop-shadow(0 0 4px var(--icon-glow)) drop-shadow(0 0 8px var(--icon-glow))`
  };

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <span aria-label="Views engagement" title="Views">
        {eyeEngaged ? (
          <EyeSolid className="h-4 w-4" style={{ color: 'var(--icon-engaged)', ...glowStyle }} data-testid="eye-engaged" />
        ) : (
          <EyeOutline className="h-4 w-4" style={{ color: 'var(--icon-default)' }} data-testid="eye-outline" />
        )}
      </span>
      <span aria-label="Ideas engagement" title="Ideas">
        {bulbEngaged ? (
          <LightBulbSolid className="h-4 w-4" style={{ color: 'var(--icon-engaged)', ...glowStyle }} data-testid="bulb-engaged" />
        ) : (
          <LightBulbOutline className="h-4 w-4" style={{ color: 'var(--icon-default)' }} data-testid="bulb-outline" />
        )}
      </span>
    </div>
  );
};

export default EngagementIcons;
