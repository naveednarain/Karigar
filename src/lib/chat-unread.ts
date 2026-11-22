import { getConversationIdsForUser } from './chat-directory';

export type ChatRole = 'customer' | 'provider';

export interface ChatMessageSummary {
  id: string;
  sender_role: 'customer' | 'provider';
  sender_name?: string;
  body: string;
  created_at: string;
}

const STORAGE_SEEN_KEY = 'karigar_chat_seen_v2';
const STORAGE_CHAT_PREFIX = 'karigar_chat_';

// Default initial unread conversation configs for the default simulated conversations
// In KRG-2081: Customer (Sana Ahmed) sent the latest message -> unread for Provider
// In KRG-2083: Provider (Imran Memon) sent the latest message -> unread for Customer
// In KRG-2082: Customer (Mariam Shah) and Provider (Nadeem Baloch) are both read
const DEFAULT_FALLBACK_MESSAGES: Record<string, ChatMessageSummary[]> = {
  'KRG-2081': [
    {
      id: 'msg-1',
      sender_role: 'provider',
      sender_name: 'Ahsan Ali',
      body: 'Assalam-o-Alaikum Sana! I have accepted your plumbing repair request for Latifabad.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-2',
      sender_role: 'provider',
      sender_name: 'Ahsan Ali',
      body: "I am gathering the PVC pipe fittings and Teflon tape. I'll be at your location in approx 25 minutes.",
      created_at: new Date(Date.now() - 2400000).toISOString(),
    },
    {
      id: 'msg-3',
      sender_role: 'customer',
      sender_name: 'Sana Ahmed',
      body: 'Walaikum Assalam Ahsan bhai. I am waiting at the main gate. Please call when you reach the lane.',
      created_at: new Date(Date.now() - 1200000).toISOString(),
    },
  ],
  'KRG-2083': [
    {
      id: 'msg-101',
      sender_role: 'provider',
      sender_name: 'Imran Memon',
      body: 'Hello Bilal! Received your AC gas charging and cooling check booking for Qasimabad.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg-102',
      sender_role: 'customer',
      sender_name: 'Bilal Hussain',
      body: 'Yes Imran bhai, cooling is very low and outdoor unit seems to be tripping frequently.',
      created_at: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 'msg-103',
      sender_role: 'provider',
      sender_name: 'Imran Memon',
      body: 'Understood. I will bring the manifold gauge and R410A gas cylinder for pressure check.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  'KRG-2082': [
    {
      id: 'msg-201',
      sender_role: 'provider',
      sender_name: 'Nadeem Baloch',
      body: 'Assalam-o-Alaikum! Nadeem Baloch here regarding your woodwork appointment in Jamshoro.',
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'msg-202',
      sender_role: 'customer',
      sender_name: 'Mariam Shah',
      body: 'Work is finished and verified. Everything looks great.',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ],
};

export function getChatSeenMap(): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveChatSeenMap(map: Record<string, Record<string, number>>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Returns the timestamp (ms) when this role last viewed/seen this chat.
 * If never viewed yet, defaults to a timestamp that leaves incoming unread messages active.
 */
export function getSeenTimestamp(bookingId: string, role: ChatRole): number {
  const map = getChatSeenMap();
  if (map[bookingId]?.[role] !== undefined) {
    return map[bookingId][role];
  }

  // Initial demo defaults:
  // For KRG-2081, customer sent msg-3 at (now - 20m). Provider hasn't seen it yet.
  if (bookingId === 'KRG-2081') {
    return role === 'provider' ? Date.now() - 30 * 60 * 1000 : Date.now();
  }
  // For KRG-2083, provider sent msg-103 at (now - 60m). Customer hasn't seen it yet.
  if (bookingId === 'KRG-2083') {
    return role === 'customer' ? Date.now() - 90 * 60 * 1000 : Date.now();
  }

  // Default to now for already completed/read older chats
  return Date.now();
}

/**
 * Mark a conversation as seen right now by the given role.
 * Resets the unread counter for this role to 0.
 */
export function markChatSeen(bookingId: string, role: ChatRole) {
  if (typeof window === 'undefined') return;
  const map = getChatSeenMap();
  if (!map[bookingId]) map[bookingId] = {};
  map[bookingId][role] = Date.now();
  saveChatSeenMap(map);

  // Dispatch events so badges across tabs & components update immediately
  window.dispatchEvent(new Event('karigar_messages_read'));
  window.dispatchEvent(new Event('karigar_chat_updated'));
}

/**
 * Mark all conversations as seen by the role (e.g. "Mark all as read" button).
 */
export function markAllChatsSeen(role: ChatRole, bookingIds: string[]) {
  if (typeof window === 'undefined') return;
  const map = getChatSeenMap();
  const now = Date.now();
  for (const id of bookingIds) {
    if (!map[id]) map[id] = {};
    map[id][role] = now;
  }
  saveChatSeenMap(map);
  window.dispatchEvent(new Event('karigar_messages_read'));
  window.dispatchEvent(new Event('karigar_chat_updated'));
}

/**
 * Read the list of messages for a booking from localStorage or fallbacks.
 */
export function getConversationMessages(
  bookingId: string,
  fallback?: ChatMessageSummary[]
): ChatMessageSummary[] {
  if (typeof window === 'undefined') return fallback || DEFAULT_FALLBACK_MESSAGES[bookingId] || [];
  try {
    const stored = localStorage.getItem(`${STORAGE_CHAT_PREFIX}${bookingId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return fallback || DEFAULT_FALLBACK_MESSAGES[bookingId] || [];
}

/**
 * Calculate the exact count of unread messages for a role in a booking.
 */
export function getConversationUnreadCount(
  bookingId: string,
  role: ChatRole,
  fallback?: ChatMessageSummary[]
): number {
  if (typeof window === 'undefined') return 0;
  const messages = getConversationMessages(bookingId, fallback);
  if (!messages || messages.length === 0) return 0;

  const seenAt = getSeenTimestamp(bookingId, role);

  let unread = 0;
  for (const m of messages) {
    // Only count messages sent by the other party
    if (m.sender_role && m.sender_role !== role) {
      const createdAtMs = new Date(m.created_at).getTime();
      if (createdAtMs > seenAt) {
        unread++;
      }
    }
  }
  return unread;
}

/**
 * Calculate total unread count across all tracked conversations for a role.
 * Strictly calculates based on the specific user's isolated conversations.
 */
export function getTotalUnreadCount(
  role: ChatRole,
  userNameOrBookingIds?: string | string[]
): number {
  if (typeof window === 'undefined') return 0;
  let targetIds: string[];
  if (Array.isArray(userNameOrBookingIds)) {
    targetIds = userNameOrBookingIds;
  } else if (typeof userNameOrBookingIds === 'string' && userNameOrBookingIds.trim().length > 0) {
    targetIds = getConversationIdsForUser(role, userNameOrBookingIds);
  } else {
    targetIds = getConversationIdsForUser(role);
  }
  let total = 0;
  for (const id of targetIds) {
    total += getConversationUnreadCount(id, role);
  }
  return total;
}
