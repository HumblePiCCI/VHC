type Classification = 'public' | 'sensitive' | 'local';

export interface TopologyRule {
  pathPrefix: string;
  classification: Classification;
}

const DEFAULT_RULES: TopologyRule[] = [
  { pathPrefix: 'vh/public/', classification: 'public' },
  { pathPrefix: 'vh/sensitive/', classification: 'sensitive' },
  { pathPrefix: 'vh/local/', classification: 'local' },
  // legacy namespaces
  { pathPrefix: 'vh/chat/', classification: 'sensitive' },
  { pathPrefix: 'vh/outbox/', classification: 'sensitive' },
  { pathPrefix: 'vh/analyses/', classification: 'public' },
  { pathPrefix: 'vh/aggregates/', classification: 'public' }
];

function containsPII(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false;
  const keys = Object.keys(value as Record<string, unknown>);
  return keys.some((k) =>
    ['nullifier', 'district_hash', 'email', 'wallet', 'address'].some((pii) => k.toLowerCase().includes(pii))
  );
}

export class TopologyGuard {
  private rules: TopologyRule[];

  constructor(rules: TopologyRule[] = DEFAULT_RULES) {
    this.rules = rules;
  }

  validateWrite(path: string, data: unknown): void {
    const rule = this.rules.find((r) => path.startsWith(r.pathPrefix));
    if (!rule) {
      return;
    }
    if (rule.classification === 'public') {
      if (containsPII(data)) {
        throw new Error(`Topology violation: PII in public path ${path}`);
      }
    }
    if (rule.classification === 'sensitive') {
      // Expect payload to be encrypted/encapsulated
      if (!data || typeof data !== 'object' || !(data as Record<string, unknown>).__encrypted) {
        throw new Error(`Topology violation: sensitive write without encryption flag at ${path}`);
      }
    }
    // local requires no sync; guard not enforced here because writes are in-app only
  }
}
