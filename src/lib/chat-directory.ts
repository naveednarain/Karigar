import { jobs, providers } from '@/lib/data';
import { marketProviders } from '@/lib/ai/rank';
import { getAllSyncedBookings } from '@/lib/sync';

export interface BookingChatContext {
  id?: string;
  bookingId?: string;
  category?: string;
  client?: string;
  providerName?: string;
}

export interface ChatConversation {
  bookingId: string;
  providerName: string;
  providerId?: string;
  providerTrade: string;
  customerName: string;
  customerArea: string;
  service: string;
  defaultMessage: string;
  defaultTime: string;
  online?: boolean;
}

// Canonical static seed conversations
export const SEED_CONVERSATIONS: ChatConversation[] = [
  {
    bookingId: 'KRG-2081',
    providerName: 'Ahsan Ali',
    providerId: 'p01',
    providerTrade: 'Master Plumber · 4.9 ★',
    customerName: 'Sana Ahmed',
    customerArea: 'Latifabad Unit 7',
    service: 'Pipeline Leakage Repair',
    defaultMessage: 'I will be waiting outside in front of my house. Thank you!',
    defaultTime: '16:01',
    online: true,
  },
  {
    bookingId: 'KRG-2083',
    providerName: 'Imran Memon',
    providerId: 'p02',
    providerTrade: 'AC & Electrical · 4.8 ★',
    customerName: 'Bilal Hussain',
    customerArea: 'Qasimabad',
    service: 'Split AC Gas Servicing',
    defaultMessage: 'Tomorrow at 10:00 AM works well for the AC inspection.',
    defaultTime: 'Yesterday',
    online: false,
  },
  {
    bookingId: 'KRG-2082',
    providerName: 'Nadeem Baloch',
    providerId: 'p03',
    providerTrade: 'Master Carpenter · 5.0 ★',
    customerName: 'Mariam Shah',
    customerArea: 'Jamshoro',
    service: 'Cabinet Door Lock Repair',
    defaultMessage: 'Work is finished and verified. Everything looks great.',
    defaultTime: 'Nov 15',
    online: false,
  },
];

// Static lookup for backward compatibility
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

  // Imran Memon (AC & Electrical) <-> Bilal Hussain (Qasimabad)
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
 * Robust case-insensitive name matching helper
 */
export function isNameMatch(nameA?: string | null, nameB?: string | null): boolean {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim();
  const b = nameB.toLowerCase().trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const partA = a.split(/\s+/)[0];
  const partB = b.split(/\s+/)[0];
  return Boolean(partA && partB && partA.length >= 3 && partA === partB);
}

/**
 * Register custom dynamic conversation metadata into localStorage
 */
export function registerConversationMeta(meta: ChatConversation) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('karigar_chat_directory');
    const map: Record<string, ChatConversation> = raw ? JSON.parse(raw) : {};
    map[meta.bookingId] = meta;
    localStorage.setItem('karigar_chat_directory', JSON.stringify(map));
  } catch {}
}

/**
 * Retrieves all registered dynamic conversations from localStorage
 */
export function getRegisteredConversations(): Record<string, ChatConversation> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('karigar_chat_directory');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

/**
 * Inspect stored localStorage messages for actual participant names
 */
export function getStoredChatParticipants(bookingId: string): {
  customerName?: string;
  providerName?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`karigar_chat_${bookingId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return {};

    let customerName: string | undefined;
    let providerName: string | undefined;

    for (let i = parsed.length - 1; i >= 0; i--) {
      const msg = parsed[i];
      if (!customerName && msg.sender_role === 'customer' && msg.sender_name) {
        customerName = msg.sender_name;
      }
      if (!providerName && msg.sender_role === 'provider' && msg.sender_name) {
        providerName = msg.sender_name;
      }
      if (customerName && providerName) break;
    }

    return { customerName, providerName };
  } catch {
    return {};
  }
}

/**
 * Returns strictly isolated conversations for the given user role and name.
 * - Providers only see conversations where they are the assigned provider.
 * - Customers only see conversations where they are the customer.
 * - Admins see all conversations.
 */
export function getConversationsForUser(
  role: 'provider' | 'customer' | 'admin' | string,
  userName?: string | null
): ChatConversation[] {
  // 1. Gather seed conversations
  const list: ChatConversation[] = SEED_CONVERSATIONS.map((c) => ({ ...c }));
  const idMap = new Map<string, ChatConversation>();
  list.forEach((c) => idMap.set(c.bookingId, c));

  // 2. Add or update dynamic conversations from localStorage
  const dynamicMap = getRegisteredConversations();
  for (const [id, conv] of Object.entries(dynamicMap)) {
    if (idMap.has(id)) {
      const existing = idMap.get(id)!;
      Object.assign(existing, conv);
    } else {
      idMap.set(id, conv);
      list.unshift(conv);
    }
  }

  // 3. Add synced bookings if any
  try {
    const synced = getAllSyncedBookings();
    for (const j of synced) {
      if (j.id && !idMap.has(j.id) && j.providerName && j.client) {
        const item: ChatConversation = {
          bookingId: j.id,
          providerName: j.providerName,
          providerTrade: j.category || 'Service Professional',
          customerName: j.client,
          customerArea: j.area || 'Hyderabad',
          service: j.type || 'Home Service',
          defaultMessage: `Booking #${j.id} request received for ${j.type || 'service'}.`,
          defaultTime: j.time || 'Today',
          online: false,
        };
        idMap.set(j.id, item);
        list.unshift(item);
      }
    }
  } catch {}

  // 4. Update customerName and providerName from stored message history if messages exist
  for (const c of list) {
    const stored = getStoredChatParticipants(c.bookingId);
    if (stored.customerName) {
      c.customerName = stored.customerName;
    }
    if (stored.providerName) {
      c.providerName = stored.providerName;
    }
  }

  // 5. Role-based strict isolation filtering
  if (role === 'admin') {
    return list;
  }

  const queryName = (userName || '').trim();

  if (role === 'provider') {
    const providerName = queryName || 'Ahsan Ali';
    return list.filter((c) => isNameMatch(c.providerName, providerName));
  }

  // Customer role
  const customerName = queryName || 'Sana Ahmed';
  return list.filter((c) => isNameMatch(c.customerName, customerName));
}

