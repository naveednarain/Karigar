# KARIGAR (کاریگر): Complete Project Brief
**Hyperlocal AI-powered home services marketplace · Hyderabad & Jamshoro, Sindh, Pakistan**
**Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel · Green UI · 3 roles · AI search · One-click judge demo**

> This document is the full specification of the project: what to build, how it should look and behave, the data model, the rules, and the quality bar. Two reference images accompany it.

---


## 1. Project Overview

### 1.1 What Karigar Is
**Karigar** (کاریگر, "skilled worker") is a bilingual (English + Urdu) home-services marketplace web app. Customers in **Hyderabad and Jamshoro, Sindh, Pakistan** describe a problem in their own words, find verified local professionals (plumber, electrician, AC technician, painter, carpenter, cleaner, mason, appliance repair, solar/UPS, CCTV, pest control), and book them. Skilled workers apply, get verified by an admin, receive job requests, and earn. The platform solves three local problems: **trust** (verified workers, real reviews), **price clarity** (transparent PKR estimates), and **fast discovery** (AI search that understands Urdu, Roman Urdu, and English).

### 1.2 Service Region
- **Hyderabad:** Latifabad, Qasimabad (Phases 1 and 2), Hirabad, Saddar, Autobhan, Gulistan-e-Sajjad, Heerabad, Cantt, DHA, and more (full list in Section 6)
- **Jamshoro and nearby:** Jamshoro city, Sindh University, MUET colony, LUMHS, Kotri

### 1.3 Three Roles in One App
| Role | Who | What they do |
|---|---|---|
| **User (Customer)** | Home owner, tenant, student, family | Search with AI, view profiles, book, track, chat, pay cash on service, rate |
| **Service Provider (Karigar)** | Plumber, electrician, technician, etc. | Apply and get verified, toggle availability, accept/reject jobs, update job status, chat, see earnings |
| **Admin** | Karigar operations team | Verify providers, monitor bookings and zones, manage catalog and prices, moderate reviews, resolve complaints |

### 1.4 Core Requirements
1. **Fixed stack:** Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Storage, Realtime, RLS), deployed on **Vercel**. No other backend.
2. **Three role-based experiences** inside one app, protected by middleware and database row-level security.
3. **Bilingual:** English and Urdu with full **RTL** layout when Urdu is selected. Language switcher always visible.
4. **AI-powered search** that parses natural text or voice in English, Urdu, or Roman Urdu into structured filters, then ranks providers. It must **fall back to a rule-based parser** when no AI key exists or the AI call fails, so search never breaks.
5. **One-click judge demo login** for all three roles (no typing, passwords, or OTP) with richly pre-seeded data on every screen.
6. **Fast by design:** Lighthouse mobile Performance ≥ 95, LCP < 2s, CLS < 0.05, small JS per route (details in Section 10).
7. **Top-quality UI/UX:** green brand, consistent 8px grid, 20px card radius, soft shadows, WCAG AA contrast, 44px tap targets, micro-interactions, skeleton loaders, empty and error states, toasts, mobile-first (verify at 360px) and polished on desktop.
8. **Secure:** RLS on every table, private bucket for identity documents, service-role key only on the server, zod validation on every API route, rate limiting on the AI endpoint.
9. **Clean, typed, production-ready code** that runs with `npm i && npm run dev` and deploys to Vercel without changes.
10. **Full feature set:** maps with live provider tracking, realtime chat, in-app and push notifications (Sections 5.4 to 5.6), and AI features beyond search (Section 9.6).

### 1.5 Reference Images
Two reference images accompany this brief.
- **Image 1 (web landing page):** layout and visual language for the customer landing page. Recolor from blue to green.
- **Image 2 (native mobile app, food-delivery content):** reference for the **mobile layout and component style only** (dashboard, pastel stat cards, tabs, Accept/Reject cards, route card, chat bubbles, rating screen, notifications, bottom tab bar). Karigar is a **responsive web app**, so on tablet and desktop this style must be adapted to sidebar, multi-column, drawers, and modals. Ignore the food/delivery content, the phone frame, and the status bar. Full translation rules are in Section 4.4.

### 1.6 Success Metrics
Booking completion rate above 80%, provider response time under 10 minutes, average rating at or above 4.3, AI search click-through above 85%, and a Lighthouse score of 95 or higher on mobile.

### 1.7 Out of Scope for This Version
Native mobile apps, online payment gateways (cash on service only; JazzCash/Easypaisa can be added later), Sindhi language, and photo-based AI diagnosis. The code should leave clean extension points for these.

---

## 2. Business Rules & Workflows

### 2.1 Booking Lifecycle
| From | To | Triggered by | Rule |
|---|---|---|---|
| (new) | `requested` | Customer | Provider must be approved; request goes to the chosen provider |
| `requested` | `accepted` | Provider | Must respond within **10 minutes**; chat opens |
| `requested` | `rejected` | Provider | Customer is notified and offered the next best matches |
| `requested` | `cancelled` | Customer | Free cancellation any time before acceptance |
| `requested` | expired → `rejected` | System | Auto-expire after 10 minutes without response, notify customer |
| `accepted` | `on_the_way` | Provider | One-tap button; customer sees live status |
| `on_the_way` | `arrived` | Provider | |
| `arrived` | `in_progress` | Provider | |
| `in_progress` | `completed` | Provider | Provider enters the final price; commission is calculated; customer can now review |
| `accepted` | `cancelled` | Customer or Provider | Allowed before `on_the_way` with a reason; provider cancellations count against reliability |
| any active | `disputed` | Customer or Admin | Creates a complaint; admin resolves |

Every transition writes a `booking_events` row and sends a notification to the other party.

### 2.2 Pricing and Payment
- Cash on service. Show an **estimated price** from the provider's visit fee and the service's typical range; final price is entered by the provider at completion.
- **Extra charges** (parts, extra work) are added by the provider and must be **approved by the customer** in the app before being included.
- **Commission:** default 10% of `final_price` (configurable per service by admin), stored on the booking at completion.
- Currency is PKR, formatted like `Rs 1,200`.

### 2.3 Provider Verification
Status flow: `draft → pending → approved | rejected → suspended`.
- Required: name, phone, photo, skills, areas, price info, CNIC image (front and back) in the **private documents bucket**; only the **last 4 digits** of the CNIC are stored in the table.
- Optional: skill certificate, police character certificate, work photos.
- Only providers with `approved` status are visible in search and bookable. Rejections show the admin's reason to the provider so they can fix and resubmit.
- Admin approval grants the **Verified** badge.

### 2.4 Search Ranking (explainable)
Score out of 100 for each approved provider matching the parsed service:
| Factor | Weight |
|---|---|
| Available now (online toggle) | 25 |
| Area match (same area = full, same city = half) | 25 |
| Rating (average, adjusted for review count) | 20 |
| Distance (if coordinates exist) | 10 |
| Response time | 10 |
| Jobs completed | 10 |
Show a one-line reason on top results ("Nearby · 4.9★ · replies in 5 min").

### 2.5 Reviews
One review per completed booking, written only by the customer of that booking. Ratings update the provider's average and count automatically. Admin can hide abusive reviews.

