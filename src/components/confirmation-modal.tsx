'use client';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      Icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-900',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      Icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-900',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    success: {
      Icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    info: {
      Icon: Info,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-900',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }[variant];

  const { Icon, color, btnColor } = iconConfig;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-[420px] rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          disabled={busy}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${color}`}>
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-ink dark:text-white leading-snug">{title}</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex h-10 items-center justify-center rounded-xl px-5 text-xs font-bold transition shadow-xs disabled:opacity-60 ${btnColor}`}
          >
            {busy ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
