import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { provisionSchool } from '@/services/provisioningService';
import { sendWelcomeEmail, sendPaymentFailedEmail } from '@/lib/email';
import { env } from '@/lib/env';

/**
 * GET /api/cron/retry-failures
 *
 * Scheduled cron job (runs e.g. every 30 minutes via Vercel Cron).
 * 1. Retries failed school provisioning tasks from `provisioning_failures`.
 * 2. Retries failed email deliveries from `email_failures`.
 * 3. Prunes idempotency records in `processed_webhook_events` older than 30 days.
 */
export async function GET(req: NextRequest) {
  // ── 1. Cron Authorization ────────────────────────────────────────
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader   = req.headers.get('authorization') || '';
  const isAuthorized = isVercelCron || (env.CRON_SECRET && authHeader === `Bearer ${env.CRON_SECRET}`) || env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    provisioningRetried: 0,
    provisioningSuccess: 0,
    emailsRetried: 0,
    emailsSuccess: 0,
    idempotencyPruned: false,
    errors: [] as string[],
  };

  try {
    // ── 2. Retry Provisioning Failures ──────────────────────────────
    const { data: provFailures, error: provErr } = await supabaseAdmin
      .from('provisioning_failures')
      .select('*')
      .limit(10);

    if (provErr) {
      results.errors.push(`Query provisioning_failures failed: ${JSON.stringify(provErr)}`);
    } else if (provFailures && provFailures.length > 0) {
      for (const fail of provFailures) {
        results.provisioningRetried++;
        const res = await provisionSchool({
          schoolName: fail.school_name || 'Unknown School',
          adminName: fail.admin_name || 'Admin',
          adminEmail: fail.admin_email,
          planTier: fail.plan_tier || 'starter',
          paystackCustomerCode: fail.paystack_customer_code || '',
          paystackSubscriptionCode: fail.paystack_subscription_code || '',
        });

        if (res.success) {
          results.provisioningSuccess++;
          // Remove from failure queue on success
          await supabaseAdmin.from('provisioning_failures').delete().eq('id', fail.id);
        }
      }
    }

    // ── 3. Retry Email Failures ─────────────────────────────────────
    const { data: emailFailures, error: emailErr } = await supabaseAdmin
      .from('email_failures')
      .select('*')
      .limit(20);

    if (emailErr) {
      results.errors.push(`Query email_failures failed: ${JSON.stringify(emailErr)}`);
    } else if (emailFailures && emailFailures.length > 0) {
      for (const fail of emailFailures) {
        results.emailsRetried++;
        // Fetch user & school info to populate email template
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('admin_name, id')
          .eq('admin_email', fail.admin_email)
          .maybeSingle();

        const { data: school } = await supabaseAdmin
          .from('schools')
          .select('school_name, plan_tier')
          .eq('id', fail.school_id)
          .maybeSingle();

        if (user && school) {
          let sent = false;
          if (fail.failure_type === 'welcome') {
            // Generate fresh temp password and update auth user
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!$%';
            const tempPwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            
            await supabaseAdmin.auth.admin.updateUserById(user.id, { password: tempPwd });
            sent = await sendWelcomeEmail({
              to: fail.admin_email,
              adminName: user.admin_name,
              schoolName: school.school_name,
              tempPassword: tempPwd,
              planTier: school.plan_tier,
            });
          } else if (fail.failure_type === 'payment_failed') {
            sent = await sendPaymentFailedEmail({
              to: fail.admin_email,
              adminName: user.admin_name,
              schoolName: school.school_name,
              planTier: school.plan_tier,
            });
          }

          if (sent) {
            results.emailsSuccess++;
            await supabaseAdmin.from('email_failures').delete().eq('id', fail.id);
          }
        }
      }
    }

    // ── 4. Prune Idempotency Table (> 30 days old) ──────────────────
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: pruneErr } = await supabaseAdmin
      .from('processed_webhook_events')
      .delete()
      .lt('processed_at', thirtyDaysAgo);

    if (pruneErr) {
      results.errors.push(`Prune processed_webhook_events failed: ${JSON.stringify(pruneErr)}`);
    } else {
      results.idempotencyPruned = true;
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err) {
    console.error('[cron] Uncaught error in retry-failures:', err);
    return NextResponse.json({ error: 'Internal cron error', details: String(err) }, { status: 500 });
  }
}
