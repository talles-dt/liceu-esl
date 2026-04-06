import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendLevelUpEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { level } = await req.json();

  if (!level) {
    return NextResponse.json({ error: "Level is required" }, { status: 400 });
  }

  // Update profile
  const { error } = await supabase
    .from("user_profiles")
    .update({
      cefr_level: level,
      onboarding_complete: true,
      placement_test_taken_at: new Date().toISOString(),
      placement_test_eligible_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save level" }, { status: 500 });
  }

  // Send level up email
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("email, name")
    .eq("id", user.id)
    .single();

  if (profile?.email) {
    try {
      await sendLevelUpEmail(profile.email, level);
    } catch (e) {
      console.error("Failed to send level up email:", e);
    }
  }

  return NextResponse.json({ success: true });
}
