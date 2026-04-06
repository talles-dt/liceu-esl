import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate TTS audio for a listening exercise transcript.
 * Stores the audio in Supabase Storage and returns the public URL.
 */
export async function generateListeningAudio(
  transcript: string,
  exerciseId: string
): Promise<string> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: transcript,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  const fileName = `listening/${exerciseId}.mp3`;

  const { data, error } = await supabase.storage
    .from("exercises")
    .upload(fileName, buffer, {
      contentType: "audio/mpeg",
      cacheControl: "31536000", // 1 year
    });

  if (error) {
    throw new Error(`Failed to upload audio to Supabase: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("exercises")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
