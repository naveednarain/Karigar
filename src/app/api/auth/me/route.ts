import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';
import { DEMO_ACCOUNTS } from '@/lib/demo/accounts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionType = req.cookies.get('karigar_session_type')?.value;
    const demoCookie = req.cookies.get(DEMO_COOKIE)?.value;
    const demoRole = await verifyDemoSession(demoCookie);

    // 1. If explicit demo session is active, return the demo persona directly
    if (sessionType === 'demo' && demoRole && (demoRole === 'user' || demoRole === 'provider' || demoRole === 'admin')) {
      const demoAccount = DEMO_ACCOUNTS[demoRole];
      const demoName =
        demoRole === 'provider'
          ? 'Ahsan Ali'
          : demoRole === 'user'
          ? 'Sana Ahmed'
          : 'Operations Admin';

      const res = NextResponse.json({
        user: {
          id: `demo-${demoRole}`,
          email: demoAccount.email,
          name: demoName,
          role: demoRole,
          isDemo: true,
        },
      });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res;
    }

    // 2. Check Supabase authenticated real user
    let user = null;
    let supabase = null;
    try {
      supabase = await createServerClient();
      const res = await supabase.auth.getUser();
      user = res.data.user;
    } catch {}

    if (user && supabase) {
      // Check database profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, phone')
        .eq('id', user.id)
        .maybeSingle();

      // Priority for real username:
      // 1. profile.full_name in database
      // 2. user.user_metadata.full_name / name / user_name
      // 3. email prefix fallback
      const metaName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.user_name as string) ||
        (user.user_metadata?.preferred_username as string);

      const resolvedName =
        profile?.full_name?.trim() ||
        metaName?.trim() ||
        user.email?.split('@')[0] ||
        'User';

      const resolvedRole =
        (profile?.role as 'user' | 'provider' | 'admin') ||
        (user.user_metadata?.role as 'user' | 'provider' | 'admin') ||
        demoRole ||
        'user';

      // If profile row was missing, upsert to keep database in sync
      if (!profile) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              full_name: resolvedName,
              role: resolvedRole,
              language: 'en',
              is_blocked: false,
              is_demo: false,
            },
            { onConflict: 'id' }
          );
        } catch {}
      }

      const res = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: resolvedName,
          role: resolvedRole,
          isDemo: false,
        },
      });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res;
    }

    // 3. Fallback to Demo Session if no Supabase user
    if (demoRole && (demoRole === 'user' || demoRole === 'provider' || demoRole === 'admin')) {
      const demoAccount = DEMO_ACCOUNTS[demoRole];
      const demoName =
        demoRole === 'provider'
          ? 'Ahsan Ali'
          : demoRole === 'user'
          ? 'Sana Ahmed'
          : 'Operations Admin';

      const res = NextResponse.json({
        user: {
          id: `demo-${demoRole}`,
          email: demoAccount.email,
          name: demoName,
          role: demoRole,
          isDemo: true,
        },
      });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res;
    }

    const res = NextResponse.json({ user: null });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  } catch {
    const res = NextResponse.json({ user: null });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  }
}
