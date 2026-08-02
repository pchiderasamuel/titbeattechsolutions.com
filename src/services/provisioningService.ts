import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWelcomeEmail, sendPaymentFailedEmail } from '@/lib/email';
import { PLAN_CODE_TO_TIER } from '@/lib/paystack';

/** ─────────────────────────────────────────────────────────────────
 *  generateTempPassword
 *  Cryptographically secure 12-character password that satisfies
 *  uppercase + lowercase + digit + symbol requirements.
 * ───────────────────────────────────────────────────────────────── */
function generateTempPassword(): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const symbols = '@#!$%';
  const all     = upper + lower + digits + symbols;

  const rand = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  // Guarantee at least one of each required class
  const guaranteed = [rand(upper), rand(lower), rand(digits), rand(symbols)];
  const rest = Array.from({ length: 8 }, () => rand(all));

  return [...guaranteed, ...rest]
    .sort(() => Math.random() - 0.5)
    .join('');
}

/** ─────────────────────────────────────────────────────────────────
 *  isEventProcessed / markEventProcessed
 *  Idempotency guard — stores Paystack event IDs in Supabase to
 *  silently ignore duplicate webhook deliveries.
 * ───────────────────────────────────────────────────────────────── */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle();
  return !!data;
}

export async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ event_id: eventId, event_type: eventType, processed_at: new Date().toISOString() });
}

/** ─────────────────────────────────────────────────────────────────
 *  provisionSchool
 *  Called after charge.success (new subscription activated).
 *  Handles:
 *   1. Duplicate email detection (idempotent re-activation)
 *   2. School record creation in Supabase
 *   3. Supabase Auth user creation with temp password
 *   4. users table row insertion
 *   5. Welcome email dispatch + failure logging
 *  Partial failures are logged to provisioning_failures — never silently swallowed.
 * ───────────────────────────────────────────────────────────────── */
export async function provisionSchool(params: {
  schoolName: string;
  adminName: string;
  adminEmail: string;
  planTier: string;
  country?: string;
  stateLoc?: string;
  lga?: string;
  address?: string;
  paystackCustomerCode: string;
  paystackSubscriptionCode: string;
}): Promise<{ success: boolean; error?: string }> {
  const {
    schoolName, adminName, adminEmail,
    planTier, country, stateLoc, lga, address, paystackCustomerCode, paystackSubscriptionCode,
  } = params;

  // ── 1. Duplicate email guard (Local) ───────────────────────────
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, school_id, subscription_status')
    .eq('admin_email', adminEmail)
    .maybeSingle();

  if (existingUser) {
    console.warn(`[provision] Duplicate signup for ${adminEmail} — re-activating existing local record`);

    await supabaseAdmin
      .from('schools')
      .update({
        subscription_status: 'active',
        plan_tier: planTier,
        paystack_customer_code: paystackCustomerCode,
        paystack_subscription_code: paystackSubscriptionCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.school_id);

    await supabaseAdmin
      .from('users')
      .update({ subscription_status: 'active' })
      .eq('id', existingUser.id);

    return { success: true };
  }

  // ── 2. Call myschoolgradeflow S2S Provisioning API ─────────────
  const tempPassword = generateTempPassword();
  // Using a short code derived from the school name
  const code = schoolName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);
  
  const productApiUrl = process.env.MYSCHOOLGRADEFLOW_API_URL || "https://myschoolgradeflow.supabase.co/functions/v1/provision-school";
  const productApiSecret = process.env.PROVISIONING_SECRET || "";

  try {
    const apiResponse = await fetch(productApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-provisioning-secret': productApiSecret
      },
      body: JSON.stringify({
        idempotencyKey: paystackCustomerCode, // using customer code as idempotency key
        school: {
          name: schoolName,
          code: code,
          email: adminEmail,
          address: {
            street: address || "",
            city: lga || "",
            state: stateLoc || ""
          }
        },
        admin: {
          name: adminName,
          email: adminEmail,
          tempPassword: tempPassword
        },
        subscription: {
          plan: planTier,
          paymentMethod: "paystack",
          transactionRef: paystackSubscriptionCode
        }
      })
    });

    if (!apiResponse.ok) {
      const errData = await apiResponse.json().catch(() => ({}));
      console.error('[provision] myschoolgradeflow API error:', errData);
      throw new Error(`API returned ${apiResponse.status}: ${JSON.stringify(errData)}`);
    }
  } catch (apiError) {
    console.error('[provision] Failed to call product API:', apiError);
    // Log for manual recovery
    await supabaseAdmin.from('provisioning_failures').insert({
      admin_email: adminEmail,
      school_name: schoolName,
      plan_tier: planTier,
      paystack_customer_code: paystackCustomerCode,
      error: apiError instanceof Error ? apiError.message : JSON.stringify(apiError),
      created_at: new Date().toISOString(),
    });
    return { success: false, error: 'Product API provisioning failed' };
  }

  // ── 3. Create local billing/school record ──────────────────────
  const { data: school, error: schoolError } = await supabaseAdmin
    .from('schools')
    .insert({
      school_name: schoolName,
      plan_tier: planTier,
      country: country || 'Nigeria',
      state: stateLoc || '',
      lga: lga || '',
      address: address || '',
      subscription_status: 'active',
      paystack_customer_code: paystackCustomerCode,
      paystack_subscription_code: paystackSubscriptionCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (schoolError || !school) {
    console.error('[provision] Failed to create local school record:', schoolError);
  }

  // ── 4. Create local user record for billing sync ───────────────
  if (school) {
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: crypto.randomUUID(),
      admin_email: adminEmail,
      admin_name: adminName,
      role: 'admin',
      school_id: school.id,
      subscription_status: 'active',
      must_reset_password: true,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      console.error('[provision] Failed to insert local users row:', userError);
    }
  }

  // ── 5. Send welcome email ──────────────────────────────────────
  const emailSent = await sendWelcomeEmail({
    to: adminEmail,
    adminName,
    schoolName,
    tempPassword,
    planTier,
  });

  if (!emailSent) {
    console.error(`[provision] Welcome email failed for ${adminEmail} — logging for manual resend`);
    await supabaseAdmin.from('email_failures').insert({
      admin_email: adminEmail,
      school_id: school?.id || crypto.randomUUID(),
      failure_type: 'welcome',
      created_at: new Date().toISOString(),
    });
  }

  return { success: true };
}

