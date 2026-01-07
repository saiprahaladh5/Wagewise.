import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API_URL =
  process.env.TOGETHER_API_URL ??
  "https://api.together.xyz/v1/chat/completions";

async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY;

  // If there is no key, just return a generic answer so UI never breaks
  if (!apiKey) {
    console.warn("TOGETHER_API_KEY missing, using dummy AI reply.");
    return (
      "I couldn't contact the AI model, but here are some generic tips:\n\n" +
      "- Track every expense for a few days.\n" +
      "- Notice your top 2–3 spending categories.\n" +
      "- Decide a simple goal like 'save $50 this week'.\n" +
      "- Avoid one small impulse, like extra snacks or random Amazon buys."
    );
  }

  try {
    const res = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        max_tokens: 350,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are MoneyBuddy, a concise personal finance coach. " +
              "Use short paragraphs and bullet points. Max 6 bullets, no fluff.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Together API error", res.status, txt);
      throw new Error("Together error");
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Together");
    return text;
  } catch (err) {
    console.error("callLLM failed, using fallback:", err);
    return (
      "I had trouble contacting the AI service. For now you can:\n\n" +
      "- Review how much you spent on food, transport, and shopping.\n" +
      "- Pick ONE category to reduce this week.\n" +
      "- Set a daily or weekly spending limit.\n" +
      "- Move money to savings right after you get paid."
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt : "";

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Missing 'prompt' in body" },
        { status: 400 }
      );
    }

    const reply = await callLLM(prompt);
    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: unknown) {
    console.error("ai-chat route error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

