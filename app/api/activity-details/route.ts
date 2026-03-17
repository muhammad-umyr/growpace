import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  try {
    const { title, desc, tag, ageMonths } = await req.json();

    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    const ageStr = years > 0
      ? `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` and ${months} month${months !== 1 ? "s" : ""}` : ""}`
      : `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a child development expert. For the activity "${title}" (${desc}) categorised as ${tag}, written for a ${ageStr} old child, return a JSON object:

{
  "benefits": ["3-4 short sentences, each a distinct developmental benefit"],
  "generalTips": ["3-5 practical tips to make this activity more effective"],
  "risks": "One short sentence about safety if any risk exists, or null if no meaningful risk",
  "howTo": ["4-6 step-by-step instructions"]
}

Return ONLY valid JSON, no markdown.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const details = JSON.parse(jsonMatch?.[0] || "{}");

    return NextResponse.json(details);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Activity details API error:", message);
    return NextResponse.json({ error: "failed", detail: message }, { status: 500 });
  }
}
