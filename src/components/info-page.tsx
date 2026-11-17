import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { SiteHeader } from './site-header';

type Topic = 'help' | 'terms' | 'privacy';

const content: Record<Topic, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }> = {
  help: {
    eyebrow: 'HERE WHEN YOU NEED US',
    title: 'How can we help?',
    intro: 'Karigar brings customers and skilled local professionals together across Hyderabad and Jamshoro.',
    sections: [
      { title: 'Booking a professional', body: 'Search by service or describe the problem in your own words. Compare verified local profiles, choose a visit time, and share your address after a professional accepts.' },
      { title: 'Changing or cancelling a booking', body: 'Open your booking from My bookings to view its status and contact your professional. You can cancel before work begins; if a visit fee applies, it will be shown before you confirm.' },
      { title: 'For service professionals', body: 'Apply with your skills, service areas, and identity documents. Our team reviews applications before a profile is listed as verified. Keep your availability and profile details up to date.' },
      { title: 'Need a person?', body: 'For this preview, use the demo accounts to explore each role. In a live marketplace, contact support from your booking or account so we can help with the right details.' },
    ],
  },
  terms: {
    eyebrow: 'THE KARIGAR AGREEMENT',
    title: 'Terms of service',
    intro: 'These plain-language terms describe how the Karigar marketplace works for customers and service professionals.',
    sections: [
      { title: 'Marketplace role', body: 'Karigar helps customers discover and contact independent service professionals. Professionals are responsible for the quality, safety, timing, and agreed price of their work.' },
      { title: 'Bookings and estimates', body: 'A booking request is not confirmed until a professional accepts it. Visit fees and estimates are not final quotes unless the professional explicitly confirms them. Any added work or price change must be agreed with the customer before it starts.' },
      { title: 'Respectful use', body: 'Provide accurate contact and job details, keep conversations respectful, and use the marketplace only for lawful home services. We may review reports and restrict accounts that put people or the marketplace at risk.' },
      { title: 'Local availability', body: 'The preview is designed for Hyderabad and Jamshoro, Sindh. Service coverage, availability, and features may vary by neighbourhood and can change as the marketplace grows.' },
    ],
  },
  privacy: {
    eyebrow: 'YOUR INFORMATION, HANDLED WITH CARE',
    title: 'Privacy at Karigar',
    intro: 'We collect only the information needed to connect customers with local professionals and operate a safer marketplace.',
    sections: [
      { title: 'Information you share', body: 'Account details, booking descriptions, neighbourhood, messages, and reviews help us provide the service. Professionals may submit identity documents as part of verification.' },
      { title: 'Who can see what', body: 'A professional sees the booking details needed to respond. Your exact address and contact details are shared only when needed for an accepted booking. Identity documents are stored privately and are available only to authorised reviewers.' },
      { title: 'Safety and access', body: 'Karigar uses role-based access controls and private document storage. Do not include sensitive information in a public profile, review, or job description.' },
      { title: 'Your choices', body: 'You can update your profile and contact support about account information or a privacy concern. Demo mode uses sample profiles and activity so you can explore the experience.' },
    ],
  },
};

const icons = [ShieldCheck, CheckCircle2, MapPin, Clock3];

export function InfoPage({ topic, locale }: { topic: Topic; locale: string }) {
  const page = content[topic];
  return (
    <>
      <SiteHeader showBack backUrl={`/${locale}`} title={page.title} />
      <main className="min-h-[75vh] bg-[#f5f8f5] pb-20 text-ink">
        <div className="container max-w-[960px] pt-7">
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-700 transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to Karigar Home
          </Link>

          <div className="rounded-[28px] bg-gradient-to-tr from-[#123b2b] to-[#168348] px-6 py-10 text-white sm:px-10 sm:py-12 shadow-soft">
            <span className="text-[10px] font-bold tracking-[.2em] text-[#bce3c6]">{page.eyebrow}</span>
            <h1 className="display mt-2 text-3xl font-extrabold sm:text-4xl">{page.title}</h1>
            <p className="mt-3 max-w-[620px] text-xs sm:text-sm leading-6 text-white/80">{page.intro}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {page.sections.map((section, index) => {
              const Icon = icons[index];
              return (
                <article
                  key={section.title}
                  className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <h2 className="mt-4 text-sm font-bold text-ink">{section.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{section.body}</p>
                </article>
              );
            })}
          </div>

          {topic === 'help' && (
            <div className="mt-6 rounded-[24px] border border-emerald-100 bg-emerald-50/60 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-emerald-950">Looking for a home service now?</h2>
                <p className="mt-1 text-xs text-emerald-800/80">
                  Search across verified plumbers, electricians, carpenters, and AC technicians in Hyderabad.
                </p>
              </div>
              <Link
                href={`/${locale}/search`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#168348] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#12683b] transition"
              >
                Find a Local Pro
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
