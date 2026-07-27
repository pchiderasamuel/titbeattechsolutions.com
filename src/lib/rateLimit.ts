import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Initialize Upstash Redis if environment variables are available
let redisInstance: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.error('[rateLimit] Failed to initialize Upstash Redis client:', err);
  }
}

/**
 * Hybrid rate limiter for Next.js Route Handlers.
 * Uses Upstash Redis in distributed production when configured,
 * falling back gracefully to an in-memory store for local dev or standalone deployments.
 */
export async function rateLimit(options: {
  windowMs: number;
  max: number;
  key: string;
}): Promise<{ allowed: boolean; remaining: number }> {
  // 1. Try Upstash Redis if available
  if (redisInstance) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
      const limiter = new Ratelimit({
        redis: redisInstance,
        limiter: Ratelimit.slidingWindow(options.max, `${windowSeconds} s` as any),
      });
      const res = await limiter.limit(options.key);
      return { allowed: res.success, remaining: res.remaining };
    } catch (err) {
      console.error('[rateLimit] Upstash error — falling back to in-memory store:', err);
    }
  }

  // 2. Fallback: In-memory rate limiter
  const now = Date.now();
  const entry = memoryStore.get(options.key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.max - 1 };
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.max - entry.count };
}
