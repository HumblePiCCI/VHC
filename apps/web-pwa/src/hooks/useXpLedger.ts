import { create } from 'zustand';

type Track = 'civic' | 'social' | 'project';

interface XpState {
  tracks: Record<Track, number>;
  totalXP: number;
  lastUpdated: number;
  addXp: (track: Track, amount: number) => void;
  calculateRvu: (trustScore: number) => number;
  claimDailyBoost: (trustScore: number) => number;
}

const STORAGE_KEY = 'vh_xp_ledger';
const DAILY_BOOST_RVU = 10;

function loadLedger(): Omit<XpState, 'addXp' | 'calculateRvu' | 'claimDailyBoost'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        tracks: { civic: 0, social: 0, project: 0 },
        totalXP: 0,
        lastUpdated: 0
      };
    }
    const parsed = JSON.parse(raw) as { tracks: Record<Track, number>; totalXP: number; lastUpdated: number };
    return {
      tracks: parsed.tracks ?? { civic: 0, social: 0, project: 0 },
      totalXP: parsed.totalXP ?? 0,
      lastUpdated: parsed.lastUpdated ?? 0
    };
  } catch {
    return { tracks: { civic: 0, social: 0, project: 0 }, totalXP: 0, lastUpdated: 0 };
  }
}

function persist(state: XpState) {
  const { addXp, calculateRvu, claimDailyBoost, ...rest } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

function clampRvu(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, value);
}

function clampTrust(trustScore: number): number {
  if (Number.isNaN(trustScore)) return 0;
  if (trustScore < 0) return 0;
  if (trustScore > 1) return 1;
  return trustScore;
}

export const useXpLedger = create<XpState>((set, get) => ({
  ...loadLedger(),
  addXp(track, amount) {
    set((state) => {
      const nextTracks = { ...state.tracks, [track]: Math.max(0, (state.tracks[track] ?? 0) + amount) } as Record<Track, number>;
      const nextTotal = nextTracks.civic + nextTracks.social + nextTracks.project;
      const nextState: XpState = {
        ...state,
        tracks: nextTracks,
        totalXP: nextTotal,
        lastUpdated: Date.now(),
        addXp: state.addXp,
        calculateRvu: state.calculateRvu,
        claimDailyBoost: state.claimDailyBoost
      };
      persist(nextState);
      return nextState;
    });
  },
  calculateRvu(trustScore) {
    const clampedTrust = clampTrust(trustScore);
    const scaled = Math.round(clampedTrust * 10000);
    return clampRvu(get().totalXP * (scaled / 10000));
  },
  claimDailyBoost(trustScore) {
    if (clampTrust(trustScore) < 0.5) return 0;
    const rvMint = DAILY_BOOST_RVU;
    get().addXp('civic', rvMint);
    return rvMint;
  }
}));
