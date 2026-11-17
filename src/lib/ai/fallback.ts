import type { ParsedQuery } from '@/lib/validators/search';

const services: Record<
  Exclude<ParsedQuery['service'], 'other'>,
  { words: string[]; price: [number, number]; label: string; labelUr: string }
> = {
  plumbing: {
    words: [
      'plumb', 'plumber', 'leak', 'leakage', 'tap', 'pipe', 'pipeline', 'geyser', 'tank', 'drain',
      'drainage', 'sink', 'toilet', 'flush', 'washroom', 'sanitary', 'nal', 'pani', 'tonti', 'water tank',
      'motor', 'boring', 'نل', 'پانی', 'پائپ', 'گیزر', 'ٹونٹی', 'لیک', 'پلمبر', 'موٹر', 'سینیٹری', 'ڈرین'
    ],
    price: [700, 5000],
    label: 'Plumbing',
    labelUr: 'پلمبر',
  },
  electrical: {
    words: [
      'electric', 'electrician', 'wiring', 'wire', 'fan', 'switch', 'socket', 'light', 'breaker',
      'short circuit', 'bijli', 'pankha', 'taar', 'ups', 'generator', 'bulb', 'chhat ka pankha',
      'بجلی', 'پنکھا', 'سوئچ', 'وائرنگ', 'تار', 'یو پی ایس', 'الیکٹریشن', 'بریکر', 'لائٹ'
    ],
    price: [600, 6000],
    label: 'Electrical',
    labelUr: 'الیکٹریشن',
  },
  ac_service: {
    words: [
      'ac', 'air condition', 'air conditioner', 'cooling', 'gas refill', 'gas charging', 'inverter ac',
      'split ac', 'ac repair', 'ac installation', 'ac servicing', 'thandi', 'thanda',
      'اے سی', 'ایئر کنڈیشنر', 'ٹھنڈا', 'گیس چارجنگ', 'کولنگ', 'اسپلٹ اے سی'
    ],
    price: [1200, 15000],
    label: 'AC service',
    labelUr: 'اے سی سروس',
  },
  painting: {
    words: [
      'paint', 'painter', 'painting', 'wall color', 'distemper', 'deco', 'polish', 'texture', 'rang',
      'safedi', 'roghan', 'رنگ', 'پینٹ', 'پینٹر', 'ڈسٹمبر', 'روغن', 'سفیدی'
    ],
    price: [1500, 60000],
    label: 'Painting',
    labelUr: 'رنگ و روغن',
  },
  carpentry: {
    words: [
      'carpenter', 'carpentry', 'wood', 'wooden', 'door', 'lock', 'kundi', 'almari', 'wardrobe',
      'furniture', 'table', 'chair', 'bed', 'cabinet', 'darwaza', 'badhai', 'polish',
      'بڑھئی', 'دروازہ', 'الماری', 'فرنیچر', 'لکڑی', 'لاک', 'کنڈی'
    ],
    price: [800, 20000],
    label: 'Carpentry',
    labelUr: 'کارپینٹر',
  },
  cleaning: {
    words: [
      'clean', 'cleaning', 'cleaner', 'deep clean', 'safai', 'wash', 'water tank cleaning',
      'sofa clean', 'carpet clean', 'floor cleaning', 'jhadoo', 'pocha',
      'صفائی', 'جھاڑو', 'پوچھا', 'سوپھا کلیننگ', 'واٹر ٹینک کلیننگ', 'دھلائی'
    ],
    price: [1500, 12000],
    label: 'Cleaning',
    labelUr: 'صفائی',
  },
  mason: {
    words: [
      'mason', 'masonry', 'tiles', 'tile fitting', 'marble', 'marble polish', 'plaster', 'cement',
      'roof leak', 'waterproofing', 'deewar', 'raaj', 'mistri', 'farsh', 'repair wall',
      'مستری', 'ٹائل', 'ماربل', 'دیوار', 'پلاسٹر', 'واٹر پروفنگ', 'راج مستری'
    ],
    price: [2000, 50000],
    label: 'Mason / tiles',
    labelUr: 'راج مستری',
  },
  appliance_repair: {
    words: [
      'fridge', 'refrigerator', 'freezer', 'deep freeze', 'washer', 'washing machine', 'dryer',
      'microwave', 'oven', 'dispenser', 'iron', 'istri', 'appliance',
      'فریج', 'واشنگ مشین', 'اوون', 'مائیکروویو', 'ڈسپنسر', 'استری'
    ],
    price: [1000, 8000],
    label: 'Appliance repair',
    labelUr: 'ایپلائنس مرمت',
  },
  solar: {
    words: [
      'solar', 'solar panel', 'solar plate', 'inverter', 'net metering', 'solar installation',
      'solar ups', 'plate fitting', 'سولر', 'انورٹر', 'سولر پینل', 'نیٹ میٹرنگ'
    ],
    price: [2000, 100000],
    label: 'Solar',
    labelUr: 'سولر سسٹم',
  },
  cctv: {
    words: [
      'cctv', 'camera', 'security camera', 'ip camera', 'dvr', 'nvr', 'intercom', 'wifi', 'networking',
      'سی سی ٹی وی', 'کیمرہ', 'سیکیورٹی کیمرہ', 'انٹرکام', 'وائی فائی'
    ],
    price: [1500, 40000],
    label: 'CCTV',
    labelUr: 'سی سی ٹی وی',
  },
  pest_control: {
    words: [
      'pest', 'pest control', 'cockroach', 'termite', 'deemak', 'bedbug', 'khatmal', 'fumigation',
      'spray', 'mosquito', 'keeray', 'مچھر', 'دیمک', 'کیڑے', 'کھٹمل', 'فیومیگیشن', 'کیڑے مار'
    ],
    price: [2500, 10000],
    label: 'Pest control',
    labelUr: 'کیڑے مار اسپرے',
  },
};

