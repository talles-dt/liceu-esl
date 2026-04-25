import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import {
  coerceLessonOutput,
  extractJsonObject,
  FALLBACK_LESSON,
  type PillarLesson,
} from "@/lib/lesson-output";
import type { CefrLevel } from "@/types/database";
import { clampToMvpCefr } from "@/lib/cefr-mvp";
import { pillarForBrtDate, type PillarKey } from "@/lib/pillar-schedule";
import { assertNimCreditsAvailable, recordNimUsage } from "@/lib/nim-credits";

const PILLARS = new Set<string>(["grammar", "logic", "communication"]);

function buildPrompt(pillar: string, level: string, anchor: string): string {
  return `
You are Lexio, an AI tutor specializing in ${pillar} for Brazilians learning English.
Target CEFR band for this lesson: **${level}** (MVP scope is A2–C1 only; calibrate vocabulary and examples strictly to ${level}).

Use the memory palace anchor: **${anchor}**.

Output **JSON only** (no markdown fences) with exactly these string fields:
{
  "grammar": "Explicit pattern + PT-BR interference warning",
  "logic": "Reasoning behind usage choice",
  "communication": "Real-world scenario + cultural note",
  "mnemonic": "CONCEPT→LOCATION→VISUAL HOOK→PT ANCHOR"
}

Example:
{
  "grammar": "*The* vs. *zero article*. PT error: 'Eu gosto de *o* café'. Correct: 'I like coffee'.",
  "logic": "English uses zero article for uncountables/general plurals.",
  "communication": "Ask for 'advice' (uncountable), not 'an advice'.",
  "mnemonic": "COFFEE SHOP→COUNTER→COIN JAR→CAIXINHA DE MOEDAS"
}
`.trim();
}

async function callNim(prompt: string): Promise<string> {
  const client = createNvidiaClient();
  const response = await client.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });
  const raw = response.choices[0]?.message?.content;
  if (!raw || !raw.trim()) {
    throw new Error("empty_model_output");
  }
  return raw.trim();
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const pillarParam =
      typeof body.pillar === "string" ? body.pillar.toLowerCase().trim() : "";

    let pillarRaw: PillarKey;
    if (!pillarParam) {
      pillarRaw = pillarForBrtDate(new Date());
    } else if (PILLARS.has(pillarParam)) {
      pillarRaw = pillarParam as PillarKey;
    } else {
      return NextResponse.json(
        { error: "Invalid pillar (grammar | logic | communication), or omit for today’s BRT pillar." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("cefr_level, professional_context")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.cefr_level) {
      return NextResponse.json(
        { error: "Complete placement before generating lessons." },
        { status: 403 }
      );
    }

    const level = clampToMvpCefr(profile.cefr_level as CefrLevel);
    const anchor =
      profile.professional_context?.trim() ||
      "your daily routine and workspace";

    const prompt = buildPrompt(pillarRaw, level, anchor);

    let lesson: PillarLesson = FALLBACK_LESSON;

    const canCall = await assertNimCreditsAvailable();
    if (canCall) {
      try {
        const raw = await callNim(prompt);
        await recordNimUsage("lesson", user.id);
        const parsed = extractJsonObject(raw);
        lesson = coerceLessonOutput(parsed);
      } catch {
        lesson = FALLBACK_LESSON;
      }
    }

    const { error: saveError } = await supabase.from("lessons").insert({
      user_id: user.id,
      pillar: pillarRaw,
      cefr_level: level,
      content: lesson,
    });

    if (saveError) {
      console.error("lessons insert:", saveError);
    }

    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json(
      { error: "Could not generate a lesson right now. Please try again." },
      { status: 503 }
    );
  }
}
