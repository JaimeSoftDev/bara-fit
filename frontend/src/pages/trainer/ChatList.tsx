import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";

export default function TrainerChatList() {
  const { data: clients = [] } = useClients();

  return (
    <div>
      <PageHeader title="Chat" subtitle="Comunícate con tus clientes" />
      <div className="space-y-2">
        {clients.map((c) => (
          <Link key={c.id} to={`/trainer/chat/${c.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardBody className="flex items-center gap-3">
                <Avatar name={c.name} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-400">{c.email}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
