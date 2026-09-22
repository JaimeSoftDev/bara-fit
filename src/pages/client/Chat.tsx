import { useEffect } from "react";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import { getConversation, getMessages } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { ChatThread } from "../../components/ChatThread";
import { id } from "../../lib/id";

export default function ClientChat() {
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const addMessage = useDb((s) => s.addMessage);
  const clientId = currentUserId!;
  const client = db.users[clientId];
  const trainerId = client && client.role === "client" ? client.trainerId : "";
  const trainer = db.users[trainerId];

  const conv = getConversation(db, trainerId, clientId);

  useEffect(() => {
    if (conv || !trainerId) return;
    const newConv = { id: id("conv"), trainerId, clientId };
    useDb.setState((s) => ({ db: { ...s.db, conversations: { ...s.db.conversations, [newConv.id]: newConv } } }));
  }, [conv, trainerId, clientId]);

  const messages = conv ? getMessages(db, conv.id) : [];

  return (
    <div>
      <PageHeader title="Chat" subtitle={trainer ? `Conversación con ${trainer.name}` : undefined} />
      <ChatThread
        messages={messages}
        currentUserId={clientId}
        otherName={trainer?.name ?? "tu entrenador"}
        onSend={(text) => conv && addMessage(conv.id, clientId, text)}
      />
    </div>
  );
}
