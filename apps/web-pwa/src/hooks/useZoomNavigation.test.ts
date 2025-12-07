/* @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZoomNavigation } from './useZoomNavigation';

describe('useZoomNavigation', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('initializes with empty stack and null activeId', () => {
    const { result } = renderHook(() => useZoomNavigation());

    expect(result.current.stack).toEqual([]);
    expect(result.current.activeId).toBeNull();
  });

  describe('zoomTo', () => {
    it('adds an id to the stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });

      expect(result.current.stack).toEqual(['comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });

    it('adds multiple ids to the stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });

      expect(result.current.stack).toEqual(['comment-1', 'comment-2']);
      expect(result.current.activeId).toBe('comment-2');
    });

    it('does not add duplicate if already at top of stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-1'); // Same id again
      });

      expect(result.current.stack).toEqual(['comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });

    it('allows same id if not at top of stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });
      act(() => {
        result.current.zoomTo('comment-1'); // Same as first, but not top
      });

      expect(result.current.stack).toEqual(['comment-1', 'comment-2', 'comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });
  });

  describe('zoomOut', () => {
    it('removes the top id from the stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });
      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.stack).toEqual(['comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });

    it('returns null activeId when stack is empty', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.stack).toEqual([]);
      expect(result.current.activeId).toBeNull();
    });

    it('is safe to call on empty stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.stack).toEqual([]);
      expect(result.current.activeId).toBeNull();
    });
  });

  describe('zoomOutTo', () => {
    it('pops back to a specific index', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });
      act(() => {
        result.current.zoomTo('comment-3');
      });

      act(() => {
        result.current.zoomOutTo(0); // Go back to first item
      });

      expect(result.current.stack).toEqual(['comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });

    it('clears entire stack when index is -1', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });

      act(() => {
        result.current.zoomOutTo(-1); // Clear all
      });

      expect(result.current.stack).toEqual([]);
      expect(result.current.activeId).toBeNull();
    });

    it('keeps items up to and including the given index', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('a');
      });
      act(() => {
        result.current.zoomTo('b');
      });
      act(() => {
        result.current.zoomTo('c');
      });
      act(() => {
        result.current.zoomTo('d');
      });

      act(() => {
        result.current.zoomOutTo(1); // Keep a and b
      });

      expect(result.current.stack).toEqual(['a', 'b']);
      expect(result.current.activeId).toBe('b');
    });
  });

  describe('Escape key handler', () => {
    it('registers keydown listener on mount', () => {
      renderHook(() => useZoomNavigation());

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes keydown listener on unmount', () => {
      const { unmount } = renderHook(() => useZoomNavigation());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('pops stack when Escape is pressed with non-empty stack', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });
      act(() => {
        result.current.zoomTo('comment-2');
      });

      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      act(() => {
        window.dispatchEvent(escapeEvent);
      });

      expect(result.current.stack).toEqual(['comment-1']);
      expect(result.current.activeId).toBe('comment-1');
    });

    it('does not change empty stack when Escape is pressed', () => {
      const { result } = renderHook(() => useZoomNavigation());

      // Simulate Escape key press on empty stack
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      act(() => {
        window.dispatchEvent(escapeEvent);
      });

      expect(result.current.stack).toEqual([]);
      expect(result.current.activeId).toBeNull();
    });

    it('ignores non-Escape key presses', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('comment-1');
      });

      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      act(() => {
        window.dispatchEvent(enterEvent);
      });

      expect(result.current.stack).toEqual(['comment-1']); // Stack unchanged
    });

    it('correctly removes top item from stack with Escape', () => {
      const { result } = renderHook(() => useZoomNavigation());

      act(() => {
        result.current.zoomTo('a');
      });
      act(() => {
        result.current.zoomTo('b');
      });
      act(() => {
        result.current.zoomTo('c');
      });

      expect(result.current.stack).toEqual(['a', 'b', 'c']);

      // Press Escape to go back
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(result.current.stack).toEqual(['a', 'b']);

      // Press Escape again
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(result.current.stack).toEqual(['a']);
    });
  });
});

