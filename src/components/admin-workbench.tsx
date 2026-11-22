'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowUpRight,
  Download,
  MoreHorizontal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Eye,
  EyeOff,
  Flag,
  Trash2,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  BadgeCheck,
  Ban,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  PhoneCall,
  UserX,
  UserCheck,
  FileText,
  ChevronDown,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationModal } from './confirmation-modal';
import { downloadCSV } from '@/lib/csv';
import {
  getAllSyncedBookings,
  setSyncedJobStatus,
  setSyncedProviderStatus,
  getSyncedProviderStatuses,
} from '@/lib/sync';

type Row = Record<string, string>;

interface ReviewItem {
  id: string;
  customer: string;
  professional: string;
  trade: string;
  rating: number;
  comment: string;
  status: 'Published' | 'Hidden' | 'Flagged';
  date: string;
  reply?: string;
}

const defaultReviews: ReviewItem[] = [
  {
    id: 'REV-1042',
    customer: 'Ayesha Khan',
    professional: 'Ahsan Ali',
    trade: 'Plumbing',
    rating: 5,
    comment: 'Arrived within 30 mins to Latifabad and fixed the pipeline leak neatly. Very polite and fair visit fee.',
    status: 'Published',
    date: '16 Nov 2026',
  },
  {
    id: 'REV-1041',
    customer: 'Sana Ahmed',
    professional: 'Imran Memon',
    trade: 'AC & Electrician',
    rating: 4,
    comment: 'Quick diagnosis of capacitor fault in split AC unit. Replaced on spot and provided warranty.',
    status: 'Published',
    date: '15 Nov 2026',
  },
  {
    id: 'REV-1040',
    customer: 'Tariq Sheikh',
    professional: 'Nadeem Baloch',
    trade: 'Carpentry',
    rating: 2,
    comment: 'Door lock installation took longer than quoted and wood shavings were left on floor. Requesting refund.',
    status: 'Flagged',
    date: '14 Nov 2026',
  },
  {
    id: 'REV-1039',
    customer: 'Zubair Mallah',
    professional: 'Farzana Bibi',
    trade: 'Home Cleaning',
    rating: 5,
    comment: 'Excellent deep cleaning for 3-bedroom flat in Qasimabad. Very professional and thorough.',
    status: 'Published',
    date: '12 Nov 2026',
  },
  {
    id: 'REV-1038',
    customer: 'Unknown Guest',
    professional: 'Bilal Panhwar',
    trade: 'Masonry',
    rating: 1,
    comment: 'Did not answer phone at 2 AM for non-emergency request.',
    status: 'Hidden',
    date: '10 Nov 2026',
  },
];

