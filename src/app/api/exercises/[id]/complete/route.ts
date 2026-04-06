import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BASE_XP } from "@/types/database";
import type { CefrLevel } from "@/types/database";
import type {
  MCQContent,
  FillBlankContent,
  ListeningMCQContent,
} from "@/types/exercise-content";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: exerciseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { answer, attemptNumber = 1 } = body;

  // Get exercise
  const { data: exercise, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exerciseId)
    .single();

  if (error || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (exercise.status !== "approved") {
    return NextResponse.json({ error: "Exercise not available" }, { status: 403 });
  }

  // Evaluate answer
  let correct = false;
  const content = exercise.content;

  switch (exercise.type) {
    case "mcq": {
      const mcq = content as MCQContent;
      correct = answer === mcq.correctIndex;
      break;
    }
    case "fill_blank": {
      const fb = content as FillBlankContent;
      if (Array.isArray(answer)) {
        correct = answer.every(
          (a: string, i: number) =>
            a.toLowerCase().trim() === fb.answers[i].toLowerCase().trim()
        );
      } else {
        correct =
          answer.toLowerCase().trim() === fb.answers[0].toLowerCase().trim();
      }
      break;
    }
    case "vocab_flashcard": {
      correct = answer === 0; // First option is always the correct definition in the UI
      break;
    }
    case "vocab_drag": {
      if (Array.isArray(answer)) {
        correct = JSON.stringify(answer) === JSON.stringify((content as any).correctOrder);
      }
      break;
    }
    case "listening_mcq": {
      const lmcq = content as ListeningMCQContent;
      correct = answer === lmcq.correctIndex;
      break;
    }
  }

  // Record completion
  await supabase.from("completions").insert({
    user_id: user.id,
    exercise_id: exerciseId,
    correct,
    attempt_number: attemptNumber,
  });

  // Award XP only if correct on first try
  let xpEarned = 0;
  if (correct && attemptNumber === 1) {
    const baseXP = BASE_XP[exercise.cefr_level as CefrLevel] ?? 10;
    xpEarned = Math.round(baseXP * 1.5);

    await supabase.from("xp_log").insert({
      user_id: user.id,
      amount: xpEarned,
      source: "exercise",
      exercise_id: exerciseId,
    });
  }

  // Update streak
  await updateStreak(supabase, user.id);

  // Check badges
  await checkBadges(supabase, user.id);

  return NextResponse.json({
    correct,
    xpEarned,
    explanation:
      exercise.type === "mcq"
        ? (content as MCQContent).explanation
        : exercise.type === "fill_blank"
        ? (content as FillBlankContent).explanation
        : exercise.type === "listening_mcq"
        ? (content as ListeningMCQContent).explanation
        : null,
  });
}

async function updateStreak(
  supabase: SupabaseClient,
  userId: string
) {
  const today = new Date();
  // Convert to BRT (UTC-3)
  const brtDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    .toISOString()
    .split("T")[0];

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) return;

  const lastActivity = streak.last_activity_date;

  if (lastActivity === brtDate) {
    // Already active today, no change
    return;
  }

  const yesterday = new Date(new Date(brtDate).getTime() - 86400000)
    .toISOString()
    .split("T")[0];

  let newStreak = streak.current_streak;
  let freezeUsed = false;

  if (lastActivity === yesterday) {
    // Consecutive day
    newStreak += 1;
  } else if (lastActivity !== brtDate) {
    // Missed a day
    if (streak.freeze_available) {
      freezeUsed = true;
      // Streak preserved
    } else {
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(newStreak, streak.longest_streak);

  await supabase
    .from("streaks")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: brtDate,
      freeze_available: freezeUsed ? false : streak.freeze_available,
      last_freeze_used: freezeUsed ? brtDate : streak.last_freeze_used,
    })
    .eq("user_id", userId);
}

async function checkBadges(
  supabase: SupabaseClient,
  userId: string
) {
  // Get current stats
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("user_id", userId)
    .single();

  const { data: completions } = await supabase
    .from("completions")
    .select("id")
    .eq("user_id", userId);

  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const existingBadgeIds = new Set(existingBadges?.map((b) => b.badge_id) ?? []);

  const badgeChecks: { slug: string; condition: boolean }[] = [
    { slug: "first-step", condition: (completions?.length ?? 0) >= 1 },
    { slug: "on-a-roll", condition: (streak?.current_streak ?? 0) >= 3 },
    { slug: "week-warrior", condition: (streak?.current_streak ?? 0) >= 7 },
    { slug: "fortnight", condition: (streak?.current_streak ?? 0) >= 14 },
    { slug: "monthly-grind", condition: (streak?.current_streak ?? 0) >= 30 },
    { slug: "centurion", condition: (completions?.length ?? 0) >= 100 },
  ];

  for (const check of badgeChecks) {
    if (!check.condition) continue;

    const { data: badge } = await supabase
      .from("badges")
      .select("id")
      .eq("slug", check.slug)
      .single();

    if (!badge || existingBadgeIds.has(badge.id)) continue;

    await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });
  }
}
