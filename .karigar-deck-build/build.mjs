import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const ROOT = 'D:/Karigar';
const BUILD = `${ROOT}/.karigar-deck-build`;
const SCREENSHOT = `${ROOT}/karigar-project-screenshot-clean.png`;
const DRAFT = `${BUILD}/Karigar-Overview-draft.pptx`;
const W = 1280;
const H = 720;
const C = {
  ink: '#14382C', dark: '#0B3B2E', green: '#147A4B', leaf: '#2F9B63',
  lime: '#DDF1B4', mint: '#E8F2E9', paper: '#F7F7F1', white: '#FFFFFF',
  body: '#395449', muted: '#6A7D73', line: '#D5E2D8', amber: '#F2B94B',
};
const FONT = 'Segoe UI';
const p = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, x, y, w, h, fill, lineFill = 'none', lineWidth = 0, name) {
  return slide.shapes.add({
    geometry, name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: 'solid', fill: lineFill, width: lineWidth },
  });
}

function text(slide, value, x, y, w, h, options = {}) {
  const box = shape(slide, 'textbox', x, y, w, h, 'none', 'none', 0, options.name);
  box.text = value;
  box.text.style = {
    typeface: options.font || FONT,
    fontSize: options.size ?? 22,
    bold: options.bold ?? false,
    color: options.color ?? C.body,
    alignment: options.align ?? 'left',
    verticalAlignment: options.valign ?? 'top',
    autoFit: 'shrinkText',
    wrap: 'square',
    insets: 0,
    ...(options.italic ? { italic: true } : {}),
  };
  return box;
}

function line(slide, x, y, w, h = 2, fill = C.line) {
  shape(slide, 'rect', x, y, w, h, fill);
}

function base(title, index, opts = {}) {
  const slide = p.slides.add();
  slide.background.fill = opts.bg || C.paper;
  if (!opts.cover) {
    text(slide, 'KARIGAR  /  PRODUCT OVERVIEW', 72, 34, 440, 22, { size: 13, bold: true, color: opts.dark ? '#BFE5C9' : C.green });
    text(slide, title, 72, 82, 1120, 58, { size: 40, bold: true, color: opts.dark ? C.white : C.ink });
    line(slide, 72, 660, 1136, 1, opts.dark ? '#3D6B56' : C.line);
    text(slide, 'Hyderabad  ·  Jamshoro  ·  Sindh, Pakistan', 72, 675, 700, 20, { size: 13, color: opts.dark ? '#C6D9CC' : C.muted });
    text(slide, String(index).padStart(2, '0'), 1150, 675, 58, 20, { size: 13, bold: true, color: opts.dark ? '#C6D9CC' : C.muted, align: 'right' });
  }
  return slide;
}

function label(slide, value, x, y, w, color = C.green) {
  text(slide, value.toUpperCase(), x, y, w, 20, { size: 13, bold: true, color });
}

function step(slide, n, title, detail, x, y, width = 250) {
  shape(slide, 'ellipse', x, y, 44, 44, C.lime);
  text(slide, String(n).padStart(2, '0'), x, y + 10, 44, 24, { size: 15, bold: true, color: C.dark, align: 'center' });
  text(slide, title, x, y + 62, width, 36, { size: 23, bold: true, color: C.ink });
  text(slide, detail, x, y + 105, width, 100, { size: 18, color: C.body });
}

function notes(slide, paths) {
  slide.speakerNotes.text = `Project sources: ${paths.join('; ')}. Product facts are taken from the local Karigar codebase and README.`;
}

// 1 — Cover
{
  const s = p.slides.add();
  s.background.fill = C.dark;
  shape(s, 'ellipse', 900, 0, 380, 380, '#14563D');
  shape(s, 'ellipse', 1020, 460, 260, 260, '#174A37');
  shape(s, 'rect', 82, 82, 10, 88, C.lime);
  text(s, 'Karigar', 124, 83, 620, 78, { size: 64, bold: true, color: C.white });
  text(s, 'کاریگر', 124, 164, 400, 58, { size: 38, bold: true, color: C.lime, font: 'Segoe UI' });
  text(s, 'Local home help, made easier.', 124, 272, 740, 70, { size: 37, bold: true, color: C.white });
  text(s, 'A bilingual home-services marketplace for Hyderabad and Jamshoro, Sindh.', 124, 367, 690, 62, { size: 23, color: '#D3E6D8' });
  line(s, 124, 483, 485, 2, '#4B7C62');
  text(s, 'CUSTOMERS  ·  SERVICE PROFESSIONALS  ·  ADMIN', 124, 505, 810, 28, { size: 14, bold: true, color: C.lime });
  text(s, 'Project overview', 124, 634, 500, 24, { size: 15, color: '#B6CFC0' });
  notes(s, ['README.md', 'Karigar_Project_Brief.md']);
}

