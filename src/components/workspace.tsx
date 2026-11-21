'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  Download,
  Droplets,
  Edit,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  HeartHandshake,
  Home,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { jobs as initialJobs, providers } from '@/lib/data';
import { AdminWorkbench } from './admin-workbench';
import { VerificationQueue } from './verification-queue';
import { CustomSelect } from './custom-select';
import { ThemeToggle } from './theme-toggle';
import { ConfirmationModal } from './confirmation-modal';
import { downloadCSV } from '@/lib/csv';

type Role = 'provider' | 'admin' | 'customer';

const money = (n: number) => new Intl.NumberFormat('en-PK').format(n);

export function Workspace({ role, view = 'dashboard' }: { role: Role; view?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // State
  const [available, setAvailable] = useState(true);
  const [activeJobId, setActiveJobId] = useState(initialJobs[0].id);
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'Current' | 'Active' | 'Completed'>('Current');
  const [jobsFilter, setJobsFilter] = useState<'All' | 'New' | 'Active' | 'Completed'>('All');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Active User session state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email?: string;
    role: 'user' | 'provider' | 'admin';
    isDemo?: boolean;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const displayName =
    currentUser?.name ||
    (role === 'admin' ? 'Karigar Admin' : role === 'provider' ? 'Ahsan Ali' : 'Sana Ahmed');
  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    (role === 'admin' ? 'KA' : role === 'provider' ? 'AA' : 'SA');

  const handleSignOut = async () => {
    setProfileDropdown(false);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {}
    try {
      const { createClient } = await import('@/lib/supabase/client');
      await createClient().auth.signOut();
    } catch {}
    setCurrentUser(null);
    window.location.href = `/${locale}/login`;
  };

  // Global Confirmation Modal State for workspace actions
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'success' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  // Persistent Customer Addresses
  const defaultAddresses = [
    { id: '1', title: 'Home', address: 'Flat 301, SVR Enclave, Latifabad Unit 7, Hyderabad', isDefault: true },
    { id: '2', title: 'Office', address: 'Plot 42, Main Autobhan Road, Hyderabad', isDefault: false },
    { id: '3', title: 'Parents House', address: 'Street 5, Phase 2, Qasimabad, Hyderabad', isDefault: false },
  ];
  const [savedAddresses, setSavedAddresses] = useState(defaultAddresses);
  const [newAddrModal, setNewAddrModal] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrText, setNewAddrText] = useState('');

  // Persistent Read Conversations
  const [readConversations, setReadConversations] = useState<string[]>([]);
  const [customerBookings, setCustomerBookings] = useState(initialJobs);

  useEffect(() => {
    setIsMounted(true);
    const syncStorage = () => {
      try {
        const storedAddrs = localStorage.getItem('karigar_saved_addresses');
        if (storedAddrs) {
          setSavedAddresses(JSON.parse(storedAddrs));
        } else {
          localStorage.setItem('karigar_saved_addresses', JSON.stringify(defaultAddresses));
        }
        const storedReads = localStorage.getItem('karigar_read_conversations');
        if (storedReads) {
          setReadConversations(JSON.parse(storedReads));
        }
        const storedBookings = localStorage.getItem('karigar_user_bookings');
        if (storedBookings) {
          const userAdded = JSON.parse(storedBookings);
          setCustomerBookings([...userAdded, ...initialJobs]);
        }
      } catch {
        // storage fallback
      }
    };

    syncStorage();

    // If viewing messages tab, mark conversations read
    if (view === 'messages') {
      try {
        const current: string[] = JSON.parse(localStorage.getItem('karigar_read_conversations') || '[]');
        let changed = false;
        ['KRG-2081', 'KRG-2082', 'KRG-2083'].forEach((id) => {
          if (!current.includes(id)) {
            current.push(id);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('karigar_read_conversations', JSON.stringify(current));
          setReadConversations(current);
          window.dispatchEvent(new Event('karigar_messages_read'));
        }
      } catch {}
    }

    window.addEventListener('storage', syncStorage);
    window.addEventListener('karigar_messages_read', syncStorage);
    window.addEventListener('karigar_chat_updated', syncStorage);
    window.addEventListener('focus', syncStorage);
    return () => {
      window.removeEventListener('storage', syncStorage);
      window.removeEventListener('karigar_messages_read', syncStorage);
      window.removeEventListener('karigar_chat_updated', syncStorage);
      window.removeEventListener('focus', syncStorage);
    };
  }, [view]);

  const saveAddresses = (newAddrs: typeof defaultAddresses) => {
    setSavedAddresses(newAddrs);
    try {
      localStorage.setItem('karigar_saved_addresses', JSON.stringify(newAddrs));
    } catch {}
  };

  const markConversationRead = (bookingId: string) => {
    try {
      const current: string[] = JSON.parse(localStorage.getItem('karigar_read_conversations') || '[]');
      if (!current.includes(bookingId)) {
        current.push(bookingId);
        localStorage.setItem('karigar_read_conversations', JSON.stringify(current));
        setReadConversations([...current]);
        window.dispatchEvent(new Event('karigar_messages_read'));
      }
    } catch {}
  };

  const markAllConversationsRead = () => {
    try {
      const allIds = ['KRG-2081', 'KRG-2082', 'KRG-2083'];
      localStorage.setItem('karigar_read_conversations', JSON.stringify(allIds));
      setReadConversations(allIds);
      window.dispatchEvent(new Event('karigar_messages_read'));
      toast.success('All messages marked as read.');
    } catch {}
  };

  // Notifications mock data
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'Your delivery active now',
      time: '19 Dec 2026 · 20:49 PM',
      detail: 'You have placed a repair request with Ahsan Ali. He is preparing for your visit.',
      isNew: true,
      type: 'delivery',
    },
    {
      id: 'n-2',
      title: 'Account Setup Successful!',
      time: '12 Dec 2026 · 14:27 PM',
      detail: 'Your Karigar profile is verified and active. You can now book services across Hyderabad & Jamshoro.',
      isNew: false,
      type: 'account',
    },
    {
      id: 'n-3',
      title: 'Job Completed: Kitchen tap replacement',
      time: '10 Dec 2026 · 11:15 AM',
      detail: 'Your plumbing repair was completed. Please leave a rating to help your neighbourhood.',
      isNew: false,
      type: 'service',
    },
  ]);

  // Dynamic Messages data with persistent read state & real latest message inspection
  const messagesList = useMemo(() => {
    const rawList = [
      {
        bookingId: 'KRG-2081',
        name: role === 'provider' ? 'Sana Ahmed' : 'Ahsan Ali',
        roleSubtitle: role === 'provider' ? 'Customer · Latifabad Unit 7' : 'Master Plumber · 4.9 ★',
        defaultMessage: 'I will be waiting outside in front of my house. Thank you!',
        defaultTime: '16:01',
        online: true,
        initials: role === 'provider' ? 'SA' : 'AA',
      },
      {
        bookingId: 'KRG-2083',
        name: role === 'provider' ? 'Bilal Hussain' : 'Imran Memon',
        roleSubtitle: role === 'provider' ? 'Customer · Qasimabad' : 'AC & Electrical · 4.8 ★',
        defaultMessage: 'Tomorrow at 10:00 AM works well for the AC inspection.',
        defaultTime: 'Yesterday',
        online: false,
        initials: role === 'provider' ? 'BH' : 'IM',
      },
      {
        bookingId: 'KRG-2082',
        name: role === 'provider' ? 'Mariam Shah' : 'Nadeem Baloch',
        roleSubtitle: role === 'provider' ? 'Customer · Jamshoro' : 'Master Carpenter · 5.0 ★',
        defaultMessage: 'Work is finished and verified. Everything looks great.',
        defaultTime: 'Nov 15',
        online: false,
        initials: role === 'provider' ? 'MS' : 'NB',
      },
    ];

    return rawList.map((m) => {
      let lastMsg = m.defaultMessage;
      let time = m.defaultTime;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`karigar_chat_${m.bookingId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const last = parsed[parsed.length - 1];
              if (last?.body) lastMsg = last.body;
              if (last?.created_at) {
                const d = new Date(last.created_at);
                time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }
          }
        } catch {}
      }
      const isRead = readConversations.includes(m.bookingId);
      return {
        ...m,
        lastMessage: lastMsg,
        time,
        unread: isRead ? 0 : 1,
      };
    });
  }, [role, readConversations, isMounted]);

  const totalUnreadMessages = useMemo(() => {
    if (!isMounted) return 0;
    return messagesList.reduce((acc, m) => acc + (m.unread || 0), 0);
  }, [messagesList, isMounted]);

  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const isCustomer = role === 'customer';

  // Navigation Items
  const nav = isAdmin
    ? ([
        ['Overview', '/admin', Activity],
        ['Verification', '/admin/verification', ShieldCheck],
        ['Bookings', '/admin/bookings', ClipboardList],
        ['Providers', '/admin/providers', Users],
        ['Customers', '/admin/users', Users],
        ['Services', '/admin/services', Wrench],
        ['Reviews', '/admin/reviews', Star],
        ['Complaints', '/admin/complaints', LifeBuoy],
        ['Payments', '/admin/payments', Wallet],
        ['AI Insights', '/admin/ai-insights', Activity],
        ['Settings', '/admin/settings', Settings],
      ] as const)
    : isProvider
    ? ([
        ['Dashboard', '/provider/dashboard', Home],
        ['My Jobs', '/provider/jobs', ClipboardList],
        ['Messages', '/provider/messages', MessageCircle],
        ['Earnings', '/provider/earnings', Wallet],
        ['Notifications', '/provider/notifications', Bell],
        ['My Profile', '/provider/profile', UserRound],
      ] as const)
    : ([
        ['Bookings', '/account/bookings', CalendarDays],
        ['Messages', '/account/messages', MessageCircle],
        ['Saved Pros', '/account/saved', Star],
        ['Addresses', '/account/addresses', MapPin],
        ['Notifications', '/account/notifications', Bell],
        ['My Profile', '/account/profile', UserRound],
      ] as const);

  // View title calculation
  const title = isAdmin
    ? view === 'dashboard'
      ? 'Overview'
      : view.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : isProvider
    ? view === 'dashboard'
      ? 'Dashboard'
      : view === 'jobs'
      ? 'My Jobs'
      : view === 'earnings'
      ? 'Earnings & Payouts'
      : view === 'messages'
      ? 'Messages'
      : view === 'notifications'
      ? 'Notifications'
      : view === 'profile'
      ? 'Provider Information'
      : view.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : view === 'dashboard' || view === 'bookings'
    ? 'My Bookings'
    : view === 'messages'
    ? 'Messages'
    : view === 'notifications'
    ? 'Notifications'
    : view === 'saved'
    ? 'Saved Professionals'
    : view === 'addresses'
    ? 'Delivery Addresses'
    : view === 'profile'
    ? 'My Profile'
    : view.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Job Actions
  const action = async (id: string, status: string) => {
    setJobStatuses((s) => ({ ...s, [id]: status }));
    toast.success(
      status === 'Accepted'
        ? 'Job accepted. Customer has been notified.'
        : status === 'Rejected'
        ? 'Request passed to the next local pro.'
        : status === 'On the way'
        ? 'Customer notified that you are on the way!'
        : status === 'Arrived'
        ? 'Status updated: You have arrived at customer address.'
        : status === 'In progress'
        ? 'Work is now marked in progress.'
        : status === 'Completed'
        ? 'Job marked complete! Earnings have been credited.'
        : 'Job status updated.'
    );
  };

  const currentJob = initialJobs.find((j) => j.id === activeJobId) || initialJobs[0];

  // Provider Filtered Jobs for Dashboard Tabs
  const tabbedJobs = initialJobs.filter((j) => {
    const status = jobStatuses[j.id] || j.status;
    if (tab === 'Current') return status === 'New request';
    if (tab === 'Active') return ['Accepted', 'On the way', 'Arrived', 'In progress'].includes(status);
    return status === 'Completed';
  });

  // Back Navigation Helper
  const handleBack = () => {
    if (view !== 'dashboard' && view !== 'bookings') {
      router.push(`/${locale}/${isAdmin ? 'admin' : isProvider ? 'provider/dashboard' : 'account/bookings'}`);
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-ink pb-20 md:pb-6 dark:bg-[#090e0b] dark:text-slate-100 transition-colors">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-slate-200/80 bg-white px-5 py-6 lg:flex shadow-xs dark:bg-[#111a14] dark:border-slate-800">
        {/* Brand */}
        <Link href={`/${locale}`} prefetch={true} className="flex items-center gap-3 px-1">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-brand-900 text-white shadow-sm dark:bg-brand-600">
            <Wrench size={20} />
          </span>
          <span>
            <b className="display text-[20px] font-extrabold text-ink dark:text-white">Karigar</b>
            <small className="block text-[9px] font-bold tracking-[.18em] text-brand-700 dark:text-brand-400">
              {isAdmin ? 'ADMIN CONSOLE' : isProvider ? 'PRO WORKSPACE' : 'CUSTOMER HUB'}
            </small>
          </span>
        </Link>

        {/* User Card */}
        <div className="mt-7 rounded-[18px] bg-slate-50 border border-slate-100 p-3 dark:bg-slate-900/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-900 dark:bg-brand-900/60 dark:text-brand-300">
              {userInitials}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-xs text-ink dark:text-white">
                {displayName}
              </b>
              <small className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isAdmin ? 'Operations Manager' : isProvider ? 'Master Plumber · 4.9 ★' : 'Customer Account'}
              </small>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <p className="mb-2 mt-7 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 dark:text-slate-500">
          MAIN MENU
        </p>
        <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
          {nav.map(([label, navPath, Icon]) => {
            const href = `/${locale}${navPath}`;
            const isActive =
              navPath === '/admin'
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={label}
                href={href}
                prefetch={true}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 truncate">{label}</span>
                {label === 'Verification' && isAdmin && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold text-amber-950">
                    4
                  </span>
                )}
                {label === 'Messages' && isMounted && totalUnreadMessages > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${isActive ? 'bg-white text-brand-700' : 'bg-rose-500 text-white shadow-xs'}`}>
                    {totalUnreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Compact Support Link - Short, sleek and non-intrusive */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/${locale}/help`}
            prefetch={true}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-emerald-400 transition"
          >
            <LifeBuoy size={16} className="text-brand-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Need assistance?</span>
            <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              24/7
            </span>
          </Link>
        </div>
      </aside>

      {/* TABLET MINI SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[70px] flex-col items-center gap-3 border-r border-slate-200 bg-white py-5 md:flex lg:hidden">
        <Link href={`/${locale}`} aria-label="Karigar home" className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-white">
          <Wrench size={20} />
        </Link>
        {nav.map(([label, navPath, Icon]) => {
          const href = `/${locale}${navPath}`;
          const isActive =
            navPath === '/admin'
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              title={label}
              aria-label={label}
              href={href}
              className={`relative grid h-11 w-11 place-items-center rounded-xl transition ${
                isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={19} />
              {label === 'Messages' && isMounted && totalUnreadMessages > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white ring-2 ring-white">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="md:pl-[70px] lg:pl-[240px]">
        {/* TOP HEADER BAR WITH BACK BUTTON */}
        <header className="sticky top-0 z-20 flex h-[64px] sm:h-[70px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-[#111a14]/95 transition-colors">
          {/* Back Button + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back"
              className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <small className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {isAdmin ? 'ADMIN CONSOLE' : isProvider ? 'SERVICE PROVIDER' : 'MY KARIGAR'}
              </small>
              <h1 className="text-[14px] sm:text-[18px] font-bold text-ink leading-tight dark:text-white truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Availability Toggle for Providers - Exactly matching Reference Image 1 Screen 3 */}
            {isProvider && (
              <div className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-700 hidden lg:inline">
                  Are you available?
                </span>
                <button
                  onClick={() => {
                    setAvailable(!available);
                    toast.success(available ? 'You are now offline.' : 'You are now online and ready for jobs!');
                  }}
                  className={`relative flex h-6 sm:h-7 w-10 sm:w-12 items-center rounded-full p-0.5 sm:p-1 transition duration-200 ${
                    available ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle availability"
                >
                  <span
                    className={`h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                      available ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Messages Icon with real-time unread badge (hidden on mobile, provided in bottom bar) */}
            {!isAdmin && (
              <Link
                href={`/${locale}/${isProvider ? 'provider/messages' : 'account/messages'}`}
                aria-label="Messages"
                className="relative hidden sm:grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <MessageCircle size={18} />
                {isMounted && totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    {totalUnreadMessages}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setNoticeOpen(!noticeOpen)}
              aria-label="Notifications"
              className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* User Avatar with Logout dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-brand-100 text-xs font-bold text-brand-900 border border-brand-200 transition hover:scale-105"
              >
                {userInitials}
              </button>

              {profileDropdown && (
                <div className="absolute right-0 top-12 z-40 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-ink truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {currentUser?.role || (isProvider ? 'provider' : isAdmin ? 'admin' : 'customer')} · Hyderabad
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/${isProvider ? 'provider/profile' : 'account/profile'}`}
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={15} /> Sign Out / Switch
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* NOTIFICATIONS POPUP */}
        {noticeOpen && (
          <div className="fixed right-4 top-[76px] z-50 w-[min(360px,calc(100vw-32px))] rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-brand-600" />
                <b className="text-sm font-bold text-ink">Notifications</b>
              </div>
              <button
                onClick={() => setNoticeOpen(false)}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <b className="text-xs font-bold text-ink">{n.title}</b>
                    {n.isNew && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-4">{n.detail}</p>
                  <small className="mt-2 block text-[9px] text-slate-400">{n.time}</small>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/${isProvider ? 'provider/notifications' : 'account/notifications'}`}
              onClick={() => setNoticeOpen(false)}
              className="mt-3 block text-center text-xs font-bold text-brand-700 hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        )}

        {/* MAIN BODY PER VIEW */}
        <main className="mx-auto max-w-[1440px] p-3.5 sm:p-7 pb-24 md:pb-8">
          {/* ========================================================================= */}
          {/* 1. ADMIN WORKBENCH VIEWS (All views except dashboard)                     */}
          {/* ========================================================================= */}
          {isAdmin && view !== 'dashboard' && (
            view === 'verification' ? <VerificationQueue /> : <AdminWorkbench view={view} />
          )}

          {/* ========================================================================= */}
          {/* 2. ADMIN DASHBOARD OVERVIEW                                              */}
          {/* ========================================================================= */}
          {isAdmin && view === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
                {[
                  { label: 'Bookings Today', value: '28', meta: '+12% this week', icon: ClipboardList, bg: 'bg-[#e8f3f7]', tone: 'text-blue-600' },
                  { label: 'Verified Pros', value: '146', meta: 'Across 3 cities', icon: ShieldCheck, bg: 'bg-[#e8f5e8]', tone: 'text-brand-700' },
                  { label: 'To Review', value: '04', meta: 'Provider applications', icon: Users, bg: 'bg-[#fff5d9]', tone: 'text-amber-600' },
                  { label: 'Volume This Month', value: 'Rs 842k', meta: 'Completed work', icon: CircleDollarSign, bg: 'bg-[#f1edfb]', tone: 'text-violet-600' },
                ].map(({ label, value, meta, icon: Icon, bg, tone }) => (
                  <article key={label} className={`${bg} rounded-[22px] p-5 shadow-xs border border-black/5`}>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-white shadow-xs ${tone}`}>
                        <Icon size={18} />
                      </span>
                    </div>
                    <b className="display mt-3 block text-[26px] font-extrabold text-ink">{value}</b>
                    <p className="mt-1 text-[11px] text-slate-500">{meta}</p>
                  </article>
                ))}
              </div>

              {/* Chart & Queue Overview */}
              <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
                <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[16px] font-bold text-ink">Booking Activity</h2>
                      <p className="mt-1 text-xs text-slate-500">Marketplace volume · Last 7 days</p>
                    </div>
                    <span className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
                      This Week
                    </span>
                  </div>
                  <div className="mt-8 flex h-[200px] items-end justify-between gap-3 border-b border-l border-slate-100 px-4">
                    {[36, 53, 43, 75, 60, 95, 72].map((h, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col justify-end">
                        <div
                          className={`rounded-t-lg transition duration-200 hover:opacity-85 ${i === 5 ? 'bg-brand-600 shadow-sm' : 'bg-brand-100'}`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between px-3 text-[11px] font-medium text-slate-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-[16px] font-bold text-ink">Needs Verification</h2>
                      <Link href={`/${locale}/admin/verification`} className="text-xs font-bold text-brand-700 hover:underline">
                        See All (4) →
                      </Link>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        { name: 'Rashid Hussain', skill: 'Electrician · Qasimabad', initial: 'RH' },
                        { name: 'Farzana Bibi', skill: 'Home cleaning · Latifabad', initial: 'FB' },
                        { name: 'Kashif Brohi', skill: 'AC technician · Jamshoro', initial: 'KB' },
                      ].map((x) => (
                        <div key={x.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-900">
                            {x.initial}
                          </span>
                          <div className="flex-1 min-w-0">
                            <b className="block truncate text-xs text-ink">{x.name}</b>
                            <small className="block text-[11px] text-slate-500 truncate">{x.skill}</small>
                          </div>
                          <Link
                            href={`/${locale}/admin/verification`}
                            className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                          >
                            Review
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. PROVIDER DASHBOARD (Matching Reference Image 1 Screen 3 & 6)          */}
          {/* ========================================================================= */}
          {isProvider && view === 'dashboard' && (
            <div className="space-y-6">
              {/* Date Header + Provider Profile Overview (Image 1 Screen 3) */}
              <div className="flex flex-col gap-4 rounded-[22px] sm:rounded-[26px] bg-white p-4 sm:p-6 shadow-soft border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-brand-100 text-base sm:text-lg font-extrabold text-brand-900 shadow-sm">
                      {userInitials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h2 className="display text-[18px] sm:text-[22px] font-extrabold text-ink truncate">
                        {displayName}
                      </h2>
                      <BadgeCheck size={18} className="text-emerald-600 fill-emerald-100 shrink-0" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-slate-600">
                      <span className="flex items-center text-amber-500 font-bold shrink-0">
                        <Star size={14} fill="currentColor" className="mr-1" /> 4.9
                      </span>
                      <span className="text-slate-300 hidden sm:inline">·</span>
                      <span className="truncate">(126 reviews)</span>
                      <span className="text-slate-300 hidden sm:inline">·</span>
                      <span className="truncate">Master Plumber</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700">
                    <CalendarDays size={13} className="mr-1.5 inline text-slate-500" />
                    17 Nov 2026
                  </div>
                  <Link
                    href={`/${locale}/provider/profile`}
                    className="flex h-9 sm:h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 sm:px-4 text-xs font-bold text-white transition hover:bg-brand-700 shrink-0"
                  >
                    <User size={14} /> View Profile
                  </Link>
                </div>
              </div>

              {/* 4 Color-Coded Stat Cards - Exactly matching Reference Image 1 Screen 3 */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4">
                {/* 08 Current Orders - Soft Pink/Coral */}
                <article className="rounded-[20px] sm:rounded-[24px] bg-[#feecef] border border-rose-100 p-3.5 sm:p-5 shadow-xs">
                  <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white text-rose-500 shadow-xs">
                    <CalendarDays size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <b className="display mt-2 sm:mt-4 block text-[24px] sm:text-[30px] font-extrabold text-ink leading-tight">08</b>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-rose-800 leading-tight">Current Orders</p>
                </article>

                {/* 250 Total Deliveries - Soft Emerald Green */}
                <article className="rounded-[20px] sm:rounded-[24px] bg-[#e6f8ee] border border-emerald-100 p-3.5 sm:p-5 shadow-xs">
                  <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white text-emerald-600 shadow-xs">
                    <Box size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <b className="display mt-2 sm:mt-4 block text-[24px] sm:text-[30px] font-extrabold text-ink leading-tight">250</b>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-emerald-800 leading-tight">Total Deliveries</p>
                </article>

                {/* 04 Pending Deliveries - Soft Amber/Orange */}
                <article className="rounded-[20px] sm:rounded-[24px] bg-[#fff4e0] border border-amber-100 p-3.5 sm:p-5 shadow-xs">
                  <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white text-amber-600 shadow-xs">
                    <Clock3 size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <b className="display mt-2 sm:mt-4 block text-[24px] sm:text-[30px] font-extrabold text-ink leading-tight">04</b>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-amber-800 leading-tight">Pending Deliveries</p>
                </article>

                {/* 500 Total KM Travelled - Soft Sky Blue */}
                <article className="rounded-[20px] sm:rounded-[24px] bg-[#e7f3fe] border border-blue-100 p-3.5 sm:p-5 shadow-xs">
                  <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white text-blue-600 shadow-xs">
                    <Globe size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <b className="display mt-2 sm:mt-4 block text-[24px] sm:text-[30px] font-extrabold text-ink leading-tight">500</b>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-blue-800 leading-tight">Total KM Travelled</p>
                </article>
              </div>

              {/* TABS + JOB ORDERS SECTION (Image 1 Screen 6) */}
              <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                <section className="space-y-4">
                  {/* Tabs: Current, Active, Completed orders */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 overflow-x-auto">
                    <div className="flex gap-3 sm:gap-4 shrink-0">
                      {(['Current', 'Active', 'Completed'] as const).map((tabName) => (
                        <button
                          key={tabName}
                          onClick={() => setTab(tabName)}
                          className={`relative pb-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                            tab === tabName ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tabName} {tabName === 'Completed' ? 'orders' : ''}
                          {tab === tabName && (
                            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 shrink-0 ml-2">{tabbedJobs.length} Orders</span>
                  </div>

                  {/* Order Cards List matching Reference Image 1 Screen 6 */}
                  <div className="space-y-4">
                    {tabbedJobs.length === 0 ? (
                      <div className="rounded-[20px] sm:rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm">
                        No orders in {tab} right now.
                      </div>
                    ) : (
                      tabbedJobs.map((j) => {
                        const status = jobStatuses[j.id] || j.status;
                        return (
                          <article
                            key={j.id}
                            onClick={() => setActiveJobId(j.id)}
                            className={`rounded-[20px] sm:rounded-[24px] border bg-white p-4 sm:p-5 transition duration-150 cursor-pointer shadow-soft hover:border-emerald-300 ${
                              activeJobId === j.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100'
                            }`}
                          >
                            {/* Order ID Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
                              <span className="text-xs font-bold text-slate-500">
                                Order ID <b className="text-ink ml-1 font-extrabold">#{j.id}</b>
                              </span>
                              <span
                                className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] font-bold ${
                                  status === 'New request'
                                    ? 'bg-amber-100 text-amber-800'
                                    : status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            {/* Service and Addresses (Matching Image 1 Screen 6) */}
                            <div className="mt-3 sm:mt-4 space-y-2 text-xs text-slate-600">
                              <div className="flex items-start gap-2.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                  <small className="block text-[10px] font-bold text-slate-400">SERVICE & CATEGORY</small>
                                  <b className="text-ink text-xs sm:text-sm font-bold">{j.type}</b> ({j.category})
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <MapPin size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                  <small className="block text-[10px] font-bold text-slate-400">CUSTOMER ADDRESS</small>
                                  <p className="text-slate-800 font-medium text-xs sm:text-sm">{j.client} · {j.area}, Hyderabad</p>
                                </div>
                              </div>
                            </div>

                            {/* Timing and Approx distance */}
                            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-xl bg-slate-50 p-2.5 sm:p-3 text-center text-xs">
                              <div>
                                <small className="block text-[9px] sm:text-[10px] text-slate-400">Pickup / Start</small>
                                <b className="text-ink text-[11px] sm:text-xs">8:00 AM</b>
                              </div>
                              <div>
                                <small className="block text-[9px] sm:text-[10px] text-slate-400">Delivery / Visit</small>
                                <b className="text-ink text-[11px] sm:text-xs">8:30 AM</b>
                              </div>
                              <div>
                                <small className="block text-[9px] sm:text-[10px] text-slate-400">Distance</small>
                                <b className="text-emerald-700 text-[11px] sm:text-xs truncate block">{j.distance}</b>
                              </div>
                            </div>

                            {/* Action Buttons: Accept / Reject - Matching Image 1 Screen 6 */}
                            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                              <b className="text-sm sm:text-base font-extrabold text-ink">{j.price}</b>

                              {status === 'New request' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action(j.id, 'Rejected');
                                    }}
                                    className="h-9 sm:h-10 rounded-xl bg-rose-500 px-3.5 sm:px-5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action(j.id, 'Accepted');
                                    }}
                                    className="h-9 sm:h-10 rounded-xl bg-emerald-600 px-3.5 sm:px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                  >
                                    Accept
                                  </button>
                                </div>
                              )}

                              {['Accepted', 'On the way'].includes(status) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action(j.id, status === 'Accepted' ? 'On the way' : 'Arrived');
                                  }}
                                  className="h-9 sm:h-10 rounded-xl bg-emerald-600 px-3.5 sm:px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                  {status === 'Accepted' ? 'Start Journey' : 'I’ve Arrived'}
                                </button>
                              )}

                              {status === 'Arrived' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action(j.id, 'In progress');
                                  }}
                                  className="h-9 sm:h-10 rounded-xl bg-emerald-600 px-3.5 sm:px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                  Start Job
                                </button>
                              )}

                              {status === 'In progress' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action(j.id, 'Completed');
                                  }}
                                  className="h-9 sm:h-10 rounded-xl bg-emerald-600 px-3.5 sm:px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                  Complete Job
                                </button>
                              )}

                              {status === 'Completed' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <Check size={14} /> Completed
                                </span>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* ROUTE MAP BY CUSTOMER HOME (Image 1 Screen 2) */}
                <aside className="space-y-5">
                  <section className="overflow-hidden rounded-[22px] sm:rounded-[26px] border border-slate-100 bg-white shadow-soft">
                    <div className="p-4 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        LIVE ROUTE PREVIEW
                      </span>
                      <h3 className="text-sm font-extrabold text-ink mt-0.5">Route Map by Customer Home</h3>
                      <p className="text-[11px] text-slate-500">{currentJob.area} · Approx. {currentJob.distance}</p>
                    </div>

                    {/* Visual Route Canvas */}
                    <div className="relative h-[180px] sm:h-[200px] bg-[#eef7ee] overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-70"
                        style={{
                          backgroundImage:
                            'linear-gradient(28deg, transparent 46%, white 47%, white 50%, transparent 51%), linear-gradient(103deg, transparent 46%, white 47%, white 51%, transparent 52%)',
                          backgroundSize: '90px 80px, 120px 70px',
                        }}
                      />
                      {/* Curving green route path */}
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                        <path
                          d="M 60 40 Q 120 120, 240 100 T 320 160"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="4"
                          strokeDasharray="6 4"
                        />
                      </svg>
                      {/* Start marker */}
                      <div className="absolute left-[50px] top-[26px] grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white shadow-md border-2 border-white">
                        <Navigation size={14} />
                      </div>
                      {/* Customer home destination */}
                      <div className="absolute right-[40px] bottom-[26px] grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white shadow-md border-2 border-white">
                        <MapPin size={15} />
                      </div>
                    </div>

                    {/* Customer Information (Image 1 Screen 2) */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Customer information
                      </span>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-amber-100 font-bold text-amber-900 text-xs shrink-0">
                          {currentJob.client.split(' ').map((n) => n[0]).join('')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <b className="block truncate text-xs font-bold text-ink">{currentJob.client}</b>
                          <small className="text-[11px] text-slate-500 truncate block">{currentJob.area}</small>
                        </div>
                        <a
                          href="tel:+923001234567"
                          className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shrink-0"
                          title="Call customer"
                        >
                          <Phone size={16} />
                        </a>
                        <Link
                          href={`/${locale}/chat/${currentJob.bookingId}`}
                          onClick={() => markConversationRead(currentJob.bookingId)}
                          className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shrink-0"
                          title="Chat with customer"
                        >
                          <MessageCircle size={16} />
                        </Link>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600 border border-slate-100">
                        <p className="font-semibold text-slate-700">Delivery at Home:</p>
                        <p>Flat no: 301, SVR Enclave, {currentJob.area}, Hyderabad</p>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PROVIDER JOBS VIEW (`/provider/jobs`)                                  */}
          {/* ========================================================================= */}
          {isProvider && view === 'jobs' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">My Jobs & Orders</h2>
                  <p className="text-xs text-slate-500">Manage all current, active, and completed requests.</p>
                </div>
                <div className="flex gap-2">
                  {(['All', 'New', 'Active', 'Completed'] as const).map((filterName) => (
                    <button
                      key={filterName}
                      onClick={() => setJobsFilter(filterName)}
                      className={`h-9 rounded-xl px-4 text-xs font-bold transition ${
                        jobsFilter === filterName
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {filterName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {initialJobs
                  .filter((j) => {
                    const st = jobStatuses[j.id] || j.status;
                    if (jobsFilter === 'New') return st === 'New request';
                    if (jobsFilter === 'Active') return ['Accepted', 'On the way', 'Arrived', 'In progress'].includes(st);
                    if (jobsFilter === 'Completed') return st === 'Completed';
                    return true;
                  })
                  .map((j) => {
                    const status = jobStatuses[j.id] || j.status;
                    return (
                      <div key={j.id} className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-soft flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[11px] font-bold text-slate-400">#{j.id}</span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                                status === 'New request'
                                  ? 'bg-amber-100 text-amber-800'
                                  : status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <h3 className="mt-3 text-sm font-bold text-ink">{j.type}</h3>
                          <p className="mt-1 text-xs text-slate-500">{j.category} · {j.client}</p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                            <MapPin size={14} className="text-emerald-600" />
                            <span>{j.area} ({j.distance})</span>
                          </div>
                          <div className="mt-2 text-xs font-semibold text-slate-600">
                            <Clock3 size={14} className="inline mr-1 text-slate-400" />
                            {j.time}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <b className="text-sm font-extrabold text-ink">{j.price}</b>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/${locale}/chat/${j.bookingId}`}
                              onClick={() => markConversationRead(j.bookingId)}
                              className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                              title="Chat"
                            >
                              <MessageCircle size={16} />
                            </Link>
                            <Link
                              href={`/${locale}/provider/jobs/${j.bookingId}`}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                            >
                              Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. PROVIDER EARNINGS VIEW (`/provider/earnings`)                         */}
          {/* ========================================================================= */}
          {isProvider && view === 'earnings' && (
            <div className="space-y-6">
              {/* Earnings Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-gradient-to-tr from-[#123b2b] to-[#168348] p-6 text-white shadow-soft">
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                    Total Earnings (Month)
                  </span>
                  <b className="display mt-2 block text-[34px] font-extrabold">Rs 86,400</b>
                  <p className="mt-1 text-xs text-emerald-100/80">38 completed repairs in Latifabad & Qasimabad</p>
                </div>

                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-soft">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Today’s Collected Cash
                  </span>
                  <b className="display mt-2 block text-[30px] font-extrabold text-ink">Rs 4,200</b>
                  <p className="mt-1 text-xs text-slate-500">2 jobs completed today</p>
                </div>

                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-soft">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Karigar Commission (10%)
                  </span>
                  <b className="display mt-2 block text-[30px] font-extrabold text-amber-600">Rs 8,640</b>
                  <p className="mt-1 text-xs text-slate-500">Settled automatically monthly</p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-ink">Recent Earnings History</h3>
                    <p className="text-xs text-slate-500">Payments collected directly in cash after service</p>
                  </div>
                  <button
                    onClick={() => {
                      downloadCSV(
                        'karigar_provider_earnings_2026',
                        ['Job ID', 'Customer', 'Service', 'Date', 'Payment Method', 'Amount (PKR)'],
                        [
                          ['KRG-2073', 'Mariam Shah', 'Ceiling fan installation', 'Yesterday', 'Cash after service', '1200'],
                          ['KRG-2065', 'Rashid Memon', 'Bathroom pipeline repair', '15 Nov', 'Cash after service', '2500'],
                          ['KRG-2059', 'Zubair Brohi', 'Water motor repair', '14 Nov', 'Cash after service', '1800'],
                          ['KRG-2041', 'Ayesha Khan', 'Kitchen sink pipe leak', '12 Nov', 'Cash after service', '2000'],
                        ]
                      );
                      toast.success('Earnings statement exported.');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Download size={14} /> Export Statement
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-2">Job ID</th>
                        <th className="py-3 px-2">Customer</th>
                        <th className="py-3 px-2">Service</th>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Method</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { id: 'KRG-2073', client: 'Mariam Shah', service: 'Ceiling fan installation', date: 'Yesterday', amount: 'Rs 1,200' },
                        { id: 'KRG-2065', client: 'Rashid Memon', service: 'Bathroom pipeline repair', date: '15 Nov', amount: 'Rs 2,500' },
                        { id: 'KRG-2059', client: 'Zubair Brohi', service: 'Water motor repair', date: '14 Nov', amount: 'Rs 1,800' },
                        { id: 'KRG-2041', client: 'Ayesha Khan', service: 'Kitchen sink pipe leak', date: '12 Nov', amount: 'Rs 2,000' },
                      ].map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-2 font-bold text-ink">{t.id}</td>
                          <td className="py-3 px-2 font-medium">{t.client}</td>
                          <td className="py-3 px-2 text-slate-500">{t.service}</td>
                          <td className="py-3 px-2 text-slate-500">{t.date}</td>
                          <td className="py-3 px-2">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                              Cash after service
                            </span>
                          </td>
                          <td className="py-3 px-2 font-extrabold text-ink text-right">{t.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. MESSAGES LIST VIEW (Provider & Customer)                              */}
          {/* ========================================================================= */}
          {view === 'messages' && (
            <div className="max-w-[800px] mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">Conversations</h2>
                  <p className="text-xs text-slate-500">Coordinate repairs directly with the customer or pro.</p>
                </div>
                <div className="flex items-center gap-2">
                  {isMounted && totalUnreadMessages > 0 && (
                    <button
                      onClick={markAllConversationsRead}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      Mark all as read
                    </button>
                  )}
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    {messagesList.length} Active Chats
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {messagesList.map((m) => (
                  <Link
                    key={m.bookingId}
                    href={`/${locale}/chat/${m.bookingId}`}
                    onClick={() => markConversationRead(m.bookingId)}
                    className="flex items-center gap-4 rounded-[22px] border border-slate-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-emerald-300"
                  >
                    <div className="relative">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 font-bold text-emerald-900 text-sm">
                        {m.initials}
                      </span>
                      {m.online && (
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <b className="truncate text-sm font-bold text-ink">{m.name}</b>
                        <small className="text-[11px] text-slate-400 font-semibold">{m.time}</small>
                      </div>
                      <small className="block text-[11px] text-slate-400 truncate">{m.roleSubtitle}</small>
                      <p className="mt-1 text-xs text-slate-600 truncate">{m.lastMessage}</p>
                    </div>

                    {m.unread > 0 ? (
                      <span className="grid h-6 min-w-6 px-1.5 place-items-center rounded-full bg-rose-500 text-[11px] font-extrabold text-white shadow-xs">
                        {m.unread}
                      </span>
                    ) : (
                      <ChevronRight size={18} className="text-slate-300" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. NOTIFICATIONS LIST VIEW (Image 1 Screen 7)                             */}
          {/* ========================================================================= */}
          {view === 'notifications' && (
            <div className="max-w-[700px] mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">Notifications</h2>
                  <p className="text-xs text-slate-500">Updates regarding your service appointments and account.</p>
                </div>
                <button
                  onClick={() => toast.success('All marked as read.')}
                  className="text-xs font-bold text-brand-700 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                      {n.type === 'delivery' ? <Box size={22} /> : n.type === 'account' ? <UserCheck size={22} /> : <CheckCircle2 size={22} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ink">{n.title}</h3>
                        {n.isNew && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold text-white">
                            New
                          </span>
                        )}
                      </div>
                      <small className="block text-[11px] text-slate-400 mt-0.5">{n.time}</small>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{n.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. PROFILE / DRIVER INFORMATION (Image 1 Screen 5)                        */}
          {/* ========================================================================= */}
          {view === 'profile' && (
            <div className="max-w-[760px] mx-auto space-y-6">
              {/* Profile Card matching Reference Image 1 Screen 5 */}
              <div className="rounded-[28px] border border-slate-100 bg-white p-7 text-center shadow-soft">
                <div className="relative mx-auto h-24 w-24">
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-100 font-extrabold text-2xl text-emerald-900 border-4 border-white shadow-md">
                    {userInitials}
                  </div>
                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <h2 className="display mt-4 text-[24px] font-extrabold text-ink">
                  {displayName}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isProvider ? 'Verified Master Plumber · Latifabad, Hyderabad' : 'Valued Customer · Hyderabad'}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Phone size={13} className="text-emerald-600" />
                  +92 300 1234567
                </div>

                {/* 3 Quick Stats - Image 1 Screen 5 */}
                {isProvider && (
                  <div className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <span className="flex items-center justify-center gap-1 text-amber-500 text-sm font-extrabold">
                        <Star size={16} fill="currentColor" /> 4.9
                      </span>
                      <small className="block text-[10px] text-slate-400 font-bold mt-1">Rating (126)</small>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <b className="display text-[18px] font-extrabold text-ink">425</b>
                      <small className="block text-[10px] text-slate-400 font-bold mt-1">Total Jobs</small>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3.5">
                      <b className="display text-[18px] font-extrabold text-ink">8+ Yrs</b>
                      <small className="block text-[10px] text-slate-400 font-bold mt-1">Experience</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Details */}
              <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-soft space-y-4">
                <h3 className="text-base font-extrabold text-ink">Account & Contact Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Full Name</label>
                    <input
                      defaultValue={displayName}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Phone Number</label>
                    <input
                      defaultValue="+92 300 1234567"
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Primary City</label>
                    <input
                      defaultValue="Hyderabad, Sindh"
                      disabled
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Primary Hub Area</label>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <CustomSelect
                        value="Hyderabad Central"
                        onChange={() => toast.success('Hub area preference updated.')}
                        options={['Hyderabad Central', 'Latifabad', 'Qasimabad', 'Jamshoro City', 'Kotri']}
                        placeholder="Select primary hub"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => toast.success('Profile details saved.')}
                    className="h-11 rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. CUSTOMER SAVED PROS VIEW (`/account/saved`)                           */}
          {/* ========================================================================= */}
          {isCustomer && view === 'saved' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-[20px] font-extrabold text-ink">Saved Professionals</h2>
                <p className="text-xs text-slate-500">Your trusted neighbourhood specialists for fast re-booking.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((p) => (
                  <div key={p.name} className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-900">
                          {p.initials}
                        </span>
                        <div>
                          <b className="block text-sm font-bold text-ink">{p.name}</b>
                          <small className="text-xs text-slate-500">{p.trade}</small>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-50 pt-2.5">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star size={13} fill="currentColor" /> {p.rating}
                        </span>
                        <span>{p.jobs} jobs completed</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{p.area}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <b className="text-xs text-ink">{p.price}</b>
                      <Link
                        href={`/${locale}/search?q=${encodeURIComponent(p.trade)}`}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                      >
                        Book Again →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. CUSTOMER ADDRESSES VIEW (`/account/addresses`)                       */}
          {/* ========================================================================= */}
          {isCustomer && view === 'addresses' && (
            <div className="max-w-[760px] mx-auto space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">Saved Addresses</h2>
                  <p className="text-xs text-slate-500">Manage repair and visit locations for fast checkout.</p>
                </div>
                <button
                  onClick={() => setNewAddrModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <Plus size={15} /> Add Address
                </button>
              </div>

              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-soft"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                        <MapPin size={20} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-sm font-bold text-ink">{addr.title}</b>
                          {addr.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{addr.address}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setConfirmModal({
                          open: true,
                          title: 'Delete Saved Address?',
                          message: `Are you sure you want to remove "${addr.title}" (${addr.address}) from your saved addresses?`,
                          variant: 'danger',
                          onConfirm: () => {
                            const updated = savedAddresses.filter((a) => a.id !== addr.id);
                            saveAddresses(updated);
                            toast.success('Address removed.');
                          },
                        });
                      }}
                      className="text-slate-400 hover:text-rose-600 p-2"
                      title="Remove address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Address Modal */}
              {newAddrModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                  <div className="w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <b className="text-sm font-bold text-ink">Add New Address</b>
                      <button onClick={() => setNewAddrModal(false)} className="text-slate-400">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">Label (e.g. Home, Shop)</label>
                        <input
                          value={newAddrTitle}
                          onChange={(e) => setNewAddrTitle(e.target.value)}
                          placeholder="Home"
                          className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">Full Address & Landmark</label>
                        <textarea
                          value={newAddrText}
                          onChange={(e) => setNewAddrText(e.target.value)}
                          placeholder="House / Flat no, Street, Neighbourhood"
                          className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newAddrTitle || !newAddrText) {
                            toast.error('Fill in both fields.');
                            return;
                          }
                          const updated = [
                            ...savedAddresses,
                            { id: Date.now().toString(), title: newAddrTitle, address: newAddrText, isDefault: false },
                          ];
                          saveAddresses(updated);
                          setNewAddrModal(false);
                          setNewAddrTitle('');
                          setNewAddrText('');
                          toast.success('Address added successfully!');
                        }}
                        className="mt-2 h-11 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 11. CUSTOMER BOOKINGS DASHBOARD (`/account/bookings`)                      */}
          {/* ========================================================================= */}
          {isCustomer && (view === 'dashboard' || view === 'bookings') && (
            <div className="space-y-6">
              {/* Header with Quick CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] bg-white p-6 shadow-soft border border-slate-100">
                <div>
                  <h2 className="text-[22px] font-extrabold text-ink">Your Home Bookings</h2>
                  <p className="text-xs text-slate-500">Track active repairs, message your technician, or re-book.</p>
                </div>
                <Link
                  href={`/${locale}/search`}
                  className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <Plus size={16} /> Book New Service
                </Link>
              </div>

              {/* Bookings List */}
              <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink">Active & Upcoming Visits</h3>
                    <span className="text-xs text-slate-500 font-semibold">{customerBookings.length} Bookings</span>
                  </div>

                  <div className="space-y-3.5">
                    {customerBookings.map((j) => (
                      <div
                        key={j.id}
                        className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft transition hover:border-emerald-200"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-slate-500">
                            Booking <b className="text-ink">#{j.id}</b>
                          </span>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                            {j.status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-start gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                            <Wrench size={18} />
                          </span>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-ink">{j.type}</h4>
                            <p className="text-xs text-slate-500">{j.category} · Assigned to Ahsan Ali</p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                              <span><MapPin size={13} className="inline mr-1 text-emerald-600" />{j.area}</span>
                              <span><Clock3 size={13} className="inline mr-1 text-slate-400" />{j.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <b className="text-sm font-bold text-ink">{j.price}</b>
                          <div className="flex gap-2">
                            <Link
                              href={`/${locale}/chat/${j.bookingId}`}
                              onClick={() => markConversationRead(j.bookingId)}
                              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                            >
                              <MessageCircle size={14} /> Chat
                            </Link>
                            <Link
                              href={`/${locale}/account/bookings/${j.bookingId}`}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                            >
                              Track & Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Right side helper info */}
                <aside className="space-y-4">
                  <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft">
                    <h3 className="text-sm font-bold text-ink">Need another repair?</h3>
                    <p className="mt-1 text-xs text-slate-500">Popular categories in your area:</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {['Plumbing', 'AC Service', 'Electrician', 'Carpentry', 'Cleaning', 'Solar'].map((item) => (
                        <Link
                          key={item}
                          href={`/${locale}/search?q=${encodeURIComponent(item)}`}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-brand-900 p-5 text-white">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-emerald-300">
                      <ShieldCheck size={20} />
                    </span>
                    <h4 className="mt-3 text-sm font-bold">100% Cash After Service</h4>
                    <p className="mt-1 text-xs text-white/70 leading-5">
                      Never pay in advance. Inspect the completed repair with your pro before handing over cash.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Image 1 Screen 3) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-lg md:hidden shadow-lg">
        {nav.slice(0, 5).map(([label, navPath, Icon]) => {
          const href = `/${locale}${navPath}`;
          const isActive =
            navPath === '/admin'
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              className={`relative flex min-w-[54px] flex-col items-center gap-1 text-[10px] font-bold transition ${
                isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {label === 'Messages' && isMounted && totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white">
                    {totalUnreadMessages}
                  </span>
                )}
              </div>
              <span>{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Persistent Global Confirmation Modal for workspace actions */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
