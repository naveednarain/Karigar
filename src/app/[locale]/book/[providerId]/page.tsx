import { BookingFlow } from '@/components/booking-flow';
import { getPublicProvider } from '@/lib/ai/providers';
import { notFound } from 'next/navigation';
export default async function BookPage({params}:{params:{locale:string;providerId:string}}){const pro=await getPublicProvider(params.providerId);if(!pro)notFound();return <BookingFlow provider={pro} locale={params.locale}/>}
