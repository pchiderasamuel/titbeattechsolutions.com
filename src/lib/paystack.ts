import crypto from 'crypto';

// ── Env validation (runs at module import time on the server) ──────
if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error('Missing PAYSTACK_SECRET_KEY environment variable');
}

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET_KEY    = process.env.PAYSTACK_SECRET_KEY as string;

/** Plan codes pre-created in your Paystack dashboard. */
export const PLAN_CODES: Record<string, string> = {
  starter:    process.env.PAYSTACK_PLAN_STARTER    || '',
  growth:     process.env.PAYSTACK_PLAN_GROWTH     || '',
  enterprise: process.env.PAYSTACK_PLAN_ENTERPRISE || '',
};

/** Map Paystack plan codes back to tier names — used in subscription.create webhook. */
export const PLAN_CODE_TO_TIER: Record<string, string> = Object.fromEntries(
  Object.entries(PLAN_CODES).map(([tier, code]) => [code, tier])
);

function paystackHeaders() {
  return {
    Authorization: `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

/** ─────────────────────────────────────────────────────────────────
 *  initializeTransaction
 *  Creates a Paystack payment session and returns the authorization URL.
 *  Metadata travels with the session so the webhook can provision the
 *  account after payment, without a second round-trip to our DB.
 * ───────────────────────────────────────────────────────────────── */
export async function initializeTransaction(params: {
  email: string;
  planCode: string;
  metadata: Record<string, string>;
  callbackUrl: string;
}): Promise<{ authorization_url: string; reference: string }> {
  const body = {
    email: params.email,
    plan: params.planCode,
    callback_url: params.callbackUrl,
    metadata: {
      cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://titbeattechsolutions.app'}/`,
      ...params.metadata,
    },
  };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: paystackHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Paystack initializeTransaction failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  };
}

/** ─────────────────────────────────────────────────────────────────
 *  verifyWebhookSignature
 *  Paystack signs every webhook with HMAC-SHA512 using your secret key.
 *  REJECT any request whose signature does not match.
 *  rawBody must be the raw bytes — NOT parsed JSON.
 * ───────────────────────────────────────────────────────────────── */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

/** ─────────────────────────────────────────────────────────────────
 *  disableSubscription
 *  Called when an admin cancels — sets status to 'canceled' via API.
 * ───────────────────────────────────────────────────────────────── */
export async function disableSubscription(subscriptionCode: string, emailToken: string): Promise<void> {
  const res = await fetch(`${PAYSTACK_BASE}/subscription/disable`, {
    method: 'POST',
    headers: paystackHeaders(),
    body: JSON.stringify({ code: subscriptionCode, token: emailToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Paystack disableSubscription failed: ${JSON.stringify(err)}`);
  }
}

/** ─────────────────────────────────────────────────────────────────
 *  getSubscription
 *  Fetch a subscription by its Paystack subscription code.
 * ───────────────────────────────────────────────────────────────── */
export async function getSubscription(subscriptionCode: string): Promise<any> {
  const res = await fetch(`${PAYSTACK_BASE}/subscription/${subscriptionCode}`, {
    headers: paystackHeaders(),
  });
  if (!res.ok) throw new Error(`Paystack getSubscription failed for ${subscriptionCode}`);
  const data = await res.json();
  return data.data;
}
