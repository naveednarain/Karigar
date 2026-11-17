import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';
import { DEMO_ACCOUNTS } from '@/lib/demo/accounts';

export async function GET(req: NextRequest) {
  try {
    // 1. Check Supabase authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, phone')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          role: profile?.role || 'user',
          isDemo: false,
        },
      });
    }

    // 2. Check Demo Session
    const demoCookie = req.cookies.get(DEMO_COOKIE)?.value;
    const demoRole = await verifyDemoSession(demoCookie);

    if (demoRole && (demoRole === 'user' || demoRole === 'provider' || demoRole === 'admin')) {
      const demoAccount = DEMO_ACCOUNTS[demoRole];
      const demoName =
        demoRole === 'provider'
          ? 'Ahsan Ali'
          : demoRole === 'user'
          ? 'Sana Ahmed'
          : 'Operations Admin';
      return NextResponse.json({
        user: {
          id: `demo-${demoRole}`,
          email: demoAccount.email,
          name: demoName,
          role: demoRole,
          isDemo: true,
        },
      });
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
