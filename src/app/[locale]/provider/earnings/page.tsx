import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function ProviderEarnings() {
  const user = await getAuthUser();
  return <Workspace role="provider" view="earnings" initialUser={user} />;
}
