import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminProviders() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="providers" initialUser={user} />;
}
