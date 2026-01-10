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

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No expense data for the last 30 days yet. Add a few expenses to see your
        spending by category.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Spending by category (last 30 days)
        </h2>
        <span className="text-xs text-slate-400">
          {currencySymbol} totals by category
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickFormatter={(v) => `${currencySymbol}${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#1f2937",
                fontSize: 12,
              }}
              formatter={(value: unknown) => [
                `${currencySymbol}${Number(value).toFixed(2)}`,
                "Total",
              ]}
            />
            <Bar dataKey="total" fill="#fb7185" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
