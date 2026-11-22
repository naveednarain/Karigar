import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminPayments() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="payments" initialUser={user} />;
}
