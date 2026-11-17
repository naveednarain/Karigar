'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Hammer, UserRound, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { SiteHeader } from './site-header';

export function SignupForm() {
  const locale = useLocale();
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'provider'>('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.message) {
        toast.success(data.message);
        return;
      }
      router.push(data.destination.replace('/en', `/${locale}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}`} title="Create Account" />
      <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f5] px-4 py-10 text-ink">
        <div className="mx-auto max-w-[500px]">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-700 transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to Karigar Home
          </Link>

          <section className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-soft sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-white shadow-xs">
              <Hammer size={24} />
            </span>
            <h1 className="display mt-5 text-[28px] font-extrabold text-ink sm:text-[32px]">Join Karigar</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Create an account to book trusted local pros or start earning as a technician.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                  role === 'user'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserRound size={16} />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                  role === 'provider'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench size={16} />
                Service Provider
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Sana Ahmed"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700" htmlFor="password">
                  Password (min. 8 characters)
                </label>
                <input
                  id="password"
                  autoComplete="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <button
                disabled={busy}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#168348] text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition disabled:opacity-60"
              >
                {busy ? 'Creating account…' : role === 'provider' ? 'Continue to Pro Onboarding' : 'Create Customer Account'}
                <ArrowRight size={15} />
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href={`/${locale}/login`} className="font-bold text-brand-700 hover:underline">
                Sign in / Demo
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
