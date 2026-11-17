'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const isDark =
      localStorage.getItem('karigar_theme') === 'dark' ||
      (!('karigar_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('karigar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('karigar_theme', 'light');
    }
  }

  if (dark === null) {
    return (
      <span className={`grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 ${className}`}>
        <Sun size={17} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400 ${className}`}
    >
      {dark ? <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" /> : <Moon size={17} className="text-slate-700 transition-transform hover:-rotate-12" />}
    </button>
  );
}
