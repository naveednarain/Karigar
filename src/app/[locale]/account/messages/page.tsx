import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AccountMessages() {
  const user = await getAuthUser();
  return <Workspace role="customer" view="messages" initialUser={user} />;
}
