export interface HydrationBarrier {
  ready: boolean;
  markReady(): void;
  prepare(): Promise<void>;
}

export function createHydrationBarrier(): HydrationBarrier {
  let ready = false;

  return {
    get ready() {
      return ready;
    },
    markReady() {
      ready = true;
    },
    async prepare() {
      if (ready) return;
      // Placeholder for logic that ensures reads hydrate before writes.
      ready = true;
    }
  };
}
