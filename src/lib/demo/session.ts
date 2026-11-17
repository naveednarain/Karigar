export const DEMO_COOKIE = 'karigar_demo_session';
const encoder = new TextEncoder();
function secret() { const value=process.env.SESSION_SECRET||(process.env.DEMO_MODE==='true'?process.env.DEMO_PASSWORD:null);return value?encoder.encode(value):null; }
async function signingKey() { const value=secret();if(!value)throw new Error('Set SESSION_SECRET on the server before issuing sessions.');return crypto.subtle.importKey('raw', value, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
export async function createDemoSession(role: 'user' | 'provider' | 'admin') {
  const payload = `${role}.${Date.now() + 86_400_000}`;
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(payload));
  return `${payload}.${Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('')}`;
}
export async function verifyDemoSession(value?: string | null) {
  if (!value || !secret()) return null;
  const [role, expiration, signature] = value.split('.');
  if (!['user', 'provider', 'admin'].includes(role) || !expiration || !signature || Number(expiration) < Date.now()) return null;
  const bytes = new Uint8Array(signature.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  try { return await crypto.subtle.verify('HMAC', await signingKey(), bytes, encoder.encode(`${role}.${expiration}`)) ? role : null; }
  catch { return null; }
}