// 2 — Marketplace
{
  const s = base('Local home services, in one place', 2);
  text(s, 'Find the right professional for the job at home.', 72, 174, 690, 72, { size: 31, bold: true, color: C.ink });
  text(s, 'Karigar brings customers and skilled neighborhood professionals together across Hyderabad and Jamshoro.', 72, 262, 700, 64, { size: 21, color: C.body });
  line(s, 72, 360, 1136, 1, C.line);
  const groups = [
    ['FIX & INSTALL', 'Plumbing · Electrical · AC\nCarpentry · Appliance repair'],
    ['CARE FOR THE HOME', 'Cleaning · Painting · Masonry\nSolar installation'],
    ['SAFETY & PREVENTION', 'CCTV installation\nPest control'],
  ];
  groups.forEach((g, i) => {
    const x = 72 + i * 386;
    shape(s, 'rect', x, 405, 6, 122, i === 1 ? C.amber : C.green);
    label(s, g[0], x + 24, 405, 310);
    text(s, g[1], x + 24, 443, 322, 92, { size: 20, color: C.body });
  });
  shape(s, 'roundRect', 72, 558, 1136, 54, C.mint, 'none', 0, 'local-promise');
  text(s, 'Verified local pros in Hyderabad & Jamshoro', 94, 573, 1050, 28, { size: 19, bold: true, color: C.dark, valign: 'middle' });
  notes(s, ['README.md', 'src/lib/data.ts']);
}

// 3 — Customer journey
{
  const s = base('A simple path from problem to professional', 3);
  text(s, 'Describe what needs attention. Karigar helps you move from discovery to a booked visit.', 72, 165, 1000, 52, { size: 21, color: C.body });
  const xs = [90, 390, 690, 990];
  step(s, 1, 'Describe', 'Type or speak in English, Urdu, or Roman Urdu.', xs[0], 275, 220);
  step(s, 2, 'Choose', 'Review relevant local providers and their profiles.', xs[1], 275, 230);
  step(s, 3, 'Book', 'Share the job details, area, and preferred visit time.', xs[2], 275, 230);
  step(s, 4, 'Follow through', 'Track progress, chat, and review the completed job.', xs[3], 275, 225);
  for (const x of [333, 633, 933]) {
    line(s, x, 296, 36, 2, C.green);
    shape(s, 'chevron', x + 22, 287, 18, 20, C.green);
  }
  notes(s, ['README.md', 'src/components/landing-page.tsx', 'src/components/booking-flow.tsx', 'src/components/booking-detail.tsx', 'src/components/chat-thread.tsx']);
}

// 4 — AI search
{
  const s = base('Search that understands local language', 4);
  label(s, 'A customer might write', 72, 175, 300);
  shape(s, 'roundRect', 72, 208, 460, 142, C.dark);
  text(s, '“Mera nal leak kar raha hai\nLatifabad mein.”', 98, 241, 405, 82, { size: 27, bold: true, color: C.white });
  label(s, 'Karigar extracts the request', 590, 175, 360);
  text(s, 'Service  ·  Plumbing\nArea  ·  Latifabad\nLanguage  ·  Roman Urdu', 590, 220, 455, 112, { size: 21, color: C.ink });
  shape(s, 'chevron', 515, 256, 38, 42, C.leaf);
  line(s, 72, 400, 1136, 1, C.line);
  text(s, 'Then it ranks matching providers.', 72, 438, 520, 42, { size: 25, bold: true, color: C.ink });
  text(s, 'The structured request can include service, sub-service, area, urgency, date, budget, language, and a short summary.', 72, 492, 650, 86, { size: 19, color: C.body });
  shape(s, 'roundRect', 800, 438, 408, 148, C.mint);
  label(s, 'Demo stays available', 826, 461, 330);
  text(s, 'If no LLM key is set or an AI call fails, a rule-based parser handles common service and area terms.', 826, 496, 344, 72, { size: 18, color: C.ink });
  notes(s, ['src/lib/ai/parse.ts', 'src/lib/ai/fallback.ts', 'src/lib/ai/rank.ts', 'src/app/api/ai/search/route.ts']);
}

