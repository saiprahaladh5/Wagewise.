import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/app/lib/supabaseServer";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Auth session missing! Please log in to use this feature." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as AiRequestBody;
    const { message, stats } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration: missing OPENROUTER_API_KEY" },
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

    const systemPrompt = `You are WageWise AI Coach — a friendly, sharp personal finance advisor built into a budgeting app.

Your personality:
- Warm but direct. No fluff.
- You speak like a smart friend who's good with money, not a textbook.
- Use the user's actual numbers. Never give generic advice.
- Keep answers concise (under 200 words unless the question needs more).

Rules:
- Always reference specific amounts and categories from the user's data.
- Give 3-5 actionable suggestions when appropriate.
- If the user is doing well, acknowledge it — don't invent problems.
- Use the user's currency symbol in your response.
- No emojis. No motivational fluff. Just clear, honest coaching.`;

    const userPrompt = `Here is my financial data:

${statsText}

My question: "${userGoal}"`;

    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wagewise.app",
        "X-Title": "WageWise AI Coach",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenRouter API error:", res.status, text);
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
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
