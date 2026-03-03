"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { Transaction } from "./AiInsights";

type Props = {
  transactions: Transaction[];
  currencySymbol: string;
};

type MonthPoint = {
  month: string; // "2026-01"
  income: number;
  expense: number;
};

function buildMonthlyData(transactions: Transaction[]): MonthPoint[] {
  const now = new Date();
  const map = new Map<string, MonthPoint>();

  for (const t of transactions) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;

    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const monthsDiff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    if (monthsDiff < 0 || monthsDiff > 5) continue; // only last 6 months

    if (!map.has(monthKey)) {
      map.set(monthKey, { month: monthKey, income: 0, expense: 0 });
    }
    const entry = map.get(monthKey)!;

    if (t.type === "income") {
      entry.income += t.amount;
    } else {
      entry.expense += t.amount;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

export default function MonthlyIncomeExpenseChart({
  transactions,
  currencySymbol,
}: Props) {
  const data = buildMonthlyData(transactions);
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-white/10 bg-[#0f1629] px-2.5 py-2 text-xs text-slate-300 shadow-xl">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 space-y-0.5">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">{item.name}</span>
              <span className="text-[11px] font-semibold text-white">
                {currencySymbol}
                {Number(item.value ?? 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No monthly data yet. Track income and expenses for a few months to see
        your trend.
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
              dataKey="month"
              tick={{ fontSize: 10, fill: "#64748b" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => `${currencySymbol}${v}`}
            />
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Bar
              dataKey="income"
              name="Income"
              stackId="a"
              fill="#fbbf24"
              activeBar={{ fill: "#fcd34d", stroke: "#fde68a", strokeWidth: 1 }}
              isAnimationActive
              animationDuration={450}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              stackId="a"
              fill="#f43f5e"
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

