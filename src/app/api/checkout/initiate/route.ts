import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { initializeTransaction, PLAN_CODES, ANNUAL_PLAN_CODES } from '@/lib/paystack';
import { rateLimit } from '@/lib/rateLimit';
import { env } from '@/lib/env';

const checkoutSchema = z.object({
  schoolName:  z.string().min(3, 'School name must be at least 3 characters'),
  adminName:   z.string().min(2, 'Admin name must be at least 2 characters'),
  adminEmail:  z.string().email('Invalid email address'),
  plan:        z.enum(['micro', 'starter', 'growth', 'enterprise']),
  isAnnual:    z.boolean().optional(),
  country:     z.string().optional(),
  state:       z.string().optional(),
  lga:         z.string().optional(),
  address:     z.string().optional(),
});

const PLAN_BASE_PRICES: Record<string, number> = {
  micro: 20000,
  starter: 52000,
  growth: 105000,
  enterprise: 112500,
};

/**
 * POST /api/checkout/initiate
 *
 * Receives signup form data, creates a Paystack transaction, and returns
 * the authorization URL for the browser to redirect to.
 *
 * Security:
 *  - Paystack secret key is ONLY used server-side - never sent to the browser
 *  - Metadata (school/admin info) travels with the Paystack session so the
 *     webhook can provision the account after payment with no second DB call
 *  - No school or user records are created here - only after successful payment
 *  - Rate limited: 20 requests per 15 minutes per IP
 */
export async function POST(req: NextRequest) {
  // === Rate limiting ===
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed } = await rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: `checkout:${ip}` });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { schoolName, adminName, adminEmail, plan, isAnnual, country, state, lga, address } = checkoutSchema.parse(body);

    const planCode = isAnnual ? ANNUAL_PLAN_CODES[plan] : PLAN_CODES[plan];
    if (!planCode) {
      return NextResponse.json(
        { error: `Plan code for "${plan}" (${isAnnual ? 'Annual' : 'Termly'}) is not configured in .env.local` },
        { status: 400 }
      );
    }

    const basePrice = PLAN_BASE_PRICES[plan];
    const amountInNaira = isAnnual ? basePrice * 3 * 0.9 : basePrice;
    const amountInKobo = Math.round(amountInNaira * 100);

    const siteUrl = env.NEXT_PUBLIC_SITE_URL;
    const callbackUrl = `${siteUrl}/checkout-success`;

    const { authorization_url, reference } = await initializeTransaction({
      email: adminEmail,
      amount: amountInKobo,
      planCode,
      callbackUrl,
      metadata: {
        school_name:  schoolName,
        admin_name:   adminName,
        admin_email:  adminEmail,
        plan_tier:    plan,
        country:      country || 'Nigeria',
        state:        state || '',
        lga:          lga || '',
        address:      address || '',
      },
    });

    return NextResponse.json({ authorization_url, reference });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('[checkout] initiate error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
