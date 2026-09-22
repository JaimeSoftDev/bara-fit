import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import { getConversation, getMessages } from "../../lib/queries";
import { ChatThread } from "../../components/ChatThread";
import { Avatar } from "../../components/ui/Avatar";
import { id } from "../../lib/id";

export default function TrainerChatThread() {
  const { clientId } = useParams<{ clientId: string }>();
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const addMessage = useDb((s) => s.addMessage);
  const trainerId = currentUserId!;

  const client = clientId ? db.users[clientId] : undefined;
  const conv = clientId ? getConversation(db, trainerId, clientId) : undefined;

  useEffect(() => {
    if (!clientId || conv) return;
    const newConv = { id: id("conv"), trainerId, clientId };
    useDb.setState((s) => ({ db: { ...s.db, conversations: { ...s.db.conversations, [newConv.id]: newConv } } }));
  }, [clientId, conv, trainerId]);

  const messages = conv ? getMessages(db, conv.id) : [];

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
        onSend={(text) => conv && addMessage(conv.id, trainerId, text)}
      />
    </div>
  );
}
