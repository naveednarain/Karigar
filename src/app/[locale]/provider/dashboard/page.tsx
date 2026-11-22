import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function ProviderDashboard() {
  const user = await getAuthUser();
  return <Workspace role="provider" initialUser={user} />;
}
