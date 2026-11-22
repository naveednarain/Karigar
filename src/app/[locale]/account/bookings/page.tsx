import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function CustomerBookings() {
  const user = await getAuthUser();
  return <Workspace role="customer" initialUser={user} />;
}
