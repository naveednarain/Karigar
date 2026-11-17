'use client';
import Link from 'next/link';
import { useState, useEffect, ChangeEvent } from 'react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  Wrench,
  AlertCircle,
  Sparkles,
  UserCheck,
  Lock,
  Star,
  Eye,
  Trash2,
  BadgeCheck,
  Info,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { SiteHeader } from './site-header';
import { providerApplicationSchema } from '@/lib/validators/provider';
import type { z } from 'zod';

type Values = z.infer<typeof providerApplicationSchema>;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isDemo?: boolean;
}

const skills = [
  ['plumbing', 'Plumbing & Water Pipes'],
  ['electrical', 'Electrical Wiring & Fans'],
  ['ac_service', 'AC Service & Gas Inverter'],
  ['painting', 'Home & Commercial Painting'],
  ['carpentry', 'Carpentry & Woodwork'],
  ['cleaning', 'Deep Home & Sofa Cleaning'],
  ['mason', 'Masonry & Tiles Fitting'],
  ['appliance_repair', 'Appliance Repair (Fridge/Washing)'],
  ['solar', 'Solar Panel Installation'],
  ['cctv', 'CCTV & Smart Security'],
  ['pest_control', 'Fumigation & Pest Control'],
];

const areas = [
  ['latifabad', 'Latifabad'],
  ['qasimabad', 'Qasimabad'],
  ['hirabad', 'Hirabad'],
  ['saddar', 'Saddar'],
  ['autobhan', 'Autobhan Road'],
  ['jamshoro', 'Jamshoro City'],
  ['kotri', 'Kotri Industrial & Res.'],
  ['lumhs', 'LUMHS Colony'],
  ['muet', 'MUET Campus Area'],
  ['sindh_university', 'Sindh University Society'],
  ['qasimabad_phase2', 'Qasimabad Phase 2'],
  ['naseem_nagar', 'Naseem Nagar'],
];

