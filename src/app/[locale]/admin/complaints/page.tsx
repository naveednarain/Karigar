import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminComplaints() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="complaints" initialUser={user} />;
}
