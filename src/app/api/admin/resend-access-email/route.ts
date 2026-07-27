import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWelcomeEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';
import { env } from '@/lib/env';

const resendSchema = z.object({
  adminEmail: z.string().email(),
});

/**
 * POST /api/admin/resend-access-email
 *
 * Admin-facing endpoint to resend the welcome / temp-password email
 * when the original delivery failed. Generates a fresh temp password
 * and updates the auth user.
 *
 * Protected by the ADMIN_API_KEY environment variable.
 * Add `Authorization: Bearer <ADMIN_API_KEY>` to the request header.
 */
export async function POST(req: NextRequest) {
  // ── Rate limiting (10 req/15 min per IP) ────────────────────────
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = await rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: `admin-resend:${ip}` });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  // ── Bearer token / RBAC auth check ──────────────────────────────
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  let isAuthorized = false;

  // Check 1: Static ADMIN_API_KEY
  if (env.ADMIN_API_KEY && token === env.ADMIN_API_KEY) {
    isAuthorized = true;
  }

  // Check 2: Supabase Auth JWT with admin role
  if (!isAuthorized && token) {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (!authErr && user && (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'superadmin')) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { adminEmail } = resendSchema.parse(body);

    // ── Find the user ───────────────────────────────────────────
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, admin_name, school_id')
      .eq('admin_email', adminEmail)
      .maybeSingle();

    if (userErr || !userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .select('school_name, plan_tier')
      .eq('id', userRow.school_id)
      .maybeSingle();

    if (schoolErr || !school) {
      return NextResponse.json({ error: 'School record not found' }, { status: 404 });
    }

    // ── Generate a fresh temp password ──────────────────────────
    const chars   = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!$%';
    const tempPwd = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');

    // ── Update the Supabase Auth user ───────────────────────────
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      userRow.id,
      {
        password: tempPwd,
        user_metadata: { must_reset_password: true },
      }
    );

    if (updateErr) {
      console.error('[resend] Failed to update user password:', updateErr);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    // ── Send the welcome email ──────────────────────────────────
    const sent = await sendWelcomeEmail({
      to: adminEmail,
      adminName: userRow.admin_name,
      schoolName: school.school_name,
      tempPassword: tempPwd,
      planTier: school.plan_tier,
    });

    if (!sent) {
      return NextResponse.json(
        { error: 'Password reset but email delivery failed — try again' },
        { status: 500 }
      );
    }

    // ── Clear the email_failures log entry ──────────────────────
    await supabaseAdmin
      .from('email_failures')
      .delete()
      .eq('admin_email', adminEmail)
      .eq('failure_type', 'welcome');

    return NextResponse.json({ message: 'Access email resent successfully' });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[resend] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
