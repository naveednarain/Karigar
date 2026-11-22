'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Clock3, FileText, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ConfirmationModal } from './confirmation-modal';
import { setSyncedProviderStatus } from '@/lib/sync';

type Applicant = { id: string; name: string; skill: string; area: string; since: string; initials: string };

const demoQueue: Applicant[] = [
  { id: 'u-01', name: 'Rashid Hussain', skill: 'Electrician', area: 'Qasimabad, Hyderabad', since: 'Applied 2 hours ago', initials: 'RH' },
  { id: 'u-02', name: 'Farzana Bibi', skill: 'Home cleaning', area: 'Latifabad, Hyderabad', since: 'Applied yesterday', initials: 'FB' },
  { id: 'u-03', name: 'Kashif Brohi', skill: 'AC technician', area: 'Jamshoro', since: 'Applied yesterday', initials: 'KB' },
  { id: 'u-04', name: 'Muneer Ahmed', skill: 'Solar installer', area: 'Kotri', since: 'Applied 2 days ago', initials: 'MA' },
];

const STORAGE_KEY = 'karigar_verification_queue';

export function VerificationQueue() {
  const router = useRouter();
  const locale = useLocale();
  const [queue, setQueue] = useState<Applicant[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: string;
    action: 'approve' | 'reject';
    name: string;
  }>({ open: false, id: '', action: 'approve', name: '' });

  // Load from persistent localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      } else {
        setQueue(demoQueue);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoQueue));
      }
    } catch {
      setQueue(demoQueue);
    }
  }, []);

  function saveQueue(newQueue: Applicant[]) {
    setQueue(newQueue);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
    } catch {
      // Storage quota or private mode fallback
    }
  }

  function resetDemoQueue() {
    saveQueue(demoQueue);
    toast.success('Reset demo verification queue to 4 pending applicants.');
  }

  const filtered = queue.filter((p) =>
    `${p.name} ${p.skill} ${p.area}`.toLowerCase().includes(search.toLowerCase())
  );

  async function executeDecision(id: string, decision: 'approve' | 'reject') {
    if (decision === 'reject' && !reason.trim()) {
      toast.error('Add a feedback note before declining.');
      return;
    }
    setBusy(true);

    const newQueue = queue.filter((item) => item.id !== id);
    saveQueue(newQueue);

    // If approved, update approved providers cache so public search knows
    if (decision === 'approve') {
      try {
        const approvedItem = queue.find((item) => item.id === id);
        if (approvedItem) {
          const approved = JSON.parse(localStorage.getItem('karigar_approved_providers') || '[]');
          approved.push(approvedItem);
          localStorage.setItem('karigar_approved_providers', JSON.stringify(approved));
          setSyncedProviderStatus(approvedItem.name, 'Verified');
        }
      } catch {
        // storage fallback
      }
    } else {
      const rejectedItem = queue.find((item) => item.id === id);
      if (rejectedItem) {
        setSyncedProviderStatus(rejectedItem.name, 'Rejected');
      }
    }
    window.dispatchEvent(new Event('karigar_admin_updated'));

    setActive(null);
    setReason('');
    setConfirmModal({ open: false, id: '', action: 'approve', name: '' });
    toast.success(
      decision === 'approve'
        ? 'Professional approved and verified on Karigar! Status saved.'
        : 'Application declined with feedback sent to applicant.'
    );
    setBusy(false);
  }

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
              IDENTITY VERIFICATION QUEUE
            </span>
            <h1 className="display text-[24px] font-extrabold text-ink dark:text-white sm:text-[28px] leading-tight">
              Provider Verification Queue
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={resetDemoQueue}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Reset queue for demo testing"
          >
            <RefreshCw size={13} /> Reset Demo Queue
          </button>
          <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-3.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-300">
            {queue.length} Pending Review
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex h-11 max-w-[480px] items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 shadow-xs">
        <Search size={16} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applicants by name, skill, or area..."
          className="h-full flex-1 text-xs outline-none bg-transparent dark:text-white"
        />
      </div>

      {/* Queue List */}
      {filtered.length === 0 ? (
        <div className="rounded-[24px] bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-soft">
          No applicants currently pending in verification queue. (Changes persisted)
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="rounded-[22px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft sm:flex sm:items-center sm:gap-4 transition hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 font-extrabold text-sm text-emerald-900 dark:text-emerald-300">
                  {p.initials}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink dark:text-white">{p.name}</h2>
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Pending CNIC
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{p.skill} · {p.area}</p>
                  <small className="mt-1 block text-[10px] text-slate-400">{p.since}</small>
                </div>
              </div>

              <div className="mt-4 flex gap-2 sm:ml-auto sm:mt-0">
                <button
                  type="button"
                  onClick={() => {
                    setActive(p.id);
                    setReason('');
                  }}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <FileText size={15} /> Review Documents
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      id: p.id,
                      action: 'approve',
                      name: p.name,
                    })
                  }
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <Check size={15} /> Approve
                </button>
              </div>

              {/* Document Review Drawer/Drawer Modal */}
              {active === p.id && (
                <div className="mt-4 w-full border-t border-slate-100 dark:border-slate-800 pt-4 sm:col-span-full">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                    <h3 className="text-xs font-bold text-ink dark:text-white">CNIC Document Verification</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                        <small className="block font-bold text-[10px] text-slate-400 uppercase">CNIC Front</small>
                        <img
                          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
                          alt="CNIC Front"
                          className="mt-2 h-32 w-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                        <small className="block font-bold text-[10px] text-slate-400 uppercase">CNIC Back</small>
                        <img
                          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
                          alt="CNIC Back"
                          className="mt-2 h-32 w-full rounded-lg object-cover"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Admin Feedback Note (Required if declining)
                      </label>
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Please re-upload clearer photo with CNIC number visible..."
                        className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs outline-none dark:text-white"
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActive(null)}
                        className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            id: p.id,
                            action: 'reject',
                            name: p.name,
                          })
                        }
                        className="h-9 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 px-4 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                      >
                        Decline Application
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            id: p.id,
                            action: 'approve',
                            name: p.name,
                          })
                        }
                        className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        Approve & Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        title={confirmModal.action === 'approve' ? 'Approve Service Provider' : 'Decline Provider Application'}
        message={
          confirmModal.action === 'approve'
            ? `Are you sure you want to verify and approve ${confirmModal.name}? This will activate their profile badge across Hyderabad search results.`
            : `Are you sure you want to decline the application for ${confirmModal.name}? Feedback will be delivered to the applicant.`
        }
        variant={confirmModal.action === 'approve' ? 'success' : 'danger'}
        confirmText={confirmModal.action === 'approve' ? 'Yes, Approve & Verify' : 'Yes, Decline'}
        onConfirm={() => executeDecision(confirmModal.id, confirmModal.action)}
        onCancel={() => setConfirmModal({ open: false, id: '', action: 'approve', name: '' })}
        busy={busy}
      />
    </div>
  );
}
