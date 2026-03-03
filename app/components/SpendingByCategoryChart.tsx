"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { Transaction } from "./AiInsights";

type Props = {
  transactions: Transaction[];
  currencySymbol: string;
};

type CategoryPoint = {
  category: string;
  total: number;
};

function buildCategoryData(transactions: Transaction[]): CategoryPoint[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - 29); // last 30 days

  const map = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date);
    if (isNaN(d.getTime()) || d < cutoff || d > now) continue;

    const key = t.category || "Other";
    map.set(key, (map.get(key) || 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export default function SpendingByCategoryChart({
  transactions,
  currencySymbol,
}: Props) {
  const data = buildCategoryData(transactions);
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const value = Number(payload[0].value ?? 0);
    return (
      <div className="rounded-lg border border-white/10 bg-[#0f1629] px-2.5 py-2 text-xs text-slate-300 shadow-xl">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 font-semibold text-white">
          {currencySymbol}
          {value.toFixed(2)}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No expense data for the last 30 days yet. Add a few expenses to see your
        spending by category.
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 10, fill: "#64748b" }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => `${currencySymbol}${v}`}
            />
            <Tooltip content={renderTooltip} />
            <Bar
              dataKey="total"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              activeBar={{ fill: "#fb7185", stroke: "#fda4af", strokeWidth: 1 }}
              isAnimationActive
              animationDuration={450}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
