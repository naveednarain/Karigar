import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function ProviderJobs() {
  const user = await getAuthUser();
  return <Workspace role="provider" view="jobs" initialUser={user} />;
}
