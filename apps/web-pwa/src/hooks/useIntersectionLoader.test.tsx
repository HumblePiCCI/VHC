/* @vitest-environment jsdom */

import { act, cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { useIntersectionLoader } from './useIntersectionLoader';

interface TestComponentProps {
  readonly enabled?: boolean;
  readonly loading?: boolean;
  readonly onLoadMore: () => void;
}

function TestComponent({
  enabled = true,
  loading = false,
  onLoadMore,
}: TestComponentProps) {
  const ref = useIntersectionLoader<HTMLDivElement>({
    enabled,
    loading,
    onLoadMore,
    debounceMs: 50,
  });

  return <div ref={ref} data-testid="sentinel" />;
}

function NoRefComponent({ onLoadMore }: Pick<TestComponentProps, 'onLoadMore'>) {
  useIntersectionLoader<HTMLDivElement>({
    enabled: true,
    loading: false,
    onLoadMore,
    debounceMs: 50,
  });

  return <div data-testid="no-ref" />;
}

describe('useIntersectionLoader', () => {
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;
        return {
          observe: observeSpy,
          disconnect: disconnectSpy,
          unobserve: vi.fn(),
          takeRecords: vi.fn(),
          root: null,
          rootMargin: '0px',
          thresholds: [0],
        } as unknown as IntersectionObserver;
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('observes sentinel when enabled and not loading', () => {
    render(<TestComponent onLoadMore={vi.fn()} />);

    expect(screen.getByTestId('sentinel')).toBeInTheDocument();
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not observe sentinel when disabled', () => {
    render(<TestComponent enabled={false} onLoadMore={vi.fn()} />);

    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('does not observe sentinel when already loading', () => {
    render(<TestComponent loading onLoadMore={vi.fn()} />);

    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('no-ops when the hook ref is not attached to a DOM element', () => {
    render(<NoRefComponent onLoadMore={vi.fn()} />);

    expect(screen.getByTestId('no-ref')).toBeInTheDocument();
    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('triggers debounced load when sentinel intersects', () => {
    vi.useFakeTimers();
    const onLoadMore = vi.fn();

    render(<TestComponent onLoadMore={onLoadMore} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(onLoadMore).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid intersection callbacks', () => {
    vi.useFakeTimers();
    const onLoadMore = vi.fn();

    render(<TestComponent onLoadMore={onLoadMore} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('ignores non-intersecting callbacks', () => {
    vi.useFakeTimers();
    const onLoadMore = vi.fn();

    render(<TestComponent onLoadMore={onLoadMore} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      vi.advanceTimersByTime(100);
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('falls back to timed load when IntersectionObserver is unavailable', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', undefined);
    const onLoadMore = vi.fn();

    render(<TestComponent onLoadMore={onLoadMore} />);

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('clears fallback debounce timer on unmount', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', undefined);
    const onLoadMore = vi.fn();

    const view = render(<TestComponent onLoadMore={onLoadMore} />);
    view.unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('clears pending debounce timer on unmount', () => {
    vi.useFakeTimers();
    const onLoadMore = vi.fn();

    const view = render(<TestComponent onLoadMore={onLoadMore} />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    view.unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(disconnectSpy).toHaveBeenCalled();
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
