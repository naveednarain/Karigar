'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, MapPin, Search, type LucideIcon } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string)[];
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  id?: string;
  searchable?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options: rawOptions,
  placeholder = 'Select an option',
  icon: Icon = MapPin,
  className = '',
  id,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const options: Option[] = rawOptions.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFilter('');
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        setFilter('');
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const filtered = filter
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(filter.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(filter.toLowerCase())
      )
    : options;

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between gap-2.5 rounded-xl bg-transparent px-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon size={17} className="shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="truncate font-medium">
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
          {searchable && options.length > 5 && (
            <div className="relative mb-1 px-1 pt-1">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search areas..."
                className="h-8 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-7 text-[11px] outline-none dark:text-white"
                autoFocus
              />
              <Search size={13} className="absolute left-3 top-3 text-slate-400" />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-center text-[11px] text-slate-400">
                No matching locations
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setFilter('');
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/60 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin
                        size={14}
                        className={`shrink-0 ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