### 2.6 Chat and Notifications
- Chat is available only between the two parties of an **accepted** booking (text and images), in real time.
- Notification events: new request, accepted, rejected, on the way, arrived, completed (rate now), extra charge needs approval, application approved/rejected, new complaint (admin). Unread count shown on the bell.

### 2.7 Permissions Matrix
| Capability | User | Provider | Admin |
|---|---|---|---|
| Browse and AI search | ✔ | ✔ | ✔ |
| Create booking | ✔ | – | – |
| Accept/reject/update job status | – | ✔ (own jobs) | ✔ |
| Edit own profile, addresses | ✔ | ✔ | ✔ |
| Manage availability, prices, areas | – | ✔ (own) | ✔ |
| View CNIC documents | – | own only | ✔ |
| Approve/suspend providers, block users | – | – | ✔ |
| Manage catalog, areas, commission, banners | – | – | ✔ |
| Moderate reviews, resolve complaints | – | – | ✔ |

---

## 3. Final Tech Stack (all of it)

| Area | Technology | Notes |
|---|---|---|
| Framework | **Next.js 14/15 (App Router)** + **TypeScript** | RSC, Server Actions, Route Handlers, Middleware |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix) | Green theme tokens |
| Icons / Motion | **Lucide**, **Framer Motion** (sparingly) | Keep bundle small |
| Fonts | `next/font`: **Poppins** (headings), **Inter** (body), **Noto Naskh Arabic** (Urdu) | Self-hosted, no layout shift |
| i18n | **next-intl** | `en`, `ur` (RTL); `sd` later |
| Forms | **react-hook-form** + **zod** | Shared schemas client/server |
| Data / Auth | **Supabase**: Postgres, Auth, Storage, Realtime, RLS | `@supabase/ssr`, `@supabase/supabase-js` |
| Vector search | **pgvector** (Supabase extension) | Provider embeddings (optional, with keyword fallback) |
| AI parsing | **LLM API**: Claude `claude-haiku-5-5`, OpenAI `gpt-4o-mini`, or Gemini Flash, swappable via `AI_PROVIDER` | Target < 500ms; fallback: rule-based parser (never fails) |
| Maps | **Leaflet + OpenStreetMap** (dynamic import, no API key) + **OSRM** routing | Address pin, route line, ETA, live provider tracking (Section 5.4) |
| Charts | **Recharts** (dynamic import, admin only) | |
| Tables | **TanStack Table** | Admin lists |
| State / cache | **TanStack Query** (only where needed) | Prefer server data |
| PWA | **@ducanh2912/next-pwa** or manual manifest | Installable on Android |
| Toasts | **sonner** | |
| Dates | **date-fns** | |
| Rate limit | **@upstash/ratelimit** + Upstash Redis (free) or in-memory fallback | AI endpoint |
| Analytics | **Vercel Analytics** + **Speed Insights** | Shows performance to judges |
| Hosting | **Vercel** (Hobby/Pro) | Edge CDN, preview deploys |
| Cron | **Vercel Cron** | Nightly demo-data reset |
| Testing | **Playwright** (smoke tests for 3 demo logins), **Vitest** (utils) | Optional but impressive |
| Lint | ESLint + Prettier | |

### Environment variables (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only, never expose

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true          # shows demo banner + buttons
DEMO_MODE=true                      # enables /api/demo-login on the server
DEMO_PASSWORD=Demo@12345            # used server-side only
CRON_SECRET=change-me               # protects /api/cron/*

# AI search (optional; app works without them via fallback parser)
AI_PROVIDER=anthropic               # anthropic | openai | gemini | none
ANTHROPIC_API_KEY=
OPENAI_API_KEY=                     # e.g. gpt-4o-mini
GEMINI_API_KEY=                     # e.g. Gemini Flash (cheap + fast)

# Rate limit (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Web push notifications (optional; in-app notifications always work)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# AI feature flags (comma-separated; each feature has a non-AI fallback)
AI_FEATURES=search,describe,price,assistant,review_summary,bio
```

---

## 4. Brand & Design System

### 4.1 Colors
| Token | Hex | Use |
|---|---|---|
| `brand-900` | `#0B3D2E` | Dark sections, footer, headings |
| `brand-700` | `#14804A` | Hover/active |
| `brand-600` | `#16A34A` | **Primary** buttons/links |
| `brand-500` | `#22C55E` | Success / online dot |
| `brand-100` | `#DCFCE7` | Chips, soft fills |
| `brand-50` | `#F0FDF4` | Section backgrounds |
| `accent-yellow` | `#FACC15` | Stars, badges, highlights |
| `accent-orange` | `#F97316` | Pending/warning |
| `danger` | `#EF4444` | Reject/cancel/error |
| `info` | `#3B82F6` | Info cards |
| `ink` | `#111827` / `muted` `#6B7280` | Text |

### 4.2 Tokens
- Radius: card `20px`, button `14px`, chip `999px`, input `12px`
- Shadows: `0 8px 30px rgba(11,61,46,.08)` for cards
- Spacing: 8px grid · Max content width `1200px`
- Hero: deep green gradient (`#0B3D2E → #16A34A`) with soft cloud/leaf shapes, bold headline, search card floating over it (as in reference image 1, recolored green)
- Section rhythm: white → `brand-50` → white; wavy yellow divider optional for the category pills row
- Buttons: solid green, white text; secondary = outline green; destructive = red
- Provider dashboard stat cards: pastel tinted (pink, mint, peach, light blue) like reference image 2, with round icon badges

### 4.3 UX principles
- Search is the hero: one input, big, with voice mic and example chips
- Max 3 steps to book; show progress
- Provider UI is **big-button, low-text**, with Urdu support, because many workers are not tech-savvy
- Every list has: skeleton → data → empty state → error state
- Sticky bottom action bars on mobile (Book Now, Accept/Reject)
- WhatsApp + Call buttons on every provider card

---

### 4.4 Reference Images: How to Translate Them into a Responsive Web App

**Image 1 (web landing page)** is used directly. Keep: bold hero headline with the search card inside the hero, a **trust pill** above the headline, a **fan of 5 curved portrait cards** of smiling workers in green uniforms holding tools, white **rounded-top sections (`rounded-t-[32px]`) overlapping the hero**, "Popular services" photo cards with **frosted white pill labels** plus one customer quote and a "View all services" outline button, "Book in 3 steps" (01, 02, 03), "Why choose us" with soft pastel icon badges (orange, purple, green), a **scalloped/wavy strip of colorful category pills**, and a "Meet local experts" row of circular portraits.

**Image 2 (native mobile app)** is a style and mobile-layout reference only. Take the card styles, pastel stat tiles, tabs, Accept/Reject buttons, route card, chat bubbles, rating screen, and notification list. Ignore its food-delivery content, the phone frame, and the status bar.

| Breakpoint | Provider / User / Admin layout |
|---|---|
| **Mobile < 768px** (copy Image 2 closely) | Single column, **bottom tab bar**, large cards, sticky bottom action bar (Accept/Reject, Book Now), full-screen sheets for chat, rating, and filters, pull-friendly lists |
| **Tablet 768–1023px** | Two columns, bottom tabs become a slim **left icon rail**, stat cards 2x2 |
| **Desktop ≥ 1024px** | **Left sidebar** navigation, top bar (page title, availability toggle, notification bell, language switch, profile), the 4 pastel stat cards in **one row**, main area split in two: job list on the left, selected-job detail with route map and customer card on the right, chat as a **right-side drawer**, rating as a **centered modal**, data tables for admin |

