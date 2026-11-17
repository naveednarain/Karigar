'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Hammer, Menu, X, UserRound, Search, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader({ showBack = false, backUrl, title }: { showBack?: boolean; backUrl?: string; title?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Active user session state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: 'user' | 'provider' | 'admin';
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setCurrentUser(data.user);
        } else if (active) {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);

  const dashboardHref =
    currentUser?.role === 'provider'
      ? `/${locale}/provider/dashboard`
      : currentUser?.role === 'admin'
      ? `/${locale}/admin`
      : `/${locale}/account/bookings`;

  const dashboardLabel =
    currentUser?.role === 'provider'
      ? 'Pro Workspace'
      : currentUser?.role === 'admin'
      ? 'Admin Console'
      : 'My Bookings';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-[#0c140f]/95">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-3">
          {showBack && (
            backUrl ? (
              <Link
                href={backUrl}
                prefetch={true}
                aria-label="Go back"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={18} />
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={18} />
              </button>
            )
          )}

          <Link href={`/${locale}`} prefetch={true} className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-brand-900 text-white shadow-sm dark:bg-brand-600">
              <Hammer size={20} />
            </span>
            <span className="leading-none">
              <b className="display text-[20px] font-extrabold text-ink dark:text-white">Karigar</b>
              <small className="mt-1 block text-[10px] font-bold tracking-[.18em] text-brand-700 dark:text-brand-400">
                LOCAL HOME HELP
              </small>
            </span>
          </Link>

          {title && (
            <span className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-slate-700 dark:text-slate-300">{title}</span>
            </span>
          )}
        </div>

        {/* Center / Navigation Links */}
        <nav
          className={`${
            open
              ? 'absolute left-0 top-[72px] flex w-full flex-col border-b border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950'
              : 'hidden'
          } gap-6 text-[13px] font-semibold text-slate-600 dark:text-slate-300 md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <a
            href={`/${locale}#services`}
            onClick={() => setOpen(false)}
            className="transition hover:text-brand-700 dark:hover:text-brand-400"
          >
            Services
          </a>
          <a
            href={`/${locale}#how`}
            onClick={() => setOpen(false)}
            className="transition hover:text-brand-700 dark:hover:text-brand-400"
          >
            How it works
          </a>
          <a
            href={`/${locale}#why`}
            onClick={() => setOpen(false)}
            className="transition hover:text-brand-700 dark:hover:text-brand-400"
          >
            Why Us
          </a>
          <Link
            href={`/${locale}/join`}
            prefetch={true}
            onClick={() => setOpen(false)}
            className="transition hover:text-brand-700 dark:hover:text-brand-400"
          >
            Become a Pro
          </Link>

          {/* Mobile only controls */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 md:hidden">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-700 text-xs font-bold text-white">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-xs text-ink dark:text-white truncate">{currentUser.name}</b>
                    <span className="text-[10px] text-brand-700 dark:text-emerald-400 font-semibold capitalize">
                      {currentUser.role} Account
                    </span>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  prefetch={true}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 text-xs font-bold text-white shadow-xs"
                >
                  Go to {dashboardLabel}
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={async () => {
                    await fetch('/api/auth/signout', { method: 'POST' });
                    setCurrentUser(null);
                    setOpen(false);
                    window.location.href = `/${locale}`;
                  }}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-900"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                prefetch={true}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-brand-900 dark:border-slate-800 dark:text-slate-100"
              >
                <UserRound size={16} />
                Sign In
              </Link>
            )}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Right Controls: Dark Mode, Login / User Pill, Book Service */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={dashboardHref}
                prefetch={true}
                className="flex h-10 items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-3.5 text-xs font-bold text-brand-900 transition hover:bg-brand-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-xs"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-700 text-[10px] font-extrabold text-white">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <span>{dashboardLabel}</span>
                <ArrowRight size={13} />
              </Link>

              <button
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' });
                  setCurrentUser(null);
                  window.location.href = `/${locale}`;
                }}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              prefetch={true}
              className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-700 transition hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-400"
            >
              <UserRound size={15} />
              Sign In
            </Link>
          )}

          <Link
            href={`/${locale}/search`}
            prefetch={true}
            className="flex h-11 items-center gap-2 rounded-[13px] bg-brand-600 px-5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(22,131,72,.25)] transition hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Book a pro
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-brand-900 dark:border-slate-800 dark:text-white"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
