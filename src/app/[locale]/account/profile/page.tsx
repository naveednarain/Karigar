import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AccountProfile() {
  const user = await getAuthUser();
  return <Workspace role="customer" view="profile" initialUser={user} />;
}