Web-only upgrades Image 2 does not have: hover and focus states, keyboard navigation, URLs for every screen (shareable and back-button friendly), desktop tables with sorting and search, and toasts instead of native alerts.

**Pastel stat card colors (provider dashboard):**
| Card | Background | Icon badge |
|---|---|---|
| Current jobs | `#FCE7F3` (soft pink) | `#EC4899` |
| Completed jobs | `#DCFCE7` (soft mint) | `#16A34A` |
| Pending requests | `#FEF3C7` (soft amber) | `#F59E0B` |
| Monthly earnings (PKR) | `#DBEAFE` (soft blue) | `#3B82F6` |

**Image rules (no broken images, fast pages):** never hotlink. Use curated local images in `/public/demo` (or Supabase Storage), consistent worker portraits in green uniforms, initials-avatar fallback when a photo is missing, and blur placeholders. Use only licensed, generated, or self-made images.

**Honest copy:** avoid invented statistics ("5,000+ happy customers") on a platform that has just launched. Use "Verified local pros in Hyderabad & Jamshoro", or show real counts pulled from the database.

---

## 5. Pages & Features by Role


### 5.1 Public / USER
| Route | Content |
|---|---|
| `/` | Hero + AI search, popular services, Book in 3 steps, Why Karigar, category pills, Meet local experts, testimonials, Join as Pro banner, FAQ, footer |
| `/search` | AI summary chip (editable), filters (rating, price, distance, available now, verified), sort, provider cards |
| `/provider/[id]` | Profile, services & prices, gallery, reviews, areas, sticky Book button |
| `/book/[providerId]` | 3-step booking: details+photos → date/time/address(map pin) → review & confirm |
| `/account/bookings` | Tabs Upcoming / In progress / Completed / Cancelled, status timeline |
| `/account/bookings/[id]` | Timeline, provider on map, chat, call, cancel, rate |
| `/chat/[bookingId]` | Realtime chat with image share |
| `/account/notifications`, `/account/profile`, `/account/addresses` | |
| `/login`, `/signup` | **Demo buttons** + email/password + phone OTP |
| `/help`, `/terms`, `/privacy` | |

### 5.2 PROVIDER
| Route | Content |
|---|---|
| `/join` | Multi-step application: account → basic info → skills → areas → CNIC/docs upload → work photos → pricing → submit |
| `/provider/dashboard` | Availability toggle, 4 stat cards, new job request cards (Accept/Reject with countdown), today's schedule |
| `/provider/jobs` | Tabs Current / Active / Completed |
| `/provider/jobs/[id]` | Customer info, problem+photos, map route, Call/Chat, one-tap status buttons (On the way → Arrived → Started → Completed), add extra charges |
| `/provider/earnings` | Day/week/month totals, commission, payout history, chart |
| `/provider/reviews`, `/provider/profile`, `/provider/notifications` | |
| Bottom tab bar (mobile): Dashboard · Jobs · Chat · Profile | |

### 5.3 ADMIN
| Route | Content |
|---|---|
| `/admin` | KPI cards, bookings/day chart, bookings by service & by area (Hyderabad vs Jamshoro), top providers, pending items |
| `/admin/verification` | Queue; view CNIC and photos; approve / reject with reason |
| `/admin/providers`, `/admin/users` | Search, filter, suspend/block |
| `/admin/bookings` | All bookings, filters, reassign, cancel, dispute resolve |
| `/admin/services`, `/admin/areas` | CRUD with Urdu names, icons, price ranges |
| `/admin/reviews` | Moderate/hide |
| `/admin/complaints` | Tickets, assign, notes, status |
| `/admin/payments` | Commission %, cash-collection report, payouts |
| `/admin/ai-insights` | Top searches, failed/unclear queries, unmet demand by area |
| `/admin/settings` | Banners, FAQs, roles, audit log |

### 5.4 Maps & Live Tracking (Leaflet + OpenStreetMap)

**Library and loading:** `leaflet` + `react-leaflet`, loaded with `next/dynamic` (`ssr: false`) only when the map scrolls into view; show a skeleton until ready. Tiles from OpenStreetMap for development and demo; for heavy production traffic use a tile provider with a free tier (MapTiler, Stadia) because the public OSM tile servers have a fair-use policy.

**Where maps appear**
| Screen | Map behavior |
|---|---|
| Booking step 2 (address) | Draggable pin, "Use my current location" button (Geolocation API), area dropdown auto-selected from the nearest area, manual address text field, saved addresses |
| Customer booking detail | Customer pin + provider marker, ETA and distance once status is `on_the_way`, live marker movement |
| Provider job detail | Customer pin, provider pin, **green route polyline**, distance (e.g. "Approx: 3.2 km") and ETA, "Open in Google Maps" deep link for turn-by-turn navigation |
| Provider profile | Coverage areas shown as chips and an optional light map with area markers |
| Admin dashboard | Zone demand map: circle markers sized by bookings per area (Hyderabad vs Jamshoro), plus a table fallback |

**Routing and distance**
- Route polyline, distance, and ETA from the **OSRM** public routing API (driving profile), cached per booking, with a timeout of 3 seconds.
- Fallback when routing fails or coordinates are missing: straight line + **Haversine** distance and an average-speed ETA; if an area has no coordinates, use the area centroid or same-city matching.
- Reverse geocoding is optional and must be debounced, cached, and rate-limited (public Nominatim allows about 1 request per second); the app must work without it by using the area dropdown and a manual address.

**Live provider tracking (only while a job is active)**
1. When the provider taps **On the way**, the browser asks for location permission and shows a visible "Sharing location" indicator.
2. `navigator.geolocation.watchPosition` sends the position to `/api/tracking` at most **every 10 seconds** (throttled, pauses when the tab is hidden), which upserts one row per booking.
3. The customer's booking detail subscribes to that row with Supabase Realtime and animates the marker smoothly between points.
4. Sharing stops automatically at `arrived` or `completed`/`cancelled`, and the row is deleted on completion. Location is never visible outside the two booking parties and admin.
5. **Demo mode:** if no real GPS movement is detected, simulate the provider moving along the route polyline so judges see live tracking without anyone moving.

```sql
-- Live tracking + distance helper (add to the migration)
create table provider_locations (
  booking_id uuid primary key references bookings(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading real,
  updated_at timestamptz default now()
);
alter table provider_locations enable row level security;

create policy "loc provider write" on provider_locations for insert
  with check (provider_id = auth.uid());
create policy "loc provider update" on provider_locations for update
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());
create policy "loc parties read" on provider_locations for select
  using (exists (select 1 from bookings b where b.id = booking_id
         and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "loc provider delete" on provider_locations for delete
  using (provider_id = auth.uid() or is_admin());

alter publication supabase_realtime add table provider_locations;

create or replace function distance_km(lat1 float8, lon1 float8, lat2 float8, lon2 float8)
returns float8 language sql immutable as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)));
$$;
```

