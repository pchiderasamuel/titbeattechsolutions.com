import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rateLimit';

describe('rateLimit hybrid limiter', () => {
  it('allows requests within the maximum limit and blocks when exceeded', async () => {
    const testKey = 'test-ip-' + Date.now();
    const opts = { windowMs: 1000, max: 2, key: testKey };

    const res1 = await rateLimit(opts);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = await rateLimit(opts);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = await rateLimit(opts);
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
  });
});
