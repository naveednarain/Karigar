import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminAreas() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="areas" initialUser={user} />;
}
