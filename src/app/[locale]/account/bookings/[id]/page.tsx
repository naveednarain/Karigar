import{BookingDetail}from'@/components/booking-detail';
export default function AccountBookingDetail({params}:{params:{id:string}}){return <BookingDetail bookingId={params.id} role="user"/>}
