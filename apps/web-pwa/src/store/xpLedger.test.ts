import { beforeEach, describe, expect, it } from 'vitest';
import { useXpLedger } from './xpLedger';

const memoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  };
};

describe('xpLedger', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = memoryStorage();
    useXpLedger.setState((state) => ({
      ...state,
      socialXP: 0,
      civicXP: 0,
      projectXP: 0,
      dailySocialXP: { date: state.dailySocialXP.date, amount: 0 },
      dailyCivicXP: { date: state.dailyCivicXP.date, amount: 0 },
      weeklyProjectXP: { weekStart: state.weeklyProjectXP.weekStart, amount: 0 },
      firstContacts: new Set(),
      qualityBonuses: new Map(),
      sustainedAwards: new Map(),
      projectWeekly: new Map()
    }));
  });

  it('caps first contact awards to daily limit', () => {
    const ledger = useXpLedger.getState();
    ledger.applyMessagingXP({ type: 'first_contact', contactKey: 'alice' });
    ledger.applyMessagingXP({ type: 'first_contact', contactKey: 'bob' });
    ledger.applyMessagingXP({ type: 'first_contact', contactKey: 'carol' });
    ledger.applyMessagingXP({ type: 'first_contact', contactKey: 'dave' });
    expect(useXpLedger.getState().socialXP).toBeLessThanOrEqual(5);
  });

  it('awards quality bonus thresholds only once', () => {
    const ledger = useXpLedger.getState();
    ledger.applyForumXP({ type: 'quality_bonus', contentId: 'c1', threshold: 3 });
    ledger.applyForumXP({ type: 'quality_bonus', contentId: 'c1', threshold: 3 });
    expect(useXpLedger.getState().civicXP).toBe(1);
  });

  it('caps weekly project updates per thread', () => {
    const ledger = useXpLedger.getState();
    ledger.applyProjectXP({ type: 'project_update', threadId: 't1' });
    ledger.applyProjectXP({ type: 'project_update', threadId: 't1' });
    ledger.applyProjectXP({ type: 'project_update', threadId: 't1' });
    ledger.applyProjectXP({ type: 'project_update', threadId: 't1' });
    expect(useXpLedger.getState().projectXP).toBeLessThanOrEqual(3);
  });
});