const defaultSamples: Record<string, Row[]> = {
  bookings: [
    { id: '1', booking: 'KRG-2084', customer: 'Ayesha Khan', professional: 'Ahsan Ali', service: 'Plumbing', area: 'Latifabad', status: 'Requested', amount: 'Rs 1,500' },
    { id: '2', booking: 'KRG-2083', customer: 'Bilal Hussain', professional: 'Imran Memon', service: 'AC service', area: 'Qasimabad', status: 'On the way', amount: 'Rs 2,500' },
    { id: '3', booking: 'KRG-2082', customer: 'Mariam Shah', professional: 'Nadeem Baloch', service: 'Carpentry', area: 'Jamshoro', status: 'Completed', amount: 'Rs 3,200' },
    { id: '4', booking: 'KRG-2081', customer: 'Sana Ahmed', professional: 'Ahsan Ali', service: 'Plumbing', area: 'Qasimabad', status: 'Accepted', amount: 'Rs 1,200' },
  ],
  providers: [
    { id: 'p-1', name: 'Ahsan Ali', trade: 'Master plumber', area: 'Latifabad', rating: '4.9 ★', jobs: '126', status: 'Verified', cnic: '41303-1234567-1' },
    { id: 'p-2', name: 'Imran Memon', trade: 'AC & electrical', area: 'Qasimabad', rating: '4.8 ★', jobs: '94', status: 'Verified', cnic: '41303-9876543-3' },
    { id: 'p-3', name: 'Nadeem Baloch', trade: 'Carpenter', area: 'Jamshoro', rating: '5.0 ★', jobs: '61', status: 'Verified', cnic: '41302-5544332-9' },
    { id: 'p-4', name: 'Bilal Panhwar', trade: 'Mason & Painter', area: 'Latifabad', rating: '4.6 ★', jobs: '38', status: 'Suspended', cnic: '41303-7788991-5' },
  ],
  users: [
    { id: 'u-1', name: 'Ayesha Khan', email: 'ayesha.k@karigar.pk', location: 'Qasimabad', joined: 'Nov 2026', bookings: '6', status: 'Active' },
    { id: 'u-2', name: 'Sana Ahmed', email: 'sana.a@karigar.pk', location: 'Latifabad', joined: 'Oct 2026', bookings: '4', status: 'Active' },
    { id: 'u-3', name: 'Bilal Hussain', email: 'bilal.h@karigar.pk', location: 'Jamshoro', joined: 'Oct 2026', bookings: '3', status: 'Active' },
    { id: 'u-4', name: 'Rashid Memon', email: 'rashid.m@gmail.com', location: 'Saddar', joined: 'Sep 2026', bookings: '1', status: 'Suspended' },
  ],
  complaints: [
    { id: 'c-1', ticket: 'SUP-104', booking: 'KRG-2041', customer: 'Ayesha Khan', reason: 'Invoice clarification', priority: 'Medium', status: 'Open' },
    { id: 'c-2', ticket: 'SUP-102', booking: 'KRG-2018', customer: 'Bilal Hussain', reason: 'Schedule change', priority: 'High', status: 'In review' },
    { id: 'c-3', ticket: 'SUP-098', booking: 'KRG-1980', customer: 'Mariam Shah', reason: 'Tap leaking again after 2 days', priority: 'Urgent', status: 'Open' },
  ],
  services: [
    { id: 's-1', service: 'Plumbing', slug: 'plumbing', range: 'Rs 700–5,000', providers: '48', status: 'Active' },
    { id: 's-2', service: 'Electrical', slug: 'electrical', range: 'Rs 600–6,000', providers: '36', status: 'Active' },
    { id: 's-3', service: 'AC service', slug: 'ac_service', range: 'Rs 1,200–15,000', providers: '29', status: 'Active' },
    { id: 's-4', service: 'Carpentry', slug: 'carpentry', range: 'Rs 800–8,000', providers: '21', status: 'Active' },
  ],
  areas: [
    { id: 'a-1', area: 'Latifabad', city: 'Hyderabad', professionals: '42', coverage: 'Full', status: 'Active' },
    { id: 'a-2', area: 'Qasimabad', city: 'Hyderabad', professionals: '36', coverage: 'Full', status: 'Active' },
    { id: 'a-3', area: 'Jamshoro City', city: 'Jamshoro', professionals: '22', coverage: 'Expanding', status: 'Active' },
    { id: 'a-4', area: 'Kotri Industrial', city: 'Kotri', professionals: '14', coverage: 'Partial', status: 'Inactive' },
  ],
};

const defaultSettings = {
  commission: 10,
  requestTimeout: 10,
  cashOnly: true,
  supportPhone: '+92 300 1234567',
  supportEmail: 'ops@karigar.pk',
  requireCnic: true,
  minRatingThreshold: 4.0,
  autoVerifyEnabled: false,
  landingBannerText: 'Trusted Home Repair Artisans Across Hyderabad & Jamshoro',
};

const titles: Record<string, string> = {
  bookings: 'Bookings Management',
  providers: 'Service Providers Supervision',
  users: 'Registered Customers Supervision',
  reviews: 'Customer Reviews & Moderation',
  complaints: 'Customer Support & Complaints',
  services: 'Service Catalog',
  areas: 'Coverage Areas & Hubs',
  payments: 'Financial Overview',
  'ai-insights': 'AI Insights & Demand',
  settings: 'Marketplace Operations Settings',
};

