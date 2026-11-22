import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AccountNotifications() {
  const user = await getAuthUser();
  return <Workspace role="customer" view="notifications" initialUser={user} />;
}
