import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
- Options should be plausible distractors`;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if eligible for retake
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("placement_test_eligible_at, cefr_level")
    .eq("id", user.id)
    .single();

  if (profile?.cefr_level) {
    // Already has a level — check retake eligibility
    if (profile.placement_test_eligible_at) {
      const eligibleDate = new Date(profile.placement_test_eligible_at);
      if (new Date() < eligibleDate) {
        return NextResponse.json(
          { error: "You can retake the test after 30 days" },
          { status: 403 }
        );
      }
    }
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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

    // Insert as draft exercises
    const exerciseIds: string[] = [];
    for (const q of parsed.questions) {
      const { data, error } = await supabase
        .from("exercises")
        .insert({
          language: "en",
          cefr_level: q.cefr_level,
          skill: q.skill === "grammar" ? "grammar" : "vocabulary",
          type: "mcq",
          content: {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: "",
          },
          status: "approved", // Placement test questions are auto-approved
          ai_generated: true,
          generated_by: "claude-sonnet-4-20250514-placement",
        })
        .select("id")
        .single();

      if (data) exerciseIds.push(data.id);
      if (error) console.error("Placement test insert error:", error);
    }

    return NextResponse.json({ questions: parsed.questions, exerciseIds });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate placement test", raw: content },
      { status: 500 }
    );
  }
}
