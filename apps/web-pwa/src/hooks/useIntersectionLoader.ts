import { useEffect, useRef, type RefObject } from 'react';

interface UseIntersectionLoaderOptions {
  readonly enabled: boolean;
  readonly loading: boolean;
  readonly onLoadMore: () => void;
  readonly rootMargin?: string;
  readonly debounceMs?: number;
}

const DEFAULT_ROOT_MARGIN = '200px';
const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Observe a sentinel element and trigger paged loading when it intersects.
 *
 * Debounce prevents rapid-fire calls while the sentinel remains in view.
 */
export function useIntersectionLoader<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionLoaderOptions,
): RefObject<T> {
  const {
    enabled,
    loading,
    onLoadMore,
    rootMargin = DEFAULT_ROOT_MARGIN,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  const ref = useRef<T>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || loading) return;

    const element = ref.current;
    if (!element) return;

    const queueLoad = () => {
      if (debounceTimerRef.current) return;

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        onLoadMore();
      }, debounceMs);
    };

    if (typeof IntersectionObserver === 'undefined') {
      queueLoad();
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        queueLoad();
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [enabled, loading, onLoadMore, rootMargin, debounceMs]);

  return ref;
}
