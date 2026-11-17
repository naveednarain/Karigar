'use client';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { RankedProvider } from '@/lib/ai/rank';
import { SiteHeader } from './site-header';
import { RouteMap } from './map/route-map';
import { CustomSelect } from './custom-select';

const bookingSchema = z.object({
  service: z.string().min(2),
  description: z.string().trim().min(8, 'Share a little more about the job.').max(1000),
  urgency: z.enum(['emergency', 'today', 'scheduled', 'flexible']),
  scheduledAt: z.string().min(1, 'Choose a visit time.'),
  area: z.string().min(2),
  address: z.string().trim().min(8, 'Enter a nearby landmark or address.'),
});

type BookingInput = z.infer<typeof bookingSchema>;

export function BookingFlow({ provider, locale }: { provider: RankedProvider; locale: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: provider.services[0] || 'other',
      description: '',
      urgency: 'scheduled',
      scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
      area: provider.area,
      address: '',
    },
  });

  const values = form.watch();

  async function next() {
    const fields: Record<number, (keyof BookingInput)[]> = {
      1: ['service', 'description', 'urgency'],
      2: ['scheduledAt', 'area', 'address'],
    };
    const ok = await form.trigger(fields[step]);
    if (ok) setStep(Math.min(3, step + 1));
  }

  async function submit(data: BookingInput) {
    setBusy(true);
    try {
      // Ensure customer session exists so the user can seamlessly view their booking
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData?.user) {
        await fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ role: 'user', locale }),
        });
      }

      // Persist to user bookings cache
      const newBookingId = `KRG-${Math.floor(2090 + Math.random() * 100)}`;
      const newJob = {
        id: newBookingId,
        bookingId: `10000000-0000-4000-8000-000000000${Math.floor(300 + Math.random() * 500)}`,
        type: data.service.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        category: provider.skill,
        client: authData?.user?.name || 'Sana Ahmed',
        area: data.area,
        time: data.scheduledAt ? new Date(data.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        price: `From Rs ${provider.price.toLocaleString('en-PK')}`,
        distance: `${provider.distance || 2.5} km`,
        status: 'New request',
      };

      try {
        const existing = JSON.parse(localStorage.getItem('karigar_user_bookings') || '[]');
        localStorage.setItem('karigar_user_bookings', JSON.stringify([newJob, ...existing]));
      } catch {}

      setDone(true);
      toast.success('Your repair request has been sent to ' + provider.name);
    } catch (error) {
      toast.error('Booking request failed');
    } finally {
      setBusy(false);
    }
  }

  const steps = ['Job details', 'Time & address', 'Review'];

  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}/provider/${provider.id}`} title="Book a Visit" />
      <main className="min-h-[calc(100vh-72px)] bg-[#f5f8f5] pb-20 text-ink">
        <div className="container max-w-[940px] pt-7">
          {/* Back button */}
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-700 transition mb-4"
          >
            <ArrowLeft size={16} />
            {step > 1 ? 'Back to previous step' : 'Back to provider profile'}
          </button>

          {done ? (
            <section className="mx-auto mt-8 max-w-[580px] rounded-[32px] bg-white p-8 text-center shadow-soft border border-slate-100">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                <CheckCircle2 size={36} />
              </span>
              <h1 className="display mt-5 text-[28px] font-extrabold text-ink">Request Sent Successfully!</h1>
              <p className="mx-auto mt-2 max-w-[400px] text-xs sm:text-sm leading-6 text-slate-600">
                {provider.name} has received your booking request. You can now track arrival and message directly.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link
                  href={`/${locale}/account/bookings`}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#168348] px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
                >
                  View My Bookings <ArrowRight size={15} />
                </Link>
              </div>
            </section>
          ) : (
            <>
              {/* Header */}
              <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    BOOK A LOCAL PRO
                  </span>
                  <h1 className="display mt-1 text-[28px] font-extrabold sm:text-[34px]">Schedule your home repair</h1>
                </div>

                <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2 border border-slate-100 shadow-xs">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-xs font-extrabold text-emerald-900">
                    {provider.avatar}
                  </span>
                  <div>
                    <b className="block text-xs text-ink">{provider.name}</b>
                    <small className="text-[10px] text-amber-500 font-bold">★ {provider.rating.toFixed(1)}</small>
                  </div>
                </div>
              </div>

              {/* Multi-step Form Grid */}
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
                <section className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-soft">
                  {/* Stepper Header */}
                  <div className="mb-7 grid grid-cols-3">
                    {steps.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                            step >= i + 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step > i + 1 ? <Check size={14} /> : `0${i + 1}`}
                        </span>
                        <span
                          className={`hidden text-xs font-semibold sm:block ${
                            step === i + 1 ? 'text-emerald-900 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {label}
                        </span>
                        {i < 2 && (
                          <span
                            className={`mx-2 h-0.5 flex-1 ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-100'}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={form.handleSubmit(submit)}>
                    {step === 1 && (
                      <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-ink">Describe the job</h2>
                        <p className="text-xs text-slate-500">Provide details so your technician brings proper tools.</p>

                        <div>
                          <label className="block text-xs font-bold text-slate-700" htmlFor="description">
                            What needs to be fixed?
                          </label>
                          <textarea
                            id="description"
                            {...form.register('description')}
                            rows={4}
                            placeholder="e.g. Kitchen tap is leaking continuously from the base joint. Needs a washer replacement..."
                            className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          />
                          {form.formState.errors.description && (
                            <p className="mt-1 text-xs text-rose-600">{form.formState.errors.description.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700">How urgent is this?</label>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[
                              ['flexible', 'Flexible Time'],
                              ['scheduled', 'Specific Date'],
                              ['today', 'Today (Soon)'],
                              ['emergency', 'Urgent Help'],
                            ].map(([val, txt]) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => form.setValue('urgency', val as BookingInput['urgency'])}
                                className={`h-11 rounded-xl border text-xs font-bold transition ${
                                  values.urgency === val
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {txt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-ink">Choose appointment time & address</h2>
                        <p className="text-xs text-slate-500">Your technician will confirm availability beforehand.</p>

                        <div>
                          <label htmlFor="date" className="block text-xs font-bold text-slate-700">
                            Preferred visit time
                          </label>
                          <input
                            id="date"
                            type="datetime-local"
                            min={new Date().toISOString().slice(0, 16)}
                            {...form.register('scheduledAt')}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="area" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Neighbourhood
                          </label>
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <CustomSelect
                              value={form.watch('area')}
                              onChange={(val) => form.setValue('area', val, { shouldValidate: true })}
                              options={[
                                provider.area,
                                'Latifabad Unit 7',
                                'Latifabad Unit 2',
                                'Qasimabad Phase 1',
                                'Qasimabad Phase 2',
                                'Jamshoro City',
                                'Autobhan Road',
                                'Hirabad',
                                'Saddar',
                              ]}
                              placeholder="Select area"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-xs font-bold text-slate-700">
                            House / Flat address & nearby landmark
                          </label>
                          <input
                            id="address"
                            {...form.register('address')}
                            placeholder="e.g. Flat 301, SVR Enclave, near City Hospital"
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-emerald-500"
                          />
                          {form.formState.errors.address && (
                            <p className="mt-1 text-xs text-rose-600">{form.formState.errors.address.message}</p>
                          )}
                        </div>

                        <div className="mt-3">
                          <RouteMap area={values.area} className="h-[170px] rounded-2xl" />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-ink">Review booking request</h2>
                        <p className="text-xs text-slate-500">
                          Confirm all details before dispatching to your technician.
                        </p>

                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Technician:</span>
                            <b className="text-ink">{provider.name}</b>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Trade:</span>
                            <b className="text-ink">{provider.skill}</b>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Area:</span>
                            <b className="text-ink">{values.area}</b>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Address:</span>
                            <b className="text-ink text-right max-w-[240px] truncate">{values.address}</b>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between">
                            <span className="text-slate-500">Estimated Visit Fee:</span>
                            <b className="text-ink font-extrabold text-sm">From Rs {provider.price.toLocaleString('en-PK')}</b>
                          </div>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900 border border-emerald-100 flex items-start gap-2">
                          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                          <span>No advance payment needed. Pay in cash after the repair is inspected.</span>
                        </div>
                      </div>
                    )}

                    {/* Step Navigation Buttons */}
                    <div className="mt-8 flex justify-between border-t border-slate-100 pt-4">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={() => setStep(step - 1)}
                          className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Back
                        </button>
                      ) : (
                        <span />
                      )}

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={next}
                          className="flex h-11 items-center gap-2 rounded-xl bg-[#168348] px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
                        >
                          Continue <ArrowRight size={15} />
                        </button>
                      ) : (
                        <button
                          disabled={busy}
                          type="submit"
                          className="flex h-11 items-center gap-2 rounded-xl bg-[#168348] px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition disabled:opacity-60"
                        >
                          {busy ? 'Dispatching…' : 'Confirm & Request Visit'}
                          <Check size={15} />
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Right side summary card */}
                <aside className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft h-fit space-y-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Wrench size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-ink">Karigar Protection</h3>
                  <div className="space-y-3 text-xs text-slate-500 leading-5">
                    <p>✓ Transparent estimates agreed before work begins.</p>
                    <p>✓ 100% cash on completion.</p>
                    <p>✓ Direct call and chat with your pro in Hyderabad.</p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
