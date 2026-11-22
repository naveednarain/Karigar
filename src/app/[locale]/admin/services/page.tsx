import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminServices() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="services" initialUser={user} />;
}
