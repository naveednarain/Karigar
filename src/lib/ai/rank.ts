import type { ParsedQuery } from '@/lib/validators/search';

export type RankedProvider = {
  id: string;
  name: string;
  skill: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  jobs: number;
  available: boolean;
  responseMinutes: number;
  price: number;
  distance: number;
  services: string[];
  score: number;
  reason: string;
  verified: boolean;
  avatar: string;
};

const profiles: Array<[string, string, string, string, string, number, number, boolean, number, number, number, string[], string]> = [
  ['p01', 'Ahsan Ali', 'Master plumber', 'Latifabad', 'Hyderabad', 4.9, 126, true, 5, 850, 2.4, ['plumbing'], 'AA'],
  ['p02', 'Imran Memon', 'AC & electrical specialist', 'Qasimabad', 'Hyderabad', 4.8, 94, true, 8, 1200, 4.1, ['ac_service', 'electrical'], 'IM'],
  ['p03', 'Nadeem Baloch', 'Carpenter & furniture repair', 'Jamshoro', 'Jamshoro', 5.0, 61, true, 7, 1000, 3.2, ['carpentry'], 'NB'],
  ['p04', 'Farzana Bibi', 'Home cleaning professional', 'Latifabad', 'Hyderabad', 4.9, 83, false, 12, 1500, 1.8, ['cleaning'], 'FB'],
  ['p05', 'Rashid Hussain', 'Certified electrician', 'Qasimabad', 'Hyderabad', 4.7, 108, true, 6, 900, 3.5, ['electrical', 'solar'], 'RH'],
  ['p06', 'Kashif Brohi', 'AC & refrigeration technician', 'Jamshoro', 'Jamshoro', 4.8, 72, true, 10, 1300, 2.1, ['ac_service', 'appliance_repair'], 'KB'],
  ['p07', 'Sajid Chandio', 'Painter & wall finisher', 'Hirabad', 'Hyderabad', 4.6, 54, false, 18, 1600, 5.7, ['painting', 'mason'], 'SC'],
  ['p08', 'Shabana Memon', 'Deep cleaning specialist', 'Qasimabad', 'Hyderabad', 5.0, 42, true, 9, 1800, 3.9, ['cleaning'], 'SM'],
  ['p09', 'Javed Khaskheli', 'Plumbing & geyser repair', 'Kotri', 'Kotri', 4.7, 96, true, 11, 800, 6.2, ['plumbing'], 'JK'],
  ['p10', 'Muneer Ahmed', 'Solar installation technician', 'Jamshoro', 'Jamshoro', 4.9, 35, true, 14, 2500, 4.0, ['solar', 'electrical'], 'MA'],
  ['p11', 'Bilal Shaikh', 'Appliance repair technician', 'Latifabad', 'Hyderabad', 4.5, 67, false, 20, 1100, 2.0, ['appliance_repair'], 'BS'],
  ['p12', 'Adeel Rind', 'CCTV & network technician', 'Saddar', 'Hyderabad', 4.8, 58, true, 8, 1400, 2.8, ['cctv', 'electrical'], 'AR'],
  ['p13', 'Saima Qureshi', 'Pest control specialist', 'Autobhan', 'Hyderabad', 4.9, 77, true, 15, 2200, 4.2, ['pest_control'], 'SQ'],
  ['p14', 'Aslam Junejo', 'Mason & tile installer', 'Jamshoro', 'Jamshoro', 4.6, 105, true, 9, 1800, 3.0, ['mason'], 'AJ'],
  ['p15', 'Riaz Panhwar', 'Plumbing specialist', 'Hirabad', 'Hyderabad', 4.8, 89, true, 7, 750, 3.4, ['plumbing'], 'RP'],
  ['p16', 'Umar Farooq', 'AC installation & service', 'Qasimabad', 'Hyderabad', 4.7, 83, false, 15, 1400, 4.0, ['ac_service'], 'UF'],
  ['p17', 'Sohail Raza', 'Carpenter', 'Latifabad', 'Hyderabad', 4.8, 44, true, 8, 950, 2.2, ['carpentry'], 'SR'],
  ['p18', 'Nisar Ahmed', 'Painter', 'Kotri', 'Kotri', 4.5, 50, true, 13, 1500, 2.6, ['painting'], 'NA'],
  ['p19', 'Irfan Mangi', 'Pest control & fumigation', 'Jamshoro', 'Jamshoro', 4.8, 63, false, 19, 2400, 4.5, ['pest_control'], 'IM'],
  ['p20', 'Naveed Laghari', 'Fridge & washing machine repair', 'Qasimabad', 'Hyderabad', 4.9, 111, true, 6, 1000, 3.0, ['appliance_repair'], 'NL'],
  ['p21', 'Waseem Jokhio', 'Solar & inverter technician', 'Latifabad', 'Hyderabad', 4.7, 74, true, 10, 2000, 2.3, ['solar'], 'WJ'],
  ['p22', 'Hina Ali', 'Home cleaning', 'Autobhan', 'Hyderabad', 4.8, 52, true, 11, 1600, 3.1, ['cleaning'], 'HA'],
  ['p23', 'Zubair Memon', 'Electrician & UPS repair', 'Saddar', 'Hyderabad', 4.6, 134, true, 7, 850, 3.7, ['electrical'], 'ZM'],
  ['p24', 'Shahid Raza', 'CCTV installation technician', 'Qasimabad', 'Hyderabad', 4.9, 49, false, 16, 1550, 3.8, ['cctv'], 'SR'],
  // Newly seeded service providers:
  ['p25', 'Tariq Soomro', 'Water tank cleaning & disinfection', 'Naseem Nagar', 'Hyderabad', 5.0, 88, true, 6, 1400, 2.9, ['cleaning'], 'TS'],
  ['p26', 'Ghulam Mustafa', 'Inverter & solar UPS specialist', 'Citizen Colony', 'Hyderabad', 4.9, 142, true, 5, 1800, 3.1, ['solar', 'electrical'], 'GM'],
  ['p27', 'Master Rafiq', 'Sofa & carpet deep cleaner', 'Saddar', 'Hyderabad', 4.8, 65, true, 9, 2200, 2.5, ['cleaning'], 'MR'],
  ['p28', 'Danish Mallah', 'Geyser repair & gas pipeline pro', 'Latifabad', 'Hyderabad', 4.9, 115, true, 7, 950, 1.9, ['plumbing', 'appliance_repair'], 'DM'],
  ['p29', 'Faisal Shoro', 'Smart CCTV, intercom & biometric locks', 'Autobhan', 'Hyderabad', 4.9, 78, true, 8, 1600, 3.6, ['cctv'], 'FS'],
  ['p30', 'Akram Kazi', 'Inverter AC gas refill & PCB master', 'Latifabad', 'Hyderabad', 4.9, 160, true, 5, 1500, 2.0, ['ac_service'], 'AK'],
  ['p31', 'Barkat Ali', 'Custom kitchen cabinets & wood polish', 'Qasimabad', 'Hyderabad', 4.8, 90, true, 8, 1200, 3.8, ['carpentry'], 'BA'],
  ['p32', 'Ali Nawaz', 'Roof waterproofing & leakage control', 'Hirabad', 'Hyderabad', 4.7, 58, false, 15, 2500, 4.3, ['mason', 'painting'], 'AN'],
  ['p33', 'Zahid Thebo', 'Washing machine & microwave repair', 'Jamshoro', 'Jamshoro', 4.8, 82, true, 9, 1100, 2.8, ['appliance_repair'], 'ZT'],
  ['p34', 'Dr. Termite (Salman Shah)', 'Termite eradication & pest fumigation', 'Qasimabad', 'Hyderabad', 5.0, 95, true, 6, 3000, 3.4, ['pest_control'], 'SS'],
  ['p35', 'Kamran Kalhoro', 'House wiring & generator specialist', 'Gulistan-e-Sajjad', 'Hyderabad', 4.8, 110, true, 7, 1000, 3.2, ['electrical'], 'KK'],
  ['p36', 'Mukhtiar Ahmed', 'Wall texture, distemper & deco paint', 'Naseem Nagar', 'Hyderabad', 4.8, 72, true, 11, 1800, 3.0, ['painting'], 'MA'],
  ['p37', 'Waqar Jamali', 'Drainage jetting & sanitary expert', 'Jamshoro', 'Jamshoro', 4.9, 104, true, 8, 1100, 2.5, ['plumbing'], 'WJ'],
  ['p38', 'Babar Rind', 'Deep freezer & commercial cooling', 'Kotri', 'Kotri', 4.7, 89, true, 10, 1300, 4.5, ['appliance_repair', 'ac_service'], 'BR'],
  ['p39', 'Sohail Chandio', 'Marble polish & designer tile masonry', 'Qasimabad', 'Hyderabad', 4.9, 67, true, 7, 2200, 3.9, ['mason'], 'SC'],
  ['p40', 'Mansoor Nizamani', 'Net metering & rooftop solar arrays', 'Sindh University', 'Jamshoro', 4.9, 53, true, 12, 2800, 3.7, ['solar'], 'MN'],
];

