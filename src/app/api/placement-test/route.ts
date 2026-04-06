import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert ESL assessment designer. Generate a 60-question comprehensive placement test that covers grammar, vocabulary, reading comprehension, and pragmatic usage across all CEFR levels.

Return ONLY a JSON object with no preamble:
{
  "questions": [
    {
      "question": "string — the question or sentence/context",
      "options": ["string", "string", "string", "string"],
      "correctIndex": number — 0 to 3,
      "cefr_level": "string — A1, A2, B1, B2, C1, or C2",
      "skill": "string — 'grammar', 'vocabulary', 'reading', or 'pragmatics'"
    }
  ]
}

Distribution rules — exactly 60 questions:
- Questions 1–8: A1 grammar (basic verb "to be", articles, plurals, simple present)
- Questions 9–16: A1 vocabulary (everyday objects, numbers, family, colors, time)
- Questions 17–22: A2 grammar (past simple, prepositions, comparatives, countable/uncountable)
- Questions 23–28: A2 vocabulary (work, travel, health, shopping, weather)
- Questions 29–34: B1 grammar (present perfect, conditionals type 1, relative clauses, reported speech)
- Questions 35–40: B1 vocabulary (phrasal verbs, idioms, collocations, word formation)
- Questions 41–46: B2 grammar (conditionals type 2/3, passive voice, modal perfects, inversion)
- Questions 47–50: B2 pragmatics (register, politeness strategies, implied meaning)
- Questions 51–54: C1 grammar (cleft sentences, subjunctive, advanced connectors, ellipsis)
- Questions 55–57: C1 vocabulary (academic/abstract terms, nuanced synonyms, register shifts)
- Questions 58–60: C2 grammar & vocabulary (idiomatic mastery, rare structures, stylistic nuance)

Rules:
- Each question must have exactly one correct answer
- Options should be plausible distractors — wrong answers should look tempting to someone at a lower level
- Mix sentence structures and topics (work, travel, technology, culture, science)
- Keep questions clear and self-contained
- Do NOT repeat question patterns`;

export async function POST() {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: "Generate a 60-question placement test." }],
  });

  const content = message.content.find((c) => c.type === "text")?.text ?? "";

  try {
    const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid format");
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (e) {
    console.error("Placement test generation error:", e);
    return NextResponse.json(
      { error: "Failed to generate placement test", raw: content },
      { status: 500 }
    );
  }
}
