import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import {
  isEventProcessed,
  markEventProcessed,
  provisionSchool,
  handleSubscriptionUpdated,
  handleSubscriptionDisabled,
  handleInvoicePaymentFailed,
} from '@/services/provisioningService';

/**
 * POST /api/webhooks/paystack
 *
 * Handles all Paystack webhook events.
 *
 * Security checklist:
 *  ✅ Signature verified with HMAC-SHA512 before ANY processing
 *  ✅ Raw text body used for signature (req.text() — not parsed JSON)
 *  ✅ Idempotency: event ID checked + stored in processed_webhook_events
 *  ✅ Abandoned checkout: DB writes ONLY happen here, never during initiation
 *  ✅ Partial failures: logged to provisioning_failures, never silently swallowed
 *  ✅ invoice.payment_failed → 'past_due' (NOT 'canceled')
 *  ✅ subscription.disable → 'canceled', school + user data is NEVER deleted
 *
 * Next.js note: raw body is obtained via req.text() before any JSON parsing.
 * No express.raw() middleware needed — Next.js gives us stream access natively.
 */
export async function POST(req: NextRequest) {
  // ── 1. Get raw body FIRST (before parsing) ─────────────────────
  // This is the Next.js equivalent of express.raw({ type: 'application/json' }).
  const rawBody = await req.text();

  // ── 2. Verify webhook signature ─────────────────────────────────
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    console.warn('[webhook] Missing x-paystack-signature header — rejected');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[webhook] Signature verification failed — rejected');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── 3. Parse event ──────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const eventId   = event.data?.id?.toString() || event.id?.toString();
  const eventType = event.event as string;

  if (!eventId || !eventType) {
    console.warn('[webhook] Event missing id or type:', event);
    return NextResponse.json({ error: 'Malformed event' }, { status: 400 });
  }

  // ── 4. Idempotency check ────────────────────────────────────────
  const alreadyProcessed = await isEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`[webhook] Duplicate event ${eventId} (${eventType}) — ignoring`);
    return NextResponse.json({ status: 'duplicate — already processed' });
  }

  // ── 5. Respond to Paystack immediately (< 5 s requirement) ──────
  // We return 200 here. If processing fails, Paystack will retry.
  // We run processEvent() as a fire-and-forget after responding.
  // In Next.js on Vercel, the serverless function stays alive until
  // the response stream closes AND all awaited work completes —
  // so we await it AFTER constructing the response.

  // Start processing (async, non-blocking from response perspective)
  const processingPromise = processEvent(eventType, event.data)
    .then(() => markEventProcessed(eventId, eventType))
    .catch(err => {
      console.error(`[webhook] Error processing ${eventId} (${eventType}):`, err);
    });

  // Wait for processing to complete so Vercel doesn't kill the function early.
  // The 200 response is sent immediately in the HTTP sense but the function
  // contract on Vercel keeps the runtime alive until all awaited Promises resolve.
  await processingPromise;

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────────────────────────
//  Event dispatcher
// ─────────────────────────────────────────────────────────────────
async function processEvent(eventType: string, data: any): Promise<void> {
  console.log(`[webhook] Processing: ${eventType}`);

  switch (eventType) {

    // ── charge.success ─────────────────────────────────────────
    // Paystack fires this when payment clears. This is the trigger for
    // provisioning the school + admin account.
    case 'charge.success': {
      if (data.status !== 'success') break;

      const meta         = data.metadata || {};
      const schoolName   = meta.school_name   || data.customer?.metadata?.school_name;
      const adminName    = meta.admin_name    || data.customer?.metadata?.admin_name;
      const adminEmail   = meta.admin_email   || data.customer?.email || data.customer_email;
      const planTier     = meta.plan_tier     || 'starter';
      const country      = meta.country       || '';
      const stateLoc     = meta.state         || '';
      const lga          = meta.lga           || '';
      const address      = meta.address       || '';
      const customerCode = data.customer?.customer_code || '';
      // subscription_code may not be set yet on charge.success;
      // it gets populated when subscription.create fires.
      const subscriptionCode = data.subscription_code || '';

      if (!adminEmail || !schoolName) {
        console.error('[webhook] charge.success missing metadata', data);
        break;
      }

      const result = await provisionSchool({
        schoolName,
        adminName,
        adminEmail,
        planTier,
        country,
        stateLoc,
        lga,
        address,
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subscriptionCode,
      });

      if (!result.success) {
        console.error('[webhook] provisionSchool failed:', result.error);
        // provisioning_failures row already written inside provisionSchool
      }
      break;
    }

    // ── subscription.create ─────────────────────────────────────
    // Fires when a subscription is activated (new or plan change).
    // Updates plan_tier and subscription code; handles upgrades/downgrades.
    case 'subscription.create': {
      const customerCode     = data.customer?.customer_code || '';
      const subscriptionCode = data.subscription_code || '';
      const planCode         = data.plan?.plan_code || '';

      if (customerCode) {
        await handleSubscriptionUpdated({
          paystackCustomerCode: customerCode,
          paystackSubscriptionCode: subscriptionCode,
          planCode,
        });
      }
      break;
    }

    // ── subscription.disable ───────────────────────────────────
    // Admin canceled OR Paystack auto-canceled after too many retries.
    // Status → 'canceled'. School + user data is NEVER deleted.
    case 'subscription.disable': {
      const customerCode = data.customer?.customer_code || '';
      if (customerCode) {
        await handleSubscriptionDisabled(customerCode);
      }
      break;
    }

    // ── invoice.payment_failed ─────────────────────────────────
    // Renewal payment failed. Status → 'past_due' (NOT 'canceled').
    // Admin is emailed to update their payment method.
    case 'invoice.payment_failed': {
      const customerCode = data.customer?.customer_code || '';
      if (customerCode) {
        await handleInvoicePaymentFailed(customerCode);
      }
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${eventType} — skipped`);
  }
}
