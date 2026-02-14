import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Lightweight viewport intersection hook.
 * Returns [ref, hasBeenVisible] — `hasBeenVisible` latches true once the
 * element has entered the viewport, and never reverts to false.
 *
 * Used by TopicCard to defer synthesis hydration until the card is (or has
 * been) visible, preventing burst Gun subscriptions for off-screen items.
 */
export function useInView<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  boolean,
] {
  const ref = useRef<T>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (hasBeenVisible) return;

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      // SSR / test environment fallback: treat as always visible
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }, // pre-fetch 200px before viewport
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasBeenVisible]);

  return [ref, hasBeenVisible];
}
