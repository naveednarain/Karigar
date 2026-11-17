'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Sparkles,
  Phone,
  HelpCircle,
  Wrench,
  Zap,
  Snowflake,
  Sun,
  Paintbrush,
  Hammer,
  Bug,
  ShieldCheck,
  Droplets,
  Tv,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { SiteHeader } from './site-header';

type SearchProvider = {
  id: string;
  name: string;
  skill: string;
  area: string;
  rating: number;
  jobs: number;
  price: string;
  score: number;
  reason: string;
  verified: boolean;
  available: boolean;
};

type Result = {
  service: string;
  area: string | null;
  urgency: string;
  language: string;
  summary: string;
  ai_summary: string;
  estimated_price_range: string | null;
  clarifying_question: string | null;
  usedAI: boolean;
  found?: boolean;
  providers: SearchProvider[];
  parsed: { service: string; area: string | null; urgency: string; language: string };
};

const suggestedCategories = [
  { name: 'AC Service', ur: 'اے سی سروس', icon: Snowflake, query: 'AC service' },
  { name: 'Plumber', ur: 'پلمبر', icon: Droplets, query: 'Plumbing tap leak' },
  { name: 'Electrician', ur: 'الیکٹریشن', icon: Zap, query: 'Electrician fan wiring' },
  { name: 'Deep Cleaning', ur: 'گھریلو صفائی', icon: Sparkles, query: 'Home cleaning' },
  { name: 'Solar & Inverter', ur: 'سولر و یو پی ایس', icon: Sun, query: 'Solar inverter' },
  { name: 'Carpentry', ur: 'کارپینٹر', icon: Hammer, query: 'Carpentry door repair' },
  { name: 'Painting', ur: 'رنگ و روغن', icon: Paintbrush, query: 'Painting wall' },
  { name: 'Appliance Repair', ur: 'فریج و مشین', icon: Tv, query: 'Fridge washing machine repair' },
  { name: 'CCTV Security', ur: 'سی سی ٹی وی', icon: ShieldCheck, query: 'CCTV camera' },
  { name: 'Pest Control', ur: 'کیڑے مار', icon: Bug, query: 'Pest control termite' },
];