export const marketProviders: RankedProvider[] = profiles.map(
  ([id, name, skill, area, city, rating, reviews, available, responseMinutes, price, distance, services, avatar]) => ({
    id: String(id),
    name: String(name),
    skill: String(skill),
    area: String(area),
    city: String(city),
    rating: Number(rating),
    reviews: Number(reviews),
    jobs: Number(reviews),
    available: Boolean(available),
    responseMinutes: Number(responseMinutes),
    price: Number(price),
    distance: Number(distance),
    services: services as string[],
    avatar: String(avatar),
    score: 0,
    reason: 'Verified local professional',
    verified: true,
  })
);

const cityFor = (slug: string | null) =>
  slug?.includes('jamshoro') || slug === 'muet' || slug === 'lumhs' || slug === 'sindh_university'
    ? 'Jamshoro'
    : slug === 'kotri' || slug === 'kotri_site'
    ? 'Kotri'
    : slug
    ? 'Hyderabad'
    : null;

const generalSearchWords = new Set([
  'all', 'home', 'service', 'services', 'karigar', 'repair', 'worker', 'pro', 'pros',
  'technician', 'technicians', 'help', 'maintenance', 'popular', 'top', 'trusted',
  'hyderabad', 'jamshoro', 'kotri', 'کام', 'کاریگر', 'گھر', 'مدد', 'سروس', 'سب'
]);

