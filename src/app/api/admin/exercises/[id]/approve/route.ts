import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateListeningAudio } from "@/lib/tts";
import type { ListeningMCQContent } from "@/types/exercise-content";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get exercise
  const { data: exercise, error: fetchError } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Generate TTS if listening_mcq
  let audioUrl: string | null = null;
  if (exercise.type === "listening_mcq") {
    const content = exercise.content as ListeningMCQContent;
    try {
      audioUrl = await generateListeningAudio(content.transcript, id);
    } catch (err) {
      console.error("TTS generation failed:", err);
      // Don't block approval — audio can be regenerated later
    }
  }

  // Update exercise
  const { error: updateError } = await supabase
    .from("exercises")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      audio_url: audioUrl,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to approve exercise" }, { status: 500 });
  }

  return NextResponse.json({ success: true, audio_url: audioUrl });
}
