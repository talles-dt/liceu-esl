import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import type {
  GenerateExerciseRequest,
  GenerateExerciseResponse,
  GeneratedExercise,
  ExerciseContent,
} from "@/types/exercise-content";
import type { CefrLevel, ExerciseSkill, ExerciseType } from "@/types/database";
import { assertNimCreditsAvailable, recordNimUsage } from "@/lib/nim-credits";

const CONTENT_SCHEMAS: Record<ExerciseType, string> = {
  mcq: `{"type":"mcq","content":{"question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"string"}}`,
  fill_blank: `{"type":"fill_blank","content":{"sentence":"string with ___ for blanks","answers":["string"],"explanation":"string"}}`,
  vocab_flashcard: `{"type":"vocab_flashcard","content":{"term":"string","definition":"string","distractors":["string","string","string"]}}`,
  vocab_drag: `{"type":"vocab_drag","content":{"sentence":"string with ___ for slots","words":["string"],"correctOrder":["string"]}}`,
  listening_mcq: `{"type":"listening_mcq","content":{"transcript":"string 2-4 sentences for TTS","question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"string"}}`,
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
- Ensure variety across exercises
- Each exercise must be self-contained and answerable

Return ONLY a JSON array. Each object must match this schema:
${schema}

Return exactly ${req.count} exercises. Do NOT include any text outside the JSON array.`;
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

  if (!(await assertNimCreditsAvailable())) {
    return NextResponse.json(
      { error: "AI capacity temporarily limited. Try again later." },
      { status: 503 }
    );
  }

  const client = createNvidiaClient();
  const prompt = getGenerationPrompt(body);

  const response = await client.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: "You are an expert ESL content designer. You return ONLY valid JSON. No markdown, no explanations, no code fences." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content ?? "";
  await recordNimUsage("admin_generate", user.id);

  let exercises: GeneratedExercise[];
  try {
    const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
    exercises = JSON.parse(cleaned);
  } catch {
    console.error("admin generate: failed to parse NIM JSON");
    return NextResponse.json(
      { error: "Failed to parse AI response." },
      { status: 500 }
    );
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json(
      { error: "AI returned invalid data" },
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
        generated_by: NVIDIA_MODEL,
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
    model_used: NVIDIA_MODEL,
    prompt,
    response: content,
    exercises_created: exerciseIds,
  });

  const response_data: GenerateExerciseResponse = {
    exercises,
    exerciseIds,
    count: exerciseIds.length,
  };

  return NextResponse.json(response_data);
}
