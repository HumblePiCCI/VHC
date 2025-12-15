import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  onPost: (stance: 'concur' | 'counter' | 'discuss') => Promise<void>;
  disabled?: boolean;
}

type Stance = 'concur' | 'counter' | 'discuss';

export const SlideToPost: React.FC<Props> = ({ onPost, disabled = false }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(50); // 0..100, 50=center
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cleanupMouseListenersRef = useRef<null | (() => void)>(null);
  const resetTimerRef = useRef<number | null>(null);
  const positionRef = useRef(position);
  const isPostingRef = useRef(isPosting);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    isPostingRef.current = isPosting;
  }, [isPosting]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const positionToStance = (pos: number): Stance => {
    if (pos <= 30) return 'concur';
    if (pos >= 70) return 'counter';
    return 'discuss';
  };

  const getLabel = (pos: number): string => {
    if (pos <= 15) return 'Strong Support';
    if (pos <= 30) return 'Support';
    if (pos >= 85) return 'Strong Oppose';
    if (pos >= 70) return 'Oppose';
    return 'Discuss';
  };

  const getThumbColor = (pos: number): string => {
    if (pos <= 30) return 'var(--concur-button)';
    if (pos >= 70) return 'var(--counter-button)';
    return 'var(--discuss-button)';
  };

  const getPositionFromClientX = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 50;
    const rect = track.getBoundingClientRect();
    if (!rect.width || rect.width <= 0) return 50;
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, pct));
  }, []);

  const setPositionFromClientX = useCallback(
    (clientX: number) => {
      const next = getPositionFromClientX(clientX);
      positionRef.current = next;
      setPosition(next);
    },
    [getPositionFromClientX]
  );

  const resetToCenter = useCallback(() => {
    positionRef.current = 50;
    setPosition(50);
  }, []);

  const commitPost = useCallback(async () => {
    if (disabledRef.current || isPostingRef.current) return;
    const stance = positionToStance(positionRef.current);
    isPostingRef.current = true;
    setIsPosting(true);

    try {
      await onPost(stance);
      setShowSuccess(true);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        setShowSuccess(false);
        resetToCenter();
      }, 1200);
    } catch (err) {
      console.warn('[vh:forum] Slide-to-post failed:', err);
      resetToCenter();
    } finally {
      isPostingRef.current = false;
      setIsPosting(false);
    }
  }, [onPost, resetToCenter]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    cleanupMouseListenersRef.current?.();
    cleanupMouseListenersRef.current = null;
  }, []);

  const startMouseDrag = useCallback(
    (clientX: number) => {
      if (disabledRef.current || isPostingRef.current) return;
      setIsDragging(true);
      setPositionFromClientX(clientX);

      const onMouseMove = (e: MouseEvent) => setPositionFromClientX(e.clientX);
      const onMouseUp = () => {
        endDrag();
        void commitPost();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      cleanupMouseListenersRef.current = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    },
    [commitPost, endDrag, setPositionFromClientX]
  );

  useEffect(() => {
    return () => {
      cleanupMouseListenersRef.current?.();
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startMouseDrag(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled || isPosting) return;
    setIsDragging(true);
    setPositionFromClientX(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setPositionFromClientX(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    endDrag();
    void commitPost();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isPosting) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.max(0, positionRef.current - 10);
      positionRef.current = next;
      setPosition(next);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(100, positionRef.current + 10);
      positionRef.current = next;
      setPosition(next);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void commitPost();
    }
  };

  const thumbColor = getThumbColor(position);
  const label = getLabel(position);

  return (
    <div
      ref={trackRef}
      className={[
        'relative h-12 select-none overflow-hidden rounded-full',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        !prefersReducedMotion && isDragging ? 'scale-[1.02]' : '',
        !prefersReducedMotion ? 'transition-transform duration-150' : ''
      ].join(' ')}
      style={{
        background: `linear-gradient(to right,
          var(--concur-button) 0%,
          var(--concur-button) 25%,
          var(--discuss-button) 50%,
          var(--counter-button) 75%,
          var(--counter-button) 100%)`
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label="Slide to post your comment. Left for support, right for oppose, center for discuss."
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${label}. Release to post.`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      data-testid="slide-to-post"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-xs font-medium text-white/80">
        <span>◀ Support</span>
        <span>Oppose ▶</span>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={[
            'text-sm font-semibold text-white',
            !prefersReducedMotion ? 'transition-opacity duration-150' : '',
            isDragging ? 'opacity-0' : 'opacity-100'
          ].join(' ')}
          data-testid="slide-label-idle"
        >
          {showSuccess ? '✓ Posted!' : isPosting ? 'Posting…' : 'Slide to Post'}
        </span>

        <span
          className={[
            'absolute text-sm font-bold text-white',
            !prefersReducedMotion ? 'transition-opacity duration-100' : '',
            isDragging ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
          data-testid="slide-label-active"
        >
          {label}
        </span>
      </div>

      <div
        className={[
          'pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white',
          !prefersReducedMotion ? 'transition-all duration-75' : '',
          !prefersReducedMotion && isDragging ? 'scale-110' : '',
          !prefersReducedMotion && isPosting ? 'animate-pulse' : ''
        ].join(' ')}
        style={{
          left: `calc(${position}% - 20px)`,
          borderWidth: '3px',
          borderColor: thumbColor,
          boxShadow:
            isDragging && !prefersReducedMotion
              ? `0 0 16px ${thumbColor}, 0 4px 12px rgba(0,0,0,0.3)`
              : '0 2px 8px rgba(0,0,0,0.2)'
        }}
        data-testid="slide-thumb"
      >
        <div className="flex gap-0.5">
          <div className="h-4 w-0.5 rounded-full" style={{ backgroundColor: thumbColor }} />
          <div className="h-4 w-0.5 rounded-full" style={{ backgroundColor: thumbColor }} />
          <div className="h-4 w-0.5 rounded-full" style={{ backgroundColor: thumbColor }} />
        </div>
      </div>
    </div>
  );
};

export default SlideToPost;

