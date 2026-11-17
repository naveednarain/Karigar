import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';

const intl = createMiddleware({ locales: ['en', 'ur'], defaultLocale: 'en', localePrefix: 'always' });

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedMatch = path.match(/^\/(en|ur)\/(provider|admin|account|chat)(\/|$)/);

  if (protectedMatch) {
    const role = await verifyDemoSession(request.cookies.get(DEMO_COOKIE)?.value);
    const section = protectedMatch[2];

    // Admin has superuser supervisor privileges across all sections
    if (role === 'admin') {
      return intl(request);
    }

    let allowed = false;
    if (role === 'provider') {
      // Provider can access provider dashboard/jobs, chat, and booking detail views
      allowed =
        section === 'provider' ||
        section === 'chat' ||
        path.includes('/account/bookings');
    } else if (role === 'user') {
      // Customer can access customer account, bookings, booking flow, and chat
      allowed = section === 'account' || section === 'book' || section === 'chat';
    }

    if (!role || !allowed) {
      const login = request.nextUrl.clone();
      login.pathname = `/${protectedMatch[1]}/login`;
      login.searchParams.set('next', path);
      return NextResponse.redirect(login);
    }
  }

  return intl(request);
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
