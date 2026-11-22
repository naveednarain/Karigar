import { jobs, providers } from '@/lib/data';

export interface BookingChatContext {
  id?: string;
  bookingId?: string;
  category?: string;
  client?: string;
  providerName?: string;
}

// Known canonical mappings for demo professionals and customers
const KNOWN_CANONICAL_MAP: Record<string, string> = {
  // Ahsan Ali (Plumbing) <-> Sana Ahmed (Latifabad)
  'KRG-2081': 'KRG-2081',
  'KRG-2084': 'KRG-2081',
  'KRG-2042': 'KRG-2081',
  'KRG-2043': 'KRG-2081',
  '10000000-0000-4000-8000-000000000206': 'KRG-2081',
  '10000000-0000-4000-8000-000000000202': 'KRG-2081',
  '10000000-0000-4000-8000-000000000203': 'KRG-2081',
  'p01': 'KRG-2081',
  'pro-ahsan-ali': 'KRG-2081',
  '3e21aded-f633-401c-971c-2f77c478caf9': 'KRG-2081',

  // Imran Memon (AC & Electrical) <-> Bilal Hussain / Sana Ahmed (Qasimabad)
  'KRG-2083': 'KRG-2083',
  'KRG-2085': 'KRG-2083',
  'KRG-2086': 'KRG-2083',
  '10000000-0000-4000-8000-000000000216': 'KRG-2083',
  '10000000-0000-4000-8000-000000000217': 'KRG-2083',
  'p02': 'KRG-2083',
  'pro-imran-memon': 'KRG-2083',
  'd924a543-308c-485e-b5e3-1656283439c4': 'KRG-2083',

  // Nadeem Baloch (Carpentry) <-> Mariam Shah (Jamshoro)
  'KRG-2082': 'KRG-2082',
  'KRG-2073': 'KRG-2082',
  '10000000-0000-4000-8000-000000000218': 'KRG-2082',
  'p03': 'KRG-2082',
  'pro-nadeem-baloch': 'KRG-2082',
  'e99d0dbb-e753-4ddb-a7ed-374917f741df': 'KRG-2082',
};

/**
 * Resolves any booking ID, job, or provider to the canonical active conversation ID.
 * If a customer has already contacted a provider, this guarantees the chat continues
 * in the real conversation thread rather than opening a disconnected empty thread.
 */
export function resolveCanonicalChatId(
  identifier?: string | null,
  context?: BookingChatContext
): string {
  if (!identifier && !context) return 'KRG-2081';

  // 1. Direct lookup in static known map
  if (identifier && KNOWN_CANONICAL_MAP[identifier]) {
    return KNOWN_CANONICAL_MAP[identifier];
  }

  // 2. Check context IDs
  if (context?.bookingId && KNOWN_CANONICAL_MAP[context.bookingId]) {
    return KNOWN_CANONICAL_MAP[context.bookingId];
  }
  if (context?.id && KNOWN_CANONICAL_MAP[context.id]) {
    return KNOWN_CANONICAL_MAP[context.id];
  }

  // 3. Check matching job from library
  const matchedJob = jobs.find(
    (j) =>
      (identifier && (j.id === identifier || j.bookingId === identifier)) ||
      (context?.id && (j.id === context.id || j.bookingId === context.id)) ||
      (context?.bookingId && (j.id === context.bookingId || j.bookingId === context.bookingId))
  );

  if (matchedJob) {
    if (matchedJob.id && KNOWN_CANONICAL_MAP[matchedJob.id]) {
      return KNOWN_CANONICAL_MAP[matchedJob.id];
    }
    if (matchedJob.bookingId && KNOWN_CANONICAL_MAP[matchedJob.bookingId]) {
      return KNOWN_CANONICAL_MAP[matchedJob.bookingId];
    }
  }

  // 4. Check category / provider name context
  const cat = (context?.category || matchedJob?.category || '').toLowerCase();
  const pro = (context?.providerName || '').toLowerCase();
  const client = (context?.client || matchedJob?.client || '').toLowerCase();

  if (cat.includes('plumb') || pro.includes('ahsan') || (client.includes('sana') && cat.includes('leak'))) {
    return 'KRG-2081';
  }
  if (cat.includes('ac') || cat.includes('electric') || pro.includes('imran') || client.includes('bilal')) {
    return 'KRG-2083';
  }
  if (cat.includes('carpenter') || pro.includes('nadeem') || client.includes('mariam')) {
    return 'KRG-2082';
  }

  // 5. Check persistent dynamic mappings in localStorage for custom created bookings
  if (typeof window !== 'undefined') {
    try {
      const storedMap = localStorage.getItem('karigar_chat_provider_map');
      if (storedMap) {
        const parsed = JSON.parse(storedMap);
        const key = identifier || context?.providerName || context?.id;
        if (key && parsed[key]) {
          return parsed[key];
        }
      }
    } catch {}
  }

  // Fallback to identifier or KRG-2081
  return identifier || context?.id || 'KRG-2081';
}

/**
 * Remember a custom provider/booking chat mapping in localStorage
 */
export function registerChatMapping(key: string, canonicalChatId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('karigar_chat_provider_map');
    const map = raw ? JSON.parse(raw) : {};
    map[key] = canonicalChatId;
    localStorage.setItem('karigar_chat_provider_map', JSON.stringify(map));
  } catch {}
}
