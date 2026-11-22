import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminBookings() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="bookings" initialUser={user} />;
}
