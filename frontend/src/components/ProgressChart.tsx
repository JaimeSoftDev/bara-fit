import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressEntry } from "../types";
import { formatDate } from "../lib/utils";

export function ProgressChart({ entries, dataKey, unit }: { entries: ProgressEntry[]; dataKey: "weightKg" | "bodyFatPct"; unit: string }) {
  const data = entries
    .filter((e) => e[dataKey] !== undefined)
    .map((e) => ({ date: formatDate(e.date), value: e[dataKey] as number }));

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Aún no hay registros de progreso.</p>;
  }

  const values = data.map((d) => d.value);
  const yMin = Math.floor(Math.min(...values) - 1);
  const yMax = Math.ceil(Math.max(...values) + 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={[yMin, yMax]}
        />
        <Tooltip
          formatter={(value) => [`${value} ${unit}`, ""]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} fill="url(#progressFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
