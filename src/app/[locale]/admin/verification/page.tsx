import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function VerificationPage() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="verification" initialUser={user} />;
}
