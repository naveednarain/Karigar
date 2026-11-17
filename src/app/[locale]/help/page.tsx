import { InfoPage } from '@/components/info-page';
export default async function HelpPage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) { const { locale } = await params; return <InfoPage topic="help" locale={locale} />; }
