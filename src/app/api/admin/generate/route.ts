import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  GenerateExerciseRequest,
  GenerateExerciseResponse,
  GeneratedExercise,
  ExerciseContent,
  MCQContent,
  FillBlankContent,
  VocabFlashcardContent,
  VocabDragContent,
  ListeningMCQContent,
} from "@/types/exercise-content";
import type { CefrLevel, ExerciseSkill, ExerciseType } from "@/types/database";
import { generateListeningAudio } from "@/lib/tts";

const CONTENT_SCHEMAS: Record<ExerciseType, string> = {
  mcq: `{
  "type": "mcq",
  "content": {
    "question": "string — the question text",
    "options": ["string", "string", "string", "string"] — exactly 4 options,
    "correctIndex": number — 0 to 3,
    "explanation": "string — why the correct answer is right"
  }
}`,
  fill_blank: `{
  "type": "fill_blank",
  "content": {
    "sentence": "string — sentence with ___ for each blank",
    "answers": ["string"] — one answer per blank in order,
    "explanation": "string"
  }
}`,
  vocab_flashcard: `{
  "type": "vocab_flashcard",
  "content": {
    "term": "string — the vocabulary word",
    "definition": "string — correct definition",
    "distractors": ["string", "string", "string"] — 3 wrong definitions
  }
}`,
  vocab_drag: `{
  "type": "vocab_drag",
  "content": {
    "sentence": "string — sentence with ___ for each slot",
    "words": ["string"] — all words including distractors,
    "correctOrder": ["string"] — correct words for the blanks in order
  }
}`,
  listening_mcq: `{
  "type": "listening_mcq",
  "content": {
    "transcript": "string — short paragraph for TTS (2-4 sentences)",
    "question": "string — comprehension question",
    "options": ["string", "string", "string", "string"],
    "correctIndex": number — 0 to 3,
    "explanation": "string"
  }
}`,
};

function getGenerationPrompt(
  req: GenerateExerciseRequest
): string {
  const schema = CONTENT_SCHEMAS[req.exercise_type];

  return `You are an expert ESL content designer. Generate ${req.count} ${req.exercise_type} exercises for CEFR level ${req.cefr_level}, skill: ${req.skill}, topic: "${req.topic}".

Rules:
- Calibrate difficulty to ${req.cefr_level} level precisely
- Use natural, contemporary English
- For fill_blank: use exactly "___" (three underscores) for each blank
- For vocab_drag: include 2-3 distractor words beyond the correct answers
- For listening_mcq: the transcript should be 2-4 sentences, natural spoken style
- Ensure variety across exercises — don't repeat structures
- Each exercise must be self-contained and answerable

Return ONLY a JSON array with no preamble, no markdown, no code fences. Each object must match this schema:

${schema}

Return exactly ${req.count} exercises.`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: GenerateExerciseRequest = await req.json();

  const { topic, cefr_level, skill, exercise_type, count } = body;

  if (!topic || !cefr_level || !skill || !exercise_type || !count) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (count < 1 || count > 20) {
    return NextResponse.json({ error: "Count must be between 1 and 20" }, { status: 400 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = getGenerationPrompt(body);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096 * count,
    system:
      "You are an expert ESL content designer. You return ONLY valid JSON. No markdown, no explanations, no code fences.",
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content.find((c) => c.type === "text")?.text ?? "";

  let exercises: GeneratedExercise[];
  try {
    // Strip any markdown code fences if present
    const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
    exercises = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Claude response", raw: content },
      { status: 500 }
    );
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json(
      { error: "Claude returned invalid data" },
      { status: 500 }
    );
  }

  // Insert exercises into DB
  const exerciseIds: string[] = [];

  for (const ex of exercises) {
    const { data, error } = await supabase
      .from("exercises")
      .insert({
        language: "en",
        cefr_level: cefr_level as CefrLevel,
        skill: skill as ExerciseSkill,
        type: exercise_type as ExerciseType,
        content: ex.content as ExerciseContent,
        status: "draft",
        ai_generated: true,
        generated_by: "claude-sonnet-4-20250514",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert exercise:", error);
      continue;
    }

    exerciseIds.push(data.id);
  }

  // Log generation
  await supabase.from("generation_logs").insert({
    generated_by: user.id,
    topic,
    cefr_level: cefr_level as CefrLevel,
    skill: skill as ExerciseSkill,
    exercise_type: exercise_type as ExerciseType,
    count: exercises.length,
    model_used: "claude-sonnet-4-20250514",
    prompt,
    response: content,
    exercises_created: exerciseIds,
  });

  const response: GenerateExerciseResponse = {
    exercises,
    exerciseIds,
    count: exerciseIds.length,
  };

  return NextResponse.json(response);
}