export function ProviderApplication() {
  const locale = useLocale();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  // Check login status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          // Pre-fill user name if available
          if (data.user.name && data.user.name !== 'User') {
            setValue('fullName', data.user.name);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues: {
      experienceYears: 5,
      visitFee: 1000,
      serviceSlugs: ['plumbing'],
      areas: ['latifabad', 'qasimabad'],
      cnicLast4: '',
      headline: '',
      bio: '',
      fullName: '',
      phone: '',
      cnicFrontPath: '',
      cnicBackPath: '',
    },
  });

  const selectedSkills = watch('serviceSlugs') || [];
  const selectedAreas = watch('areas') || [];
  const watchedName = watch('fullName') || 'Your Name';
  const watchedHeadline = watch('headline') || 'Your Professional Headline';
  const watchedFee = watch('visitFee') || 1000;

  // Handle CNIC file selection with live image preview
  function handleFileChange(e: ChangeEvent<HTMLInputElement>, side: 'front' | 'back') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, or WebP).');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5 MB.');
      e.target.value = '';
      return;
    }

    setPhotoError(null);
    const previewUrl = URL.createObjectURL(file);

    if (side === 'front') {
      setFront(file);
      setFrontPreview(previewUrl);
      setValue('cnicFrontPath', `uploads/cnic_front_${Date.now()}_${file.name}`, {
        shouldValidate: true,
      });
      toast.success('CNIC Front image attached!');
    } else {
      setBack(file);
      setBackPreview(previewUrl);
      setValue('cnicBackPath', `uploads/cnic_back_${Date.now()}_${file.name}`, {
        shouldValidate: true,
      });
      toast.success('CNIC Back image attached!');
    }
  }

  function removePhoto(side: 'front' | 'back') {
    if (side === 'front') {
      setFront(null);
      setFrontPreview(null);
      setValue('cnicFrontPath', '', { shouldValidate: true });
    } else {
      setBack(null);
      setBackPreview(null);
      setValue('cnicBackPath', '', { shouldValidate: true });
    }
  }

  function toggle(field: 'serviceSlugs' | 'areas', value: string) {
    const current = field === 'areas' ? selectedAreas : selectedSkills;
    setValue(field, current.includes(value) ? current.filter((x) => x !== value) : [...current, value], {
      shouldValidate: true,
    });
  }

  async function handleNextStep() {
    if (step === 1) {
      const isValid = await trigger(['fullName', 'phone', 'headline', 'bio', 'experienceYears']);
      if (!isValid) {
        toast.error('Please fill in all mandatory profile fields correctly.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedSkills.length === 0) {
        toast.error('Please select at least one trade service.');
        return;
      }
      if (selectedAreas.length === 0) {
        toast.error('Please select at least one local coverage area.');
        return;
      }
      setStep(3);
    }
  }

  async function quickProviderDemo() {
    setDemoLoginLoading(true);
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'provider', locale, next: `/${locale}/join` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentUser({
        id: 'demo-provider',
        email: 'ahsan.ali.provider@karigar.pk',
        name: 'Ahsan Ali',
        role: 'provider',
        isDemo: true,
      });

      setValue('fullName', 'Ahsan Ali');
      setValue('phone', '0300 1234567');
      setValue('headline', 'Master Plumber & Pipeline Expert');
      setValue('bio', '8+ years of experience repairing leakages, geysers, motor pumps, and sanitary systems across Hyderabad.');
      setValue('visitFee', 1000);
      setValue('experienceYears', 8);

      toast.success('Logged in as Demo Provider (Ahsan Ali)! Application ready.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start demo provider session');
    } finally {
      setDemoLoginLoading(false);
    }
  }

  async function submit(data: Values) {
    // Check if user is logged in
    if (!currentUser) {
      toast.error('Please sign in or use the 1-Click Demo Provider button above to submit.');
      return;
    }

    // STRICT VALIDATION: CNIC Front and CNIC Back photos are mandatory
    if (!front || !back) {
      setPhotoError('Both front and back photos of your CNIC are strictly required.');
      toast.error('Both front and back photos of your CNIC are required.');
      return;
    }

    if (!data.cnicLast4 || data.cnicLast4.length !== 4) {
      toast.error('Please enter the exact last 4 digits of your CNIC.');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...data,
        cnicFrontPath: data.cnicFrontPath || `documents/${front.name}`,
        cnicBackPath: data.cnicBackPath || `documents/${back.name}`,
      };

      const res = await fetch('/api/provider-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit application.');
      }

      setComplete(true);
      toast.success('Application submitted! Your profile is in the verification queue.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}`} title="Join as a Service Provider" />
      <main className="min-h-screen bg-[#f5f8f5] dark:bg-[#080d09] pb-24 text-ink dark:text-slate-100 transition-colors">
        <div className="container max-w-[1040px] pt-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-emerald-400 transition mb-6"
          >
            <ArrowLeft size={16} />
            Back to Karigar Home
          </Link>

          {/* Educational Explainer Banner: What is "Pro" vs "Registered User"? */}
          <div className="mb-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Info size={18} />
              </span>
              <div className="text-xs space-y-1">
                <h3 className="font-bold text-blue-950 dark:text-blue-200 text-sm">
                  What is a &quot;Pro&quot; (Service Provider / Karigar) on this platform?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>• Pro / Service Provider (کاریگر):</strong> An electrician, plumber, AC mechanic, carpenter, or cleaning specialist who performs repair jobs and earns cash payments from local clients.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>• For Registered Users &amp; Customers:</strong> Any registered user can register their skilled trade here! When you submit this form, your existing account is upgraded to a verified Service Provider profile upon CNIC approval.
                </p>
              </div>
            </div>
          </div>

          {/* 1. SUCCESS SCREEN */}
          {complete ? (
            <section className="mx-auto mt-8 max-w-[560px] rounded-[32px] bg-white dark:bg-slate-900 p-8 sm:p-10 text-center shadow-xl border border-slate-100 dark:border-slate-800">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={36} />
              </span>
              <h1 className="display mt-5 text-[28px] font-extrabold text-ink dark:text-white">Application Submitted!</h1>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your profile details and CNIC credentials have been placed into the Karigar verification desk queue.
                Our team reviews all submissions within 24 to 48 hours.
              </p>
              <div className="mx-auto mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-left flex items-start gap-3">
                <ShieldCheck size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>CNIC Privacy Guarantee:</strong> Your documents are encrypted and kept strictly confidential. Verified badges are displayed on your profile upon approval.
                </span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/${locale}/provider/dashboard`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#168348] dark:bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b]"
                >
                  View Provider Dashboard →
                </Link>
                <Link
                  href={`/${locale}`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Return to Home
                </Link>
              </div>
            </section>
          ) : (
            <div>
              {/* Account State Bar */}
              {currentUser ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white font-bold text-xs">
                      {currentUser.name[0]}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        {currentUser.role === 'provider'
                          ? 'Service Provider Account'
                          : 'Registered Account Upgrade'}
                      </span>
                      <b className="block text-xs text-ink dark:text-white">
                        Applying as: {currentUser.name} ({currentUser.email})
                      </b>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <BadgeCheck size={14} /> Account Connected
                  </span>
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                      Sign in or use 1-click Pro Demo to submit
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                      You can fill out the form now, but connecting an account is required to activate your profile.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={quickProviderDemo}
                      disabled={demoLoginLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-60"
                    >
                      <UserCheck size={14} />
                      {demoLoginLoading ? 'Connecting…' : '1-Click Demo Provider'}
                    </button>
                    <Link
                      href={`/${locale}/login?next=/${locale}/join`}
                      className="inline-flex items-center rounded-xl border border-amber-300 dark:border-amber-800 px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-white/50"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Header Title */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    SERVICE PROVIDER REGISTRATION
                  </span>
                  <h1 className="display mt-1 text-[28px] font-extrabold dark:text-white sm:text-[34px]">
                    Put your skill to work in Hyderabad.
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Fill in your verified trade details and CNIC photos to start receiving local customer requests.
                  </p>
                </div>

                {/* Step Percentage Counter */}
                <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-3.5 py-2 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Step {step} of 3
                  </span>
                  <span className="text-[11px] text-slate-400">({step === 1 ? '33%' : step === 2 ? '66%' : '100%'})</span>
                </div>
              </div>

              {/* Main 2-Column Layout */}
              <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_340px]">
                {/* Form Card */}
                <section className="rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-soft">
                  {/* Step Indicators with visual connector bar */}
                  <div className="mb-8 flex items-center gap-2">
                    {[
                      { stepNum: 1, title: 'Your Profile' },
                      { stepNum: 2, title: 'Skills & Areas' },
                      { stepNum: 3, title: 'CNIC Verification' },
                    ].map(({ stepNum, title }, i) => (
                      <div key={title} className="flex flex-1 items-center gap-2">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                            step >= stepNum
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {stepNum}
                        </span>
                        <span
                          className={`hidden text-xs font-bold sm:block ${
                            step === stepNum
                              ? 'text-emerald-900 dark:text-emerald-300'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {title}
                        </span>
                        {i < 2 && (
                          <span
                            className={`h-0.5 flex-1 transition ${
                              step > stepNum ? 'bg-emerald-600' : 'bg-slate-100 dark:bg-slate-800'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit(submit)}>
                    {/* STEP 1: Personal Profile */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                          <h2 className="text-base font-extrabold text-ink dark:text-white">
                            Personal & Contact Information
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Fields marked with <span className="text-rose-500 font-bold">*</span> are mandatory.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register('fullName')}
                            className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition dark:bg-slate-800 dark:text-white ${
                              errors.fullName
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                            }`}
                            placeholder="e.g. Ahsan Ali (as appears on CNIC)"
                          />
                          {errors.fullName && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> {errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Mobile Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register('phone')}
                            placeholder="0300 1234567 or +923001234567"
                            className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition dark:bg-slate-800 dark:text-white ${
                              errors.phone
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                            }`}
                          />
                          {errors.phone ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> {errors.phone.message}
                            </p>
                          ) : (
                            <span className="mt-1 block text-[10px] text-slate-400">
                              Customers will call and coordinate appointments through this number.
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Professional Trade Headline <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register('headline')}
                            placeholder="e.g. Master Plumber & Pipeline Expert"
                            className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition dark:bg-slate-800 dark:text-white ${
                              errors.headline
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                            }`}
                          />
                          {errors.headline && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> {errors.headline.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            About your work & experience <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            {...register('bio')}
                            rows={3}
                            placeholder="Briefly describe your skill background, specialty tools, and experience in Hyderabad..."
                            className={`mt-1.5 w-full rounded-xl border p-3 text-xs outline-none transition dark:bg-slate-800 dark:text-white ${
                              errors.bio
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                            }`}
                          />
                          {errors.bio && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> {errors.bio.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Years of Hands-on Experience
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            {...register('experienceYears', { valueAsNumber: true })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3.5 text-xs outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Skills & Areas */}
                    {step === 2 && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                          <h2 className="text-base font-extrabold text-ink dark:text-white">
                            Select Trades & Coverage Areas
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Select all skills you offer and local zones in Hyderabad you can reach.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Services you provide <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              {selectedSkills.length} selected
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {skills.map(([slug, label]) => {
                              const active = selectedSkills.includes(slug);
                              return (
                                <button
                                  type="button"
                                  key={slug}
                                  onClick={() => toggle('serviceSlugs', slug)}
                                  className={`min-h-11 rounded-xl border px-3 text-left text-xs font-semibold transition flex items-center justify-between ${
                                    active
                                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                                      : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <span>{label}</span>
                                  {active && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                          {selectedSkills.length === 0 && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> Please select at least one trade service.
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2 mt-4">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Hyderabad & Jamshoro Coverage <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              {selectedAreas.length} areas covered
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {areas.map(([slug, label]) => {
                              const active = selectedAreas.includes(slug);
                              return (
                                <button
                                  type="button"
                                  key={slug}
                                  onClick={() => toggle('areas', slug)}
                                  className={`min-h-11 rounded-xl border px-3 text-left text-xs font-semibold transition flex items-center justify-between ${
                                    active
                                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                                      : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{label}</span>
                                  {active && <CheckCircle2 size={14} className="text-emerald-600 shrink-0 ml-1" />}
                                </button>
                              );
                            })}
                          </div>
                          {selectedAreas.length === 0 && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> Please select at least one coverage area.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-4">
                            Starting Inspection / Visit Fee (PKR) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="100"
                            step="100"
                            {...register('visitFee', { valueAsNumber: true })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3.5 text-xs outline-none focus:border-emerald-500"
                          />
                          <span className="mt-1 block text-[10px] text-slate-400">
                            Transparent inspection fee shown to customers on your public profile card.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Mandatory CNIC Document Photos */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                          <h2 className="text-base font-extrabold text-ink dark:text-white">
                            CNIC Identity Verification Documents
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Both CNIC Front and CNIC Back photos are <strong className="text-rose-600">mandatory</strong> for safety verification and verified badge activation.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            CNIC Last 4 Digits <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register('cnicLast4')}
                            maxLength={4}
                            className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-xs outline-none transition dark:bg-slate-800 dark:text-white ${
                              errors.cnicLast4
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                            }`}
                            placeholder="e.g. 7845"
                          />
                          {errors.cnicLast4 && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
                              <AlertCircle size={13} /> {errors.cnicLast4.message}
                            </p>
                          )}
                        </div>

                        {photoError && (
                          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{photoError}</span>
                          </div>
                        )}

                        {/* CNIC Front & Back File Uploaders with Live Previews */}
                        <div className="grid gap-4 sm:grid-cols-2 mt-4">
                          {/* Front Side */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                CNIC Front Photo <span className="text-rose-500">*</span>
                              </span>
                              {front && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Ready
                                </span>
                              )}
                            </div>

                            {frontPreview ? (
                              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-slate-50 dark:bg-slate-800 p-2">
                                <img
                                  src={frontPreview}
                                  alt="CNIC Front Preview"
                                  className="h-32 w-full rounded-xl object-cover"
                                />
                                <div className="mt-2 flex items-center justify-between px-1 text-[11px]">
                                  <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-slate-200">
                                    {front?.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removePhoto('front')}
                                    className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold"
                                  >
                                    <Trash2 size={13} /> Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex min-h-[145px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 text-center transition hover:bg-emerald-50/80">
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="sr-only"
                                  onChange={(e) => handleFileChange(e, 'front')}
                                />
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs">
                                  <UploadCloud size={20} />
                                </span>
                                <b className="mt-2 text-xs text-ink dark:text-white">Upload Front Photo</b>
                                <small className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                  Tap to select JPG or PNG (Mandatory)
                                </small>
                              </label>
                            )}
                          </div>

                          {/* Back Side */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                CNIC Back Photo <span className="text-rose-500">*</span>
                              </span>
                              {back && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Ready
                                </span>
                              )}
                            </div>

                            {backPreview ? (
                              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-slate-50 dark:bg-slate-800 p-2">
                                <img
                                  src={backPreview}
                                  alt="CNIC Back Preview"
                                  className="h-32 w-full rounded-xl object-cover"
                                />
                                <div className="mt-2 flex items-center justify-between px-1 text-[11px]">
                                  <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-slate-200">
                                    {back?.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removePhoto('back')}
                                    className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold"
                                  >
                                    <Trash2 size={13} /> Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex min-h-[145px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 text-center transition hover:bg-emerald-50/80">
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="sr-only"
                                  onChange={(e) => handleFileChange(e, 'back')}
                                />
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs">
                                  <UploadCloud size={20} />
                                </span>
                                <b className="mt-2 text-xs text-ink dark:text-white">Upload Back Photo</b>
                                <small className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                  Tap to select JPG or PNG (Mandatory)
                                </small>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Demo fast-track photo helper */}
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                          <span>Testing on desktop without sample CNIC images?</span>
                          <button
                            type="button"
                            onClick={() => {
                              const sampleFront = new File(['cnic_front_sample'], 'sample_cnic_front.jpg', {
                                type: 'image/jpeg',
                              });
                              const sampleBack = new File(['cnic_back_sample'], 'sample_cnic_back.jpg', {
                                type: 'image/jpeg',
                              });
                              setFront(sampleFront);
                              setBack(sampleBack);
                              setFrontPreview(
                                'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
                              );
                              setBackPreview(
                                'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
                              );
                              setValue('cnicFrontPath', 'documents/demo_front.jpg');
                              setValue('cnicBackPath', 'documents/demo_back.jpg');
                              setValue('cnicLast4', '7845');
                              setPhotoError(null);
                              toast.success('Attached sample demo verification images!');
                            }}
                            className="rounded-lg bg-amber-200 dark:bg-amber-800 px-2.5 py-1 font-bold text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition"
                          >
                            Attach Sample Photos
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step Actions */}
                    <div className="mt-8 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={() => setStep(step - 1)}
                          className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          Back
                        </button>
                      ) : (
                        <span />
                      )}

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex h-11 items-center gap-2 rounded-xl bg-[#168348] dark:bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
                        >
                          Next Step <ArrowRight size={15} />
                        </button>
                      ) : (
                        <button
                          disabled={busy}
                          type="submit"
                          className="flex h-11 items-center gap-2 rounded-xl bg-[#168348] dark:bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] disabled:opacity-60 transition"
                        >
                          {busy ? 'Verifying & Submitting…' : 'Submit Application for Review'} <CheckCircle2 size={15} />
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Right Side Live Search Preview & Benefits */}
                <aside className="space-y-5">
                  {/* Real-time Customer Search Preview Card */}
                  <div className="rounded-[26px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-soft">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      LIVE PROFILE PREVIEW
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      How your card will look in Hyderabad search:
                    </p>

                    <div className="mt-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#fbfdfb] dark:bg-slate-800/80 p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                          {watchedName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <b className="truncate text-xs text-ink dark:text-white">{watchedName}</b>
                            <BadgeCheck size={14} className="text-emerald-600 shrink-0" />
                          </div>
                          <small className="block truncate text-[11px] text-slate-500 dark:text-slate-300">
                            {watchedHeadline}
                          </small>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/60 pt-2.5 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star size={13} fill="currentColor" /> 5.0 New
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          Rs {watchedFee} visit
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedAreas.slice(0, 2).map((a) => (
                          <span
                            key={a}
                            className="rounded-md bg-white dark:bg-slate-700 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                          >
                            {a}
                          </span>
                        ))}
                        {selectedAreas.length > 2 && (
                          <span className="text-[9px] text-slate-400">+{selectedAreas.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partner Benefits Box */}
                  <div className="rounded-[26px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-soft space-y-3.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      <Wrench size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">Why Join Karigar Pro?</h3>
                    <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <p>✓ <strong>Zero Platform Commission:</strong> Keep 100% of all cash paid directly by customers.</p>
                      <p>✓ <strong>Set Your Own Rates:</strong> Choose your inspection visit fee and job pricing.</p>
                      <p>✓ <strong>Verified Trust:</strong> CNIC badges bring 3x more bookings compared to unverified listings.</p>
                      <p>✓ <strong>WhatsApp & Calls:</strong> Receive direct phone inquiries without middleman delays.</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
