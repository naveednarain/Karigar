'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, FormEvent, ChangeEvent } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  ImagePlus,
  Phone,
  Send,
  X,
  BadgeCheck,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { jobs } from '@/lib/data';
import { markChatSeen } from '@/lib/chat-unread';
import {
  resolveCanonicalChatId,
  getConversationMeta,
  registerConversationMeta,
  isNameMatch,
} from '@/lib/chat-directory';

export type ChatMessage = {
  id: string;
  sender_role: 'customer' | 'provider';
  sender_name: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  images?: string[];
};

// Realistic metadata lookup per booking ID
const bookingDirectory: Record<
  string,
  {
    proName: string;
    proTrade: string;
    customerName: string;
    service: string;
    area: string;
    avatarInitials: string;
    customerInitials: string;
    defaultMessages: ChatMessage[];
  }
> = {
  'KRG-2081': {
    proName: 'Ahsan Ali',
    proTrade: 'Master Plumber',
    customerName: 'Sana Ahmed',
    service: 'Pipeline Leakage Repair',
    area: 'Latifabad Unit 7',
    avatarInitials: 'AA',
    customerInitials: 'SA',
    defaultMessages: [
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
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
        ],
      },
    ],
  },
  'KRG-2083': {
    proName: 'Imran Memon',
    proTrade: 'AC & Electrician',
    customerName: 'Bilal Hussain',
    service: 'Split AC Gas Inverter Servicing',
    area: 'Qasimabad Phase 1',
    avatarInitials: 'IM',
    customerInitials: 'BH',
    defaultMessages: [
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
  },
  'KRG-2082': {
    proName: 'Nadeem Baloch',
    proTrade: 'Master Carpenter',
    customerName: 'Mariam Shah',
    service: 'Cabinet Door Lock Repair',
    area: 'Jamshoro City',
    avatarInitials: 'NB',
    customerInitials: 'MS',
    defaultMessages: [
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
        body: 'Hello Nadeem, the lock mechanism is jammed and the hinge needs tightening.',
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
  },
};

function normalizeMessage(m: any): ChatMessage {
  const role: 'customer' | 'provider' =
    m.sender_role === 'provider' || m.sender_role === 'customer'
      ? m.sender_role
      : m.sender_id === 'other'
      ? 'provider'
      : 'customer';

  return {
    id: m.id || crypto.randomUUID(),
    sender_role: role,
    sender_name: m.sender_name || (role === 'provider' ? 'Ahsan Ali' : 'Sana Ahmed'),
    body: m.body || '',
    created_at: m.created_at || new Date().toISOString(),
    images: Array.isArray(m.images) ? m.images : undefined,
  };
}

export function ChatThread({
  bookingId,
  initialUser,
}: {
  bookingId: string;
  initialUser?: { id?: string; name?: string; role?: string } | null;
}) {
  const locale = useLocale();
  const router = useRouter();

  // Resolve to canonical conversation ID so that ongoing chats continue seamlessly
  const canonicalId = resolveCanonicalChatId(bookingId);

  // Synchronously initialize currentUser and activeRole to prevent any 1st-render visual flicker
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; role?: string } | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('karigar_cached_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState<'customer' | 'provider'>(() => {
    if (initialUser?.role === 'provider') return 'provider';
    if (initialUser?.role === 'user') return 'customer';
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('karigar_cached_user');
        if (cached) {
          const u = JSON.parse(cached);
          if (u?.role === 'provider') return 'provider';
          if (u?.role === 'user') return 'customer';
        }
      } catch {}
    }
    return 'customer';
  });

  useEffect(() => {
    // Detect current authenticated persona from /api/auth/me
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setCurrentUser(d.user);
          try {
            localStorage.setItem('karigar_cached_user', JSON.stringify(d.user));
          } catch {}
          const role = d.user.role === 'provider' ? 'provider' : 'customer';
          setActiveRole(role);
          markChatSeen(canonicalId, role);
        }
      })
      .catch(() => {});
  }, [canonicalId]);

  // Dynamically resolve metadata for the exact provider and customer
  const meta = useMemo(() => {
    return getConversationMeta(canonicalId, currentUser?.name, activeRole);
  }, [canonicalId, currentUser?.name, activeRole]);

  const storageKey = `karigar_chat_${canonicalId}`;
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const tail = useRef<HTMLDivElement>(null);

  // Load chat messages from localStorage on mount & listen for real-time cross-tab sync
  useEffect(() => {
    const loadAndMarkRead = () => {
      try {
        // Mark this conversation as seen immediately for current active perspective
        markChatSeen(canonicalId, activeRole);

        // Load messages
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed.map(normalizeMessage));
          } else {
            setItems(meta.defaultMessages);
            localStorage.setItem(storageKey, JSON.stringify(meta.defaultMessages));
          }
        } else {
          setItems(meta.defaultMessages);
          localStorage.setItem(storageKey, JSON.stringify(meta.defaultMessages));
        }
      } catch {
        setItems(meta.defaultMessages);
      }
    };

    loadAndMarkRead();

    // Listen for incoming messages from other tabs or actions
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed.map(normalizeMessage));
            // Since user is currently actively looking at this chat, mark seen
            markChatSeen(canonicalId, activeRole);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('karigar_chat_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('karigar_chat_updated', handleSync);
    };
  }, [canonicalId, storageKey, meta.defaultMessages, activeRole]);

  function saveMessages(newItems: ChatMessage[]) {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
      // Mark seen for the sender
      markChatSeen(canonicalId, activeRole);
      window.dispatchEvent(new Event('karigar_chat_updated'));
      window.dispatchEvent(new Event('karigar_messages_read'));
    } catch {}
  }

  useEffect(() => {
    tail.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, url]);
    toast.success('Photo attached to message.');
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text && pendingImages.length === 0) return;

    const senderName =
      activeRole === 'provider'
        ? (currentUser?.name || meta.proName)
        : (currentUser?.name || meta.customerName);

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender_role: activeRole,
      sender_name: senderName,
      body: text || (pendingImages.length > 0 ? 'Sent photo' : ''),
      created_at: new Date().toISOString(),
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    };

    const updated = [...items, newMessage];
    saveMessages(updated);

    // Register conversation metadata with exact sender persona
    registerConversationMeta({
      bookingId: canonicalId,
      providerName: activeRole === 'provider' ? senderName : meta.proName,
      providerTrade: meta.proTrade,
      customerName: activeRole === 'customer' ? senderName : meta.customerName,
      customerArea: meta.area,
      service: meta.service,
      defaultMessage: newMessage.body,
      defaultTime: 'Just now',
    });

    setBody('');
    setPendingImages([]);
  }

  // Perspective calculations:
  // Strictly prevent own-name visual flicker: if currentUser is the provider, viewer is provider!
  // If currentUser is the customer, viewer is customer!
  const isViewingAsCustomer = useMemo(() => {
    if (currentUser?.name) {
      if (isNameMatch(currentUser.name, meta.proName)) return false;
      if (isNameMatch(currentUser.name, meta.customerName)) return true;
    }
    return activeRole === 'customer';
  }, [currentUser?.name, meta.proName, meta.customerName, activeRole]);

  const otherPartyName = isViewingAsCustomer ? meta.proName : meta.customerName;
  const otherPartyTrade = isViewingAsCustomer ? meta.proTrade : `Customer · ${meta.area}`;
  const otherPartyInitials = isViewingAsCustomer ? meta.avatarInitials : meta.customerInitials;
  const otherPartyPhoneLabel = isViewingAsCustomer ? 'Call Pro' : 'Call Customer';
  const mySenderName = isViewingAsCustomer ? meta.customerName : meta.proName;

  return (
    <main className="flex h-screen flex-col bg-[#f5f8f5] dark:bg-[#080d09] text-ink dark:text-slate-100 transition-colors">
      {/* Top Header Bar */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                {otherPartyInitials}
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <b className="text-sm font-bold text-ink dark:text-white truncate">
                  {otherPartyName}
                </b>
                <BadgeCheck size={15} className="text-emerald-600 shrink-0" />
              </div>
              <small className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {otherPartyTrade} · #{canonicalId}
              </small>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Perspective Switcher Button for Demo/Testing */}
          <button
            onClick={() => {
              const nextRole = activeRole === 'customer' ? 'provider' : 'customer';
              setActiveRole(nextRole);
              markChatSeen(canonicalId, nextRole);
              toast.info(
                `Switched view to ${
                  nextRole === 'provider' ? `Provider (${meta.proName})` : `Customer (${meta.customerName})`
                }`
              );
            }}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Switch sender perspective"
          >
            <ArrowLeftRight size={13} className="text-brand-600 dark:text-emerald-400" />
            <span>Chatting as: {activeRole === 'provider' ? 'Provider' : 'Customer'}</span>
          </button>

          <a
            href="tel:+923001234567"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
          >
            <Phone size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">{otherPartyPhoneLabel}</span>
          </a>
        </div>
      </header>

      {/* Role Notice Pill on Mobile */}
      <div className="sm:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-1.5 text-[11px] text-slate-600 dark:text-slate-300">
        <span>
          Sending as <b>{activeRole === 'provider' ? `Provider (${meta.proName})` : `Customer (${meta.customerName})`}</b>
        </span>
        <button
          onClick={() => {
            const nextRole = activeRole === 'customer' ? 'provider' : 'customer';
            setActiveRole(nextRole);
          }}
          className="text-brand-700 dark:text-emerald-400 font-bold underline"
        >
          Switch to {activeRole === 'customer' ? 'Provider' : 'Customer'}
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
        <div className="mx-auto max-w-[420px] rounded-2xl bg-white/80 dark:bg-slate-800/80 p-3 text-center text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Real-time verified chat synced between Customer & Service Provider.</span>
        </div>

        {items.map((m) => {
          // Message is on the right if sent by the current viewer
          const isMe = m.sender_role === activeRole;
          const senderInitial =
            m.sender_role === 'provider' ? meta.avatarInitials : meta.customerInitials;

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <span
                  title={m.sender_name}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold text-[10px] text-emerald-900 dark:text-emerald-300 shadow-xs"
                >
                  {senderInitial}
                </span>
              )}

              <div
                className={`max-w-[78%] rounded-[22px] px-4 py-3 shadow-xs ${
                  isMe
                    ? 'rounded-br-xs bg-[#168348] text-white'
                    : 'rounded-bl-xs border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-ink dark:text-slate-100'
                }`}
              >
                {!isMe && (
                  <small className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    {m.sender_name}
                  </small>
                )}

                {m.images && m.images.length > 0 && (
                  <div className="mb-2 grid grid-cols-2 gap-1.5">
                    {m.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Attached media"
                        className="h-28 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{m.body}</p>

                <div
                  className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                    isMe ? 'text-white/75' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && <CheckCheck size={13} className="text-emerald-200" />}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={tail} />
      </div>

      {/* Pending Photos Preview */}
      {pendingImages.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 flex items-center gap-2">
          {pendingImages.map((src, i) => (
            <div
              key={i}
              className="relative h-14 w-14 rounded-lg overflow-hidden border border-emerald-400"
            >
              <img src={src} alt="Pending" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPendingImages((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <span className="text-[11px] text-slate-500">Ready to send with message</span>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={send}
        className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 flex items-center gap-2"
      >
        <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoUpload}
          />
          <ImagePlus size={20} />
        </label>

        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            activeRole === 'provider'
              ? `Reply to ${meta.customerName} as ${mySenderName}...`
              : `Message ${meta.proName} as ${mySenderName}...`
          }
          className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-xs outline-none focus:border-emerald-500 dark:text-white"
        />

        <button
          disabled={!body.trim() && pendingImages.length === 0}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#168348] text-white shadow-xs transition hover:bg-[#12683b] disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
