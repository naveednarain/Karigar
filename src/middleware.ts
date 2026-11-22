import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';

const intl = createMiddleware({ locales: ['en', 'ur'], defaultLocale: 'en', localePrefix: 'always' });

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Provider public profile (/[locale]/provider/[id]) is open to everyone (guests, users, providers)
  // Protected provider routes are exclusively the provider workspace subpaths
  const isPublicProviderProfile = /^\/(en|ur)\/provider\/(?!dashboard|jobs|earnings|messages|notifications|profile(?:\/|$))[^/]+(\/|$)/.test(path);
  if (isPublicProviderProfile) {
    return intl(request);
  }

  const protectedMatch = path.match(/^\/(en|ur)\/(provider|admin|account|chat)(\/|$)/);

  if (protectedMatch) {
    const locale = protectedMatch[1];
    const section = protectedMatch[2];

    const verified = await verifyDemoSession(
      request.cookies.get(DEMO_COOKIE)?.value
    );
    let role: 'user' | 'provider' | 'admin' | null =
      verified === 'user' || verified === 'provider' || verified === 'admin'
        ? verified
        : null;

    // If no demo session cookie, inspect Supabase auth cookies
    if (!role) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        try {
          const supabase = createServerClient(url, key, {
            cookies: {
              getAll: () => request.cookies.getAll(),
              setAll: () => {},
            },
          });
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            role = (user.user_metadata?.role as 'user' | 'provider' | 'admin') || 'user';
          }
        } catch {}
      }
    }

    // Admin has superuser supervisor privileges across all sections
    if (role === 'admin') {
      return intl(request);
    }

    let allowed = false;
    if (role === 'provider') {
      // Providers can access both provider workspace and customer account (for booking/hiring other pros)
      allowed =
        section === 'provider' ||
        section === 'account' ||
        section === 'chat' ||
        section === 'book';
    } else if (role === 'user') {
      allowed = section === 'account' || section === 'book' || section === 'chat';
    }

    // If authenticated but visiting an unauthorized section, redirect to their role's dashboard
    // to prevent infinite loops between login and mismatched target URLs
    if (role && !allowed) {
      const target = request.nextUrl.clone();
      target.pathname = `/${locale}/${
        role === 'provider' ? 'provider/dashboard' : 'account/bookings'
      }`;
      target.search = '';
      return NextResponse.redirect(target);
    }

    // If completely unauthenticated, redirect to login
    if (!role) {
      const login = request.nextUrl.clone();
      login.pathname = `/${locale}/login`;
      login.searchParams.set('next', path);
      return NextResponse.redirect(login);
    }
  }

  return intl(request);
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
