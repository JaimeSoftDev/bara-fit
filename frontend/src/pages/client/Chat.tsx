import { useSession } from "../../store/session";
import { useMessages, useMyConversation, useSendMessage } from "../../hooks/useChat";
import { PageHeader } from "../../components/ui/PageHeader";
import { ChatThread } from "../../components/ChatThread";

export default function ClientChat() {
  const clientId = useSession((s) => s.user!.id);
  const { data: conversation } = useMyConversation();
  const { data: messages = [] } = useMessages(conversation?.id);
  const sendMessage = useSendMessage(conversation?.id);

  return (
    <div>
      <PageHeader title="Chat" subtitle="Conversación con tu entrenador" />
      <ChatThread
        messages={messages}
        currentUserId={clientId}
        otherName="tu entrenador"
        onSend={(text) => sendMessage.mutate(text)}
      />
    </div>
  );
}
