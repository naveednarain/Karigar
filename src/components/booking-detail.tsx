'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldAlert,
  Star,
  Wallet,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { RouteMap } from './map/route-map';

const sequence = ['requested', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'];
const labels: Record<string, string> = {
  requested: 'Request Sent',
  accepted: 'Technician Accepted',
  on_the_way: 'On The Way',
  arrived: 'Arrived at Location',
  in_progress: 'Repair in Progress',
  completed: 'Job Completed',
  cancelled: 'Cancelled',
  rejected: 'Request Passed On',
};

export function BookingDetail({ bookingId, role }: { bookingId: string; role: 'user' | 'provider' }) {
  const locale = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<string>('on_the_way');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('The service was very prompt and the pipe repair is completely fixed. Excellent work!');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [finalPrice, setFinalPrice] = useState(1800);
  const [complaint, setComplaint] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const isProvider = role === 'provider';

  async function updateStatus(next: string) {
    setBusy(true);
    setStatus(next);
    toast.success(`Booking status: ${labels[next] || next}`);
    setBusy(false);
    if (next === 'completed' && !isProvider) {
      setShowRatingModal(true);
    }
  }

  function submitReview(e: FormEvent) {
    e.preventDefault();
    if (!rating) {
      toast.error('Please choose a star rating.');
      return;
    }
    setReviewed(true);
    setShowRatingModal(false);
    toast.success('Thank you for rating your service!');
  }

  function submitComplaint(e: FormEvent) {
    e.preventDefault();
    setComplaint(false);
    toast.success('Your concern has been forwarded to Karigar customer care.');
  }

  const activeIndex = sequence.indexOf(status);

  return (
    <main className="min-h-screen bg-[#f5f8f5] pb-24 text-ink">
      {/* Top Header Bar with Back Button */}
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <small className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              BOOKING OVERVIEW
            </small>
            <h1 className="text-sm font-extrabold text-ink sm:text-base leading-tight">
              Order #{bookingId.startsWith('KRG-') ? bookingId : `KRG-${bookingId.slice(-4)}`}
            </h1>
          </div>
        </div>

        <span
          className={`rounded-full px-3.5 py-1 text-xs font-bold ${
            status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'cancelled'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {labels[status] || status}
        </span>
      </header>

      <div className="container max-w-[1100px] pt-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          {/* Left Column: Details, Progress, Route */}
          <div className="space-y-5">
            {/* Service Summary Card */}
            <article className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    PLUMBING · HOME VISIT
                  </span>
                  <h2 className="display mt-1 text-[22px] font-extrabold text-ink">Kitchen Sink Leak Repair</h2>
                  <p className="mt-1 text-xs text-slate-500">Today · 2:30 PM · Latifabad Unit 7, Hyderabad</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MapPin size={22} />
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 border border-slate-100">
                <p className="font-semibold text-slate-700">Job Description:</p>
                <p className="mt-1">
                  The kitchen sink pipe is leaking under the cabinet. Please inspect the main joint and seal or replace
                  the washer.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Estimated Visit Fee</span>
                  <b className="block text-sm font-extrabold text-ink mt-0.5">Rs 1,500 – 2,000</b>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                  <Wallet size={14} /> Cash after service
                </span>
              </div>
            </article>

            {/* Job Tracking Stepper */}
            <article className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-ink">Service Tracking Status</h3>
                <span className="text-[11px] font-medium text-emerald-600">Live Updates</span>
              </div>

              <div className="mt-5 space-y-2">
                {sequence.map((item, i) => {
                  const passed = activeIndex >= i;
                  const current = status === item;
                  return (
                    <div key={item} className="flex min-h-[44px] gap-3">
                      <div className="flex w-6 flex-col items-center">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                            passed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {passed ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        {i < sequence.length - 1 && (
                          <span
                            className={`w-0.5 flex-1 my-0.5 ${activeIndex > i ? 'bg-emerald-400' : 'bg-slate-200'}`}
                          />
                        )}
                      </div>
                      <div className="pb-2">
                        <b className={`block text-xs ${current ? 'text-emerald-800 font-extrabold' : 'text-slate-700'}`}>
                          {labels[item]}
                        </b>
                        <small className="text-[10px] text-slate-400">{passed ? 'Completed step' : 'Pending'}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Live Map Tracking Canvas */}
            <article className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-soft">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    {status === 'on_the_way' ? 'Professional is on the way' : 'Service Location'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Latifabad Unit 7 · Approx 2.4 km distance</p>
                </div>
                {status === 'on_the_way' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" /> LIVE GPS
                  </span>
                )}
              </div>
              <RouteMap area="Latifabad" live={status === 'on_the_way'} className="h-[230px] rounded-none" />
            </article>
          </div>

          {/* Right Column: Provider/Customer Info & Quick Actions */}
          <div className="space-y-5">
            {/* Person Card (Image 1 Screen 2 & 5) */}
            <article className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isProvider ? 'Customer Information' : 'Assigned Professional'}
              </h3>

              <div className="mt-4 flex items-center gap-3.5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-900 shadow-xs">
                  {isProvider ? 'SA' : 'AA'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <b className="truncate text-sm font-extrabold text-ink">
                      {isProvider ? 'Sana Ahmed' : 'Ahsan Ali'}
                    </b>
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  </div>
                  <small className="block text-xs text-slate-500">
                    {isProvider ? 'Customer · Latifabad Unit 7' : 'Master Plumber · 4.9 ★ (126 jobs)'}
                  </small>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href="tel:+923001234567"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                >
                  <Phone size={15} /> Call
                </a>
                <Link
                  href={`/${locale}/chat/${bookingId}`}
                  onClick={() => {
                    try {
                      const r = JSON.parse(localStorage.getItem('karigar_read_conversations') || '[]');
                      if (!r.includes(bookingId)) {
                        r.push(bookingId);
                        localStorage.setItem('karigar_read_conversations', JSON.stringify(r));
                        window.dispatchEvent(new Event('karigar_messages_read'));
                      }
                    } catch {}
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <MessageCircle size={15} /> Message
                </Link>
              </div>
            </article>

            {/* Action Buttons */}
            <article className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-soft space-y-4">
              <h3 className="text-sm font-bold text-ink">Booking Actions</h3>

              {isProvider && (
                <div className="space-y-3">
                  {status === 'accepted' && (
                    <button
                      onClick={() => updateStatus('on_the_way')}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <Navigation size={16} /> I’m On My Way
                    </button>
                  )}
                  {status === 'on_the_way' && (
                    <button
                      onClick={() => updateStatus('arrived')}
                      className="h-12 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      I’ve Arrived at Customer Location
                    </button>
                  )}
                  {status === 'arrived' && (
                    <button
                      onClick={() => updateStatus('in_progress')}
                      className="h-12 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Start Work
                    </button>
                  )}
                  {status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus('completed')}
                      className="h-12 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Complete Job
                    </button>
                  )}
                </div>
              )}

              {!isProvider && (
                <div className="space-y-3">
                  {status !== 'completed' && (
                    <button
                      onClick={() => updateStatus('completed')}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={16} /> Mark as Completed & Rate Pro
                    </button>
                  )}

                  {status === 'completed' && !reviewed && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
                    >
                      <Star size={16} fill="currentColor" /> Rate & Review Ahsan Ali
                    </button>
                  )}

                  {reviewed && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Thank you! Your 5-star review has been published.</span>
                    </div>
                  )}

                  {['requested', 'accepted'].includes(status) && (
                    <button
                      onClick={() => updateStatus('cancelled')}
                      className="h-10 w-full rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setComplaint(true)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 w-full pt-2"
              >
                <ShieldAlert size={14} /> Need support with this booking?
              </button>
            </article>
          </div>
        </div>
      </div>

      {/* RATING & FEEDBACK MODAL - Matching Reference Image 1 Screen 4 */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[460px] rounded-[32px] bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Top avatar / icon */}
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="display text-[22px] font-extrabold text-ink leading-snug">
              How was the service of your order from Ahsan Ali?
            </h2>
            <p className="mt-2 text-xs text-slate-500 max-w-[340px] mx-auto">
              Enjoyed your repair? Rate the technician, your feedback matters to the neighbourhood.
            </p>

            {/* 5 Golden Stars - Image 1 Screen 4 */}
            <div className="mt-6 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  aria-label={`${num} Stars`}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    size={32}
                    className={num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                  />
                </button>
              ))}
            </div>

            {/* Feedback textarea */}
            <form onSubmit={submitReview} className="mt-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share a short note about the work quality and promptness..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              {/* Cancel and Submit Buttons - Exactly matching Reference Image 1 Screen 4 */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="h-12 flex-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-12 flex-1 rounded-2xl bg-[#168348] text-xs font-bold text-white shadow-md hover:bg-[#12683b] transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support / Complaint Modal */}
      {complaint && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form onSubmit={submitComplaint} className="w-full max-w-[420px] rounded-[26px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <b className="text-sm font-bold text-ink">Contact Karigar Support</b>
              <button type="button" onClick={() => setComplaint(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Please describe any question, delay, or price discrepancy.
            </p>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the problem in detail..."
              className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="mt-3 h-11 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
