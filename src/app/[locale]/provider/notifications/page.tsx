import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function ProviderNotifications() {
  const user = await getAuthUser();
  return <Workspace role="provider" view="notifications" initialUser={user} />;
}
