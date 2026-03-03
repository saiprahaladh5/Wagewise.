"use client";

import React, { useMemo, useRef, useState } from "react";

type CurrencyInfo = {
  code: string;
  symbol: string;
  label: string;
};

interface AiInsightsProps {
  transactions: Transaction[];
  currency: CurrencyInfo;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  "How can I save more this month?",
  "Am I on track with my budget?",
  "What's my biggest spending category?",
  "Give me a financial health check",
];

const AiInsights: React.FC<AiInsightsProps> = ({ transactions, currency }) => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === "income") monthIncome += t.amount;
        if (t.type === "expense") monthExpense += t.amount;
      }

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

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleAsk = async (overrideMessage?: string) => {
    const msgToSend = overrideMessage ?? userMessage;
    if (!msgToSend.trim()) return;

    setErrorMsg(null);

    if (!transactions || transactions.length === 0) {
      setErrorMsg("Add some transactions first so I can analyze your finances.");
      return;
    }

    setChatHistory((prev) => [...prev, { role: "user", content: msgToSend.trim() }]);
    setUserMessage("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgToSend, stats: statsPayload }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI coach error:", res.status, text);
        setErrorMsg("AI coach is not available right now. Please try again.");
      } else {
        const data = (await res.json()) as { answer?: string; error?: string };
        if (data.error) {
          setErrorMsg(data.error);
        } else if (data.answer) {
          setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer! }]);
        }
      }
    } catch (err: unknown) {
      console.error("AI coach request failed:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const hasChat = chatHistory.length > 0;

  return (
    <div className="space-y-4">
      {/* Stats summary bar */}
      {statsPayload && (
        <div className="flex flex-wrap gap-3 rounded-xl bg-[#0b1120] px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-slate-500">Income:</span>
            <span className="font-semibold text-amber-400">{currency.symbol}{statsPayload.monthIncome.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-slate-500">Spent:</span>
            <span className="font-semibold text-rose-400">{currency.symbol}{statsPayload.monthExpense.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${statsPayload.monthNet >= 0 ? "bg-cyan-400" : "bg-rose-400"}`} />
            <span className="text-slate-500">Net:</span>
            <span className={`font-semibold ${statsPayload.monthNet >= 0 ? "text-cyan-400" : "text-rose-400"}`}>{statsPayload.monthNet >= 0 ? "+" : ""}{currency.symbol}{statsPayload.monthNet.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Transactions:</span>
            <span className="font-semibold text-slate-300">{statsPayload.last30DaysTxnCount}</span>
          </div>
        </div>
      )}

      {/* Chat area */}
      {hasChat && (
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl bg-[#0b1120] p-4">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "border border-white/[0.06] bg-[#0f1629] text-slate-300"
              }`}>
                {msg.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-[10px] font-bold text-emerald-400">W</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">AI Coach</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0f1629] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Quick prompts */}
      {!hasChat && !loading && (
        <div>
          <p className="mb-2.5 text-xs text-slate-500">
            Example: &quot;How can I save more?&quot; or &quot;Am I on track with my budget?&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleAsk(prompt)}
                className="rounded-xl border border-white/[0.06] bg-[#0b1120] px-3 py-2 text-xs text-slate-400 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !loading && userMessage.trim()) handleAsk(); }}
          placeholder="Ask me anything about your finances..."
          className="flex-1 rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !userMessage.trim()}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          )}
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}
    </div>
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
