import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  try {
    const { childName, period, categories, activityCount, twoWeeksInARow, monthLabel, activeWeeks } =
      await req.json();

    const client = new Anthropic();
    let prompt = "";

    if (period === "daily") {
      const catStr = categories.length > 1
        ? categories.slice(0, -1).join(", ") + " and " + categories.slice(-1)
        : categories[0];
      prompt = `Write a single warm, brief sentence (max 12 words) acknowledging that a parent just logged a ${catStr} activity for their child ${childName}.
Tone: quiet, genuine, not cheerful or performative. Like a warm nod from a friend.
Do NOT use exclamation marks. Do NOT mention streaks, points, or progress.
Just acknowledge the moment. Use ${childName}'s name naturally.
Only return the sentence, nothing else.`;
    }

    if (period === "weekly") {
      const catStr = categories.join(", ");
      const twoWeeks = twoWeeksInARow ? ` They were also active the week before.` : "";
      prompt = `Write a warm 2-sentence summary for a parent who logged ${activityCount} activities for their child ${childName} this week, covering these categories: ${catStr}.${twoWeeks}
Tone: warm, human, grounded — like a message from a thoughtful friend, not an app.
Do NOT mention streaks, scores, points, or leaderboards. Do NOT use exclamation marks.
Do NOT mention what was missed. Only celebrate what was done.
Use ${childName}'s name naturally. Keep it under 40 words total.
Only return the 2 sentences, nothing else.`;
    }

    if (period === "monthly") {
      const catStr = categories.join(", ");
      prompt = `Write a warm 2–3 sentence narrative for a parent who was active ${activeWeeks} out of 4 weeks in ${monthLabel} with their child ${childName}, covering ${catStr} activities (${activityCount} total interactions).
Tone: warm, reflective, human — like a letter from a thoughtful friend at the end of the month.
Do NOT mention streaks, scores, points, or any gamification language.
Do NOT mention what was missed. Only acknowledge what was done.
Use ${childName}'s name naturally. Keep it under 55 words.
Only return the narrative, nothing else.`;
    }

    if (period === "milestone") {
      prompt = `Write a single warm sentence (max 15 words) celebrating that a parent has just reached ${activityCount} logged activities with their child ${childName}.
Tone: quiet celebration, genuine warmth — not loud or performative.
Do NOT use exclamation marks. Do NOT mention streaks or scores.
Only return the sentence, nothing else.`;
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text?.trim() ?? "";
    return NextResponse.json({ message: text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
