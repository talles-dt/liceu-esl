import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const SYSTEM_PROMPT = `You are an expert ESL assessment designer. Generate a 15-question adaptive placement test.

Return ONLY a JSON object with no preamble:
{
  "questions": [
    {
      "question": "string — the question text",
      "options": ["string", "string", "string", "string"],
      "correctIndex": number — 0 to 3,
      "cefr_level": "string — which level this question targets",
      "skill": "string — 'grammar' or 'vocabulary'"
    }
  ]
}

Rules:
- Questions 1-3: A1 level (basic)
- Questions 4-5: A2 level
- Questions 6-8: B1 level
- Questions 9-11: B2 level
- Questions 12-14: C1 level
- Question 15: C2 level
- Mix grammar and vocabulary
- Each question must have exactly one correct answer
- Options should be plausible distractors
- Keep questions concise and clear`;

export async function POST() {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: "Generate a placement test." }],
  });

  const content = message.content.find((c) => c.type === "text")?.text ?? "";

  try {
    const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid format");
    }

    // Return questions directly (no DB storage needed for public test)
    return NextResponse.json({ questions: parsed.questions });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate placement test", raw: content },
      { status: 500 }
    );
  }
}
