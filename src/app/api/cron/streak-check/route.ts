/**
 * Vercel Cron endpoint — streak at-risk check.
 * Runs daily at 20:00 BRT (23:00 UTC).
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/streak-check",
 *     "schedule": "0 23 * * *"
 *   }]
 * }
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendStreakAtRiskEmail } from "@/lib/email-templates";

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  // Get today's date in BRT (UTC-3)
  const now = new Date();
  const brtNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const today = brtNow.toISOString().split("T")[0];

  // Find users with active streaks who haven't completed an exercise today
  const { data: streaks } = await supabase
    .from("streaks")
    .select("user_id, current_streak, last_activity_date, freeze_available")
    .gt("current_streak", 0)
    .neq("last_activity_date", today);

  if (!streaks || streaks.length === 0) {
    return NextResponse.json({ checked: 0, emailed: 0 });
  }

  // Filter out users who have a freeze available (they're not at risk yet — auto-freeze will handle it)
  // Only email users who will lose their streak (no freeze available)
  const atRisk = streaks.filter((s) => !s.freeze_available);

  let emailed = 0;

  for (const streak of atRisk) {
    // Get user email
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email, name")
      .eq("id", streak.user_id)
      .single();

    if (!profile?.email) continue;

    try {
      await sendStreakAtRiskEmail(profile.email, streak.current_streak);
      emailed++;
    } catch (err) {
      console.error(`Failed to send streak email to ${profile.email}:`, err);
    }
  }

  return NextResponse.json({
    checked: streaks.length,
    atRisk: atRisk.length,
    emailed,
    timestamp: new Date().toISOString(),
  });
}
