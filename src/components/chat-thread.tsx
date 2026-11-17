'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  Phone,
  Send,
  ShieldAlert,
  Sparkles,
  Camera,
  X,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  pending?: boolean;
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
    defaultMessages: Message[];
  }
> = {
  'KRG-2081': {
    proName: 'Ahsan Ali',
    proTrade: 'Master Plumber',
    customerName: 'Sana Ahmed',
    service: 'Pipeline Leakage Repair',
    area: 'Latifabad Unit 7',
    avatarInitials: 'AA',
    defaultMessages: [
      {
        id: 'msg-1',
        sender_id: 'other',
        body: 'Assalam-o-Alaikum Sana! I have accepted your plumbing repair request for Latifabad.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        sender_id: 'other',
        body: "I am gathering the PVC pipe fittings and Teflon tape. I'll be at your location in approx 25 minutes.",
        created_at: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        id: 'msg-3',
        sender_id: 'self',
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
    defaultMessages: [
      {
        id: 'msg-101',
        sender_id: 'other',
        body: 'Hello Bilal! Received your AC gas charging and cooling check booking for Qasimabad.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'msg-102',
        sender_id: 'self',
        body: 'Yes Imran bhai, cooling is very low and outdoor unit seems to be tripping frequently.',
        created_at: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 'msg-103',
        sender_id: 'other',
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
    defaultMessages: [
      {
        id: 'msg-201',
        sender_id: 'other',
        body: 'Assalam-o-Alaikum! Nadeem Baloch here regarding your woodwork appointment in Jamshoro.',
        created_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'msg-202',
        sender_id: 'self',
        body: 'Hello Nadeem, the lock mechanism is jammed and the hinge needs tightening.',
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
  },
};

export function ChatThread({ bookingId }: { bookingId: string }) {
  const locale = useLocale();
  const router = useRouter();
  const meta = bookingDirectory[bookingId] || {
    proName: 'Ahsan Ali',
    proTrade: 'Service Professional',
    customerName: 'Customer',
    service: 'Home Service',
    area: 'Hyderabad',
    avatarInitials: 'KP',
    defaultMessages: [
      {
        id: 'def-1',
        sender_id: 'other',
        body: `Hello! I have received your service request #${bookingId}. How can I assist you?`,
        created_at: new Date().toISOString(),
      },
    ],
  };

  const storageKey = `karigar_chat_${bookingId}`;
  const [items, setItems] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [typing, setTyping] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const tail = useRef<HTMLDivElement>(null);

  // Load chat messages from localStorage on mount & mark conversation as read
  useEffect(() => {
    try {
      // Mark this bookingId as read in persistent storage
      const readList = JSON.parse(localStorage.getItem('karigar_read_conversations') || '[]');
      if (!readList.includes(bookingId)) {
        readList.push(bookingId);
        localStorage.setItem('karigar_read_conversations', JSON.stringify(readList));
      }
      window.dispatchEvent(new Event('karigar_messages_read'));

      // Load messages
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(meta.defaultMessages);
        localStorage.setItem(storageKey, JSON.stringify(meta.defaultMessages));
      }
    } catch {
      setItems(meta.defaultMessages);
    }
  }, [bookingId, storageKey]);

  function saveMessages(newItems: Message[]) {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    tail.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, typing]);

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

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: 'self',
      body: text || (pendingImages.length > 0 ? 'Sent photo' : ''),
      created_at: new Date().toISOString(),
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    };

    const updated = [...items, newMessage];
    saveMessages(updated);
    setBody('');
    setPendingImages([]);

    // Contextual auto-reply from this specific provider
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const replyText =
          items.length % 2 === 0
            ? `Understood! I have noted down the details. See you shortly at ${meta.area}.`
            : `Got it! Just reaching near your landmark in ${meta.area}.`;
        const reply: Message = {
          id: crypto.randomUUID(),
          sender_id: 'other',
          body: replyText,
          created_at: new Date().toISOString(),
        };
        saveMessages([...updated, reply]);
      }, 1800);
    }, 600);
  }

  return (
    <main className="flex h-screen flex-col bg-[#f5f8f5] dark:bg-[#080d09] text-ink dark:text-slate-100 transition-colors">
      {/* Top Header Bar */}
      <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                {meta.avatarInitials}
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <b className="text-sm font-bold text-ink dark:text-white">{meta.proName}</b>
                <BadgeCheck size={15} className="text-emerald-600" />
              </div>
              <small className="block text-[11px] text-slate-500 dark:text-slate-400">
                {meta.proTrade} · #{bookingId}
              </small>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+923001234567"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
          >
            <Phone size={15} className="text-emerald-600" /> Call Pro
          </a>
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
        <div className="mx-auto max-w-[420px] rounded-2xl bg-white/80 dark:bg-slate-800/80 p-3 text-center text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          🔒 Messages and media are end-to-end encrypted for service order #{bookingId}.
        </div>

        {items.map((m) => {
          const isMe = m.sender_id === 'self';
          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold text-[10px] text-emerald-900 dark:text-emerald-300">
                  {meta.avatarInitials}
                </span>
              )}

              <div
                className={`max-w-[78%] rounded-[22px] px-4 py-3 shadow-xs ${
                  isMe
                    ? 'rounded-br-xs bg-[#168348] text-white'
                    : 'rounded-bl-xs border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-ink dark:text-slate-100'
                }`}
              >
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
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCheck size={13} className="text-emerald-200" />}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 font-bold text-[9px] text-emerald-900">
              {meta.avatarInitials}
            </span>
            <span className="italic">{meta.proName} is typing…</span>
          </div>
        )}
        <div ref={tail} />
      </div>

      {/* Pending Photos Preview */}
      {pendingImages.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 flex items-center gap-2">
          {pendingImages.map((src, i) => (
            <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-emerald-400">
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
          placeholder={`Message ${meta.proName}...`}
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
