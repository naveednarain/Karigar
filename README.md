# Karigar (کاریگر) — Hyperlocal Home Services Marketplace

**Karigar** is an on-demand home repair and artisan marketplace designed specifically for **Hyderabad & Jamshoro, Sindh, Pakistan**. It bridges the gap between verified local technicians (electricians, plumbers, AC mechanics, carpenters, cleaners) and neighbourhood households through natural-language search, live tracking, transparent pricing, and 100% cash-after-service assurance.

---

## 🌟 Key Features of Queue Flow

### 👤 Customer Experience

- **AI-Powered Natural Language Search**: Describe any repair problem in English, Urdu, or Roman Urdu (e.g., *"kitchen pipe leaking under sink in Latifabad"* or *"AC capacitor change in Qasimabad"*) to get instant category matching, visit fee estimates, and recommended local artisans.

- **3-Step Frictionless Booking**: Choose service details, set visit time/urgency, and provide landmark address with immediate order dispatch (`/book/[providerId]`).
- **Live Order Tracking**: Real-time progress through every service milestone (*Request Sent* &rarr; *Accepted* &rarr; *On the way* &rarr; *Arrived* &rarr; *In progress* &rarr; *Completed*).
- **Per-Booking Dynamic Chat**: End-to-end encrypted messaging threads (`/chat/[bookingId]`) with persistent local storage, photo attachments, contextual auto-replies, and automatic unread badge counter resets.
- **Saved Addresses & Pros**: Fast address management with confirmation modals and one-click re-booking of trusted neighbourhood technicians.
- **Ratings & Reviews**: Transparent post-service reviews and star ratings to protect community standards.

### 🔧 Service Provider (Karigar Pro) Workspace
- **Interactive Job Management**: Real-time incoming requests with instant **Accept** or **Reject** actions.
- **Live Route Map by Customer Home**: Visual route overview with distance estimates from the technician's location to the customer's flat or house.
- **Availability Switch**: One-tap toggle (*"Are you available?"*) to switch between online and offline modes.
- **Earnings & Commission Ledger**: Track completed repairs, cash collected on-site, and platform commission with **1-click CSV Statement Export**.
- **Become a Pro Onboarding**: Comprehensive verified registration (`/join`) requiring mandatory front and back CNIC uploads, trade selection, and live search card preview.

### 🛡️ Super-Admin Operations Console
- **Supervision & Badge Revocation**: Full authority over all providers and customers. Instantly revoke verification badges or suspend/reinstate accounts with persistent updates.
- **CNIC Verification Queue (`/admin/verification`)**: Review submitted identity documents, verify CNIC details, and approve or decline provider applications with confirmation prompts.
- **Operational Workbenches**: Comprehensive management tables for **Bookings**, **Service Providers**, **Customers**, **Complaints**, **Services Catalog**, and **Coverage Hubs**.
- **Interactive Sorting & Status Filtering**: Real column sorting `(A → Z / Z → A)` and status filter dropdowns across all operational tables.
- **Reviews Moderation Workbench (`/admin/reviews`)**: Publish, hide, or flag disputed reviews, delete with confirmation, and post official platform responses.
- **Marketplace Settings Modal (`/admin/settings`)**: Live configuration modal for platform commission %, dispatch request timeout, support hotline, banner announcements, and strictness rules.
- **CSV Data Exporter**: Instant client-side CSV downloads for administrative records, customer complaints, and payment settlement ledgers.

---

## 🌐 Localization & Design

- **Bilingual Support**: Full English (`/en`) and Urdu (`/ur`) localization with native **Noto Naskh Arabic** typography and RTL (Right-to-Left) layout mirroring.
- **Dark Mode & Light Mode**: Seamless theme switching with high-contrast emerald and slate palettes optimized for outdoor readability.
- **Mobile First**: Adaptive mobile bottom navigation bar, tablet mini-sidebar, and desktop collapsible workspace.

---

## 🚀 Quick Start (Local Demo Mode)

Karigar includes a zero-setup **Local Demo Mode** that functions out of the box without requiring external database credentials:

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). 

### 🔑 Demo Accounts

Use the **One-Click Demo Access** buttons on the login page or log in with password `Demo@12345`:

| Role | Demo Account | Destination | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `demo.user@karigar.pk` | `/en/account/bookings` | Book services, track visits, chat with pro |
| **Provider** | `demo.provider@karigar.pk` | `/en/provider/dashboard` | Accept jobs, view route maps, export earnings |
| **Admin** | `demo.admin@karigar.pk` | `/en/admin` | Verify CNICs, revoke badges, moderate reviews |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` to configure production services:

```env
# Platform Mode
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
DEMO_PASSWORD=Demo@12345
SESSION_SECRET=your-random-32-character-secret-key-here

# Supabase Credentials (Database, Auth & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Search Engine (Optional: openai | anthropic | gemini)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

# Password Reset & Email Notifications
RESEND_API_KEY=re_your_resend_api_key

# Cron Job Secret
CRON_SECRET=your-secure-cron-secret
```

---

## 🗄️ Supabase & Database Architecture

1. Link your Supabase project:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
2. Apply the database schema and Row Level Security (RLS) migrations:
   ```bash
   npx supabase db push
   ```
3. Seed sample categories, providers, and test records:
   ```bash
   npm run db:seed
   ```
4. Deploy the Supabase Edge Function for Resend password reset:
   ```bash
   npx supabase functions deploy send-password-reset --no-verify-jwt
   npx supabase secrets set RESEND_API_KEY=re_...
   ```

---

## ⏰ Background Cron Jobs (Vercel Free Hobby Plan)

Karigar is configured to run 100% within **Vercel's Free Hobby Plan** limits without triggering cron frequency warnings:

- **`/api/cron/expire-bookings`**: Runs once daily at `00:00 UTC` (midnight) to purge stale requests from database tables. *(Real-time 10-minute request timeouts are computed dynamically on client read).*
- **`/api/cron/reset-demo`**: Runs once daily at `21:00 UTC` to clean test submissions and reset demo state.

See [vercel.json](file:///d:/Karigar/vercel.json) for cron schedules.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Dynamic Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with class-based Dark Mode
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`, Postgres, Edge Functions, RLS)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (English & Urdu RTL)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Email Delivery**: [Resend](https://resend.com/) via Supabase Edge Functions

---

## 🧪 Verification & Build

```bash
# Type check TypeScript
npm run typecheck

# Production build
npm run build
```

---

## 📄 License

Proprietary software built for local community artisans in Sindh. All rights reserved.