// 5 — Provider journey
{
  const s = base('A working toolkit for local professionals', 5);
  text(s, 'Providers can apply, manage incoming jobs, and keep track of their work from one responsive workspace.', 72, 164, 1050, 54, { size: 21, color: C.body });
  const milestones = [
    ['Apply', 'Choose trades and submit profile details.'],
    ['Get verified', 'Send identity documents for admin review.'],
    ['Go available', 'Set availability and receive relevant requests.'],
    ['Manage the job', 'Accept or reject, view the route, and message the customer.'],
    ['Track earnings', 'Review completed work and export a CSV statement.'],
  ];
  milestones.forEach((m, i) => {
    const y = 255 + i * 74;
    shape(s, 'ellipse', 78, y + 3, 34, 34, i < 2 ? C.lime : C.mint);
    text(s, String(i + 1), 78, y + 10, 34, 18, { size: 14, bold: true, color: C.dark, align: 'center' });
    if (i < milestones.length - 1) line(s, 94, y + 40, 2, 38, C.line);
    text(s, m[0], 142, y, 235, 32, { size: 21, bold: true, color: C.ink });
    text(s, m[1], 380, y + 2, 700, 42, { size: 18, color: C.body });
  });
  notes(s, ['README.md', 'src/components/provider-application.tsx', 'src/components/workspace.tsx', 'src/app/[locale]/provider/dashboard/page.tsx', 'src/app/[locale]/provider/earnings/page.tsx']);
}

// 6 — Admin and trust
{
  const s = base('Trust and operations built into the workflow', 6);
  const columns = [
    { x: 72, title: 'Verify professionals', body: 'Review provider applications and CNIC documents before approving a verification badge.', tag: 'IDENTITY REVIEW' },
    { x: 465, title: 'Run the marketplace', body: 'Manage bookings, providers, customers, services, coverage areas, reviews, and complaints.', tag: 'ADMIN WORKBENCH' },
    { x: 858, title: 'Protect access', body: 'Use role-aware routes and Supabase Row Level Security policies for database access.', tag: 'ROLE + RLS' },
  ];
  columns.forEach((c, i) => {
    label(s, c.tag, c.x, 199, 300);
    line(s, c.x, 230, 300, 2, i === 1 ? C.amber : C.green);
    text(s, c.title, c.x, 260, 300, 66, { size: 25, bold: true, color: C.ink });
    text(s, c.body, c.x, 342, 300, 128, { size: 18, color: C.body });
  });
  shape(s, 'roundRect', 72, 520, 1136, 76, C.dark);
  text(s, 'CNIC files are stored in a private bucket; the service-role key stays on the server.', 100, 542, 1065, 34, { size: 19, color: C.white, bold: true, valign: 'middle' });
  notes(s, ['src/middleware.ts', 'src/lib/supabase/admin.ts', 'supabase/migrations/0001_init.sql', 'src/app/[locale]/admin/verification/page.tsx']);
}

// 7 — Responsive and bilingual
{
  const s = base('One product across mobile, tablet, and desktop', 7);
  text(s, 'The same service journey adapts to the screen people are using.', 72, 166, 970, 48, { size: 21, color: C.body });
  shape(s, 'roundRect', 72, 247, 456, 305, C.white, C.line, 1);
  label(s, 'MOBILE', 100, 276, 180);
  text(s, 'Bottom navigation\nCompact job cards\nQuick accept / reject\nChat and notifications', 100, 320, 380, 166, { size: 21, color: C.ink });
  shape(s, 'roundRect', 752, 247, 456, 305, C.white, C.line, 1);
  label(s, 'TABLET & DESKTOP', 782, 276, 310);
  text(s, 'Sidebar navigation\nMulti-column workspaces\nTables and job detail panels\nRoom for operational tasks', 782, 320, 380, 166, { size: 21, color: C.ink });
  line(s, 548, 399, 160, 2, C.green);
  shape(s, 'chevron', 682, 389, 22, 22, C.green);
  shape(s, 'roundRect', 72, 574, 1136, 48, C.mint);
  text(s, 'English + Urdu  ·  Urdu screens mirror into right-to-left layout', 94, 585, 1078, 25, { size: 18, bold: true, color: C.dark });
  notes(s, ['Karigar_Project_Brief.md', 'messages/en.json', 'messages/ur.json', 'src/i18n/request.ts', 'src/components/workspace.tsx']);
}