function Inner() {
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(true);
  const [filter, setFilter] = useState('All pros');
  const [searchText, setSearchText] = useState(query);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPending(true);
    setError('');
    fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: query || 'home service Hyderabad' }),
    })
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || 'Search could not be completed');
        if (active) setResult(x);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Search failed');
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const filtered = (result?.providers || []).filter((p) =>
    filter === 'Available today'
      ? p.available
      : filter === 'Top rated'
      ? p.rating >= 4.8
      : filter === 'Verified'
      ? p.verified
      : true
  );

  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}`} title="Find Local Pros" />
      <main className="min-h-screen bg-[#f5f8f5] pb-24 text-ink dark:bg-[#090e0b] dark:text-slate-100 transition-colors">
        <div className="container max-w-[1140px] pt-6">
          {/* Back button */}
          <Link
            href={`/${locale}`}
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-400 dark:hover:text-emerald-400 transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to Karigar Home
          </Link>

          {/* Heading */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#168348] dark:text-emerald-400">
                HYDERABAD & JAMSHORO
              </span>
              <h1 className="display mt-1 text-[30px] font-extrabold sm:text-[36px] dark:text-white">
                Find your right-hand professional.
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Verified home technicians ready to assist in your neighbourhood.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/${locale}/search?q=${encodeURIComponent(searchText)}`);
            }}
            className="mt-6 flex max-w-[760px] items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Search size={18} className="text-[#168348] dark:text-emerald-400 shrink-0" />
            <input
              aria-label="Describe your home service request"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10 flex-1 text-xs sm:text-sm text-ink outline-none font-medium bg-transparent dark:text-white"
              placeholder="What needs fixing today? (e.g. AC service, tap leak)"
            />
            <button
              type="submit"
              aria-label="Search"
              className="h-10 rounded-xl bg-[#168348] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {['All pros', 'Available today', 'Top rated', 'Verified'].map((x) => (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === x
                    ? 'bg-[#168348] text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {x}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {/* Query understanding / status banner - Fully Responsive */}
              {pending ? (
                <div className="h-24 w-full animate-pulse rounded-2xl sm:rounded-[24px] bg-white border border-slate-100 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900" />
              ) : result && result.providers.length === 0 ? (
                <div className="w-full max-w-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-amber-200 bg-amber-50/80 p-4 sm:p-5 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/25">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 shadow-xs dark:bg-amber-900/50 dark:text-amber-300">
                      <HelpCircle size={22} />
                    </span>
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        Service Not Found
                      </div>
                      <p className="mt-1 text-xs sm:text-[13px] text-amber-950 dark:text-amber-100 font-medium leading-relaxed break-words">
                        {result.ai_summary}
                      </p>
                      <p className="mt-1.5 text-[11px] text-amber-800 dark:text-amber-300/80">
                        Karigar offers trusted home services in Hyderabad & Jamshoro. Try one of our popular categories below:
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-emerald-200/80 bg-[#edf8f1] p-4 sm:p-5 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-300">
                      <Check size={20} />
                    </span>
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        <span>Request Understood</span>
                        {result?.usedAI && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-200">
                            <Sparkles size={11} /> AI Match
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-[13px] text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed break-words">
                        {result?.ai_summary || result?.summary}
                        {result?.clarifying_question ? ` · ${result.clarifying_question}` : ''}
                      </p>
                      {result?.parsed && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-900 shadow-xs border border-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                            {result.service}
                          </span>
                          {result.area && (
                            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-900 shadow-xs border border-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                              📍 {result.area}
                            </span>
                          )}
                          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-900 shadow-xs border border-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                            ⏱ {result.urgency}
                          </span>
                          {result.estimated_price_range && (
                            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-900 shadow-xs border border-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                              💰 {result.estimated_price_range}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Providers list heading */}
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-base font-bold text-ink">
                  {locale === 'ur' ? 'تجویز کردہ کاریگر' : 'Recommended Technicians'}
                </h2>
                <span className="text-xs text-slate-500 font-semibold">{filtered.length} {locale === 'ur' ? 'دستیاب' : 'found'}</span>
              </div>

              {error ? (
                <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
                  {error}
                </div>
              ) : pending ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-36 animate-pulse rounded-[24px] bg-white border border-slate-100" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[24px] border border-slate-200/80 bg-white p-8 text-center shadow-soft">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                    <Search size={26} />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-ink">
                    {locale === 'ur'
                      ? `"${query || searchText}" کے لیے کوئی سروس یا کاریگر نہیں ملا`
                      : `No services or professionals found for "${query || searchText}"`}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 max-w-[480px] mx-auto">
                    {locale === 'ur'
                      ? 'کاریگر پر موجود مقبول سروسز میں سے کسی ایک پر کلک کریں تاکہ آپ کو متعلقہ تصدیق شدہ ماہرین مل سکیں:'
                      : "We couldn't find a match for that specific search. Explore our most popular verified categories:"}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-[620px] mx-auto">
                    {suggestedCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            setSearchText(cat.name);
                            router.push(`/${locale}/search?q=${encodeURIComponent(cat.query)}`);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 transition shadow-xs"
                        >
                          <Icon size={14} className="text-brand-600" />
                          <span>{locale === 'ur' ? cat.ur : cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filtered.map((p) => (
                    <article
                      key={p.id}
                      className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:border-emerald-300 dark:border-slate-800 dark:bg-[#111a14] dark:hover:border-emerald-600"
                    >
                      <div className="flex gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-base font-extrabold text-emerald-900 shadow-xs dark:bg-emerald-950 dark:text-emerald-300">
                          {p.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-ink dark:text-white">{p.name}</h3>
                            <BadgeCheck size={16} className="fill-emerald-100 text-emerald-600 dark:fill-emerald-900 dark:text-emerald-400" />
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                              Verified
                            </span>
                            <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star size={14} fill="currentColor" /> {p.rating}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{p.skill}</p>

                          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} className="text-emerald-600 dark:text-emerald-400" />
                              {p.area}
                            </span>
                            <span>{p.jobs} completed visits</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{p.reason}</span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div>
                              <b className="text-sm font-extrabold text-ink dark:text-white">{p.price}</b>
                              <span className="ml-2 text-[11px] text-slate-400">Visit fee</span>
                            </div>

                            <Link
                              href={`/${locale}/provider/${p.id}`}
                              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#168348] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
                            >
                              <CalendarDays size={15} />
                              View Profile & Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Right sidebar */}
            <aside className="hidden lg:block space-y-4">
              <div className="sticky top-24 rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-[#111a14]">
                <h3 className="text-sm font-bold text-ink dark:text-white">Why Karigar Pros?</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Local peace of mind for every home repair.</p>

                <div className="mt-5 space-y-4">
                  {[
                    ['Identity verified', 'CNIC & background checked manually'],
                    ['No advance fee', 'Pay 100% in cash after job completion'],
                    ['Direct communication', 'Message and call technician in-app'],
                  ].map(([head, sub]) => (
                    <div key={head} className="flex gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0 dark:bg-emerald-950 dark:text-emerald-400">
                        <Check size={16} />
                      </div>
                      <div>
                        <b className="block text-xs text-ink dark:text-white">{head}</b>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-4">{sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export function SearchResults() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading local specialists…</div>}>
      <Inner />
    </Suspense>
  );
}
