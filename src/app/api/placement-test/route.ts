import { NextResponse } from "next/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
  skill: string;
  difficulty_score: number; // 1.0-5.0 scale for weighted scoring
  context?: string; // Optional context passage for comprehension questions
  explanation?: string; // Why this answer is correct
}

// Enhanced batches: 20 questions per level for comprehensive evaluation
const BATCHES = [
  { count: 20, level: "A1", skill: "grammar", topic: 'basic verb "to be", articles (a/an/the), plurals, simple present, pronouns (I/you/he/she), basic prepositions (in/on/at), demonstratives (this/that), possessive adjectives (my/your/his)', difficulty_base: 1.0 },
  { count: 20, level: "A2", skill: "vocabulary", topic: "everyday objects, numbers (1-1000), family members, colors, time expressions, food and drinks, clothing items, jobs and work, travel and transport, weather conditions, shopping and money, daily routines, hobbies", difficulty_base: 2.0 },
  { count: 20, level: "B1", skill: "grammar", topic: "present perfect vs past simple, past perfect, future forms (will/going to/present continuous), conditionals type 1 and 2, relative clauses (who/which/that), reported speech basics, passive voice (present and past), gerunds vs infinitives, modal verbs (must/should/can/could)", difficulty_base: 3.0 },
  { count: 20, level: "B2", skill: "mixed", topic: "advanced conditionals (type 3 and mixed), modal verbs of deduction, phrasal verbs (common), collocations, discourse markers (however/therefore/moreover), nuanced tense usage, future perfect, wish/regret structures, causative have/get", difficulty_base: 4.0 },
  { count: 20, level: "C1-C2", skill: "mixed", topic: "advanced grammar structures, cleft sentences (it was...that), inversion (never have I ever), subjunctive mood, academic vocabulary, idiomatic expressions, pragmatics and register, nuanced synonyms, ellipsis and substitution, advanced collocations and fixed expressions", difficulty_base: 5.0 },
];

const SYSTEM_PROMPT = (batch: typeof BATCHES[number]) =>
  `Generate exactly ${batch.count} ESL multiple-choice placement test questions.

Level: ${batch.level}
Skill: ${batch.skill}
Topics: "${batch.topic}"
Difficulty Base: ${batch.difficulty_base}/5.0

Return ONLY a JSON array. Each object must have:
{"question":"sentence or question text","options":["A","B","C","D"],"correctIndex":0,"cefr_level":"${batch.level}","skill":"${batch.skill}","explanation":"brief explanation of why this answer is correct"}

Rules:
- Exactly 4 options per question (A, B, C, D)
- Exactly one correct answer
- Plausible distractors that reflect common learner errors at this level
- No repeats or overly similar questions
- Keep questions concise but clear
- For B1+ levels, include 30% context-rich questions with short passages (2-3 sentences) before the question
- Include contextual information comprehension questions at all levels (daily situations, work scenarios, academic contexts for higher levels)
- Questions should test understanding of context, not just rote memorization
- Do NOT include any text outside the JSON array`;

async function generateBatch(
  client: ReturnType<typeof createNvidiaClient>,
  batch: typeof BATCHES[number]
): Promise<Question[]> {
  const response = await client.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT(batch) },
      { role: "user", content: `Generate ${batch.count} questions for ${batch.level} level.` },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content ?? "";
  const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) return [];
  
  // Assign difficulty scores based on level
  return (parsed as Question[]).map((q, idx) => ({
    ...q,
    difficulty_score: batch.difficulty_base + (Math.random() * 0.4 - 0.2), // Small variation ±0.2
  }));
}

export async function POST() {
  const client = createNvidiaClient();

  try {
    const results = await Promise.all(
      BATCHES.map((batch) => generateBatch(client, batch))
    );

    const allQuestions = results.flat();

    if (allQuestions.length < 30) {
      return NextResponse.json(
        { error: "Falha ao gerar perguntas suficientes. Tente novamente." },
        { status: 500 }
      );
    }

    // Shuffle questions for better test experience (not grouped by level)
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

    return NextResponse.json({ questions: shuffled });
  } catch (err: any) {
    console.error("Placement test generation error:", err.message);
    return NextResponse.json(
      { error: "Erro ao gerar teste. Tente novamente." },
      { status: 500 }
    );
  }
}