### 5.5 Realtime Chat

- **Scope:** one thread per booking, available once the booking is `accepted`; read-only 7 days after completion. Entry points: booking detail, provider job detail, and a Chat tab/list showing all threads with last message and unread count.
- **Transport:** Supabase Realtime `postgres_changes` on `messages` filtered by `booking_id`; subscribe only while the thread is open and unsubscribe on unmount.
- **UI (matches the reference):** green outgoing bubbles, grey incoming bubbles, timestamps, date separators, auto-scroll to latest, header with name, avatar, online dot, **Call** (`tel:`) and **WhatsApp** (`wa.me`) buttons; on desktop it opens as a right-side drawer, on mobile as a full-screen view.
- **Features:** text (max 1000 characters), **image attachments** (upload to `booking-photos`, signed URLs, max 5 MB), **optimistic send** with sending/failed/retry states, **read receipts**, **typing indicator** (Realtime broadcast), **quick replies** in English and Urdu (e.g. "I'm on my way", "Please share your location", "Can you send a photo?"), report-message button.
- **Demo data:** two seeded conversations per demo account so chat looks alive immediately.

```sql
-- Read receipts (add to the migration)
alter table messages add column read_at timestamptz;
create policy "msg mark read" on messages for update
  using (sender_id <> auth.uid() and exists (select 1 from bookings b where b.id = booking_id
         and (b.user_id = auth.uid() or b.provider_id = auth.uid())))
  with check (sender_id <> auth.uid());
```

### 5.6 Notifications

- **In-app (always on):** `notifications` table + Realtime subscription drives a bell with unread count and a notification page (like the reference's notification list: title, time, "New" tag). Created by a database trigger or server action on every booking status change, application decision, new message while the other party is away, and new complaint.
- **Web push (optional, via PWA):** service worker + Web Push API with VAPID keys; users and providers can enable it from a banner or settings; subscriptions are stored per user. Use it for new job requests, acceptance, "provider on the way", and "rate your job".
- **Optional channels:** WhatsApp/SMS for provider job alerts can be added behind a provider-agnostic `sendAlert()` function; email is optional.
- **Rules:** never put sensitive data in push text; group repeated chat messages; respect quiet hours for non-urgent alerts.

```sql
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
create policy "push own" on push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

---

## 6. Database: Complete Supabase SQL

> Run in Supabase SQL Editor (or as `supabase/migrations/0001_init.sql`).

```sql
-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists vector;
create extension if not exists pg_trgm;

-- Enums
create type user_role as enum ('user','provider','admin');
create type provider_status as enum ('draft','pending','approved','rejected','suspended');
create type booking_status as enum
  ('requested','accepted','on_the_way','arrived','in_progress','completed','cancelled','rejected','disputed');
create type urgency_level as enum ('emergency','today','scheduled','flexible');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  full_name text,
  phone text,
  avatar_url text,
  language text default 'en',
  is_blocked boolean default false,
  is_demo boolean default false,
  created_at timestamptz default now()
);

-- Catalog
create table services (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_ur text not null,
  icon text,
  image_url text,
  min_price int,
  max_price int,
  sort_order int default 0,
  is_active boolean default true
);

create table sub_services (
  id serial primary key,
  service_id int references services(id) on delete cascade,
  name_en text not null,
  name_ur text
);

create table areas (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_ur text,
  city text not null check (city in ('Hyderabad','Jamshoro','Kotri')),
  lat double precision,
  lng double precision,
  is_active boolean default true
);

-- Providers
create table providers (
  id uuid primary key references profiles(id) on delete cascade,
  headline text,
  skill_title text,                    -- e.g. 'AC & Electrical Specialist'
  bio text,
  experience_years int default 0,
  cnic_last4 text,                     -- store ONLY the last 4 digits; full CNIC images stay in the private bucket
  cnic_front_path text,
  cnic_back_path text,
  certificate_path text,
  status provider_status default 'draft',
  rejection_reason text,
  is_available boolean default false,
  is_verified boolean default false,
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  jobs_completed int default 0,
  response_minutes int default 15,
  visit_fee int default 0,
  hourly_rate int,
  total_km_travelled int default 0,
  lat double precision,
  lng double precision,
  whatsapp text,
  embedding vector(384),
  created_at timestamptz default now()
);

create table provider_services (
  provider_id uuid references providers(id) on delete cascade,
  service_id int references services(id) on delete cascade,
  starting_price int,
  price_note text,
  primary key (provider_id, service_id)
);

create table provider_areas (
  provider_id uuid references providers(id) on delete cascade,
  area_id int references areas(id) on delete cascade,
  primary key (provider_id, area_id)
);

create table provider_gallery (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

-- Customers' addresses
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  label text default 'Home',
  area_id int references areas(id),
  full_address text not null,
  lat double precision,
  lng double precision,
  is_default boolean default false
);

-- Bookings
create sequence booking_code_seq start 2041;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique default ('KRG-' || nextval('booking_code_seq')),   -- e.g. KRG-2041
  user_id uuid references profiles(id),
  provider_id uuid references providers(id),
  service_id int references services(id),
  sub_service_id int references sub_services(id),
  address_id uuid references addresses(id),
  description text,
  photos text[] default '{}',
  urgency urgency_level default 'scheduled',
  distance_km numeric(4,1),            -- shown as 'Approx: 3.2 km' on job cards
  scheduled_at timestamptz,
  status booking_status default 'requested',
  estimated_price int,
  final_price int,
  commission int default 0,
  payment_method text default 'cash',
  payment_status text default 'unpaid',
  cancel_reason text,
  created_at timestamptz default now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

create table booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  status booking_status not null,
  note text,
  created_at timestamptz default now()
);

