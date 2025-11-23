import { create } from 'zustand';

interface CivicState {
  scores: Record<string, number>;
  updateScore: (key: string, delta: number) => void;
  getScore: (key: string) => number;
}

const STORAGE_KEY = 'vh_civic_scores_v1';

function loadScores(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persistScores(scores: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    /* ignore */
  }
}

export const useCivicState = create<CivicState>((set, get) => ({
  scores: loadScores(),
  updateScore(key, delta) {
    set((state) => {
      const next = { ...state.scores };
      const current = next[key] ?? 0;
      const updated = Math.max(-2, Math.min(2, current + delta));
      next[key] = updated;
      persistScores(next);
      return { scores: next };
    });
  },
  getScore(key) {
    return get().scores[key] ?? 0;
  }
}));
