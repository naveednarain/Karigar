import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are not configured.');
  const store = cookies();
  return createSSRClient<Database>(url, key, { cookies: { getAll: () => store.getAll(), setAll: (values) => values.forEach(({ name, value, options }) => { try { store.set(name, value, options); } catch { /* Server Components cannot write cookies. */ } }) } });
}
