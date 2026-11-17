import { NextRequest, NextResponse } from 'next/server';
import { parseSearch } from '@/lib/ai/parse';
import { rankDatabaseProviders, rankProviders } from '@/lib/ai/rank';
import { rateLimit } from '@/lib/ai/rate-limit';
import { searchRequestSchema } from '@/lib/validators/search';
import { createServerClient } from '@/lib/supabase/server';

const serviceNames: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  ac_service: 'AC service',
  painting: 'Painting',
  carpentry: 'Carpentry',
  cleaning: 'Home cleaning',
  mason: 'Mason / tiles',
  appliance_repair: 'Appliance repair',
  solar: 'Solar',
  cctv: 'CCTV',
  pest_control: 'Pest control',
  other: 'Home services',
};

const serviceNamesUr: Record<string, string> = {
  plumbing: 'پلمبر',
  electrical: 'الیکٹریشن',
  ac_service: 'اے سی سروس',
  painting: 'رنگ و روغن',
  carpentry: 'کارپینٹر',
  cleaning: 'صفائی',
  mason: 'راج مستری',
  appliance_repair: 'ایپلائنس مرمت',
  solar: 'سولر',
  cctv: 'سی سی ٹی وی',
  pest_control: 'کیڑے مار اسپرے',
  other: 'گھریلو سروس',
};

const areaNames: Record<string, string> = {
  latifabad: 'Latifabad',
  qasimabad: 'Qasimabad',
  hirabad: 'Hirabad',
  saddar: 'Saddar',
  autobhan: 'Autobhan',
  gulistan_e_sajjad: 'Gulistan-e-Sajjad',
  heerabad: 'Heerabad',
  cantt: 'Hyderabad Cantt',
  jamshoro: 'Jamshoro',
  sindh_university: 'Sindh University',
  muet: 'MUET',
  lumhs: 'LUMHS',
  kotri: 'Kotri',
  qasimabad_phase2: 'Qasimabad Phase 2',
  naseem_nagar: 'Naseem Nagar',
  citizen_colony: 'Citizen Colony',
  abdullah_sports_city: 'Abdullah Sports City',
  dha_hyderabad: 'DHA Hyderabad',
  tilak_incline: 'Tilak Incline',
  phuleli: 'Phuleli',
  kohsar: 'Kohsar',
  gulshan_e_zia: 'Gulshan-e-Zia',
  jamshoro_phase2: 'Jamshoro Phase 2',
  kotri_site: 'Kotri SITE',
  sikandarabad: 'Sikandarabad',
};

// 60-second database provider cache for instant search performance
let cachedDbRows: any[] | null = null;
let lastDbFetch = 0;

async function getDatabaseProviders() {
  const now = Date.now();
  if (cachedDbRows && now - lastDbFetch < 60_000) {
    return cachedDbRows;
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.from('public_provider_search').select('*').limit(150);
    if (data && data.length > 0) {
      cachedDbRows = data;
      lastDbFetch = now;
      return data;
    }
  } catch {
    // If Supabase query fails, fallback to local fast dataset
  }
  return cachedDbRows;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!(await rateLimit(`karigar:ai-search:${ip}`, 40))) {
    return NextResponse.json({ error: 'Please wait a moment before searching again.' }, { status: 429 });
  }

  const input = searchRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: 'Enter at least two characters to search.' }, { status: 400 });
  }

  const queryText = input.data.query.trim();
  const { parsed, usedAI } = await parseSearch(queryText);

  let ranked = rankProviders(parsed, queryText);

  // If database providers are cached or available
  const dbRows = await getDatabaseProviders();
  if (dbRows && dbRows.length > 0) {
    const dbRanked = rankDatabaseProviders(dbRows, parsed, queryText);
    if (dbRanked.length > 0 || ranked.length === 0) {
      ranked = dbRanked;
    }
  }

  const isUrdu = parsed.language === 'ur';
  const serviceLabel = isUrdu ? serviceNamesUr[parsed.service] || 'گھریلو سروس' : serviceNames[parsed.service] || 'Home services';
  const areaLabel = parsed.area ? areaNames[parsed.area] ?? parsed.area.replaceAll('_', ' ') : null;

  const providers = ranked.map((provider) => ({
    ...provider,
    price: `From Rs ${provider.price.toLocaleString('en-PK')}`,
  }));

  const found = providers.length > 0;
  const ai_summary = found
    ? isUrdu
      ? `${serviceLabel} کے لیے ${providers.length} ماہرین دستیاب ہیں${areaLabel ? ` (${areaLabel})` : ''}۔`
      : `Matched ${providers.length} ${serviceLabel.toLowerCase()} professionals${areaLabel ? ` near ${areaLabel}` : ''}.`
    : isUrdu
    ? `معذرت! "${queryText}" کے لیے کوئی کاریگر نہیں ملا۔`
    : `No service or technician found matching "${queryText}".`;

  return NextResponse.json({
    parsed,
    usedAI,
    found,
    service: serviceNames[parsed.service],
    area: areaLabel,
    urgency: parsed.urgency,
    language: parsed.language,
    summary: parsed.summary,
    ai_summary,
    clarifying_question: parsed.clarifying_question,
    estimated_price_range: parsed.estimated_price_range,
    providers,
  });
}
