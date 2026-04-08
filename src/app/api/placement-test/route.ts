import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
  skill: string;
}

// 4 parallel batches of 15 = 60 questions total
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

Return ONLY a JSON array with no markdown, no code fences. Each object must have:
{"question":"sentence or question text","options":["A","B","C","D"],"correctIndex":0,"cefr_level":"${batch.level}","skill":"${batch.skill}"}

Rules: exactly 4 options, exactly one correct answer, plausible distractors, no repeats, keep questions concise.`;

async function generateBatch(
  anthropic: Anthropic,
  batch: typeof BATCHES[number]
): Promise<Question[]> {
  const message = await anthropic.messages.create({
    model: "claude-haiku",
    max_tokens: 4096,
    system: SYSTEM_PROMPT(batch),
    messages: [{ role: "user", content: `Generate ${batch.count} questions.` }],
  });

  const content = message.content.find((c) => c.type === "text")?.text ?? "";
  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleaned) as Question[];
}

export async function POST() {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    // Generate all 4 batches in parallel (much faster than sequential)
    const results = await Promise.all(
      BATCHES.map((batch) => generateBatch(anthropic, batch))
    );

    const allQuestions = results.flat();

    if (allQuestions.length < 10) {
      return NextResponse.json(
        { error: "Failed to generate enough questions. Please try again." },
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
