import React, { useMemo } from 'react';
import { Button } from '@vh/ui';

interface FlippableCardProps {
  headline: string;
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlippableCard: React.FC<FlippableCardProps> = ({ headline, front, back, isFlipped, onFlip }) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <div className="space-y-4" data-testid="flippable-card">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="flip-headline">
        {headline}
      </h1>
      <div className="relative" style={{ perspective: '1000px' }}>
        <div
          className="flip-card"
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: prefersReducedMotion ? 'none' : 'transform 0.6s ease-in-out',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '200px'
          }}
          aria-live="polite"
        >
          <div
            className="flip-front"
            style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
            aria-hidden={isFlipped}
            data-testid="flip-front"
          >
            {front}
            <div className="mt-3">
              <Button onClick={onFlip} aria-expanded={isFlipped} data-testid="flip-to-forum">
                💬 Discuss in Forum
              </Button>
            </div>
          </div>
          <div
            className="flip-back"
            style={{
              backfaceVisibility: 'hidden',
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)'
            }}
            aria-hidden={!isFlipped}
            data-testid="flip-back"
          >
            {back}
            <div className="mt-3">
              <Button onClick={onFlip} aria-expanded={!isFlipped} data-testid="flip-to-analysis">
                ← Back to Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableCard;