create table booking_extras (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  title text not null,
  amount int not null,
  approved boolean default false
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references bookings(id) on delete cascade,
  user_id uuid references profiles(id),
  provider_id uuid references providers(id),
  rating int check (rating between 1 and 5) not null,
  comment text,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text,
  image_url text,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table complaints (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  raised_by uuid references profiles(id),
  reason text not null,
  status text default 'open' check (status in ('open','in_review','resolved')),
  admin_notes text,
  created_at timestamptz default now()
);

create table search_logs (
  id bigserial primary key,
  user_id uuid,
  query text,
  parsed jsonb,
  results_count int,
  used_ai boolean default false,
  created_at timestamptz default now()
);

create table audit_logs (
  id bigserial primary key,
  admin_id uuid,
  action text,
  target text,
  created_at timestamptz default now()
);

create table settings (
  key text primary key,
  value jsonb
);

-- Indexes (speed)
create index on providers (status, is_available, rating_avg desc);
create index on provider_services (service_id);
create index on provider_areas (area_id);
create index on bookings (user_id, status, created_at desc);
create index on bookings (provider_id, status, created_at desc);
create index on messages (booking_id, created_at);
create index on notifications (user_id, is_read, created_at desc);
create index on reviews (provider_id, created_at desc);
create index on search_logs using gin (to_tsvector('simple', query));
create index on profiles using gin (full_name gin_trgm_ops);

-- Helper functions
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          new.phone,
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function handle_new_user();

-- Keep provider rating fresh
create or replace function refresh_provider_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update providers p set
    rating_avg = coalesce((select round(avg(rating)::numeric,1) from reviews where provider_id = p.id and not is_hidden),0),
    rating_count = (select count(*) from reviews where provider_id = p.id and not is_hidden)
  where p.id = coalesce(new.provider_id, old.provider_id);
  return null;
end $$;

create trigger trg_review_rating
after insert or update or delete on reviews
for each row execute function refresh_provider_rating();

-- ============ ROW LEVEL SECURITY ============
alter table profiles          enable row level security;
alter table services          enable row level security;
alter table sub_services      enable row level security;
alter table areas             enable row level security;
alter table providers         enable row level security;
alter table provider_services enable row level security;
alter table provider_areas    enable row level security;
alter table provider_gallery  enable row level security;
alter table addresses         enable row level security;
alter table bookings          enable row level security;
alter table booking_events    enable row level security;
alter table booking_extras    enable row level security;
alter table reviews           enable row level security;
alter table messages          enable row level security;
alter table notifications     enable row level security;
alter table complaints        enable row level security;
alter table search_logs       enable row level security;
alter table audit_logs        enable row level security;
alter table settings          enable row level security;

-- Public catalog (read), admin write
create policy "catalog read" on services for select using (true);
create policy "catalog admin" on services for all using (is_admin()) with check (is_admin());
create policy "sub read" on sub_services for select using (true);
create policy "sub admin" on sub_services for all using (is_admin()) with check (is_admin());
create policy "areas read" on areas for select using (true);
create policy "areas admin" on areas for all using (is_admin()) with check (is_admin());

-- Profiles
create policy "own profile read" on profiles for select using (id = auth.uid() or is_admin());
create policy "public provider names" on profiles for select
  using (exists (select 1 from providers pr where pr.id = profiles.id and pr.status = 'approved'));
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "admin profiles" on profiles for all using (is_admin()) with check (is_admin());

-- Providers: approved are public; owner and admin full
create policy "providers public" on providers for select using (status = 'approved' or id = auth.uid() or is_admin());
create policy "providers owner write" on providers for insert with check (id = auth.uid());
create policy "providers owner update" on providers for update using (id = auth.uid()) with check (id = auth.uid());
create policy "providers admin" on providers for all using (is_admin()) with check (is_admin());

create policy "ps read" on provider_services for select using (true);
create policy "ps owner" on provider_services for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "pa read" on provider_areas for select using (true);
create policy "pa owner" on provider_areas for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "pg read" on provider_gallery for select using (true);
create policy "pg owner" on provider_gallery for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());

-- Addresses
create policy "addr own" on addresses for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

-- Bookings
create policy "bookings parties read" on bookings for select
  using (user_id = auth.uid() or provider_id = auth.uid() or is_admin());
create policy "bookings user create" on bookings for insert with check (user_id = auth.uid());
create policy "bookings parties update" on bookings for update
  using (user_id = auth.uid() or provider_id = auth.uid() or is_admin());

create policy "events read" on booking_events for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "events insert" on booking_events for insert
  with check (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));

create policy "extras parties" on booking_extras for all
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())))
  with check (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));

-- Reviews
create policy "reviews read" on reviews for select using (not is_hidden or is_admin());
create policy "reviews create" on reviews for insert
  with check (user_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid() and b.status = 'completed'));
create policy "reviews admin" on reviews for update using (is_admin());

-- Messages (only booking parties)
create policy "msg read" on messages for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "msg send" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid())));

-- Notifications
create policy "notif own" on notifications for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

-- Complaints
create policy "complaints own" on complaints for select using (raised_by = auth.uid() or is_admin());
create policy "complaints create" on complaints for insert with check (raised_by = auth.uid());
create policy "complaints admin" on complaints for update using (is_admin());

-- Logs and settings
create policy "search log insert" on search_logs for insert with check (true);
create policy "search log admin" on search_logs for select using (is_admin());
create policy "audit admin" on audit_logs for all using (is_admin()) with check (is_admin());
create policy "settings read" on settings for select using (true);
create policy "settings admin" on settings for all using (is_admin()) with check (is_admin());

-- Realtime
alter publication supabase_realtime add table messages, bookings, notifications;
```

### Storage buckets (create in Supabase Dashboard → Storage)
| Bucket | Public | Use |
|---|---|---|
| `avatars` | yes | Profile photos |
| `gallery` | yes | Provider work photos |
| `booking-photos` | no (signed URLs) | Customer problem photos |
| `documents` | **no** (admin + owner only) | CNIC, certificates |

### Seed data (catalog) to include in `supabase/seed.sql`
```sql
insert into services (slug,name_en,name_ur,icon,min_price,max_price,sort_order) values
('plumbing','Plumbing','پلمبر','wrench',700,5000,1),
('electrical','Electrical','الیکٹریشن','zap',600,6000,2),
('ac_service','AC Service','اے سی سروس','snowflake',1200,15000,3),
('painting','Painting','رنگ و روغن','paintbrush',1500,60000,4),
('carpentry','Carpentry','کارپینٹر','hammer',800,20000,5),
('cleaning','Cleaning','صفائی','sparkles',1500,12000,6),
('mason','Mason / Tiles','راج مستری','brick-wall',2000,50000,7),
('appliance_repair','Appliance Repair','ایپلائنس','washing-machine',1000,8000,8),
('solar','Solar','سولر','sun',2000,100000,9),
('cctv','CCTV & Internet','سی سی ٹی وی','camera',1500,40000,10),
('pest_control','Pest Control','کیڑے مار','bug',2500,10000,11);

