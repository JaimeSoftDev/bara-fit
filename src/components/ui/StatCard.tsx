import type { LucideIcon } from "lucide-react";
import { Card, CardBody } from "./Card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
          <Icon size={20} />
        </div>
      </CardBody>
    </Card>
  );
}
