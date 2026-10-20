// Client-side guards so the demo doesn't burn the Starter quota
// (5 calls / minute, 100 calls / week).

type Clock = () => number;

export class RateLimiter {
  private calls: number[] = [];

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: Clock = Date.now,
  ) {}

  private prune(): void {
    const cutoff = this.now() - this.windowMs;
    this.calls = this.calls.filter(time => time > cutoff);
  }

  tryAcquire(): boolean {
    this.prune();
    if (this.calls.length >= this.limit) {
      return false;
    }
    this.calls.push(this.now());
    return true;
  }

  retryAfterMs(): number {
    this.prune();
    if (this.calls.length < this.limit) {
      return 0;
    }
    return this.calls[0] + this.windowMs - this.now();
  }
}

export class TtlCache<T> {
  private entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly now: Clock = Date.now,
  ) {}

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }
}
