import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Poppins, Noto_Naskh_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import '../globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-poppins', display: 'swap' });
const urdu = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400','500','600','700'], variable: '--font-urdu', display: 'swap' });
export const metadata: Metadata = { title: 'Karigar — Local help, done right', description: 'Find trusted home service professionals in Hyderabad and Jamshoro.' };
export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ur' }]; }
export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!['en', 'ur'].includes(params.locale)) notFound();
  setRequestLocale(params.locale);
  const messages = useMessages();
  return <html lang={params.locale} dir={params.locale === 'ur' ? 'rtl' : 'ltr'}><body className={`${inter.variable} ${poppins.variable} ${urdu.variable}`}><NextIntlClientProvider messages={messages}>{children}<Toaster richColors position="top-center" /><Analytics/><SpeedInsights/></NextIntlClientProvider></body></html>;
}
