import { createServerClient as createSSRClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEMO_ACCOUNTS } from '@/lib/demo/accounts';
import { createDemoSession, DEMO_COOKIE } from '@/lib/demo/session';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

const schema = z.object({
  role: z.enum(['user', 'provider', 'admin']),
  locale: z.enum(['en', 'ur']).default('en'),
  next: z.string().max(512).optional(),
});

const attempts = globalThis as typeof globalThis & {
  demoLoginAttempts?: Map<string, { at: number; count: number }>;
};

export async function POST(req: NextRequest) {
  if (process.env.DEMO_MODE !== 'true') return new NextResponse('Not found', { status: 404 });
  if (!process.env.DEMO_PASSWORD || !process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Demo credentials are not configured on the server.' },
      { status: 503 }
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  attempts.demoLoginAttempts ??= new Map();
  const previous = attempts.demoLoginAttempts.get(ip);
  if (previous && now - previous.at < 60_000 && previous.count >= 20) {
    return NextResponse.json({ error: 'Please wait a moment before trying again.' }, { status: 429 });
  }
  attempts.demoLoginAttempts.set(ip, {
    at: previous && now - previous.at < 60_000 ? previous.at : now,
    count: previous && now - previous.at < 60_000 ? previous.count + 1 : 1,
  });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Choose a valid demo account.' }, { status: 400 });
  }

  const { role, locale, next } = parsed.data;
  const safeNext =
    next &&
    (next.startsWith(`/${locale}/`) || next.startsWith('/en/') || next.startsWith('/ur/')) &&
    !next.startsWith('//') &&
    !next.includes('\\') &&
    !next.includes('/login')
      ? next
      : null;

  const destination = safeNext || `/${locale}${DEMO_ACCOUNTS[role].home}`;
  const response = NextResponse.json({ destination });

  // 1. Mark session explicitly as demo session
  response.cookies.set('karigar_session_type', 'demo', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  // 2. Clear any stale non-demo Supabase cookies
  const allCookies = req.cookies.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith('sb-') && c.name.includes('auth-token')) {
      response.cookies.set(c.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  // 3. Attempt Supabase Auth SSR session
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && process.env.DEMO_PASSWORD) {
    try {
      const supabase = createSSRClient<Database>(url, key, {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (values) =>
            values.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            ),
        },
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_ACCOUNTS[role].email,
        password: process.env.DEMO_PASSWORD,
      });

      if (error) {
        console.warn('Supabase demo password notice (session issued via demo cookie):', error.message);
      }
    } catch (e) {
      console.warn('Supabase demo connection notice:', e);
    }
  }

  // 4. Always set the secure DEMO_COOKIE so access is guaranteed
  const sessionToken = await createDemoSession(role);
  response.cookies.set(DEMO_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
