import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminSettings() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="settings" initialUser={user} />;
}
