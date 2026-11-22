import { jobs as defaultJobs } from '@/lib/data';

const STORAGE_BOOKINGS = 'karigar_user_bookings';
const STORAGE_JOB_STATUSES = 'karigar_job_statuses';
const STORAGE_PROVIDER_STATUSES = 'karigar_provider_statuses';

export function getSyncedJobStatuses(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_JOB_STATUSES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSyncedJobStatus(jobIdOrBookingId: string, status: string) {
  if (typeof window === 'undefined') return;
  try {
    const statuses = getSyncedJobStatuses();
    statuses[jobIdOrBookingId] = status;
    localStorage.setItem(STORAGE_JOB_STATUSES, JSON.stringify(statuses));
    window.dispatchEvent(new Event('karigar_bookings_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getAllSyncedBookings(): any[] {
  if (typeof window === 'undefined') return defaultJobs;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS);
    const userBookings = raw ? JSON.parse(raw) : [];
    const statuses = getSyncedJobStatuses();
    const combined = [...userBookings, ...defaultJobs];
    const seen = new Set<string>();
    const result = [];
    for (const j of combined) {
      const key = j.id || j.bookingId;
      if (!seen.has(key)) {
        seen.add(key);
        const liveStatus = statuses[j.id] || statuses[j.bookingId] || j.status;
        result.push({ ...j, status: liveStatus });
      }
    }
    return result;
  } catch {
    return defaultJobs;
  }
}

export function addSyncedBooking(newJob: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_BOOKINGS, JSON.stringify([newJob, ...existing]));
    window.dispatchEvent(new Event('karigar_bookings_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function getSyncedProviderStatuses(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_PROVIDER_STATUSES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSyncedProviderStatus(providerIdOrName: string, status: string) {
  if (typeof window === 'undefined') return;
  try {
    const statuses = getSyncedProviderStatuses();
    statuses[providerIdOrName] = status;
    localStorage.setItem(STORAGE_PROVIDER_STATUSES, JSON.stringify(statuses));
    window.dispatchEvent(new Event('karigar_admin_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}
