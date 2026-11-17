'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Hammer,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  CheckCircle2,
  Mail,
  KeyRound,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'sonner';
import { SiteHeader } from './site-header';

const demoRoles = [
  {
    id: 'user',
    title: 'Customer Demo (Sana Ahmed)',
    subtitle: 'Customer Experience',
    detail: 'Search services, book trusted local pros, live tracking, and leave reviews.',
    Icon: UserRound,
    bg: 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:hover:bg-emerald-900/40',
    iconBg: 'bg-emerald-600 text-white',
    badge: 'Popular',
  },
  {
    id: 'provider',
    title: 'Service Provider Demo (Ahsan Ali)',
    subtitle: 'Karigar / Pro Workspace',
    detail: 'Manage incoming job orders, accept/reject, route map, and track earnings.',
    Icon: Wrench,
    bg: 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60 dark:hover:bg-amber-900/40',
    iconBg: 'bg-amber-600 text-white',
    badge: 'Master Plumber',
  },
  {
    id: 'admin',
    title: 'Admin Console Demo',
    subtitle: 'Operations Management',
    detail: 'Review CNIC verification queue, monitor marketplace bookings and revenue.',
    Icon: ShieldCheck,
    bg: 'bg-violet-50/70 hover:bg-violet-100/70 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/60 dark:hover:bg-violet-900/40',
    iconBg: 'bg-violet-600 text-white',
    badge: 'Full Access',
  },
] as const;

