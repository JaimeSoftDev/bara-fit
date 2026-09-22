import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useCurrentDb } from "../../store/db";
import { getClientsOfTrainer, getConversation, getMessages } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { formatTime } from "../../lib/utils";

export default function TrainerChatList() {
  const { currentUserId } = useAuth();
  const db = useCurrentDb();
  const trainerId = currentUserId!;
  const clients = getClientsOfTrainer(db, trainerId);

  return (
    <div>
      <PageHeader title="Chat" subtitle="Comunícate con tus clientes" />
      <div className="space-y-2">
        {clients.map((c) => {
          const conv = getConversation(db, trainerId, c.id);
          const messages = conv ? getMessages(db, conv.id) : [];
          const last = messages[messages.length - 1];
          return (
            <Link key={c.id} to={`/trainer/chat/${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex items-center gap-3">
                  <Avatar name={c.name} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{last ? last.text : "Sin mensajes todavía"}</p>
                  </div>
                  {last && <span className="shrink-0 text-xs text-slate-400">{formatTime(last.createdAt)}</span>}
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
