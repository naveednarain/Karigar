import { createServerClient as createSSRClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validators/auth';
import { createDemoSession, DEMO_COOKIE } from '@/lib/demo/session';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const input = signUpSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: 'Review your name, email and password.' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: 'Account creation needs Supabase configuration.' },
      { status: 503 }
    );
  }

  const destination =
    input.data.role === 'provider' ? '/en/provider/dashboard' : '/en/account/bookings';
  const response = NextResponse.json({ destination });

  const supabase = createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (values) =>
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email: input.data.email,
    password: input.data.password,
    options: {
      data: {
        role: input.data.role,
        full_name: input.data.fullName,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.session || !data.user) {
    return NextResponse.json(
      { message: 'Check your email to finish creating your account.' },
      { status: 200 }
    );
  }

  // Ensure database profiles table has the real name saved
  try {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        full_name: input.data.fullName,
        role: input.data.role,
        phone: null,
        language: 'en',
        is_blocked: false,
        is_demo: false,
      },
      { onConflict: 'id' }
    );
  } catch {}

  response.cookies.set(DEMO_COOKIE, await createDemoSession(input.data.role), {
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

  return response;
}
