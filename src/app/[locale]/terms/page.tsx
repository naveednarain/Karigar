import { InfoPage } from '@/components/info-page';
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) { const { locale } = await params; return <InfoPage topic="terms" locale={locale} />; }
