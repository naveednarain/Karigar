import { cookies } from 'next/headers';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';
import { DEMO_ACCOUNTS } from '@/lib/demo/accounts';
import { createServerClient } from '@/lib/supabase/server';

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: 'user' | 'provider' | 'admin';
  isDemo?: boolean;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const store = cookies();
    const sessionType = store.get('karigar_session_type')?.value;
    const demoCookie = store.get(DEMO_COOKIE)?.value;
    const verified = await verifyDemoSession(demoCookie);
    const demoRole: 'user' | 'provider' | 'admin' | null =
      verified === 'user' || verified === 'provider' || verified === 'admin'
        ? verified
        : null;

    // 1. Explicit demo session
    if (sessionType === 'demo' && demoRole) {
      const demoAccount = DEMO_ACCOUNTS[demoRole];
      const demoName =
        demoRole === 'provider'
          ? 'Ahsan Ali'
          : demoRole === 'user'
          ? 'Sana Ahmed'
          : 'Operations Admin';
      return {
        id: `demo-${demoRole}`,
        email: demoAccount.email,
        name: demoName,
        role: demoRole,
        isDemo: true,
      };
    }

    // 2. Check Supabase user
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle();

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

        return {
          id: user.id,
          email: user.email,
          name: resolvedName,
          role: resolvedRole,
          isDemo: false,
        };
      }
    } catch {}

    // 3. Fallback demo session
    if (demoRole) {
      const demoAccount = DEMO_ACCOUNTS[demoRole];
      const demoName =
        demoRole === 'provider'
          ? 'Ahsan Ali'
          : demoRole === 'user'
          ? 'Sana Ahmed'
          : 'Operations Admin';
      return {
        id: `demo-${demoRole}`,
        email: demoAccount.email,
        name: demoName,
        role: demoRole,
        isDemo: true,
      };
    }

    return null;
  } catch {
    return null;
  }
}
