'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bug,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Hammer,
  HeartHandshake,
  MapPin,
  Mic,
  Paintbrush,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  Wrench,
  Zap,
  Snowflake,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { services, providers } from '@/lib/data';
import { SiteHeader } from './site-header';
import { CustomSelect } from './custom-select';

const iconMap: Record<string, typeof Droplets> = {
  Droplets,
  Zap,
  Snowflake,
  Hammer,
  Paintbrush,
  Sparkles,
  Wrench,
  Sun,
  ShieldCheck,
  Bug,
};

// High-quality craft & home repair imagery for low-opacity hero slider
const heroSlides = [
  {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1800&q=80',
    title: 'Certified Electricians & Wiring',
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1800&q=80',
    title: 'Master Plumbing & Water Line Repair',
  },
  {
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1800&q=80',
    title: 'AC Inverter Servicing & Gas Refill',
  },
  {
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1800&q=80',
    title: 'Woodwork & Furniture Carpentry',
  },
  {
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=80',
    title: 'Deep Home Cleaning & Painting',
  },
];

export function LandingPage() {
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All Areas');
  const [busy, setBusy] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Active user session
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Auto-cycle hero picture slider every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  async function search(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const searchTarget = query.trim() || 'home repair';
    const locParam = location !== 'All Areas' ? ` in ${location}` : '';
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTarget + locParam)}`);
  }

  function voice() {
    type SpeechWindow = Window & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    type SpeechRecognition = EventTarget & {
      lang: string;
      start: () => void;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    };
    const win = window as SpeechWindow;
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = 'en-PK';
    rec.onresult = (event) => setQuery(event.results[0][0].transcript);
    rec.start();
  }

  return (
    <>
      <SiteHeader />
      <main className="overflow-x-hidden bg-[#fafcfa] dark:bg-[#070b08] text-ink dark:text-slate-100 transition-colors">
        {/* HERO SECTION with Low-Opacity Picture Slider */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#1651b2] via-[#1f6ad9] to-[#124294] dark:from-[#0d2854] dark:via-[#0e336c] dark:to-[#0a1e3d] pb-24 pt-14 text-white sm:pt-20 lg:pb-32 transition-colors">
          {/* Low Opacity Pictures Slider */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.url}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === activeSlide ? 'opacity-20 dark:opacity-15' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${slide.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
            {/* Soft gradient wash over the image for perfect text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#124294]/90 via-transparent to-[#1651b2]/80 dark:from-[#0a1e3d]/95 dark:to-[#0d2854]/90" />
            <div className="hero-grid absolute inset-0 opacity-15" />
          </div>

          <div className="container relative z-10 text-center">
            {/* Laurel badge / Active user badge */}
            {currentUser ? (
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-900/60 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-sm text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Signed in as <b>{currentUser.name}</b> ({currentUser.role})</span>
                <span className="text-white/40">·</span>
                <Link
                  href={`/${locale}/${
                    currentUser.role === 'provider'
                      ? 'provider/dashboard'
                      : currentUser.role === 'admin'
                      ? 'admin'
                      : 'account/bookings'
                  }`}
                  className="font-bold text-white underline hover:text-emerald-200"
                >
                  My Workspace →
                </Link>
              </div>
            ) : (
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="text-amber-300">★ ★ ★ ★ ★</span>
                <span>7.5k Happy Customers in Hyderabad & Jamshoro</span>
              </div>
            )}

            {/* Main title & subtitle */}
            <h1 className="display mx-auto max-w-[820px] text-[40px] font-extrabold leading-[1.08] tracking-[-.04em] sm:text-[58px] md:text-[68px]">
              Home services, made easy
            </h1>
            <p className="mx-auto mt-5 max-w-[580px] text-[15px] font-normal leading-7 text-white/90 sm:text-[17px]">
              Book trusted professionals for your home, apartment, office, or property.
            </p>

            {/* Unified 3-segment search bar */}
            <form
              onSubmit={search}
              className="mx-auto mt-10 max-w-[820px] rounded-[24px] bg-white dark:bg-slate-900 p-2.5 text-left shadow-[0_20px_60px_rgba(0,18,50,.35)] dark:shadow-[0_20px_60px_rgba(0,0,0,.6)] border border-transparent dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {/* Segment 1: What service do you need? */}
              <div className="flex flex-1 items-center gap-3 px-4 py-1">
                <Search className="shrink-0 text-blue-600 dark:text-blue-400" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What service do you need?"
                  className="h-12 min-w-0 flex-1 text-[14px] text-ink dark:text-white bg-transparent outline-none placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  aria-label="Speak your request"
                  onClick={voice}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition"
                >
                  <Mic size={17} />
                </button>
              </div>

              {/* Divider */}
              <div className="hidden h-9 w-px bg-slate-200 dark:bg-slate-700 md:block" />

              {/* Segment 2: Select your location */}
              <div className="relative px-2 py-0.5 md:w-[240px]">
                <CustomSelect
                  value={location}
                  onChange={setLocation}
                  placeholder="Select location"
                  options={[
                    { value: 'All Areas', label: 'All Areas (Hyd & Jam)', badge: 'All' },
                    { value: 'Latifabad', label: 'Latifabad', badge: 'Units 1-12' },
                    { value: 'Qasimabad', label: 'Qasimabad', badge: 'Phases 1-3' },
                    { value: 'Jamshoro', label: 'Jamshoro City', badge: 'Campus/City' },
                    { value: 'Autobhan', label: 'Autobhan Road', badge: 'Hub' },
                    { value: 'Hirabad', label: 'Hirabad', badge: 'Central' },
                    { value: 'Saddar', label: 'Saddar Bazar', badge: 'Commercial' },
                    { value: 'Kotri', label: 'Kotri', badge: 'Ind. & Res.' },
                  ]}
                  searchable
                />
              </div>

              {/* Segment 3: Book a service button */}
              <button
                disabled={busy}
                className="flex h-[52px] items-center justify-center gap-2 rounded-[18px] bg-[#168348] hover:bg-[#12683b] px-7 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(22,131,72,.35)] transition disabled:opacity-75"
              >
                {busy ? 'Finding…' : 'Book a service'}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Slider Dots Indicator */}
            <div className="mx-auto mt-4 flex items-center justify-center gap-2">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.url}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="mx-auto mt-6 flex max-w-[720px] flex-wrap justify-center items-center gap-2 text-xs">
              <span className="text-white/75 text-[11px] font-medium mr-1">Popular fixes:</span>
              {[
                { label: 'Leaky tap', query: 'Fix a leaky tap in Latifabad' },
                { label: 'AC repair', query: 'AC service in Qasimabad' },
                { label: 'Ceiling fan', query: 'Install ceiling fan' },
                { label: 'Electrician', query: 'Electrician wiring' },
                { label: 'Deep cleaning', query: 'Home deep cleaning' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuery(item.query)}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] text-white/90 backdrop-blur-xs transition hover:bg-white/20 hover:scale-105"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Pro Showcase Fan Cards */}
            <div className="mx-auto mt-12 max-w-[920px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Ahsan Ali', skill: 'Master Plumber', area: 'Latifabad', rating: '4.9 ★', exp: '8+ yrs' },
                  { name: 'Imran Memon', skill: 'AC & Electrician', area: 'Qasimabad', rating: '4.8 ★', exp: '6+ yrs' },
                  { name: 'Nadeem Baloch', skill: 'Master Carpenter', area: 'Jamshoro', rating: '5.0 ★', exp: '10+ yrs' },
                  { name: 'Farzana Bibi', skill: 'Home Cleaning', area: 'Hyderabad', rating: '4.9 ★', exp: '5+ yrs' },
                ].map((pro) => (
                  <div
                    key={pro.name}
                    className="rounded-[20px] bg-white/15 dark:bg-slate-900/40 backdrop-blur-md border border-white/25 dark:border-white/15 p-4 text-left transition hover:-translate-y-1 hover:bg-white/25"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-blue-900 font-bold text-xs shadow-sm">
                        {pro.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block truncate text-xs text-white">{pro.name}</b>
                        <small className="block text-[10px] text-white/75">{pro.skill}</small>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-white/90 border-t border-white/15 pt-2">
                      <span className="font-semibold text-amber-300">{pro.rating}</span>
                      <span>{pro.area}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR SERVICES SECTION */}
        <section id="services" className="relative -mt-6 rounded-t-[36px] bg-white dark:bg-[#0c140f] pb-20 pt-14 border-t border-transparent dark:border-slate-800 transition-colors">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#168348] dark:text-emerald-400">
                  EVERYTHING YOUR HOME NEEDS
                </span>
                <h2 className="display mt-2 text-[32px] font-extrabold text-ink dark:text-white sm:text-[42px]">
                  Popular services
                </h2>
                <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-400 max-w-[480px]">
                  The reliable help your home needs, right around the corner in Hyderabad & Jamshoro.
                </p>
              </div>

              <Link
                href={`/${locale}/search`}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 dark:hover:text-emerald-400"
              >
                Explore all services
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {services.map((service) => {
                const Icon = iconMap[service.icon];
                return (
                  <Link
                    href={`/${locale}/search?q=${encodeURIComponent(service.name)}`}
                    prefetch={true}
                    key={service.name}
                    className="group rounded-[24px] border border-slate-100 dark:border-slate-800 bg-[#fafcfa] dark:bg-slate-900/60 p-3 transition duration-200 hover:-translate-y-1 hover:border-brand-200 dark:hover:border-emerald-600/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-soft"
                  >
                    <div
                      className={`relative flex h-[120px] items-center justify-center overflow-hidden rounded-[18px] tint-${service.tint} sm:h-[135px]`}
                    >
                      <span className="absolute -right-4 -top-8 h-28 w-28 rounded-full bg-white/40 transition duration-300 group-hover:scale-125" />
                      <span className="relative grid h-[68px] w-[68px] place-items-center rounded-[22px] bg-white/90 text-brand-800 shadow-[0_8px_25px_rgba(18,59,43,.1)] transition duration-300 group-hover:scale-110">
                        <Icon size={32} strokeWidth={1.75} />
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-brand-900 shadow-xs">
                        {service.name}
                      </span>
                    </div>

                    <div className="p-1.5 mt-2">
                      <h3 className="text-[13px] font-bold text-ink dark:text-white sm:text-[14px]">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{service.jobs}</p>
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 dark:text-emerald-400">
                        Book service
                        <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOOK IN 3 STEPS SECTION */}
        <section id="how" className="bg-[#f6f9f6] dark:bg-[#070c08] py-20 border-y border-slate-100 dark:border-slate-800 transition-colors">
          <div className="container">
            <div className="text-center max-w-[620px] mx-auto">
              <span className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#168348] dark:text-emerald-400">
                SIMPLE STEPS
              </span>
              <h2 className="display mt-2 text-[32px] font-extrabold text-ink dark:text-white sm:text-[42px]">
                Book in 3 steps
              </h2>
              <p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">
                A clear, hassle-free path from unexpected breakdown to reliable local help.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Pick a service',
                  detail: 'Describe the fix or choose from experienced local electricians, plumbers, and technicians.',
                  icon: Search,
                  highlight: 'Choose a pro that fits your needs',
                  badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
                },
                {
                  step: '02',
                  title: 'Pick a time',
                  detail: 'Select the date and time that works best for your schedule. Flexible & urgent options available.',
                  icon: CalendarDays,
                  highlight: 'Choose a time that works for you',
                  badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
                },
                {
                  step: '03',
                  title: 'Relax',
                  detail: 'A verified professional comes directly to your home. Pay safely in cash only after the work is done.',
                  icon: Smile,
                  highlight: 'A professional comes to you',
                  badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
                },
              ].map(({ step, title, detail, icon: StepIcon, highlight, badgeColor }) => (
                <div
                  key={step}
                  className="rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-7 shadow-[0_10px_30px_rgba(18,59,43,.04)] transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500">
                      STEP {step}
                    </span>
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${badgeColor}`}>
                      <StepIcon size={24} />
                    </span>
                  </div>

                  <h3 className="mt-5 text-[20px] font-extrabold text-ink dark:text-white">{title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{detail}</p>

                  <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-[#168348] dark:text-emerald-400 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section id="why" className="py-20 bg-white dark:bg-[#0c140f] transition-colors">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] items-center">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#168348] dark:text-emerald-400">
                  LOCAL PROFESSIONALS, RIGHT WHERE YOU NEED THEM
                </span>
                <h2 className="display mt-3 text-[32px] font-extrabold text-ink dark:text-white sm:text-[44px]">
                  Why choose us
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300 max-w-[500px]">
                  Karigar is built specifically for Hyderabad and Jamshoro residents. We connect you directly with
                  neighbourhood experts without agency markups or hidden fees.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Clear pricing',
                      body: 'Know what you’re paying for with transparent upfront estimates before work begins.',
                      icon: ShieldCheck,
                      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
                    },
                    {
                      title: 'Easy booking',
                      body: 'Book in just a few clicks. No advance payment or card required; pay cash after service.',
                      icon: CheckCircle2,
                      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
                    },
                    {
                      title: 'Support when needed',
                      body: 'We’re here if something goes wrong. Our customer team is available for every visit.',
                      icon: HeartHandshake,
                      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                    },
                  ].map(({ title, body, icon: FeatureIcon, color }) => (
                    <div
                      key={title}
                      className="flex gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#fbfdfb] dark:bg-slate-900/60 p-4.5"
                    >
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${color}`}>
                        <FeatureIcon size={22} />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold text-ink dark:text-white">{title}</h3>
                        <p className="mt-1 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side interactive card showcase */}
              <div className="rounded-[32px] bg-gradient-to-tr from-[#123b2b] to-[#168348] dark:from-[#081b13] dark:to-[#115934] p-7 text-white shadow-soft">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">
                  <BadgeCheck size={14} className="text-amber-300" /> CNIC Verified & Background Checked
                </span>

                <h3 className="display mt-5 text-[26px] font-extrabold leading-snug">
                  Workmanship guaranteed. Trusted across Sindh.
                </h3>
                <p className="mt-2 text-[13px] text-white/80 leading-6">
                  Every listed professional completes identity verification. See real reviews from neighbours before
                  booking.
                </p>

                <div className="mt-6 space-y-3">
                  {providers.slice(0, 4).map((p) => {
                    const proId = p.name.includes('Ahsan') ? 'p01' : p.name.includes('Imran') ? 'p02' : p.name.includes('Nadeem') ? 'p03' : 'p01';
                    return (
                      <Link
                        key={p.name}
                        href={`/${locale}/provider/${proId}`}
                        className="flex items-center gap-3.5 rounded-2xl bg-white/10 p-3 backdrop-blur-xs border border-white/10 transition hover:bg-white/20 hover:scale-[1.01]"
                        title={`View ${p.name}'s profile and book`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white font-bold text-xs text-brand-900">
                          {p.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <b className="truncate text-xs text-white">{p.name}</b>
                            <BadgeCheck size={14} className="text-emerald-300" />
                          </div>
                          <small className="block text-[11px] text-white/70">
                            {p.trade} · {p.area}
                          </small>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
                            <Star size={13} fill="currentColor" /> {p.rating}
                          </span>
                          <span className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-bold text-white">
                            View →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href={`/${locale}/search`}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold text-brand-900 shadow-sm transition hover:bg-slate-100"
                >
                  Find your local pro
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA TO BECOME A PRO */}
        <section className="pb-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-[32px] bg-brand-900 dark:bg-emerald-950 px-6 py-12 text-white sm:px-12 sm:py-16 md:flex md:items-center md:justify-between border border-transparent dark:border-emerald-800">
              <div className="absolute -right-16 -top-36 h-80 w-80 rounded-full border-[40px] border-white/10 pointer-events-none" />
              <div className="relative max-w-[560px]">
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-[#a9dfb7]">
                  SKILLED HANDS MAKE STRONG COMMUNITIES
                </span>
                <h2 className="display mt-3 text-[30px] font-extrabold sm:text-[40px]">
                  Your skill deserves to be seen.
                </h2>
                <p className="mt-3 text-[14px] leading-6 text-white/75">
                  Join hundreds of local electricians, plumbers, and technicians growing their earnings and customer base
                  with Karigar.
                </p>
              </div>

              <div className="relative mt-7 flex flex-col gap-3 sm:flex-row md:mt-0">
                <Link
                  href={`/${locale}/join`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[13px] font-bold text-brand-900 transition hover:bg-slate-100 shadow-sm"
                >
                  Become a service pro
                  <ArrowRight size={16} />
                </Link>
                {currentUser ? (
                  <Link
                    href={`/${locale}/${
                      currentUser.role === 'provider'
                        ? 'provider/dashboard'
                        : currentUser.role === 'admin'
                        ? 'admin'
                        : 'account/bookings'
                    }`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/20 border border-white/40 px-5 text-[13px] font-bold text-white transition hover:bg-white/30"
                  >
                    Open {currentUser.role === 'provider' ? 'Workspace' : currentUser.role === 'admin' ? 'Console' : 'My Bookings'}
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-[13px] font-bold text-white transition hover:bg-white/20"
                  >
                    Try Demo
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a07] py-10 transition-colors">
        <div className="container flex flex-col items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-900 text-white text-[11px] font-bold">
              K
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              © 2026 Karigar · Built for Hyderabad & Jamshoro
            </span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href={`/${locale}/help`} className="hover:text-brand-700 dark:hover:text-emerald-400">
              Help
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-brand-700 dark:hover:text-emerald-400">
              Terms of service
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-brand-700 dark:hover:text-emerald-400">
              Privacy policy
            </Link>
            <Link
              href={`/${locale}/login`}
              className="font-bold text-brand-700 dark:text-emerald-400 hover:underline"
            >
              Sign In / Demo
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
