import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function ProviderProfilePage() {
  const user = await getAuthUser();
  return <Workspace role="provider" view="profile" initialUser={user} />;
}
