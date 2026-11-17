import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE } from '@/lib/demo/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });

  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch {}

  return response;
}
