import { ChatThread } from '@/components/chat-thread';
import { getAuthUser } from '@/lib/auth-server';

export default async function ChatPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await getAuthUser();
  return <ChatThread bookingId={params.bookingId} initialUser={user} />;
}
