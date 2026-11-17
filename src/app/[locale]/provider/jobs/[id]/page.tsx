import{BookingDetail}from'@/components/booking-detail';
export default function ProviderJobDetail({params}:{params:{id:string}}){return <BookingDetail bookingId={params.id} role="provider"/>}
