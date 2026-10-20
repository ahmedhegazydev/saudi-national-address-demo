import { RateLimiter, TtlCache } from '../quota';

describe('RateLimiter', () => {
  it('allows `limit` calls per window, then blocks until the oldest call expires', () => {
    let now = 0;
    const limiter = new RateLimiter(5, 60_000, () => now);

    for (let i = 0; i < 5; i++) {
      expect(limiter.tryAcquire()).toBe(true);
      now += 1_000;
    }
    expect(limiter.tryAcquire()).toBe(false);
    expect(limiter.retryAfterMs()).toBe(55_000);

    now = 60_001;
    expect(limiter.tryAcquire()).toBe(true);
  });
});

describe('TtlCache', () => {
  it('returns values until they expire', () => {
    let now = 0;
    const cache = new TtlCache<string>(1_000, () => now);
    cache.set('k', 'v');
    expect(cache.get('k')).toBe('v');
    now = 1_000;
    expect(cache.get('k')).toBeUndefined();
  });
});
