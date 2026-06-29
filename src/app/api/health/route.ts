import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Simple liveness check. Useful for Vercel deployment verification.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
