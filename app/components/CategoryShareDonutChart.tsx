"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { Transaction } from "./AiInsights";

type Props = {
  transactions: Transaction[];
  currencySymbol: string;
};

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#f87171",
  "#fbbf24",
  "#a78bfa",
  "#f472b6",
  "#38bdf8",
  "#fb7185",
];

type CategoryPoint = {
  name: string;
  value: number;
};

function buildCategoryData(transactions: Transaction[]): CategoryPoint[] {
  const map = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const key = t.category || "Other";
    map.set(key, (map.get(key) || 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default function CategoryShareDonutChart({
  transactions,
  currencySymbol,
}: Props) {
  const data = buildCategoryData(transactions);
  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
      <div className="rounded-lg border border-white/10 bg-[#0f1629] px-2.5 py-2 text-xs text-slate-300 shadow-xl">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          {item.name}
        </div>
        <div className="mt-1 font-semibold text-white">
          {currencySymbol}
          {Number(item.value ?? 0).toFixed(2)}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No expenses yet to show category share.
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

