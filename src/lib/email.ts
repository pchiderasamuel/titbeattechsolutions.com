import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY not set — emails will be logged only');
}

const resend  = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM    = process.env.EMAIL_FROM || 'TitbeatTech <noreply@titbeattechsolutions.app>';
const APP_URL = process.env.APP_URL   || 'https://app.titbeattechsolutions.app';

/** ─────────────────────────────────────────────────────────────────
 *  sendWelcomeEmail
 *  Sends the temporary password + first-login instructions to the
 *  new school admin. Returns true on success, false on failure.
 *  Caller is responsible for logging the failure to email_failures.
 * ───────────────────────────────────────────────────────────────── */
export async function sendWelcomeEmail(params: {
  to: string;
  adminName: string;
  schoolName: string;
  tempPassword: string;
  planTier: string;
}): Promise<boolean> {
  const { to, adminName, schoolName, tempPassword, planTier } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Inter,sans-serif;background:#F8FAFC;padding:40px 0;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;
                  border:1px solid #D4E5FF;overflow:hidden;">
        <!-- Header -->
        <div style="background:#003366;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">
            Welcome to TitbeatTech! 🎉
          </h1>
          <p style="color:#94A3B8;margin:6px 0 0;font-size:14px;">
            Your school management platform is ready
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="color:#0F172A;font-size:16px;margin:0 0 16px;">
            Hi <strong>${adminName}</strong>,
          </p>
          <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Your <strong>${schoolName}</strong> account has been created on the
            <strong style="color:#003366;">${planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan</strong>.
            Here are your temporary login credentials:
          </p>

          <!-- Credentials box -->
          <div style="background:#F0F7FF;border:1px solid #D4E5FF;border-radius:12px;
                      padding:20px 24px;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748B;font-weight:600;
                      text-transform:uppercase;letter-spacing:1px;">Login Email</p>
            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0F172A;">${to}</p>

            <p style="margin:0 0 8px;font-size:13px;color:#64748B;font-weight:600;
                      text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
            <p style="margin:0;font-size:18px;font-weight:900;color:#003366;
                      letter-spacing:2px;font-family:monospace;">${tempPassword}</p>
          </div>

          <!-- Warning -->
          <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;
                      padding:14px 18px;margin:0 0 24px;">
            <p style="margin:0;font-size:14px;color:#92400E;font-weight:600;">
              ⚠️ Important: You <em>must</em> change this password when you first log in.
              Do not share it with anyone.
            </p>
          </div>

          <!-- CTA Button -->
          <a href="${APP_URL}/login" target="_blank"
             style="display:inline-block;background:#2563EB;color:#fff;
                    text-decoration:none;padding:14px 28px;border-radius:10px;
                    font-weight:700;font-size:15px;">
            Log In &amp; Set New Password →
          </a>

          <hr style="border:none;border-top:1px solid #E2E8F0;margin:28px 0;" />

          <p style="color:#64748B;font-size:13px;line-height:1.7;margin:0;">
            If you did not sign up for TitbeatTech or believe this email was sent in error,
            please contact us at
            <a href="mailto:support@titbeattechsolutions.app" style="color:#2563EB;">
              support@titbeattechsolutions.app
            </a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (!resend) {
      console.log('[email] Welcome email (no Resend configured):', { to, tempPassword });
      return true;
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Your TitbeatTech school account is ready — ${schoolName}`,
      html,
    });

    if (error) {
      console.error('[email] Resend error sending welcome email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] Exception sending welcome email:', err);
    return false;
  }
}

/** ─────────────────────────────────────────────────────────────────
 *  sendPaymentFailedEmail
 *  Notifies the admin that a renewal payment failed (≠ canceled).
 * ───────────────────────────────────────────────────────────────── */
export async function sendPaymentFailedEmail(params: {
  to: string;
  adminName: string;
  schoolName: string;
  planTier: string;
}): Promise<boolean> {
  const { to, adminName, schoolName, planTier } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Inter,sans-serif;background:#F8FAFC;padding:40px 0;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;
                  border:1px solid #FED7AA;overflow:hidden;">
        <div style="background:#DC2626;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">
            Payment Failed — Action Required
          </h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#0F172A;font-size:16px;margin:0 0 16px;">
            Hi <strong>${adminName}</strong>,
          </p>
          <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">
            We were unable to collect your renewal payment for
            <strong>${schoolName}</strong> (${planTier} Plan).
            Your account is now <strong style="color:#DC2626;">past due</strong>.
          </p>
          <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Please update your payment method to avoid service interruption.
            Your data is safe and we will retry the charge automatically.
          </p>
          <a href="${APP_URL}/billing" target="_blank"
             style="display:inline-block;background:#DC2626;color:#fff;
                    text-decoration:none;padding:14px 28px;border-radius:10px;
                    font-weight:700;font-size:15px;">
            Update Payment Method →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (!resend) {
      console.log('[email] Payment failed email (no Resend):', { to });
      return true;
    }
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Action required: Payment failed for ${schoolName}`,
      html,
    });
    if (error) { console.error('[email] Resend payment-failed error:', error); return false; }
    return true;
  } catch (err) {
    console.error('[email] Exception sending payment-failed email:', err);
    return false;
  }
}