// 8 — Platform
{
  const s = base('A modern web stack with a local demo path', 8);
  const nodes = [
    { x: 72, title: 'EXPERIENCE', body: 'Next.js 14 App Router\nTypeScript · Tailwind\nnext-intl · React Hook Form' },
    { x: 468, title: 'APPLICATION', body: 'Role-aware routes\nZod validation\nAI search + local fallback' },
    { x: 864, title: 'DATA & DEPLOY', body: 'Supabase SSR\nPostgres · Auth · Storage · RLS\nVercel configuration' },
  ];
  nodes.forEach((n, i) => {
    label(s, n.title, n.x, 225, 315);
    line(s, n.x, 256, 300, 2, i === 1 ? C.amber : C.green);
    text(s, n.body, n.x, 286, 315, 136, { size: 21, bold: true, color: C.ink });
  });
  shape(s, 'chevron', 407, 302, 32, 38, C.leaf);
  shape(s, 'chevron', 803, 302, 32, 38, C.leaf);
  line(s, 72, 470, 1136, 1, C.line);
  text(s, 'Local demo mode works without external database credentials. Connect a Supabase project to run with persistent hosted auth and data.', 72, 506, 1080, 72, { size: 20, color: C.body });
  notes(s, ['package.json', 'src/lib/supabase/server.ts', 'src/lib/validators', 'src/middleware.ts', 'vercel.json', 'README.md']);
}

// 9 — Actual screenshot
{
  const s = base('A real view of Karigar', 9);
  text(s, 'Homepage captured from the running project', 72, 164, 800, 36, { size: 20, color: C.body });
  shape(s, 'roundRect', 257, 204, 766, 426, C.white, C.line, 1);
  s.images.add({
    blob: new Uint8Array(await fs.readFile(SCREENSHOT)),
    contentType: 'image/png',
    alt: 'Karigar homepage screenshot showing search, area selection, popular fixes, and local provider cards',
    fit: 'contain',
    geometry: 'roundRect',
    borderRadius: 14,
    position: { left: 271, top: 218, width: 738, height: 398 },
  });
  text(s, 'Live UI · English locale · sample local provider profiles', 72, 632, 1136, 20, { size: 14, color: C.muted, align: 'right' });
  notes(s, ['Captured from http://localhost:3000/en', 'src/components/landing-page.tsx', 'src/components/search-results.tsx']);
}

// 10 — Demo and path forward
{
  const s = base('A demo that’s ready to explore', 10, { bg: C.dark, dark: true });
  text(s, 'Three roles. One local marketplace.', 72, 172, 790, 60, { size: 33, bold: true, color: C.white });
  text(s, 'Open the demo as a Customer, Service Provider, or Admin. Seeded sample profiles and records make the first visit useful.', 72, 248, 720, 92, { size: 21, color: '#D3E6D8' });
  line(s, 72, 390, 620, 2, '#4B7C62');
  label(s, 'LOCAL START', 72, 426, 230, C.lime);
  text(s, 'npm install\nnpm run dev', 72, 462, 460, 78, { size: 25, bold: true, color: C.white });
  shape(s, 'roundRect', 808, 170, 400, 382, '#124C38');
  label(s, 'NEXT PRODUCTION STEP', 842, 207, 330, C.lime);
  text(s, 'Connect Supabase\n\nSet production environment variables\n\nApply migrations and seed data\n\nDeploy to Vercel', 842, 252, 318, 248, { size: 20, color: C.white });
  text(s, 'Karigar  ·  کاریگر', 72, 600, 600, 36, { size: 23, bold: true, color: C.lime });
  notes(s, ['README.md', 'src/lib/demo/accounts.ts', 'scripts/seed-demo.ts', 'supabase/migrations/0001_init.sql', 'vercel.json']);
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(BUILD, { recursive: true });
for (const [i, slide] of p.slides.items.entries()) {
  const png = await p.export({ slide, format: 'png', scale: 1 });
  await writeBlob(`${BUILD}/slide-${String(i + 1).padStart(2, '0')}.png`, png);
}
const deck = await PresentationFile.exportPptx(p);
await deck.save(DRAFT);
console.log(`Draft created: ${DRAFT}; slides: ${p.slides.items.length}`);
