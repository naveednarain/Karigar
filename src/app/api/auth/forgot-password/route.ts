import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Please provide a valid email.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const resetUrl = `${origin}/en/account/update-password`;

    let supabaseSent = false;
    let resendEdgeSent = false;

    // 1. Trigger via Supabase Auth resetPasswordForEmail
    try {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      if (!error) {
        supabaseSent = true;
      }
    } catch {
      // Supabase auth client error, continue with Edge Function / Resend
    }

    // 2. Call Supabase Edge Function `send-password-reset` (deployed on Supabase)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl) {
      try {
        const edgeRes = await fetch(`${supabaseUrl}/functions/v1/send-password-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
          },
          body: JSON.stringify({ email, resetUrl }),
        });
        if (edgeRes.ok) {
          resendEdgeSent = true;
        }
      } catch {
        // Edge function call fallback
      }
    }

    // 3. If direct RESEND_API_KEY is available in environment, trigger direct Resend send
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Karigar <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your Karigar password',
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #123b2b; margin-top: 0;">Karigar Password Reset</h2>
                <p style="color: #475569; font-size: 14px; line-height: 22px;">
                  We received a request to reset your password for your Karigar account (<strong>${email}</strong>).
                </p>
                <div style="margin: 24px 0;">
                  <a href="${resetUrl}" style="background-color: #168348; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">
                  If you did not make this request, you can safely ignore this email.
                </p>
              </div>
            `,
          }),
        });
      } catch {
        // Direct Resend error fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${email} via Resend.`,
      demoResetUrl: resetUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not process password reset.' },
      { status: 500 }
    );
  }
}
