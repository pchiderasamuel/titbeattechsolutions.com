import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // App & Site URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://titbeattechsolutions.app'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://app.titbeattechsolutions.app'),
  APP_URL: z.string().url().default('https://app.titbeattechsolutions.app'),

  // Supabase (Server-side)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  PAYSTACK_PLAN_MICRO: z.string().optional().default(''),
  PAYSTACK_PLAN_STARTER: z.string().optional().default(''),
  PAYSTACK_PLAN_GROWTH: z.string().optional().default(''),
  PAYSTACK_PLAN_ENTERPRISE: z.string().optional().default(''),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('TitbeatTech <noreply@titbeattechsolutions.app>'),

  // Admin & Cron Keys
  ADMIN_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Upstash Redis (for distributed rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
}

export const env = _env.success
  ? _env.data
  : envSchema.parse({
      // Fallback to defaults if parsing fails completely in non-strict mode
      NODE_ENV: process.env.NODE_ENV || 'development',
    });

/**
 * Helper to check if production required secrets are configured.
 */
export function validateProductionSecrets(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!env.PAYSTACK_SECRET_KEY) missing.push('PAYSTACK_SECRET_KEY');
  return {
    valid: missing.length === 0,
    missing,
  };
}