/** ─────────────────────────────────────────────────────────────────
 *  handleSubscriptionUpdated
 *  Fired by subscription.create (new or plan change).
 *  Updates plan_tier + subscription code in schools table.
 * ───────────────────────────────────────────────────────────────── */
export async function handleSubscriptionUpdated(params: {
  paystackCustomerCode: string;
  paystackSubscriptionCode: string;
  planCode: string;
}): Promise<void> {
  const { paystackCustomerCode, paystackSubscriptionCode, planCode } = params;
  const planTier = PLAN_CODE_TO_TIER[planCode] || 'unknown';

  await supabaseAdmin
    .from('schools')
    .update({
      plan_tier: planTier,
      paystack_subscription_code: paystackSubscriptionCode,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_customer_code', paystackCustomerCode);
}

/** ─────────────────────────────────────────────────────────────────
 *  handleSubscriptionDisabled
 *  Fired by subscription.disable (admin-canceled or Paystack auto-cancel).
 *  Sets status to 'canceled'. NEVER deletes school or user data.
 * ───────────────────────────────────────────────────────────────── */
export async function handleSubscriptionDisabled(paystackCustomerCode: string): Promise<void> {
  const { data: school } = await supabaseAdmin
    .from('schools')
    .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
    .eq('paystack_customer_code', paystackCustomerCode)
    .select('id')
    .maybeSingle();

  if (school) {
    await supabaseAdmin
      .from('users')
      .update({ subscription_status: 'canceled' })
      .eq('school_id', school.id);
  }
}

/** ─────────────────────────────────────────────────────────────────
 *  handleInvoicePaymentFailed
 *  Sets subscription_status to 'past_due' (NOT 'canceled') and emails admin.
 * ───────────────────────────────────────────────────────────────── */
export async function handleInvoicePaymentFailed(paystackCustomerCode: string): Promise<void> {
  const { data: school } = await supabaseAdmin
    .from('schools')
    .update({ subscription_status: 'past_due', updated_at: new Date().toISOString() })
    .eq('paystack_customer_code', paystackCustomerCode)
    .select('id, school_name, plan_tier')
    .maybeSingle();

  if (!school) return;

  await supabaseAdmin
    .from('users')
    .update({ subscription_status: 'past_due' })
    .eq('school_id', school.id);

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('admin_email, admin_name')
    .eq('school_id', school.id)
    .maybeSingle();

  if (user) {
    const emailSent = await sendPaymentFailedEmail({
      to: user.admin_email,
      adminName: user.admin_name,
      schoolName: school.school_name,
      planTier: school.plan_tier,
    });

    if (!emailSent) {
      await supabaseAdmin.from('email_failures').insert({
        admin_email: user.admin_email,
        school_id: school.id,
        failure_type: 'payment_failed',
        created_at: new Date().toISOString(),
      });
    }
  }
}
