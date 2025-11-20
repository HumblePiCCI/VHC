import { LamportClock } from './clock';

export interface LwwEntry<T> {
  value: T;
  timestamp: bigint;
}

export class LwwRegister<T> {
  private readonly clock: LamportClock;
  private entry?: LwwEntry<T>;

  constructor(clock = new LamportClock()) {
    this.clock = clock;
  }

  public set(value: T): LwwEntry<T> {
    const timestamp = this.clock.tick();
    this.entry = { value, timestamp };
    return this.entry;
  }

  public merge(incoming: LwwEntry<T>): LwwEntry<T> {
    const currentTimestamp = this.entry?.timestamp ?? 0n;
    if (!this.entry || incoming.timestamp >= currentTimestamp) {
      this.entry = incoming;
    }
    this.clock.merge(incoming.timestamp);
    return this.entry;
  }

  public read(): T | undefined {
    return this.entry?.value;
  }
}
