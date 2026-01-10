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

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No monthly data yet. Track income and expenses for a few months to see
        your trend.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Monthly income vs expenses (last 6 months)
        </h2>
        <span className="text-xs text-slate-400">
          {currencySymbol} per month
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
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
              formatter={(value: unknown, name: unknown) => [
                `${currencySymbol}${Number(value).toFixed(2)}`,
                String(name),
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="income" name="Income" stackId="a" fill="#22c55e" />
            <Bar dataKey="expense" name="Expenses" stackId="a" fill="#fb7185" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

