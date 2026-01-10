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
  "#fb7185",
  "#f97316",
  "#22c55e",
  "#38bdf8",
  "#a855f7",
  "#eab308",
  "#ec4899",
  "#0ea5e9",
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

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No expenses yet to show category share.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-2 text-sm font-semibold text-slate-100">
        Expense share by category
      </h2>
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
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#1f2937",
                fontSize: 12,
              }}
              formatter={(value: unknown, name: unknown) => [
                `${currencySymbol}${Number(value).toFixed(2)}`,
                String(name),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

