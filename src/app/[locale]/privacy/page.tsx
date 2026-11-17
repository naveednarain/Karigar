import { InfoPage } from '@/components/info-page';
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) { const { locale } = await params; return <InfoPage topic="privacy" locale={locale} />; }