export function DemoLogin({ nextPath }: { nextPath?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveNext = searchParams?.get('next') || nextPath;

  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');

  // Check if session is already active
  const [activeSession, setActiveSession] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setActiveSession(d.user);
          // If already logged in and there's a target page to visit, forward immediately
          if (effectiveNext && !effectiveNext.includes('/login')) {
            window.location.href = effectiveNext;
          }
        }
      })
      .catch(() => {});
  }, [effectiveNext]);

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  async function enter(role: string) {
    setLoading(role);
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role, locale, next: effectiveNext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        `Logged in as ${role === 'user' ? 'Customer' : role === 'provider' ? 'Service Provider' : 'Admin'}`
      );
      window.location.href = data.destination;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start demo session');
    } finally {
      setLoading(null);
    }
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setEmailErr('');
    setPassErr('');
    let valid = true;
    if (!email.trim()) {
      setEmailErr('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr('Enter a valid email address');
      valid = false;
    }
    if (!password.trim()) {
      setPassErr('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setPassErr('Password must be at least 8 characters');
      valid = false;
    }
    if (!valid) return;

    setLoading('signin');
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, next: effectiveNext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Signed in successfully!');
      window.location.href = data.destination;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoading(null);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForgotDone(true);
      toast.success(data.message || 'Password reset email sent via Resend!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send reset email.');
    } finally {
      setForgotBusy(false);
    }
  }

  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}`} title="Login" />
      <main className="min-h-[calc(100vh-72px)] bg-[#f4f7f4] dark:bg-[#080d09] px-4 py-10 transition-colors">
        <div className="mx-auto max-w-[560px]">
          {/* Back button */}
          <Link
            href={`/${locale}`}
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 transition hover:text-brand-700 dark:hover:text-emerald-400"
          >
            <ArrowLeft size={16} />
            Back to Karigar Home
          </Link>

          <div className="mt-5 rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-soft sm:p-9 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-white shadow-sm dark:bg-emerald-600">
                <Hammer size={24} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-bold text-brand-700 dark:text-emerald-300 border border-brand-100 dark:border-emerald-800">
                <Sparkles size={13} /> ONE-CLICK DEMO ACCESS
              </span>
            </div>

            <h1 className="display mt-5 text-[28px] font-extrabold text-ink dark:text-white sm:text-[32px]">
              Welcome to Karigar
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
              Click any role below to explore Karigar instantly without needing a password or OTP.
            </p>

            {/* Currently Active Logged-in Session Banner */}
            {activeSession && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40 p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 font-extrabold text-white text-xs">
                      {activeSession.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div>
                      <small className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        ACTIVE SESSION DETECTED
                      </small>
                      <b className="text-xs font-bold text-ink dark:text-white">
                        Signed in as {activeSession.name} ({activeSession.role})
                      </b>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${locale}/${
                        activeSession.role === 'provider'
                          ? 'provider/dashboard'
                          : activeSession.role === 'admin'
                          ? 'admin'
                          : 'account/bookings'
                      }`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <span>Continue to {activeSession.role === 'provider' ? 'Workspace' : activeSession.role === 'admin' ? 'Console' : 'Bookings'}</span>
                      <ArrowRight size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch('/api/auth/signout', { method: 'POST' });
                        setActiveSession(null);
                        toast.success('Signed out.');
                      }}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-rose-200 bg-white dark:bg-slate-800 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      title="Switch account"
                    >
                      <LogOut size={13} /> Switch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instant Demo Logins */}
            <div className="mt-6 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Demo Logins (1-Click)
              </div>

              {demoRoles.map(({ id, title, detail, Icon, bg, iconBg, badge }) => (
                <button
                  key={id}
                  onClick={() => enter(id)}
                  disabled={!!loading}
                  className={`flex min-h-[82px] w-full items-center gap-4 rounded-[20px] border p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-soft disabled:opacity-60 ${bg}`}
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[16px] shadow-sm ${iconBg}`}>
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <b className="truncate text-[13px] font-bold text-ink dark:text-white">{title}</b>
                      <span className="rounded-full bg-white/90 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-extrabold text-slate-700 dark:text-slate-300 shadow-xs">
                        {badge}
                      </span>
                    </span>
                    <small className="mt-1 block text-[11px] leading-4 text-slate-600 dark:text-slate-300">{detail}</small>
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
                    {loading === id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* Demo Notice */}
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#f7faf7] dark:bg-slate-800/60 border border-brand-100 dark:border-slate-800 p-3.5 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
              <BriefcaseBusiness size={16} className="mt-0.5 shrink-0 text-brand-700 dark:text-emerald-400" />
              <span>
                Demo logins are provided on this login page so you can easily explore Customer, Provider, and Admin experiences with preloaded local data.
              </span>
            </div>

            {/* Divider */}
            <div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span>Or sign in with email</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Standard Sign In Form */}
            <form onSubmit={signIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErr('');
                  }}
                  placeholder="name@example.com"
                  className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-white ${
                    emailErr
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                {emailErr && <p className="mt-1 text-[11px] text-red-500">{emailErr}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgot(true);
                    }}
                    className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPassErr('');
                  }}
                  placeholder="••••••••"
                  className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-white ${
                    passErr
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                {passErr && <p className="mt-1 text-[11px] text-red-500">{passErr}</p>}
              </div>

              <button
                disabled={!!loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-900 dark:bg-emerald-600 text-xs font-bold text-white transition hover:bg-black dark:hover:bg-emerald-500 disabled:opacity-60 shadow-xs"
              >
                {loading === 'signin' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Sign in to account
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href={`/${locale}/signup`} className="font-bold text-brand-700 dark:text-emerald-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal / Sheet */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-[460px] rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotDone(false);
              }}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <KeyRound size={22} />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-ink dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Resend & Supabase Auth</p>
              </div>
            </div>

            {forgotDone ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 p-4 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Reset instructions sent!
                  </div>
                  Check your inbox at <strong>{forgotEmail}</strong>. Follow the link to choose a new password.
                </div>
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotDone(false);
                  }}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-brand-900 dark:bg-emerald-600 text-xs font-bold text-white hover:bg-black"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter your email address and we'll send you a secure link via Resend to reset your password.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Email address</label>
                  <div className="relative mt-1.5">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white pl-9 pr-3 text-xs outline-none focus:border-brand-500"
                    />
                    <Mail size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={forgotBusy}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-900 dark:bg-emerald-600 text-xs font-bold text-white hover:bg-black dark:hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {forgotBusy ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