insert into areas (slug,name_en,name_ur,city,lat,lng) values
('latifabad','Latifabad','لطیف آباد','Hyderabad',25.3792,68.3683),
('qasimabad','Qasimabad','قاسم آباد','Hyderabad',25.4194,68.3195),
('hirabad','Hirabad','حیرآباد','Hyderabad',25.3925,68.3578),
('saddar','Saddar','صدر','Hyderabad',25.3920,68.3730),
('autobhan','Autobhan','آٹوبھان','Hyderabad',25.3510,68.3400),
('gulistan_e_sajjad','Gulistan-e-Sajjad','گلستان سجاد','Hyderabad',25.4120,68.3500),
('heerabad','Heerabad','ہیرآباد','Hyderabad',25.3990,68.3640),
('cantt','Hyderabad Cantt','حیدرآباد کینٹ','Hyderabad',25.3680,68.3650),
('jamshoro','Jamshoro City','جامشورو','Jamshoro',25.4296,68.2800),
('sindh_university','Sindh University','سندھ یونیورسٹی','Jamshoro',25.4170,68.2620),
('muet','MUET Colony','مہران یونیورسٹی','Jamshoro',25.4100,68.2630),
('lumhs','LUMHS','لمحس','Jamshoro',25.4130,68.2700),
('kotri','Kotri','کوٹری','Kotri',25.3650,68.3080),
-- Extra hyperlocal zones (lat/lng left null: ranking falls back to same-area / same-city match;
-- fill them later using the map pin). Verify names with local residents before launch.
('qasimabad_phase2','Qasimabad Phase 2','قاسم آباد فیز 2','Hyderabad',null,null),
('naseem_nagar','Naseem Nagar','نسیم نگر','Hyderabad',null,null),
('citizen_colony','Citizen Colony','سٹیزن کالونی','Hyderabad',null,null),
('abdullah_sports_city','Abdullah Sports City','عبداللہ اسپورٹس سٹی','Hyderabad',null,null),
('dha_hyderabad','DHA Hyderabad','ڈی ایچ اے حیدرآباد','Hyderabad',null,null),
('tilak_incline','Tilak Incline','تلک انکلائن','Hyderabad',null,null),
('phuleli','Phuleli','پھلیلی','Hyderabad',null,null),
('kohsar','Kohsar','کوہسار','Hyderabad',null,null),
('gulshan_e_zia','Gulshan-e-Zia','گلشن ضیاء','Hyderabad',null,null),
('jamshoro_phase2','Jamshoro Phase 2','جامشورو فیز 2','Jamshoro',null,null),
('kotri_site','Kotri SITE','کوٹری سائٹ','Kotri',null,null),
('sikandarabad','Sikandarabad','سکندرآباد','Kotri',null,null);
```
*(Coordinates are approximate and only used for rough distance ranking. Areas with null coordinates are matched by area/city. Starting visit prices are typical PKR estimates, e.g. AC visit Rs 1,200 with gas/service from Rs 2,500, plumber Rs 700–1,800, electrician Rs 600–1,500; all editable by admin.)*

---

## 7. Folder Structure

```
karigar/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                # fonts, dir=rtl for ur, providers
│   │   ├── page.tsx                  # landing
│   │   ├── (public)/search/page.tsx
│   │   ├── (public)/provider/[id]/page.tsx
│   │   ├── (auth)/login/page.tsx     # demo buttons + forms
│   │   ├── (auth)/signup/page.tsx
│   │   ├── (user)/book/[providerId]/page.tsx
│   │   ├── (user)/account/...        # bookings, profile, addresses
│   │   ├── (user)/chat/[bookingId]/page.tsx
│   │   ├── (provider)/join/page.tsx
│   │   ├── (provider)/provider/...   # dashboard, jobs, earnings, profile
│   │   └── (admin)/admin/...         # dashboard, verification, users...
│   └── api/
│       ├── ai/{search,describe,price,assistant,review-summary,bio}/route.ts
│       ├── push/subscribe/route.ts
│       ├── tracking/route.ts
│       ├── demo-login/route.ts
│       ├── cron/reset-demo/route.ts
│       ├── bookings/route.ts
│       └── bookings/[id]/status/route.ts
├── components/
│   ├── ui/                           # shadcn
│   ├── layout/                       # Header, Footer, BottomTabs, DemoBanner, LangSwitch
│   ├── search/                       # AISearchBar, VoiceButton, ParsedChip, ProviderCard
│   ├── booking/                      # Stepper, SlotPicker, StatusTimeline
│   ├── map/                          # LeafletMap, AddressPicker, RouteMap, LiveTrackingMarker, ZoneDemandMap
│   ├── chat/                         # ChatThread, MessageBubble, QuickReplies, TypingIndicator
│   ├── ai/                           # AssistantWidget, DescribeHelper, PriceEstimate, AIBadge
│   ├── provider/                     # StatCard, JobRequestCard, AvailabilityToggle
│   └── admin/                        # KpiCard, DataTable, Charts, VerifyDrawer
├── lib/
│   ├── supabase/{client,server,admin,middleware}.ts
│   ├── ai/{parse.ts,fallback.ts,rank.ts,prompt.ts}
│   ├── validators/                   # zod schemas
│   ├── demo/accounts.ts
│   └── utils.ts
├── messages/{en.json,ur.json}
├── supabase/{migrations/0001_init.sql, seed.sql}
├── scripts/seed-demo.ts              # creates demo auth users + data (service role)
├── middleware.ts                     # locale + role guard
├── tailwind.config.ts · next.config.mjs · vercel.json
└── tests/e2e/demo-login.spec.ts
```

---

## 8. ONE-CLICK JUDGE DEMO LOGIN (must-have)

### 8.1 Goal
A judge opens the site, clicks one button, and is inside as that role with a fully populated account. No OTP, no password typing, no signup.

### 8.2 Demo accounts (created by the seed script)
| Role | Email | Display name | Notes |
|---|---|---|---|
| Customer | `demo.user@karigar.pk` | Ayesha Khan (Qasimabad, Hyderabad) | Has 6 bookings in all states, 2 chats, notifications |
| Provider | `demo.provider@karigar.pk` | Ustad Bilal Ahmed, AC & Electrical Specialist, Latifabad (Approved, Online) | 3 new requests, 12 completed jobs, earnings chart |
| Admin | `demo.admin@karigar.pk` | Karigar Ops Lead (Hyderabad & Jamshoro HQ) | 4 pending verifications, 2 open complaints, full KPIs |

Password for all (server-side only): value of `DEMO_PASSWORD`.

### 8.3 UX
- `/login` top section: **"Judge / Demo Access"** card with three large buttons (green, with icons): **Demo as Customer · Demo as Service Provider · Demo as Admin**.
- Same three buttons in a header dropdown "Try Demo" on every public page.
- A subtle **floating "Judge Demo" pill** (bottom-corner, collapsible) on every screen after login with three role icons, so judges can jump between Customer, Provider, and Admin in one click without hunting for menus. On mobile it sits above the bottom tab bar.
- After login, redirect to the right home (`/`, `/provider/dashboard`, `/admin`).
- A slim **"Demo mode · data resets nightly"** banner with a **"Switch role"** menu for instant role switching (sign out, sign in as another role).
- Provide a mock OTP for the normal phone flow when `DEMO_MODE=true`: show hint "Demo OTP: 123456" (use Supabase test phone numbers).
- Gate everything behind `DEMO_MODE=true`; when false the route returns 404 and the buttons are hidden.

### 8.4 Implementation (server route; credentials never reach the browser)
```ts
// app/api/demo-login/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { DEMO_ACCOUNTS } from '@/lib/demo/accounts';

