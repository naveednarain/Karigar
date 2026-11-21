import { createServerClient as createSSRClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { signInSchema } from '@/lib/validators/auth';
import { createDemoSession, DEMO_COOKIE } from '@/lib/demo/session';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const input = signInSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
  }

  const locale = input.data.next?.startsWith('/ur/') ? 'ur' : 'en';
  const next = input.data.next;
  const safeNext =
    next &&
    (next.startsWith('/en/') || next.startsWith('/ur/')) &&
    !next.startsWith('//') &&
    !next.includes('\\') &&
    !next.includes('/login')
      ? next
      : null;

  const emailLower = input.data.email.toLowerCase().trim();
  const password = input.data.password;
  const demoPass = process.env.DEMO_PASSWORD || 'Demo@12345';

  // Check demo credentials match
  const isDemoUser =
    (emailLower === 'demo.user@karigar.pk' || emailLower === 'sana.ahmed.user@karigar.pk') &&
    password === demoPass;
  const isDemoProvider =
    (emailLower === 'demo.provider@karigar.pk' || emailLower === 'ahsan.ali.provider@karigar.pk') &&
    password === demoPass;
  const isDemoAdmin =
    (emailLower === 'demo.admin@karigar.pk' || emailLower === 'admin@karigar.pk') &&
    password === demoPass;

  if (process.env.DEMO_MODE === 'true' && (isDemoUser || isDemoProvider || isDemoAdmin)) {
    const role = isDemoProvider ? 'provider' : isDemoAdmin ? 'admin' : 'user';
    const dest =
      safeNext ||
      `/${locale}${
        role === 'provider'
          ? '/provider/dashboard'
          : role === 'admin'
          ? '/admin'
          : '/account/bookings'
      }`;

    const response = NextResponse.json({ destination: dest });
    const sessionToken = await createDemoSession(role);
    response.cookies.set(DEMO_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set('karigar_session_type', 'demo', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  }

  // Supabase Auth verification
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: 'Email sign-in needs Supabase configuration. Use a one-click demo account.' },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ destination: `/${locale}` });
  const supabase = createSSRClient<Database>(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (values) =>
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.data.email,
    password: input.data.password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: 'Email or password was not recognized.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = (profile?.role as 'user' | 'provider' | 'admin') || (data.user.user_metadata?.role as 'user' | 'provider' | 'admin') || 'user';
  response.cookies.set(DEMO_COOKIE, await createDemoSession(role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set('karigar_session_type', 'real', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json(
    {
      destination:
        safeNext ||
        `/${locale}${
          role === 'provider'
            ? '/provider/dashboard'
            : role === 'admin'
            ? '/admin'
            : '/account/bookings'
        }`,
    },
    { headers: response.headers }
  );
}