/**
 * Returns conversation IDs for a user to calculate personal unread notifications
 */
export function getConversationIdsForUser(
  role: 'provider' | 'customer' | 'admin' | string,
  userName?: string | null
): string[] {
  const convs = getConversationsForUser(role, userName);
  return convs.map((c) => c.bookingId);
}

/**
 * Resolves metadata for a specific conversation thread
 */
export function getConversationMeta(
  bookingId: string,
  currentUserName?: string | null,
  currentRole?: string | null
): {
  proName: string;
  proTrade: string;
  customerName: string;
  service: string;
  area: string;
  avatarInitials: string;
  customerInitials: string;
  defaultMessages: Array<{
    id: string;
    sender_role: 'provider' | 'customer';
    sender_name: string;
    body: string;
    created_at: string;
  }>;
} {
  // Check stored message participants first (highest ground truth)
  const stored = getStoredChatParticipants(bookingId);

  // Check dynamic registered
  const registered = getRegisteredConversations()[bookingId];

  // Check static seeds
  const seed = SEED_CONVERSATIONS.find((c) => c.bookingId === bookingId);

  // Check synced bookings
  let syncedBooking: any = null;
  try {
    const synced = getAllSyncedBookings();
    syncedBooking = synced.find((j) => j.id === bookingId || j.bookingId === bookingId);
  } catch {}

  // Check market providers
  const proId = bookingId.replace(/^c-/, '');
  const matchedPro = marketProviders.find(
    (p) => p.id === proId || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === proId
  );

  // Determine provider name
  let proName =
    (currentRole === 'provider' && currentUserName ? currentUserName : undefined) ||
    stored.providerName ||
    registered?.providerName ||
    seed?.providerName ||
    syncedBooking?.providerName ||
    matchedPro?.name ||
    'Service Professional';

  // Determine provider trade
  let proTrade =
    registered?.providerTrade ||
    seed?.providerTrade ||
    syncedBooking?.category ||
    matchedPro?.skill ||
    'Verified Professional';

  // Determine customer name
  let customerName =
    (currentRole === 'customer' && currentUserName ? currentUserName : undefined) ||
    stored.customerName ||
    registered?.customerName ||
    syncedBooking?.client ||
    seed?.customerName ||
    'Customer';

  // Determine service and area
  let service =
    registered?.service ||
    seed?.service ||
    syncedBooking?.type ||
    matchedPro?.skill ||
    'Home Service';

  let area =
    registered?.customerArea ||
    seed?.customerArea ||
    syncedBooking?.area ||
    matchedPro?.area ||
    'Hyderabad';

  const avatarInitials =
    proName
      .split(' ')
      .map((s: string) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PR';

  const customerInitials =
    customerName
      .split(' ')
      .map((s: string) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CU';

  const defaultMessages = [
    {
      id: 'def-1',
      sender_role: 'provider' as const,
      sender_name: proName,
      body: `Assalam-o-Alaikum! ${proName} here. I received your request #${bookingId}. How can I assist you?`,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return {
    proName,
    proTrade,
    customerName,
    service,
    area,
    avatarInitials,
    customerInitials,
    defaultMessages,
  };
}

/**
 * Resolves any booking ID, job, or provider to the exact canonical conversation ID.
 * Directs messages strictly to the specific provider and customer without mixing.
 */
export function resolveCanonicalChatId(
  identifier?: string | null,
  context?: BookingChatContext
): string {
  // 1. Static seed mappings for the 3 demo providers
  if (identifier && KNOWN_CANONICAL_MAP[identifier]) {
    return KNOWN_CANONICAL_MAP[identifier];
  }
  if (context?.bookingId && KNOWN_CANONICAL_MAP[context.bookingId]) {
    return KNOWN_CANONICAL_MAP[context.bookingId];
  }
  if (context?.id && KNOWN_CANONICAL_MAP[context.id]) {
    return KNOWN_CANONICAL_MAP[context.id];
  }

  // 2. Strict matching for seed professionals by specific name
  const pro = (context?.providerName || '').toLowerCase().trim();
  const client = (context?.client || '').toLowerCase().trim();

  if (pro.includes('ahsan') && (client.includes('sana') || !client)) {
    return 'KRG-2081';
  }
  if (pro.includes('imran') && (client.includes('bilal') || !client)) {
    return 'KRG-2083';
  }
  if (pro.includes('nadeem') && (client.includes('mariam') || !client)) {
    return 'KRG-2082';
  }

  // 3. For custom bookings (KRG-XXXX), each booking has its OWN isolated conversation!
  if (identifier && identifier.startsWith('KRG-')) {
    return identifier;
  }
  if (context?.bookingId && context.bookingId.startsWith('KRG-')) {
    return context.bookingId;
  }
  if (context?.id && context.id.startsWith('KRG-')) {
    return context.id;
  }

  // 4. For direct chat with a provider (e.g. from /provider/[id]), isolate by provider ID
  if (identifier) {
    return `c-${identifier}`;
  }
  if (context?.providerName) {
    const slug = context.providerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `c-${slug}`;
  }

  return 'KRG-2081';
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
