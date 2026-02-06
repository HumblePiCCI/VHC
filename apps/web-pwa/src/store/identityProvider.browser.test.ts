// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPublishedIdentity, publishIdentity } from './identityProvider';

describe('identityProvider (browser)', () => {
  beforeEach(() => {
    clearPublishedIdentity();
  });

  it('uses window for published flag and dispatches the browser event', () => {
    const listener = vi.fn();
    window.addEventListener('vh:identity-published', listener as EventListener);

    publishIdentity({
      session: { nullifier: 'browser-null', trustScore: 1, scaledTrustScore: 10000 },
    });

    expect((window as any).__vh_identity_published).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    clearPublishedIdentity();
    expect((window as any).__vh_identity_published).toBe(false);

    window.removeEventListener('vh:identity-published', listener as EventListener);
  });
});
