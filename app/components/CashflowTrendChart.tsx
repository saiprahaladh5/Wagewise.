"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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

type CashflowPoint = {
  date: string;
  income: number;
  expense: number;
  net: number;
};

function buildCashflowData(transactions: Transaction[]): CashflowPoint[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - 29);

  const map = new Map<string, CashflowPoint>();

  for (const t of transactions) {
    const d = new Date(t.date);
    if (isNaN(d.getTime()) || d < cutoff || d > now) continue;

    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!map.has(key)) {
      map.set(key, { date: key, income: 0, expense: 0, net: 0 });
    }
    const entry = map.get(key)!;

    if (t.type === "income") {
      entry.income += t.amount;
      entry.net += t.amount;
    } else {
      entry.expense += t.amount;
      entry.net -= t.amount;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export default function CashflowTrendChart({
  transactions,
  currencySymbol,
}: Props) {
  const data = buildCashflowData(transactions);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No cashflow data for the last 30 days yet. Add some income and expenses
        to see your daily trend.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Cashflow trend (last 30 days)
        </h2>
        <span className="text-xs text-slate-400">
          {currencySymbol} per day
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickFormatter={(v) => v.slice(5)}
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
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#fb7185"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="net"
              name="Net"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

