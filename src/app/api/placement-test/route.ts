import { NextResponse } from "next/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
  skill: string;
}

// 4 parallel batches — all generated concurrently
const BATCHES = [
  { count: 15, level: "A1", skill: "grammar", topic: 'basic verb "to be", articles, plurals, simple present, pronouns, basic prepositions, demonstratives' },
  { count: 15, level: "A2", skill: "vocabulary", topic: "everyday objects, numbers, family, colors, time, food, clothing, work, travel, weather, shopping" },
  { count: 15, level: "B1-B2", skill: "grammar", topic: "present perfect, past perfect, conditionals type 1 and 2, relative clauses, reported speech, passive voice, gerunds vs infinitives" },
  { count: 15, level: "C1-C2", skill: "mixed", topic: "advanced grammar, cleft sentences, inversion, subjunctive, academic vocabulary, idiomatic expressions, pragmatics, register, nuanced synonyms" },
];

const SYSTEM_PROMPT = (batch: typeof BATCHES[number]) =>
  `Generate exactly ${batch.count} ESL multiple-choice placement test questions.

Level: ${batch.level}
Skill: ${batch.skill}
Topics: "${batch.topic}"

Return ONLY a JSON array. Each object must have:
{"question":"sentence or question text","options":["A","B","C","D"],"correctIndex":0,"cefr_level":"${batch.level}","skill":"${batch.skill}"}

Rules: exactly 4 options, exactly one correct answer, plausible distractors, no repeats, keep questions concise. Do NOT include any text outside the JSON array.`;

async function generateBatch(
  client: ReturnType<typeof createNvidiaClient>,
  batch: typeof BATCHES[number]
): Promise<Question[]> {
  const response = await client.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT(batch) },
      { role: "user", content: `Generate ${batch.count} questions.` },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content ?? "";
  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) return [];
  return parsed as Question[];
}

export async function POST() {
  const client = createNvidiaClient();

  try {
    const results = await Promise.all(
      BATCHES.map((batch) => generateBatch(client, batch))
    );

    const allQuestions = results.flat();

    if (allQuestions.length < 10) {
      return NextResponse.json(
        { error: "Falha ao gerar perguntas suficientes. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: allQuestions });
  } catch (err: any) {
    console.error("Placement test generation error:", err.message);
    return NextResponse.json(
      { error: "Erro ao gerar teste. Tente novamente." },
      { status: 500 }
    );
  }
}
