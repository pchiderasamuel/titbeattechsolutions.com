process.env.PAYSTACK_SECRET_KEY = 'test-secret-key-123';

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyWebhookSignature, PLAN_CODES } from '@/lib/paystack';

describe('paystack utility', () => {
  const secret = 'test-secret-key-123';

  it('verifies valid HMAC-SHA512 webhook signatures', () => {
    const payload = JSON.stringify({ event: 'charge.success', data: { id: 100 } });
    const validSig = crypto.createHmac('sha512', secret).update(payload).digest('hex');

    expect(verifyWebhookSignature(payload, validSig)).toBe(true);
  });

  it('rejects invalid webhook signatures', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    const invalidSig = 'invalid-hex-string-0000';

    expect(verifyWebhookSignature(payload, invalidSig)).toBe(false);
  });

  it('has default plan codes defined for all tiers', () => {
    expect(PLAN_CODES).toHaveProperty('micro');
    expect(PLAN_CODES).toHaveProperty('starter');
    expect(PLAN_CODES).toHaveProperty('growth');
    expect(PLAN_CODES).toHaveProperty('enterprise');
  });
});
