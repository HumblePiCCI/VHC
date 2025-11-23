export interface CivicInteraction {
  topicId: string;
  weight: number;
  timestamp: number;
}

export interface DecayStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'vh_civic_decay';

export interface DecayState {
  topicId: string;
  interactions: number;
  weight: number;
  lastUpdated: number;
}

function loadState(storage: DecayStorage): Record<string, DecayState> {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DecayState>) : {};
  } catch {
    return {};
  }
}

function persistState(storage: DecayStorage, state: Record<string, DecayState>) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function applyDecay(interaction: CivicInteraction, storage: DecayStorage): DecayState {
  const state = loadState(storage);
  const existing = state[interaction.topicId];
  const now = interaction.timestamp;

  if (!existing) {
    const created: DecayState = {
      topicId: interaction.topicId,
      interactions: 1,
      weight: interaction.weight,
      lastUpdated: now
    };
    state[interaction.topicId] = created;
    persistState(storage, state);
    return created;
  }

  const decayedWeight = existing.weight / 2;
  const next: DecayState = {
    topicId: interaction.topicId,
    interactions: existing.interactions + 1,
    weight: decayedWeight + interaction.weight,
    lastUpdated: now
  };
  state[interaction.topicId] = next;
  persistState(storage, state);
  return next;
}

export function getDecayState(storage: DecayStorage): Record<string, DecayState> {
  return loadState(storage);
}