export function rankProviders(parsed: ParsedQuery, queryText = '') {
  const normQuery = queryText.toLowerCase().trim();
  const isGeneralSearch = !normQuery || generalSearchWords.has(normQuery) || Array.from(generalSearchWords).some(w => normQuery === w);
  const queryTokens = normQuery.split(/\s+/).filter((token) => token.length >= 3);

  // Find any direct matches by provider name or skill
  const directMatches = normQuery
    ? marketProviders.filter((p) => {
        const n = p.name.toLowerCase();
        const s = p.skill.toLowerCase();
        return (
          n.includes(normQuery) ||
          s.includes(normQuery) ||
          queryTokens.some((t) => n.includes(t) || s.includes(t))
        );
      })
    : [];

  let pool: RankedProvider[] = [];

  if (parsed.service !== 'other') {
    const serviceMatched = marketProviders.filter((p) => p.services.includes(parsed.service));
    const set = new Set(serviceMatched.map((p) => p.id));
    pool = [...serviceMatched];
    // Always include direct name matches even if different category
    for (const dm of directMatches) {
      if (!set.has(dm.id)) {
        pool.unshift(dm);
        set.add(dm.id);
      }
    }
  } else if (normQuery) {
    if (directMatches.length > 0) {
      pool = directMatches;
    } else if (isGeneralSearch) {
      pool = marketProviders;
    } else {
      // Unrecognized service/query -> return EMPTY so UI clearly shows "No services found"
      return [];
    }
  } else {
    // Empty search -> top providers
    pool = marketProviders;
  }

  return pool
    .map((provider) => {
      const areaMatch = parsed.area
        ? provider.area.toLowerCase().replaceAll(' ', '_') === parsed.area
          ? 25
          : provider.city === cityFor(parsed.area)
          ? 12
          : 0
        : 15;
      const availability = provider.available ? 25 : 0;
      const rating = (provider.rating / 5) * 20;
      const distance = Math.max(0, 10 - provider.distance * 1.25);
      const response = Math.max(0, 10 - provider.responseMinutes / 3);
      const jobs = Math.min(10, provider.jobs / 12);

      // Name & skill relevance bonus
      const pName = provider.name.toLowerCase();
      const pSkill = provider.skill.toLowerCase();
      let textBonus = 0;
      if (normQuery) {
        if (pName.includes(normQuery) || normQuery.includes(pName)) {
          textBonus += 500;
        } else {
          for (const token of queryTokens) {
            if (pName.includes(token)) {
              textBonus += 300;
            } else if (pSkill.includes(token)) {
              textBonus += 80;
            }
          }
        }
      }

      const score = Math.round(availability + areaMatch + rating + distance + response + jobs + textBonus);
      const areaReason =
        provider.distance < 3 ? 'Nearby' : provider.city === cityFor(parsed.area) ? 'Same city' : provider.area;
      return {
        ...provider,
        score,
        reason: `${areaReason} · ${provider.rating.toFixed(1)}★ · replies in ${provider.responseMinutes} min`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}

export function rankDatabaseProviders(
  rows: Array<{
    id: string;
    full_name: string | null;
    skill_title: string | null;
    headline: string | null;
    city: string | null;
    area_names: string[];
    area_slugs: string[];
    service_slugs: string[];
    rating_avg: number;
    rating_count: number;
    jobs_completed: number;
    is_available: boolean;
    response_minutes: number;
    visit_fee: number;
    minimum_price: number | null;
    is_verified: boolean;
  }>,
  parsed: ParsedQuery,
  queryText = ''
) {
  const normQuery = queryText.toLowerCase().trim();
  const isGeneralSearch = !normQuery || generalSearchWords.has(normQuery) || Array.from(generalSearchWords).some(w => normQuery === w);
  const queryTokens = normQuery.split(/\s+/).filter((token) => token.length >= 3);

  // Find any direct matches by provider name or skill
  const directMatches = normQuery
    ? rows.filter((r) => {
        const n = (r.full_name || '').toLowerCase();
        const s = `${r.skill_title || ''} ${r.headline || ''}`.toLowerCase();
        return (
          n.includes(normQuery) ||
          s.includes(normQuery) ||
          queryTokens.some((t) => n.includes(t) || s.includes(t))
        );
      })
    : [];

  let pool = rows;
  if (parsed.service !== 'other') {
    const serviceMatched = rows.filter((row) => row.service_slugs.includes(parsed.service));
    const set = new Set(serviceMatched.map((r) => r.id));
    pool = [...serviceMatched];
    // Always include direct name matches even if different category
    for (const dm of directMatches) {
      if (!set.has(dm.id)) {
        pool.unshift(dm);
        set.add(dm.id);
      }
    }
  } else if (normQuery) {
    if (directMatches.length > 0) {
      pool = directMatches;
    } else if (isGeneralSearch) {
      pool = rows;
    } else {
      // Unrecognized service/query -> return EMPTY so UI clearly shows "No services found"
      return [];
    }
  }

  return pool
    .map((row) => {
      const areaMatch = parsed.area
        ? row.area_slugs.includes(parsed.area)
          ? 25
          : row.city === cityFor(parsed.area)
          ? 12
          : 0
        : 15;
      const distance = row.area_slugs.includes(parsed.area || '') ? 2 : row.city === cityFor(parsed.area) ? 7 : 11;
      const response = Math.max(0, 10 - row.response_minutes / 3);
      const rating = (row.rating_avg / 5) * 20;
      const availability = row.is_available ? 25 : 0;
      const jobs = Math.min(10, row.jobs_completed / 12);
      const distanceScore = Math.max(0, 10 - distance * 1.25);

      // Name & skill relevance bonus
      const rName = (row.full_name || '').toLowerCase();
      const rSkill = `${row.skill_title || ''} ${row.headline || ''}`.toLowerCase();
      let textBonus = 0;
      if (normQuery) {
        if (rName.includes(normQuery) || normQuery.includes(rName)) {
          textBonus += 500;
        } else {
          for (const token of queryTokens) {
            if (rName.includes(token)) {
              textBonus += 300;
            } else if (rSkill.includes(token)) {
              textBonus += 80;
            }
          }
        }
      }

      const score = Math.round(availability + areaMatch + rating + response + jobs + distanceScore + textBonus);
      const area = row.area_names?.[0] || row.city || 'Hyderabad';
      const reason = `${distance < 3 ? 'Nearby' : row.city === cityFor(parsed.area) ? 'Same city' : area} · ${row.rating_avg.toFixed(1)}★ · replies in ${row.response_minutes} min`;
      return {
        id: row.id,
        name: row.full_name || 'Local professional',
        skill: row.skill_title || row.headline || 'Home service professional',
        area,
        city: row.city || 'Hyderabad',
        rating: row.rating_avg,
        reviews: row.rating_count,
        jobs: row.jobs_completed,
        available: row.is_available,
        responseMinutes: row.response_minutes,
        price: row.minimum_price || row.visit_fee,
        distance,
        services: row.service_slugs,
        score,
        reason,
        verified: row.is_verified,
        avatar: (row.full_name || 'K')
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join(''),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}