export async function POST(req: Request) {
  if (process.env.DEMO_MODE !== 'true') return new NextResponse('Not found', { status: 404 });
  const { role } = await req.json();                       // 'user' | 'provider' | 'admin'
  const account = DEMO_ACCOUNTS[role as keyof typeof DEMO_ACCOUNTS];
  if (!account) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  const supabase = await createServerClient();             // cookie-aware server client
  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: process.env.DEMO_PASSWORD!,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });
  return NextResponse.json({ redirect: account.home });
}
```
```ts
// lib/demo/accounts.ts
export const DEMO_ACCOUNTS = {
  user:     { email: 'demo.user@karigar.pk',     home: '/' },
  provider: { email: 'demo.provider@karigar.pk', home: '/provider/dashboard' },
  admin:    { email: 'demo.admin@karigar.pk',    home: '/admin' },
} as const;
```

### 8.5 Seed script requirements (`scripts/seed-demo.ts`, run with `npx tsx scripts/seed-demo.ts`)
- Uses `SUPABASE_SERVICE_ROLE_KEY` and `supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role, full_name } })`; skip if the user already exists.
- Marks the three accounts `profiles.is_demo = true`.
- Creates **~24 approved providers** across Hyderabad and Jamshoro (varied services, areas, ratings 4.0 to 5.0, realistic Sindhi/Urdu names, headlines in English and Urdu, prices in PKR), plus **5 pending** providers for the admin queue.
- Creates bookings in every status for the demo customer and demo provider, with `booking_events`, sample `messages`, `reviews`, `notifications`, `complaints`.
- Generates realistic earnings and booking history for the last 60 days (for admin and provider charts).
- Idempotent: running twice does not duplicate data.
- Uses avatar placeholders (e.g. DiceBear/initials generated locally) and royalty-free work photos stored in Supabase Storage or `/public/demo`.

### 8.6 Nightly reset
- `vercel.json`: `{ "crons": [{ "path": "/api/cron/reset-demo", "schedule": "0 21 * * *" }] }`
- `/api/cron/reset-demo` checks `Authorization: Bearer ${CRON_SECRET}`, deletes demo-created bookings/messages/reviews, and re-seeds demo state.
- Admin panel also has a **"Reset demo data"** button (visible only when `DEMO_MODE=true` and `is_demo`).

### 8.7 Demo safety
- Demo admin can do everything in the UI, but destructive actions (delete user, delete service) act only on `is_demo` data or show a toast "Disabled in demo".
- Turn `DEMO_MODE=false` after judging if the site goes live.

---

## 9. AI Search: Implementation Spec

### 9.1 Flow
```
Input (text/voice) → POST /api/ai/search
  1. Rate limit (per IP, e.g. 20/min)
  2. Try LLM parse (timeout 2.5s) → JSON (validated with zod)
  3. On failure/no key → rule-based fallback parser
  4. Query providers: status='approved' AND service match AND area match
  5. Rank: availability, rating, jobs_completed, distance, response time,
     price fit, optional vector similarity on bio/skills
  6. Log to search_logs; return { parsed, providers, usedAI, ai_summary }
     ai_summary example: "Matched 4 verified AC technicians available now in Qasimabad, Hyderabad."
