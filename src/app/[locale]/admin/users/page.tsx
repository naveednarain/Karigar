import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminUsers() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="users" initialUser={user} />;
}
