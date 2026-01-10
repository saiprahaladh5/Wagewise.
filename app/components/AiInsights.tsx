"use client";

import React, { useMemo, useState } from "react";

type CurrencyInfo = {
  code: string;
  symbol: string;
  label: string;
};

interface AiInsightsProps {
  transactions: Transaction[];
  currency: CurrencyInfo;
}

const AiInsights: React.FC<AiInsightsProps> = ({ transactions, currency }) => {
  const [userMessage, setUserMessage] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statsPayload = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthIncome = 0;
    let monthExpense = 0;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - 30);

    let last30DaysTxnCount = 0;
    const categoryTotals = new Map<string, number>();

    for (const t of transactions) {
      const d = new Date(t.date);

      // Monthly stats
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === "income") monthIncome += t.amount;
        if (t.type === "expense") monthExpense += t.amount;
      }

      // Last 30 days
      if (d >= cutoff && d <= now) {
        last30DaysTxnCount += 1;

        if (t.type === "expense") {
          const key = t.category || "Other";
          const prev = categoryTotals.get(key) ?? 0;
          categoryTotals.set(key, prev + t.amount);
        }
      }
    }

    const monthNet = monthIncome - monthExpense;

    const topCategories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      monthIncome,
      monthExpense,
      monthNet,
      last30DaysTxnCount,
      topCategories,
    };
  }, [transactions, currency]);

  const handleAsk = async () => {
    setErrorMsg(null);
    setAnswer(null);

    if (!transactions || transactions.length === 0) {
      setErrorMsg(
        "You don't have any transactions yet. Add a few income/expense entries so I can analyse them."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          stats: statsPayload,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI coach error:", res.status, text);
        setErrorMsg("AI coach is not available right now. Please try again.");
      } else {
        const data = (await res.json()) as { answer?: string; error?: string };
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setAnswer(data.answer ?? null);
        }
      }
    } catch (err: unknown) {
      console.error("AI coach request failed:", err);
      setErrorMsg("Something went wrong while contacting the AI coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          WageWise AI Coach
        </h2>
        {statsPayload && (
          <p className="text-xs text-slate-400">
            This month:{" "}
            <span className="text-emerald-400">
              {currency.symbol}
              {statsPayload.monthIncome.toFixed(2)} income
            </span>{" "}
            •{" "}
            <span className="text-rose-400">
              {currency.symbol}
              {statsPayload.monthExpense.toFixed(2)} spent
            </span>{" "}
            • Net:{" "}
            <span
              className={
                statsPayload.monthNet >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }
            >
              {currency.symbol}
              {statsPayload.monthNet.toFixed(2)}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Tell WageWise what you're trying to do. For example: &quot;Help me save more and control my food spending.&quot;"
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          rows={3}
        />

        <button
          onClick={handleAsk}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Ask AI Coach"}
        </button>

        {errorMsg && (
          <p className="text-xs text-rose-400">
            {errorMsg}
          </p>
        )}

        {answer && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 whitespace-pre-wrap">
            {answer}
          </div>
        )}

        {!answer && !errorMsg && !loading && (
          <p className="text-xs text-slate-500">
            The coach will look at your recent income, expenses, and top
            spending categories, then give 3–5 specific suggestions.
          </p>
        )}
      </div>
    </section>
  );
};

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  currency_code?: string | null;
}

export default AiInsights;