const areas: Array<[string, string[]]> = [
  ['latifabad', ['latifabad', 'latifabad hyderabad', 'لطیف آباد']],
  ['qasimabad', ['qasimabad', 'qasimabad hyderabad', 'قاسم آباد']],
  ['naseem_nagar', ['naseem nagar', 'نسیم نگر']],
  ['citizen_colony', ['citizen colony', 'سٹیزن کالونی']],
  ['gulistan_e_sajjad', ['gulistan-e-sajjad', 'gulistan e sajjad', 'gulistansajjad', 'گلستان سجاد']],
  ['qasimabad_phase2', ['qasimabad phase 2', 'qasimabad phase ii', 'قاسم آباد فیز 2']],
  ['dha_hyderabad', ['dha hyderabad', 'dha', 'ڈی ایچ اے']],
  ['sindh_university', ['sindh university', 'sindh uni', 'سندھ یونیورسٹی']],
  ['muet', ['muet', 'mehran university', 'مہران یونیورسٹی', 'مؤٹ']],
  ['lumhs', ['lumhs', 'liaquat medical', 'لمس']],
  ['jamshoro', ['jamshoro', 'jamshoro city', 'جامشورو']],
  ['jamshoro_phase2', ['jamshoro phase 2', 'جامشورو فیز 2']],
  ['kotri', ['kotri', 'kotri city', 'کوٹری']],
  ['kotri_site', ['kotri site', 'کوٹری سائٹ']],
  ['hirabad', ['hirabad', 'heerabad', 'حیرآباد', 'ہیرآباد']],
  ['saddar', ['saddar', 'saddar hyderabad', 'صدر']],
  ['autobhan', ['autobhan', 'autobahn', 'autobhan road', 'آٹوبھان']],
  ['cantt', ['cantt', 'hyderabad cantt', 'کینٹ']],
  ['abdullah_sports_city', ['abdullah sports city', 'عبداللہ اسپورٹس سٹی']],
  ['tilak_incline', ['tilak incline', 'تلک انکلائن']],
  ['gulshan_e_zia', ['gulshan-e-zia', 'gulshan e zia', 'گلشن ضیاء']],
  ['phuleli', ['phuleli', 'پھلیلی']],
  ['kohsar', ['kohsar', 'کوہسار']],
  ['sikandarabad', ['sikandarabad', 'سکندرآباد']],
];