```

### 9.2 JSON contract (zod)
```ts
const ParsedQuery = z.object({
  service: z.enum(['plumbing','electrical','ac_service','painting','carpentry',
    'cleaning','mason','appliance_repair','solar','cctv','pest_control','other']),
  sub_service: z.string().nullable(),
  area: z.string().nullable(),            // area slug
  urgency: z.enum(['emergency','today','scheduled','flexible']),
  preferred_date: z.string().nullable(),  // ISO
  budget_pkr: z.number().nullable(),
  language: z.enum(['en','ur','roman_ur']),
  estimated_price_range: z.string().nullable(),   // e.g. 'PKR 1,200 - 2,500'
  suggested_tags: z.array(z.string()).max(3),     // e.g. ['AC Water Leakage','Same-Day Visit']
  summary: z.string(),
  clarifying_question: z.string().nullable(),
});
```

### 9.3 LLM system prompt
```text
You are the search assistant for Karigar, a home-services marketplace in
Hyderabad and Jamshoro, Sindh, Pakistan. The user writes in English, Urdu, or
Roman Urdu (mixed is common). Return ONLY valid JSON matching the schema.
Map problems to services: nal/tap/pipe/geyser/tanki/drain → plumbing;
bijli/wiring/fan/switch/UPS/short circuit → electrical; AC/cooling/gas →
ac_service; rang/paint → painting; darwaza/almari/furniture → carpentry;
safai/cleaning → cleaning; tiles/plaster/deewar → mason; washing machine/
fridge/microwave → appliance_repair; solar/panel/inverter → solar; camera/
CCTV/wifi → cctv; keeray/deemak/cockroach → pest_control.
Urgency words: abhi, foran, urgent, emergency → emergency; aaj → today;
kal/parson/date → scheduled. Known area slugs: latifabad, qasimabad, hirabad,
saddar, autobhan, gulistan_e_sajjad, heerabad, cantt, jamshoro,
sindh_university, muet, lumhs, kotri, qasimabad_phase2, naseem_nagar,
citizen_colony, abdullah_sports_city, dha_hyderabad, tilak_incline, phuleli,
kohsar, gulshan_e_zia, jamshoro_phase2, kotri_site, sikandarabad. Common
landmarks: LUMHS, MUET, Sindh University are in Jamshoro. If the service is unclear, set service
"other" and fill clarifying_question in the user's language. Also return
estimated_price_range in PKR (based on typical visit prices) and up to 3
short suggested_tags such as "AC Water Leakage" or "Same-Day Visit".
```

### 9.4 Fallback parser (must work offline)
Dictionary of English + Urdu + Roman-Urdu keywords per service and per area, normalized lowercase, with Urdu character normalization; regex for "abhi/aaj/kal". Returns the same JSON shape with `usedAI=false`.

### 9.5 UX details
- Search bar auto-suggests popular queries in the current language
- Voice button using Web Speech API (`ur-PK`, `en-PK`); hide if unsupported
- After search, show an **editable parsed chip** ("Plumbing · Latifabad · Urgent") so users can correct the AI
- If `clarifying_question` exists, show it as a friendly prompt with quick-reply buttons
- Show a subtle **"AI matched"** badge on top results with a one-line reason ("Nearby · 4.9★ · replies in 5 min")

### 9.6 Additional AI Features (beyond search)

All features run **server-side**, are individually switchable with `AI_FEATURES`, use short timeouts (2.5 to 4 seconds), validate output with zod, are cached where possible, are rate limited, and **always have a non-AI fallback** so no core flow ever depends on an AI call. AI-generated text is labeled "AI suggested" and stays editable. Never send CNIC numbers, phone numbers, or exact addresses to an AI provider.

| # | Feature | Where | What it does | Fallback |
|---|---|---|---|---|
| 1 | **Problem description helper** (`/api/ai/describe`) | Booking step 1 | Turns a rough note ("nal se pani gir raha hai") into a clear problem statement plus a short checklist of details to add (which tap, since when) in the user's language | Show the original text and a static checklist per service |
| 2 | **Price estimate with explanation** (`/api/ai/price`) | Search results and booking review | Gives an estimated PKR range from the service range, sub-service, and urgency, with a one-line reason; always labeled an estimate | Range from `services.min_price` and `max_price` |
| 3 | **Karigar Assistant widget** (`/api/ai/assistant`, streaming) | Landing, search, help | Small chat helper that answers FAQs (how booking works, verification, pricing, cancellation), helps choose a service, and can launch a search with the parsed filters. Scoped to Karigar topics only | Keyword FAQ matcher with quick-reply buttons |
| 4 | **Review summary** (`/api/ai/review-summary`) | Provider profile | Two-line summary of strengths and weaknesses from reviews, regenerated after every 5 new reviews and stored in `providers.review_summary` | Hide the summary, show raw reviews |
| 5 | **Provider bio helper** (`/api/ai/bio`) | `/join` and profile editor | Provider enters rough skills in Urdu or Roman Urdu; AI returns a polished bio and headline in English and Urdu for the provider to edit | Template bio from selected skills |
| 6 | **Smart quick replies** | Chat | Suggests 3 short replies based on the last message | Static quick replies |
| 7 | **Admin AI insights** | `/admin/ai-insights` | Weekly written summary of top searches, unclear queries, services/areas with unmet demand, and low-supply zones | Charts and tables only |
| 8 | **Semantic search boost** (optional) | Search ranking | `pgvector` embeddings of provider headline, bio, and skills add a similarity score to ranking | Keyword and category ranking |

**Rules for verification:** AI may flag missing or inconsistent application fields for the admin, but **never approves or rejects a provider automatically and never analyzes faces or ID photos**; every decision is made by an admin and logged.

```sql
alter table providers add column review_summary text;
alter table providers add column review_summary_count int default 0;
```

---

## 10. Performance Playbook (must follow)

| Technique | Detail |
|---|---|
| Server Components first | Fetch data on the server; client components only for interactivity |
| Caching | Public catalog (`services`, `areas`) via `unstable_cache`/`revalidate: 3600`; landing page ISR (`revalidate: 300`) |
| Images | `next/image` with sizes, AVIF/WebP, blur placeholders, priority only on the hero |
| Fonts | `next/font` with `display: swap`; subset Latin and Arabic |
| JS budget | Dynamic import for Leaflet, Recharts, voice, chat; no heavy libs on landing |
| DB speed | Indexes in Section 6; select only needed columns; paginate (12 per page); use views/RPC for search ranking |
| Realtime | Subscribe only on chat and job detail screens; unsubscribe on unmount |
| UX speed | Skeletons, optimistic updates for accept/reject and toggle, prefetch on hover (`<Link prefetch>`) |
| Region | Supabase region closest to Pakistan (e.g. Singapore or Mumbai); Vercel function region `sin1` or `bom1` |
| Network | Compress, HTTP/2, `Cache-Control` on static assets, no layout shift |
| PWA | Cache shell and static assets; offline fallback page |
| Monitoring | Vercel Analytics + Speed Insights enabled |

**Targets:** Lighthouse Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95; LCP < 2.0s, INP < 200ms, CLS < 0.05.

---

## 11. Security, Localization & Accessibility

### 11.1 Security
- RLS enabled on all tables (policies in Section 6); middleware blocks `/provider/*` and `/admin/*` for the wrong role.
- Identity documents live in a **private bucket**, served only through short-lived signed URLs to the owner and admins.
- `SUPABASE_SERVICE_ROLE_KEY` and AI keys exist **only on the server**; never in client bundles.
- Validate every API input with **zod**; sanitize user text; limit upload size and type (images only, max 5 MB).
- Rate limit `/api/ai/search` (about 20 requests per minute per IP) and the demo-login route.
- Security headers via `next.config` (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy limited to what voice search needs).
- Demo accounts and routes exist only when `DEMO_MODE=true`.

### 11.2 Localization
- Locales: `en` and `ur` (Urdu uses `dir="rtl"`; mirror icons and layouts that imply direction). Structure allows adding `sd` (Sindhi) later.
- All UI strings come from `messages/*.json`; service and area names come from `name_en` and `name_ur` columns.
- Formats: currency `Rs 1,200`; dates with `en-PK`; phone numbers `+92 3XX XXXXXXX`.
- Fonts: Poppins (headings) and Inter (body) for English; Noto Naskh Arabic (and Nastaliq for display headings) for Urdu; self-hosted via `next/font` with `display: swap`.

### 11.3 Accessibility
- WCAG AA contrast, visible focus rings, full keyboard navigation, semantic landmarks, labels on all inputs, `aria-live` for toasts and status changes, reduced-motion support, alt text for all images, minimum 44px tap targets.

---

## 12. Deployment: Supabase + Vercel (step by step)

1. **Supabase:** Create a project in a nearby region → SQL Editor: run `0001_init.sql` then `seed.sql` → Storage: create the 4 buckets → Auth: enable Email (confirm email off for demo), optionally Phone; add **Site URL** and **Redirect URLs** (`http://localhost:3000/**`, your Vercel domain).
2. **Local:** `npm i` → copy `.env.local` → `npx tsx scripts/seed-demo.ts` → `npm run dev` → test all 3 demo logins.
3. **GitHub:** push the repo.
4. **Vercel:** Import the repo → add all env variables (Section 3) → set Function Region (`sin1`/`bom1`) → Deploy.
5. Add the production URL to Supabase Auth redirect URLs; add custom domain if you have one (`karigar.pk`).
6. Enable **Vercel Analytics** and **Speed Insights**; confirm the Cron job appears under Settings → Cron Jobs.
7. Run Lighthouse (mobile) on `/`, `/search`, `/provider/dashboard`; fix anything below 95.
8. Share the live URL with the **"Judge / Demo Access"** instructions.

---

## 13. Judge Demo Script (3 minutes)

1. **Open the site** on mobile view → show the fast, green, bilingual landing page; switch EN → اردو (RTL flips).
2. **AI search:** type `mera nal leak kar raha hai latifabad mein` → parsed chip "Plumbing · Latifabad" → ranked providers. Then try `Qasimabad mein AC cooling nahi kar raha urgent` and `Need plumber near LUMHS Jamshoro` to show Roman Urdu, urgency, and both cities, plus the AI summary and price range.
3. Click **Demo as Customer** (header) → open provider profile → **Book** (3 steps) → confirm.
4. Switch role → **Demo as Service Provider** → dashboard shows the new request → **Accept** → tap status buttons → complete.
5. Back as customer → live timeline updated → **watch the provider marker move on the map** (simulated in demo) → open **chat** → **rate 5 stars**.
6. Switch role → **Demo as Admin** → KPI dashboard → verification queue → **approve** a pending provider → AI insights page (top searches, unmet demand).
7. Show Vercel Speed Insights / Lighthouse score and mention RLS security + realtime chat.

---

## 14. Acceptance Checklist (tick before presenting)

**Demo & Access**
- [ ] Three one-click demo buttons work on `/login` and in the header
- [ ] Each role lands on the right dashboard with rich data
- [ ] Role switching works in two clicks; nightly reset configured

**UI/UX**
- [ ] Green theme matches reference style; consistent radius and spacing
- [ ] English and Urdu (RTL) fully working
- [ ] Mobile 360px perfect; desktop perfect
- [ ] Skeleton, empty, and error states everywhere

**Features**
- [ ] AI search works (with and without API key); editable parsed chip
- [ ] Booking: create → accept → status updates → complete → review
- [ ] Maps: address picker with draggable pin, route line on job detail, zone demand map in admin
- [ ] Live tracking: provider marker moves on the customer's screen when status is On the way (real GPS or demo simulation)
- [ ] Realtime chat: text, images, read receipts, typing indicator, quick replies in English and Urdu
- [ ] Notifications: in-app bell with unread count, web push (PWA) when enabled
- [ ] AI extras: description helper, price estimate, assistant widget, review summary, provider bio helper, each with a working fallback
- [ ] Provider application → admin approval flow
- [ ] Admin KPIs, verification, CRUD, insights

**Quality**
- [ ] Lighthouse mobile ≥ 95 (Performance, A11y, Best Practices, SEO)
- [ ] RLS on all tables; CNIC bucket private; no secrets in client
- [ ] No console errors; build passes `npm run build`
- [ ] Deployed on Vercel with Supabase production project

---

*Karigar Complete Project Brief · v3.0*
