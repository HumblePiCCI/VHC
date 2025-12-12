import React, { useMemo } from 'react';

interface FlippableCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlippableCard: React.FC<FlippableCardProps> = ({ front, back, isFlipped, onFlip }) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Transition for transform; visibility is delayed to flip midpoint so hidden face disappears cleanly
  const transformTransition = prefersReducedMotion ? 'none' : 'transform 0.6s ease-in-out';
  const visibilityTransition = prefersReducedMotion ? 'none' : 'visibility 0s linear 0.3s';
  const borderlessButton =
    'px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500';

  return (
    <div data-testid="flippable-card">
      <div className="flip-container" style={{ display: 'grid', perspective: '1000px' }}>
        <div
          className="flip-front"
          style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            // Hide the front face when flipped to prevent bleed-through with transparent backgrounds
            visibility: isFlipped ? 'hidden' : 'visible',
            transition: `${transformTransition}, ${visibilityTransition}`,
            transformStyle: 'preserve-3d'
          }}
          aria-hidden={isFlipped}
          data-testid="flip-front"
        >
          {front}
          <div className="mt-3">
            <button
              className={borderlessButton}
              onClick={onFlip}
              aria-expanded={isFlipped}
              data-testid="flip-to-forum"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
            >
              💬 Discuss in Forum
            </button>
          </div>
        </div>
        <div
          className="flip-back"
          style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
            // Hide the back face when not flipped to prevent bleed-through with transparent backgrounds
            visibility: isFlipped ? 'visible' : 'hidden',
            transition: `${transformTransition}, ${visibilityTransition}`,
            transformStyle: 'preserve-3d'
          }}
          aria-hidden={!isFlipped}
          data-testid="flip-back"
        >
          {back}
          <div className="mt-3">
            <button
              className={borderlessButton}
              onClick={onFlip}
              aria-expanded={!isFlipped}
              data-testid="flip-to-analysis"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
            >
              ← Back to Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableCard;
