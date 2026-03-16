import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  try {
    const { name, ageMonths, gender } = await req.json();

    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    const ageStr =
      years > 0
        ? `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` and ${months} month${months !== 1 ? "s" : ""}` : ""}`
        : `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are a child development expert. Suggest 6 fun, practical, age-appropriate activities for ${name}, a ${ageStr} old ${gender}.

Return ONLY a valid JSON array with no markdown or explanation:
[{"title":"string","emoji":"single emoji","desc":"8 words max","tag":"Physical|Language|Cognitive|Creative|Social|Sensory|Motor","reason":"10 words max — why great for this exact age"}]

Make the activities diverse across different tags. Be specific to the ${ageStr} developmental stage.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const activities = JSON.parse(jsonMatch?.[0] || "[]");

    return NextResponse.json({ activities });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
