import { describe, it, expect } from 'vitest';
import { env, validateProductionSecrets } from '@/lib/env';

describe('env configuration and validation', () => {
  it('provides default site and app URLs', () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toBeDefined();
    expect(env.APP_URL).toBeDefined();
    expect(env.EMAIL_FROM).toContain('TitbeatTech');
  });

  it('checks production secrets completeness', () => {
    const res = validateProductionSecrets();
    expect(res).toHaveProperty('valid');
    expect(Array.isArray(res.missing)).toBe(true);
  });
});