export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function matchTerm(text: string, term: string): boolean {
  const normTerm = normalize(term);
  if (!normTerm) return false;
  // Exact match or bounded by spaces
  return (
    text === normTerm ||
    text.startsWith(`${normTerm} `) ||
    text.endsWith(` ${normTerm}`) ||
    text.includes(` ${normTerm} `)
  );
}

export function fallbackParse(input: string): ParsedQuery {
  const query = normalize(input);
  const isUrduScript = /[؀-ۿ]/.test(input);
  const isRomanUrdu = /\b(nal|mera|meri|raha|rahi|ho raha|chahiye|pani|bijli|aaj|kal|mein|kar raha|theek|karna|wala|wali|kharab)\b/i.test(input);
  const language: ParsedQuery['language'] = isUrduScript ? 'ur' : isRomanUrdu ? 'roman_ur' : 'en';

  let service: ParsedQuery['service'] = 'other';
  let selected = Object.values(services)[0];
  let matched = false;

  for (const [slug, data] of Object.entries(services) as Array<[Exclude<ParsedQuery['service'], 'other'>, typeof selected]>) {
    if (data.words.some((word) => matchTerm(query, word))) {
      service = slug;
      selected = data;
      matched = true;
      break;
    }
  }

  let area: string | null = null;
  for (const [slug, words] of areas) {
    if (words.some((w) => matchTerm(query, w))) {
      area = slug;
      break;
    }
  }

  const urgency: ParsedQuery['urgency'] = /\b(abhi|foran|urgent|emergency|asap|jaldi)\b|فوری|ابھی|جلدی/i.test(query)
    ? 'emergency'
    : /\b(aaj|today)\b|آج/i.test(query)
    ? 'today'
    : /\b(kal|parson|tomorrow|scheduled)\b|کل|پرسوں/i.test(query)
    ? 'scheduled'
    : 'flexible';

  const budgetMatch = query.match(/(?:rs|pkr|rupees?)\s*([\d,]+)/i);
  const budget_pkr = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : null;

  const label = matched ? (language === 'ur' ? selected.labelUr : selected.label) : (language === 'ur' ? 'گھریلو سروس' : 'Home service');
  const areaName = area ? area.replaceAll('_', ' ') : null;
  const summary = matched
    ? `${label}${areaName ? ` near ${areaName}` : ''}`
    : `Search query: ${input.trim()}`;

  const range = matched
    ? `PKR ${selected.price[0].toLocaleString('en-PK')} – ${selected.price[1].toLocaleString('en-PK')}`
    : null;

  const clarify = !matched
    ? language === 'ur'
      ? 'آپ کو گھر کے کس کام کے لیے کاریگر چاہیے؟ (مثلاً پلمبر، اے سی، الیکٹریشن)'
      : language === 'roman_ur'
      ? 'Aap ko kis service ke liye karigar chahiye? (e.g. AC, plumber, bijli)'
      : 'What kind of home service do you need? (e.g. AC service, plumbing, electrician)'
    : !area
    ? language === 'ur'
      ? 'آپ کا علاقہ کون سا ہے؟ (مثلاً قاسم آباد، لطیف آباد، جامشورو)'
      : language === 'roman_ur'
      ? 'Aap kis area mein hain? (e.g. Qasimabad, Latifabad, Jamshoro)'
      : 'Which area should we look in? (e.g. Qasimabad, Latifabad, Jamshoro)'
    : null;

  const suggested_tags: string[] = [];
  if (urgency === 'emergency') suggested_tags.push('Urgent visit');
  if (areaName) suggested_tags.push(areaName);
  if (matched) suggested_tags.push(selected.label);

  return {
    service,
    sub_service: null,
    area,
    urgency,
    preferred_date: null,
    budget_pkr,
    language,
    estimated_price_range: range,
    suggested_tags: suggested_tags.slice(0, 3),
    summary,
    clarifying_question: clarify,
  };
}
