import{ChatThread}from'@/components/chat-thread';
export default function ChatPage({params}:{params:{bookingId:string}}){return <ChatThread bookingId={params.bookingId}/>}
