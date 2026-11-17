# Karigar

Karigar is a  home-services marketplace for Hyderabad and Jamshoro, Sindh. Customers can describe a home repair in English compare verified local professionals, and request a visit. Professionals manage requests and bookings; admins review provider applications and marketplace activity.

## Run the demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The checked-in `.env.local` is intentionally ignored by Git and enables local demo sessions with sample data. The demo works without Supabase credentials; database-backed auth, booking writes, chat, private document uploads, and realtime require a configured Supabase project.

To use a different setup, copy `.env.example` to `.env.local`, set a random `SESSION_SECRET` of at least 32 characters, and configure the Supabase URL and anon key. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Set both `DEMO_MODE` and `NEXT_PUBLIC_DEMO_MODE` to `false` to hide and disable demo access.

## Supabase setup

1. Create a Supabase project and apply `supabase/migrations/0001_init.sql`.
2. Set the public project URL and anon key, plus the service-role key, in server environment variables.
3. Set `DEMO_PASSWORD` and run `npm run db:seed` to create the prebuilt demo accounts, provider profiles, bookings, reviews, messages, and private demo identity documents.
4. Add the same server environment variables in Vercel. `vercel.json` schedules demo reset and expired-request jobs; configure `CRON_SECRET` for the cron endpoints.

Seeded demo accounts use `demo.user@karigar.pk`, `demo.provider@karigar.pk`, and `demo.admin@karigar.pk`; their shared password is the configured `DEMO_PASSWORD`. In local demo mode, the three one-click role buttons also work without seeding Supabase Auth.

## AI search

`/api/ai/search` parses natural-language repair requests into a validated structured query and ranks matching professionals. It uses an optional provider selected by `AI_PROVIDER` (`openai`, `anthropic`, or `gemini`) and automatically falls back to the local English, Urdu, and Roman-Urdu keyword parser if no key is set or the model fails. Search is rate-limited in-process by default; configure Upstash REST credentials for a shared limit across serverless instances.

## App areas

- Public: landing, search, professional profiles, booking, service-professional application, help, terms, and privacy.
- Customer: bookings, booking details, chat, saved professionals, profile, addresses, and notifications.
- Professional: dashboard, incoming and active jobs, job details, earnings, messages, profile, and notifications.
- Admin: overview, provider verification, bookings, providers, customers, services, areas, reviews, complaints, payments, AI insights, and settings.
- Locales: `/en` and `/ur`; the Urdu locale sets document direction to RTL.

## Stack

Next.js App Router, TypeScript strict mode, Tailwind CSS, next-intl, Supabase (`@supabase/ssr`), Zod, React Hook Form, Lucide, Framer Motion, Leaflet, Vercel Analytics, and Vercel Speed Insights.
