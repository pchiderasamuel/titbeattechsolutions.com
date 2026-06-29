/**
 * Simple in-memory rate limiter for Next.js Route Handlers.
 * Replaces express-rate-limit. Not clustered — sufficient for Vercel serverless.
 * For production at scale, use Upstash Redis with @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(options: {
  windowMs: number;
  max: number;
  key: string;
}): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(options.key);

  if (!entry || now > entry.resetAt) {
    store.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.max - 1 };
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.max - entry.count };
}
