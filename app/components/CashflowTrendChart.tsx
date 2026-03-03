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
        No cashflow data for the last 30 days yet. Add some income and expenses
        to see your daily trend.
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => `${currencySymbol}${v}`}
            />
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#f59e0b", fill: "#fbbf24" }}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#e11d48", fill: "#f43f5e" }}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="net"
              name="Net"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0284c7", fill: "#0ea5e9" }}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


