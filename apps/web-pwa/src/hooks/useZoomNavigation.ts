import { useEffect, useState } from 'react';

export function useZoomNavigation() {
  const [stack, setStack] = useState<string[]>([]);

  const activeId = stack[stack.length - 1] ?? null;

  const zoomTo = (id: string) => {
    setStack((prev) => (prev[prev.length - 1] === id ? prev : [...prev, id]));
  };

  const zoomOut = () => setStack((prev) => prev.slice(0, -1));

  const zoomOutTo = (index: number) => {
    setStack((prev) => prev.slice(0, index + 1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack.length > 0) {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stack.length]);

  return { stack, activeId, zoomTo, zoomOut, zoomOutTo };
}
