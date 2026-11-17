import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, CalendarDays, Check, ArrowLeft, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { getPublicProvider } from '@/lib/ai/providers';

export default async function ProviderProfile({ params }: { params: { locale: string; id: string } }) {
  const pro = await getPublicProvider(params.id);
  if (!pro) notFound();

  return (
    <>
      <SiteHeader showBack backUrl={`/${params.locale}/search`} title={pro.name} />
      <main className="min-h-screen bg-[#f5f8f5] pb-28 text-ink">
        <div className="container max-w-[1120px] pt-7">
          <Link
            href={`/${params.locale}/search`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-700 transition"
          >
            <ArrowLeft size={16} />
            Back to professionals
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-5">
              <article className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="grid h-[82px] w-[82px] place-items-center rounded-2xl bg-emerald-100 text-xl font-extrabold text-emerald-900 shadow-xs">
                    {pro.avatar}
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="display text-[26px] font-extrabold text-ink">{pro.name}</h1>
                      <BadgeCheck size={18} className="fill-emerald-100 text-emerald-600" />
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        CNIC Verified
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 font-medium sm:text-sm">{pro.skill}</p>
                    <div className="mt-3 flex flex-wrap gap-3.5 text-xs text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                        <Star size={14} fill="currentColor" /> {pro.rating.toFixed(1)} ({pro.reviews} reviews)
                      </span>
                      <span>{pro.jobs} completed jobs</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-emerald-600" />
                        {pro.area}, {pro.city}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      pro.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pro.available ? 'Available today' : 'Offline'}
                  </span>
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <h2 className="text-sm font-bold text-ink">About {pro.name.split(' ')[0]}</h2>
                  <p className="mt-2 text-xs sm:text-[13px] leading-6 text-slate-600">
                    A trusted local {pro.skill.toLowerCase()} serving {pro.area} and nearby neighbourhoods across
                    Hyderabad. Careful workmanship, transparent upfront estimates, and respectful communication from
                    first message to final inspection.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ['Experience', `${Math.max(3, Math.round(pro.jobs / 12))}+ years`],
                    ['Response time', `About ${pro.responseMinutes} min`],
                    ['Starting visit', `Rs ${pro.price.toLocaleString('en-PK')}`],
                  ].map(([key, val]) => (
                    <div key={key} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <small className="text-[10px] text-slate-400 font-bold uppercase">{key}</small>
                      <b className="mt-1 block text-sm font-extrabold text-ink">{val}</b>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <h2 className="text-sm font-bold text-ink">Why neighbours choose this technician</h2>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {[
                      'Identity and skills reviewed manually',
                      'Clear estimate before work begins',
                      'Local to your neighbourhood in Hyderabad',
                      '100% cash payment after service',
                    ].map((x) => (
                      <span key={x} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                          <Check size={13} />
                        </span>
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-ink">Neighbourhood Reviews</h2>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star size={14} fill="currentColor" /> {pro.rating.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-5 italic">
                    “Arrived right on time and fixed the pipe problem without any mess. Gave an accurate quote before
                    starting. Highly recommended for any plumbing issue in Latifabad.”
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-slate-400">
                    Ayesha K. · Verified Customer · Latifabad
                  </div>
                </div>
              </article>
            </section>

            {/* Sidebar Booking Card */}
            <aside>
              <div className="sticky top-24 rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft space-y-4">
                <h2 className="text-base font-extrabold text-ink">Book a Home Visit</h2>
                <p className="text-xs text-slate-500">Agree on work and estimate before service starts.</p>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Initial Visit From</span>
                  <b className="text-base font-extrabold text-ink">Rs {pro.price.toLocaleString('en-PK')}</b>
                </div>

                <p className="text-[11px] leading-4 text-slate-400">
                  Final fee depends on parts and work needed. Pay cash only after inspection.
                </p>

                <Link
                  href={`/${params.locale}/book/${pro.id}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#168348] text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
                >
                  <CalendarDays size={16} />
                  Book This Professional
                </Link>

                <div className="rounded-xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-900 border border-emerald-100 flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                  <span>Your booking is protected by Karigar local support guarantee.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3.5 lg:hidden shadow-lg">
        <div className="container flex items-center justify-between gap-4">
          <div>
            <small className="block text-[10px] font-bold text-slate-400 uppercase">VISIT FROM</small>
            <b className="text-sm font-extrabold text-ink">Rs {pro.price.toLocaleString('en-PK')}</b>
          </div>
          <Link
            href={`/${params.locale}/book/${pro.id}`}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#168348] text-xs font-bold text-white shadow-xs"
          >
            <CalendarDays size={15} />
            Book a Visit
          </Link>
        </div>
      </div>
    </>
  );
}
