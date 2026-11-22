import { Workspace } from '@/components/workspace';
import { getAuthUser } from '@/lib/auth-server';

export default async function AdminReviews() {
  const user = await getAuthUser();
  return <Workspace role="admin" view="reviews" initialUser={user} />;
}
