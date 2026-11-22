import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminAiInsights() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="ai-insights" initialUser={user} />;
}
