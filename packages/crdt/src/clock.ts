export class LamportClock {
  private counter: bigint;

  constructor(initial = 0n) {
    this.counter = BigInt(initial);
  }

  public value(): bigint {
    return this.counter;
  }

  public tick(): bigint {
    this.counter += 1n;
    return this.counter;
  }

  public merge(peerValue: bigint | number): bigint {
    const peer = BigInt(peerValue);
    this.counter = (this.counter > peer ? this.counter : peer) + 1n;
    return this.counter;
  }
}