export function AdminWorkbench({ view }: { view: string }) {
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Active floating dropdown menu for row actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Global persistent confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  // Settings State & Modal
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState<string | null>(null);

  // Rows state for table views
  const [rows, setRows] = useState<Row[]>([]);

  // Dedicated state for reviews management
  const [reviews, setReviews] = useState<ReviewItem[]>(defaultReviews);
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Published' | 'Hidden' | 'Flagged'>('All');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // 1. Synchronize state with persistent localStorage
  useEffect(() => {
    try {
      // Load Settings
      const savedSettings = localStorage.getItem('karigar_admin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        localStorage.setItem('karigar_admin_settings', JSON.stringify(defaultSettings));
      }

      // Load Reviews
      const savedReviews = localStorage.getItem('karigar_admin_reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        localStorage.setItem('karigar_admin_reviews', JSON.stringify(defaultReviews));
      }

      // Load View Rows
      if (view === 'bookings') {
        const synced = getAllSyncedBookings();
        const bookingRows = synced.map((b, idx) => ({
          id: b.id || `b-${idx}`,
          booking: b.id || b.bookingId,
          customer: b.client || 'Customer',
          professional: b.providerName || (b.category?.includes('Plumb') ? 'Ahsan Ali' : b.category?.includes('AC') ? 'Imran Memon' : 'Ahsan Ali'),
          service: b.type || b.category || 'Service',
          area: b.area || 'Hyderabad',
          status: b.status || 'Requested',
          amount: b.price || 'Rs 1,500',
        }));
        setRows(bookingRows);
      } else if (view === 'providers') {
        const savedViewRows = localStorage.getItem(`karigar_admin_providers`);
        const baseRows = savedViewRows ? JSON.parse(savedViewRows) : defaultSamples['providers'];
        const pStatuses = getSyncedProviderStatuses();
        const updated = baseRows.map((r: any) => pStatuses[r.name] ? { ...r, status: pStatuses[r.name] } : r);
        setRows(updated);
      } else if (defaultSamples[view]) {
        const savedViewRows = localStorage.getItem(`karigar_admin_${view}`);
        if (savedViewRows) {
          setRows(JSON.parse(savedViewRows));
        } else {
          setRows(defaultSamples[view]);
          localStorage.setItem(`karigar_admin_${view}`, JSON.stringify(defaultSamples[view]));
        }
      }
    } catch {
      // Fallback
      if (defaultSamples[view]) setRows(defaultSamples[view]);
    }

    const handleSync = () => {
      if (view === 'bookings') {
        const synced = getAllSyncedBookings();
        const bookingRows = synced.map((b, idx) => ({
          id: b.id || `b-${idx}`,
          booking: b.id || b.bookingId,
          customer: b.client || 'Customer',
          professional: b.providerName || (b.category?.includes('Plumb') ? 'Ahsan Ali' : b.category?.includes('AC') ? 'Imran Memon' : 'Ahsan Ali'),
          service: b.type || b.category || 'Service',
          area: b.area || 'Hyderabad',
          status: b.status || 'Requested',
          amount: b.price || 'Rs 1,500',
        }));
        setRows(bookingRows);
      }
      if (view === 'providers') {
        const savedViewRows = localStorage.getItem(`karigar_admin_providers`);
        const baseRows = savedViewRows ? JSON.parse(savedViewRows) : defaultSamples['providers'];
        const pStatuses = getSyncedProviderStatuses();
        const updated = baseRows.map((r: any) => pStatuses[r.name] ? { ...r, status: pStatuses[r.name] } : r);
        setRows(updated);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('karigar_bookings_updated', handleSync);
    window.addEventListener('karigar_admin_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('karigar_bookings_updated', handleSync);
      window.removeEventListener('karigar_admin_updated', handleSync);
    };
  }, [view]);

  // Helper to persist view rows
  const persistRows = (updatedRows: Row[]) => {
    setRows(updatedRows);
    try {
      localStorage.setItem(`karigar_admin_${view}`, JSON.stringify(updatedRows));
    } catch {}
  };

  // Helper to persist reviews
  const persistReviews = (updatedReviews: ReviewItem[]) => {
    setReviews(updatedReviews);
    try {
      localStorage.setItem('karigar_admin_reviews', JSON.stringify(updatedReviews));
    } catch {}
  };

  // Helper to persist settings
  const persistSettings = (updatedSettings: typeof defaultSettings) => {
    setSettings(updatedSettings);
    try {
      localStorage.setItem('karigar_admin_settings', JSON.stringify(updatedSettings));
    } catch {}
  };

  const title = titles[view] || view.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const columns = rows.length ? Object.keys(rows[0]!).filter((c) => c !== 'id') : [];

  // Unique statuses for filter dropdown
  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.status) set.add(r.status);
    });
    return Array.from(set);
  }, [rows]);

  // Visible rows filtered and sorted
  const visible = useMemo(() => {
    let result = rows.filter((row) =>
      Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== 'All') {
      result = result.filter((row) => row.status === statusFilter);
    }

    if (sortAsc !== null) {
      result = [...result].sort((a, b) => {
        const firstKey = columns[0] || 'id';
        const valA = (a[firstKey] || '').toLowerCase();
        const valB = (b[firstKey] || '').toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return result;
  }, [rows, search, statusFilter, sortAsc, columns]);

  // Filtered reviews
  const visibleReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        rev.customer.toLowerCase().includes(search.toLowerCase()) ||
        rev.professional.toLowerCase().includes(search.toLowerCase()) ||
        rev.comment.toLowerCase().includes(search.toLowerCase()) ||
        rev.trade.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = reviewFilter === 'All' ? true : rev.status === reviewFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, reviewFilter]);

  // Review Actions
  function updateReviewStatus(id: string, status: 'Published' | 'Hidden' | 'Flagged') {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    persistReviews(updated);
    if (status === 'Published') {
      toast.success('Review published to public provider profile.');
    } else if (status === 'Hidden') {
      toast.success('Review hidden from public profiles.');
    } else {
      toast.warning('Review marked as flagged for dispute investigation.');
    }
  }

  function deleteReviewWithConfirm(rev: ReviewItem) {
    setConfirmModal({
      open: true,
      title: 'Delete Review Permanently?',
      message: `Are you sure you want to permanently delete review ${rev.id} from ${rev.customer}? This rating will be deducted from ${rev.professional}'s public score.`,
      variant: 'danger',
      confirmLabel: 'Delete Review',
      onConfirm: () => {
        const updated = reviews.filter((r) => r.id !== rev.id);
        persistReviews(updated);
        toast.success(`Review ${rev.id} deleted successfully.`);
      },
    });
  }

  function submitReply(id: string) {
    if (!replyText.trim()) return;
    const updated = reviews.map((r) => (r.id === id ? { ...r, reply: replyText.trim() } : r));
    persistReviews(updated);
    toast.success('Official Karigar response added to review.');
    setReplyingReviewId(null);
    setReplyText('');
  }

  // Row update helper
  const updateRowStatus = (rowId: string, newStatus: string, successMsg: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    const updated = rows.map((r) => (r.id === rowId ? { ...r, status: newStatus } : r));
    persistRows(updated);

    if (view === 'bookings' && targetRow) {
      const bId = (targetRow as any).booking || targetRow.id;
      setSyncedJobStatus(bId, newStatus);
    }
    if (view === 'providers' && targetRow) {
      setSyncedProviderStatus((targetRow as any).name, newStatus);
    }

    toast.success(successMsg);
    setActiveMenuId(null);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (view === 'reviews') {
      const exportCols = ['Review ID', 'Customer', 'Professional', 'Trade', 'Rating', 'Comment', 'Status', 'Date'];
      const exportData = visibleReviews.map((r) => [
        r.id,
        r.customer,
        r.professional,
        r.trade,
        String(r.rating),
        r.comment.replace(/"/g, '""'),
        r.status,
        r.date,
      ]);
      downloadCSV(`karigar_admin_reviews_${Date.now()}`, exportCols, exportData);
      toast.success('Reviews exported as CSV file.');
      return;
    }

    if (visible.length === 0) {
      toast.error('No rows to export.');
      return;
    }

    const exportCols = columns.map((c) => c.toUpperCase());
    const exportData = visible.map((r) => columns.map((c) => r[c] || ''));
    downloadCSV(`karigar_admin_${view}_${Date.now()}`, exportCols, exportData);
    toast.success(`${title} exported as CSV file.`);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setConfirmModal({
      open: true,
      title: 'Reset Demo Operations Data?',
      message: 'This will restore all default mock bookings, providers, users, reviews, complaints, and settings.',
      variant: 'warning',
      confirmLabel: 'Reset Data',
      onConfirm: () => {
        try {
          localStorage.removeItem(`karigar_admin_${view}`);
          localStorage.removeItem('karigar_admin_reviews');
          localStorage.removeItem('karigar_admin_settings');
          localStorage.removeItem('karigar_verification_queue');
        } catch {}
        if (defaultSamples[view]) setRows(defaultSamples[view]);
        setReviews(defaultReviews);
        setSettings(defaultSettings);
        toast.success('Demo data restored to defaults.');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin`}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              KARIGAR SUPER-ADMIN OPERATIONS
            </span>
            <h1 className="display text-[24px] font-extrabold text-ink dark:text-white sm:text-[28px] leading-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoData}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Restore sample operational data"
          >
            <RotateCcw size={13} /> Reset Demo
          </button>
          <button
            onClick={handleExportCSV}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* SPECIALIZED VIEW 1: REVIEWS MODERATION WORKBENCH */}
      {view === 'reviews' ? (
        <div className="space-y-5">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Reviews</span>
              <b className="display mt-1 block text-2xl font-extrabold text-ink dark:text-white">{reviews.length}</b>
              <span className="text-[10px] text-emerald-600 font-semibold">100% verified visits</span>
            </div>
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Published & Live</span>
              <b className="display mt-1 block text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {reviews.filter((r) => r.status === 'Published').length}
              </b>
              <span className="text-[10px] text-emerald-600 font-semibold">Visible to customers</span>
            </div>
            <div className="rounded-2xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Flagged / Disputes</span>
              <b className="display mt-1 block text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                {reviews.filter((r) => r.status === 'Flagged').length}
              </b>
              <span className="text-[10px] text-amber-600 font-semibold">Requires admin action</span>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 shadow-soft">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Hidden / Moderated</span>
              <b className="display mt-1 block text-2xl font-extrabold text-slate-700 dark:text-slate-300">
                {reviews.filter((r) => r.status === 'Hidden').length}
              </b>
              <span className="text-[10px] text-slate-400 font-semibold">Excluded from ranking</span>
            </div>
          </div>

          {/* Controls: Search + Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-soft">
            <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by customer, pro, service, or keyword..."
                className="min-w-0 flex-1 text-xs outline-none bg-transparent dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'Published', 'Flagged', 'Hidden'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setReviewFilter(tab)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    reviewFilter === tab
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3.5">
            {visibleReviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-500">
                No reviews found matching current filter or search criteria.
              </div>
            ) : (
              visibleReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-soft transition ${
                    rev.status === 'Flagged'
                      ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20'
                      : rev.status === 'Hidden'
                      ? 'border-slate-200 dark:border-slate-800 opacity-75'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-ink dark:text-white">{rev.customer}</span>
                        <span className="text-slate-400 text-xs">reviewed</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">{rev.professional}</span>
                        <span className="text-[10px] text-slate-400">({rev.trade})</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-ink dark:text-slate-200">{rev.rating}.0</span>
                        <span className="text-[10px] text-slate-400">· {rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{rev.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          rev.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : rev.status === 'Flagged'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {rev.reply && (
                    <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        <BadgeCheck size={13} /> Official Karigar Platform Response:
                      </div>
                      <p className="mt-1 text-xs text-emerald-950 dark:text-emerald-200">{rev.reply}</p>
                    </div>
                  )}

                  {replyingReviewId === rev.id && (
                    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Post official reply from Karigar Operations:
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="e.g. We have contacted customer and dispatched an inspector to verify..."
                          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-none dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(rev.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          <Send size={12} /> Post
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText('');
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions bar for review */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Moderation Actions:
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {rev.status !== 'Published' && (
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(rev.id, 'Published')}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 text-[11px] font-bold text-white shadow-xs transition"
                        >
                          <Eye size={13} /> Publish Review
                        </button>
                      )}

                      {rev.status !== 'Hidden' && (
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(rev.id, 'Hidden')}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
                        >
                          <EyeOff size={13} /> Hide Review
                        </button>
                      )}

                      {rev.status !== 'Flagged' && (
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(rev.id, 'Flagged')}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 px-3 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition"
                        >
                          <Flag size={13} /> Flag Dispute
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText(rev.reply || '');
                        }}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
                      >
                        <MessageSquare size={13} /> {rev.reply ? 'Edit Reply' : 'Reply'}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteReviewWithConfirm(rev)}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 px-3 text-[11px] font-bold text-rose-700 dark:text-rose-300 transition"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : view === 'payments' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Cash volume this month', 'Rs 842,000', 'Total completed repairs volume across Hyderabad'],
              ['Estimated 10% commission', 'Rs 84,200', 'Automated platform revenue ledger'],
              ['Payouts awaiting review', 'Rs 18,400', '14 Karigars awaiting monthly invoice settlement'],
            ].map(([a, b, c]) => (
              <article key={a} className="rounded-[24px] bg-white dark:bg-slate-900 p-6 shadow-soft border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{a}</p>
                <b className="display mt-2 block text-[26px] font-extrabold text-ink dark:text-white">{b}</b>
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{c}</p>
              </article>
            ))}
          </div>

          <div className="rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-ink dark:text-white">Admin Settlement Ledger</h3>
                <p className="text-xs text-slate-500">Live platform receipts collected cash-after-service</p>
              </div>
              <button
                onClick={() => {
                  downloadCSV(
                    'karigar_admin_payments_statement_2026',
                    ['Ledger ID', 'Pro Name', 'Customer', 'Service', 'Date', 'Gross Amount', 'Commission (10%)', 'Status'],
                    [
                      ['LED-901', 'Ahsan Ali', 'Sana Ahmed', 'Kitchen Tap Replacement', '19 Dec 2026', '1200', '120', 'Settled'],
                      ['LED-902', 'Imran Memon', 'Bilal Hussain', 'AC Capacitor Repair', '18 Dec 2026', '2500', '250', 'Settled'],
                      ['LED-903', 'Nadeem Baloch', 'Mariam Shah', 'Door Hinges Fix', '17 Dec 2026', '1800', '180', 'Pending'],
                    ]
                  );
                  toast.success('Platform payments statement exported.');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                <Download size={14} /> Export Statement
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Ledger ID</th>
                    <th className="py-3 px-2">Provider</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Gross Fee</th>
                    <th className="py-3 px-2">Platform Cut (10%)</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: 'LED-901', pro: 'Ahsan Ali', service: 'Plumbing visit', fee: 'Rs 1,200', cut: 'Rs 120', st: 'Settled' },
                    { id: 'LED-902', pro: 'Imran Memon', service: 'AC Inspection', fee: 'Rs 2,500', cut: 'Rs 250', st: 'Settled' },
                    { id: 'LED-903', pro: 'Nadeem Baloch', service: 'Door alignment', fee: 'Rs 1,800', cut: 'Rs 180', st: 'Pending' },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-2 font-bold text-ink dark:text-white">{row.id}</td>
                      <td className="py-3 px-2 font-medium">{row.pro}</td>
                      <td className="py-3 px-2 text-slate-500">{row.service}</td>
                      <td className="py-3 px-2 font-bold text-ink dark:text-white">{row.fee}</td>
                      <td className="py-3 px-2 font-extrabold text-emerald-600">{row.cut}</td>
                      <td className="py-3 px-2">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                          {row.st}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : view === 'ai-insights' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ['Most requested services', 'Plumbing · 28%', 'AC service · 23%', 'Electrical · 19%'],
            ['Demand by neighbourhood', 'Latifabad · 34 requests', 'Qasimabad · 29 requests', 'Jamshoro · 17 requests'],
            ['Search phrases needing more coverage', '“urgent geyser repair” · Qasimabad', '“solar inverter” · Jamshoro', '“deep cleaning” · Latifabad'],
            ['Unclear requests', '“help with home wiring” · 8 searches', '“water not working” · 6 searches', '“room issue” · 3 searches'],
          ].map(([heading, ...items]) => (
            <article key={heading} className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
              <h2 className="text-sm font-bold text-ink dark:text-white">{heading}</h2>
              <div className="mt-4 space-y-2.5">
                {items.map((item, i) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      0{i + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : view === 'settings' ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Group 1: Booking & Financial Settings */}
            <article className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink dark:text-white">Booking & Fee Settings</h2>
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Platform Commission</b>
                      <p className="text-slate-400">Current share deducted from provider jobs</p>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-sm">{settings.commission}%</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Request Dispatch Expiry</b>
                      <p className="text-slate-400">Auto-timeout before passing to next pro</p>
                    </div>
                    <span className="font-bold text-ink dark:text-white">{settings.requestTimeout} minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Payment Method Policy</b>
                      <p className="text-slate-400">Cash-after-service customer policy</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      {settings.cashOnly ? '100% Cash-After-Service' : 'Multi-gateway'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSettingKey('booking');
                  setSettingsModalOpen(true);
                }}
                className="mt-4 h-10 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Configure Booking Policies
              </button>
            </article>

            {/* Group 2: Public Support & Contact */}
            <article className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink dark:text-white">Public Support & Hub Branding</h2>
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Support Hotline</b>
                      <p className="text-slate-400">Direct WhatsApp & call line</p>
                    </div>
                    <span className="font-bold text-ink dark:text-white">{settings.supportPhone}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Ops Support Email</b>
                      <p className="text-slate-400">Escalation inbox for complaints</p>
                    </div>
                    <span className="font-bold text-ink dark:text-white">{settings.supportEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Announcement Banner</b>
                      <p className="text-slate-400 truncate max-w-[200px]">{settings.landingBannerText}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSettingKey('contact');
                  setSettingsModalOpen(true);
                }}
                className="mt-4 h-10 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Configure Support & Banner
              </button>
            </article>

            {/* Group 3: Identity & Security */}
            <article className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink dark:text-white">Identity & Verification Controls</h2>
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Mandatory CNIC Uploads</b>
                      <p className="text-slate-400">Both front and back required for pros</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      {settings.requireCnic ? 'Strict Enforced' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <b className="text-ink dark:text-white">Minimum Rating Threshold</b>
                      <p className="text-slate-400">Pros below threshold flagged for review</p>
                    </div>
                    <span className="font-bold text-ink dark:text-white">{settings.minRatingThreshold} ★</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSettingKey('security');
                  setSettingsModalOpen(true);
                }}
                className="mt-4 h-10 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Configure Verification Rules
              </button>
            </article>

            {/* Group 4: Super-Admin Supervision */}
            <article className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink dark:text-white">Super-Admin Platform Powers</h2>
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p>✓ Instant revocation of Karigar Pro verification badges across the directory.</p>
                  <p>✓ Complete account suspension and reinstatement for rogue users and providers.</p>
                  <p>✓ Force-resolving customer dispute complaints with cash compensation.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.success('Super-admin credentials verified and session secured.');
                }}
                className="mt-4 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
              >
                Audit Session Privileges
              </button>
            </article>
          </div>

          {/* Interactive Settings Configuration Modal */}
          {settingsModalOpen && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
              <div className="w-full max-w-[500px] rounded-[26px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <b className="text-base font-bold text-ink dark:text-white">Configure Marketplace Settings</b>
                  <button onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  {activeSettingKey === 'booking' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Platform Commission (%)
                        </label>
                        <input
                          type="number"
                          value={settings.commission}
                          onChange={(e) => setSettings({ ...settings, commission: Number(e.target.value) })}
                          className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Request Expiry Timeout (Minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.requestTimeout}
                          onChange={(e) => setSettings({ ...settings, requestTimeout: Number(e.target.value) })}
                          className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                    </>
                  )}

                  {activeSettingKey === 'contact' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Support Phone / WhatsApp
                        </label>
                        <input
                          value={settings.supportPhone}
                          onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                          className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Operations Escalation Email
                        </label>
                        <input
                          value={settings.supportEmail}
                          onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                          className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Landing Page Announcement Banner
                        </label>
                        <textarea
                          value={settings.landingBannerText}
                          onChange={(e) => setSettings({ ...settings, landingBannerText: e.target.value })}
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                    </>
                  )}

                  {activeSettingKey === 'security' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Minimum Rating Threshold (Below this triggers review)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.minRatingThreshold}
                          onChange={(e) => setSettings({ ...settings, minRatingThreshold: Number(e.target.value) })}
                          className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 font-semibold dark:text-white outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSettingsModalOpen(false)}
                      className="h-10 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        persistSettings(settings);
                        setSettingsModalOpen(false);
                        toast.success('Marketplace configuration updated and saved.');
                      }}
                      className="h-10 flex-1 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GENERAL WORKBENCH TABLE FOR: bookings, providers, users, complaints, services, areas */
        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
          {/* Controls: Search, Interactive Sort, Filter Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 p-4">
            <div className="flex h-11 min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="min-w-0 flex-1 text-xs outline-none bg-transparent dark:text-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Interactive Sort */}
              <button
                onClick={() => setSortAsc((prev) => (prev === null ? true : prev ? false : null))}
                className={`flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition ${
                  sortAsc !== null
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Toggle alphabetical sorting"
              >
                <ArrowDownWideNarrow size={14} />
                <span>
                  Sort {sortAsc === null ? '' : sortAsc ? '(A → Z)' : '(Z → A)'}
                </span>
              </button>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={`flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition ${
                    statusFilter !== 'All'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <SlidersHorizontal size={14} /> Filter: {statusFilter} <ChevronDown size={13} />
                </button>

                {filterMenuOpen && (
                  <div className="absolute right-0 top-12 z-40 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl">
                    <button
                      onClick={() => {
                        setStatusFilter('All');
                        setFilterMenuOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                        statusFilter === 'All' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      All Statuses
                    </button>
                    {availableStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setFilterMenuOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                          statusFilter === st ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          {visible.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No matching records found. Try resetting filters or search terms.
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[320px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafcfa] dark:bg-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-5 py-3.5">
                        {col.replaceAll('_', ' ')}
                      </th>
                    ))}
                    <th className="px-5 py-3.5 text-right">Interactive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visible.map((row) => (
                    <tr key={row.id || Math.random()} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      {columns.map((col) => (
                        <td key={col} className="px-5 py-4 text-slate-700 dark:text-slate-200 font-medium">
                          {col === 'status' ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                row[col] === 'Open' || row[col] === 'Requested'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : row[col] === 'Completed' || row[col] === 'Verified' || row[col] === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : row[col] === 'Suspended' || row[col] === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {row[col]}
                            </span>
                          ) : col === 'priority' ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                row[col] === 'Urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : row[col] === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {row[col]}
                            </span>
                          ) : (
                            row[col]
                          )}
                        </td>
                      ))}

                      {/* Interactive Actions Dropdown & Options */}
                      <td className="px-5 py-4 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <span>Manage</span>
                            <ChevronDown size={13} />
                          </button>

                          {activeMenuId === row.id && (
                            <div className="absolute right-4 top-12 z-50 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl space-y-1">
                              {/* 1. Actions for Bookings */}
                              {view === 'bookings' && (
                                <>
                                  <Link
                                    href={`/${locale}/chat/${row.booking}`}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <MessageSquare size={13} className="text-emerald-600" />
                                    <span>Open Live Chat</span>
                                  </Link>
                                  {row.status !== 'Completed' && (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: 'Force Mark Booking Completed?',
                                          message: `Mark booking #${row.booking} as completed? This will release cash settlement authorization.`,
                                          variant: 'success',
                                          confirmLabel: 'Mark Completed',
                                          onConfirm: () =>
                                            updateRowStatus(row.id, 'Completed', `Booking #${row.booking} marked completed.`),
                                        });
                                      }}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                                    >
                                      <CheckCircle2 size={13} />
                                      <span>Mark Completed</span>
                                    </button>
                                  )}
                                  {row.status !== 'Cancelled' && (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: 'Cancel Booking Order?',
                                          message: `Are you sure you want to cancel booking #${row.booking}? Customer and provider will be notified.`,
                                          variant: 'danger',
                                          confirmLabel: 'Cancel Booking',
                                          onConfirm: () =>
                                            updateRowStatus(row.id, 'Cancelled', `Booking #${row.booking} cancelled.`),
                                        });
                                      }}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                                    >
                                      <Ban size={13} />
                                      <span>Cancel Booking</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {/* 2. Actions for Service Providers (Super-Admin Supervision) */}
                              {view === 'providers' && (
                                <>
                                  {row.status === 'Verified' ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            open: true,
                                            title: `Revoke Verification for ${row.name}?`,
                                            message: `This will remove the green verified badge from ${row.name}'s profile. They will lose search ranking boost until re-verified.`,
                                            variant: 'warning',
                                            confirmLabel: 'Revoke Badge',
                                            onConfirm: () =>
                                              updateRowStatus(row.id, 'Unverified', `Verification badge revoked for ${row.name}.`),
                                          });
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700"
                                      >
                                        <ShieldAlert size={13} />
                                        <span>Revoke Badge</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            open: true,
                                            title: `Suspend Provider ${row.name}?`,
                                            message: `Are you sure you want to suspend ${row.name}? They will be barred from accepting jobs across Hyderabad & Jamshoro.`,
                                            variant: 'danger',
                                            confirmLabel: 'Suspend Account',
                                            onConfirm: () =>
                                              updateRowStatus(row.id, 'Suspended', `Provider ${row.name} has been suspended.`),
                                          });
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                                      >
                                        <Ban size={13} />
                                        <span>Suspend Account</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: `Verify & Reinstate ${row.name}?`,
                                          message: `Restore full verified badge and active marketplace directory status for ${row.name}?`,
                                          variant: 'success',
                                          confirmLabel: 'Verify Provider',
                                          onConfirm: () =>
                                            updateRowStatus(row.id, 'Verified', `Provider ${row.name} verified and active.`),
                                        });
                                      }}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                                    >
                                      <ShieldCheck size={13} />
                                      <span>Verify & Reinstate</span>
                                    </button>
                                  )}
                                  <Link
                                    href={`/${locale}/search?q=${encodeURIComponent(row.trade || '')}`}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <Eye size={13} />
                                    <span>View Directory Card</span>
                                  </Link>
                                </>
                              )}

                              {/* 3. Actions for Registered Users (Customers) */}
                              {view === 'users' && (
                                <>
                                  {row.status === 'Active' ? (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: `Suspend Customer ${row.name}?`,
                                          message: `Are you sure you want to suspend account for ${row.name}? They will not be able to book home repairs.`,
                                          variant: 'danger',
                                          confirmLabel: 'Suspend User',
                                          onConfirm: () =>
                                            updateRowStatus(row.id, 'Suspended', `Customer ${row.name} has been suspended.`),
                                        });
                                      }}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                                    >
                                      <UserX size={13} />
                                      <span>Suspend Account</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          open: true,
                                          title: `Reactivate Customer ${row.name}?`,
                                          message: `Re-enable booking access for ${row.name}?`,
                                          variant: 'success',
                                          confirmLabel: 'Reactivate',
                                          onConfirm: () =>
                                            updateRowStatus(row.id, 'Active', `Customer ${row.name} account reactivated.`),
                                        });
                                      }}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                                    >
                                      <UserCheck size={13} />
                                      <span>Reactivate User</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      toast.success(`Password reset email triggered for ${row.name}.`);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <Lock size={13} />
                                    <span>Send Reset Link</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      toast.success(`Loyalty Rs 500 repair credit granted to ${row.name}!`);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                                  >
                                    <DollarSign size={13} />
                                    <span>Grant Rs 500 Credit</span>
                                  </button>
                                </>
                              )}

                              {/* 4. Actions for Complaints */}
                              {view === 'complaints' && (
                                <>
                                  {row.status !== 'Resolved' ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            open: true,
                                            title: `Resolve Ticket ${row.ticket}?`,
                                            message: `Confirm resolution for customer complaint ${row.ticket} regarding booking ${row.booking}?`,
                                            variant: 'success',
                                            confirmLabel: 'Resolve Ticket',
                                            onConfirm: () =>
                                              updateRowStatus(row.id, 'Resolved', `Ticket ${row.ticket} marked resolved.`),
                                          });
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                                      >
                                        <CheckCircle2 size={13} />
                                        <span>Mark as Resolved</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            open: true,
                                            title: `Compensate Customer ${row.customer}?`,
                                            message: `Issue Rs 500 apology voucher for ticket ${row.ticket} and mark resolved?`,
                                            variant: 'info',
                                            confirmLabel: 'Issue Compensation',
                                            onConfirm: () =>
                                              updateRowStatus(row.id, 'Compensated', `Rs 500 issued and ticket ${row.ticket} resolved.`),
                                          });
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700"
                                      >
                                        <DollarSign size={13} />
                                        <span>Issue Compensation</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => updateRowStatus(row.id, 'Open', `Ticket ${row.ticket} reopened.`)}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700"
                                    >
                                      <RotateCcw size={13} />
                                      <span>Reopen Ticket</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {/* 5. Actions for Services / Areas */}
                              {(view === 'services' || view === 'areas') && (
                                <button
                                  onClick={() => {
                                    const nextSt = row.status === 'Active' ? 'Inactive' : 'Active';
                                    updateRowStatus(row.id, nextSt, `Status toggled to ${nextSt}.`);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Sliders size={13} />
                                  <span>Toggle {row.status === 'Active' ? 'Inactive' : 'Active'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-3.5 text-xs text-slate-400">
            <span>
              Showing {visible.length} of {rows.length} total records
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Sindh Central Command (Hyderabad & Jamshoro)
            </span>
          </div>
        </section>
      )}

      {/* Global Confirmation Modal for destructive / supervisor actions */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmLabel}
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