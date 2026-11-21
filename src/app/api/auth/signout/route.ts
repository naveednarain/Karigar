import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE } from '@/lib/demo/session';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  // 1. Delete DEMO_COOKIE and session type cookies
  response.cookies.set(DEMO_COOKIE, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    expires: new Date(0),
  });
  response.cookies.set('karigar_session_type', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  // 2. Clear all Supabase auth tokens and related cookies from the incoming request
  const allCookies = req.cookies.getAll();
  for (const cookie of allCookies) {
    const lower = cookie.name.toLowerCase();
    if (
      lower.startsWith('sb-') ||
      lower.includes('supabase') ||
      lower.includes('auth-token') ||
      lower === DEMO_COOKIE.toLowerCase() ||
      lower === 'karigar_demo_session' ||
      lower === 'karigar_session_type'
    ) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  // 3. Supabase Auth signOut with setAll bound to response.cookies
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const supabase = createSSRClient<Database>(url, key, {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                maxAge: 0,
                expires: new Date(0),
              });
            });
          },
        },
      });
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}
  }

  // Add no-cache headers to ensure immediate expiration
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
