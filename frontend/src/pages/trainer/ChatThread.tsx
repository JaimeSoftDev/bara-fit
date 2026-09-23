import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useClient } from "../../hooks/useClients";
import { useConversationWith, useMessages, useSendMessage } from "../../hooks/useChat";
import { useSession } from "../../store/session";
import { ChatThread } from "../../components/ChatThread";
import { Avatar } from "../../components/ui/Avatar";

export default function TrainerChatThread() {
  const { clientId } = useParams<{ clientId: string }>();
  const trainerId = useSession((s) => s.user!.id);
  const { data: client } = useClient(clientId);
  const { data: conversation } = useConversationWith(clientId);
  const { data: messages = [] } = useMessages(conversation?.id);
  const sendMessage = useSendMessage(conversation?.id);

  if (!client) return <p className="text-sm text-slate-500">Cliente no encontrado.</p>;

  return (
    <div>
      <Link to="/trainer/chat" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Chats
      </Link>
      <div className="mb-3 flex items-center gap-2">
        <Avatar name={client.name} size={32} />
        <p className="text-sm font-semibold text-slate-900">{client.name}</p>
      </div>
      <ChatThread
        messages={messages}
        currentUserId={trainerId}
        otherName={client.name}
        onSend={(text) => sendMessage.mutate(text)}
      />
    </div>
  );
}
