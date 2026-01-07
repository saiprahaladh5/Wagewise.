// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API_URL =
  process.env.TOGETHER_API_URL ??
  "https://api.together.xyz/v1/chat/completions";

type TopCategory = {
  category: string;
  amount: number;
};

type StatsPayload = {
  currencyCode: string;
  currencySymbol: string;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  last30DaysTxnCount: number;
  topCategories: TopCategory[];
};

type AiRequestBody = {
  message: string;
  stats?: StatsPayload;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiRequestBody;
    const { message, stats } = body;

    if (!process.env.TOGETHER_API_KEY) {
      console.error("Missing TOGETHER_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration: missing TOGETHER_API_KEY" },
        { status: 500 }
      );
    }

    const statsText = stats
      ? buildStatsSection(stats)
      : "No structured stats were provided.";

    const trimmedMessage = message?.trim() ?? "";
    const userGoal =
      trimmedMessage.length > 0
        ? trimmedMessage
        : "Give me a short review of my recent spending and how I can improve.";

    const prompt = `
You are WageWise, a friendly, practical money coach.
Your job is to look at the user's recent spending, then give clear,
realistic advice in simple English. Avoid jargon.

Here is the user's financial context:

${statsText}

User's goal / question:
"${userGoal}"

Instructions for your answer:
- Be kind but direct.
- Refer to the actual numbers (income, expenses, categories).
- Give 3–5 concrete, practical suggestions.
- Keep it short enough to read in under a minute.
- No emojis, no over-the-top motivation. Just honest, helpful coaching.
`;

    const res = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Together API error:", res.status, text);
      return NextResponse.json(
        { error: "AI request failed", details: text },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer: string =
      data?.choices?.[0]?.message?.content ??
      "I had trouble generating advice. Please try again.";

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error("ai-chat route error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

function buildStatsSection(stats: StatsPayload): string {
  const {
    currencyCode,
    currencySymbol,
    monthIncome,
    monthExpense,
    monthNet,
    last30DaysTxnCount,
    topCategories,
  } = stats;

  const money = (n: number) =>
    `${currencySymbol}${n.toFixed(2)} (${currencyCode})`;

  const cats =
    topCategories && topCategories.length > 0
      ? topCategories
          .slice(0, 5)
          .map(
            (c, idx) =>
              `${idx + 1}. ${c.category}: ${money(c.amount)} in last 30 days`
          )
          .join("\n")
      : "No significant categories yet.";

  return `
Currency: ${currencyCode} (${currencySymbol})

This month:
- Total income: ${money(monthIncome)}
- Total expenses: ${money(monthExpense)}
- Net: ${money(monthNet)}

Recent activity:
- Transactions in last 30 days: ${last30DaysTxnCount}

Top spending categories (last 30 days):
${cats}
`.trim();
}
