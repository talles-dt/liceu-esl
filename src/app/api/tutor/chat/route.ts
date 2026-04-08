import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";
import type { CefrLevel } from "@/types/database";

const SYSTEM_PROMPT = (level: string) => `You are Leo, an expert English language tutor from Lexio Underground.
You are speaking with a ${level} level English learner.

Your role:
- Help the student practice English naturally through conversation
- Gently correct significant grammar/vocabulary errors (don't interrupt flow for minor ones)
- Adjust your vocabulary and sentence complexity to ${level} level
- Be encouraging, direct, and never condescending
- Keep responses concise (2-4 sentences max unless explaining a concept)
- Never break character or discuss topics unrelated to language learning

Current student level: ${level}`;

const MAX_MESSAGES_PER_DAY = 20;
const FREE_USER_MAX_MESSAGES = 3;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("cefr_level")
    .eq("id", user.id)
    .single();

  if (!profile?.cefr_level) {
    return NextResponse.json(
      { error: "Complete placement test first" },
      { status: 403 }
    );
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isPaid =
    subscription?.status === "active" || subscription?.status === "trialing";

  // Check daily message count
  const today = new Date().toISOString().split("T")[0];
  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", user.id);

  const sessionIds = sessions?.map((s: { id: string }) => s.id) ?? [];

  const { count: todayCount } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", `${today}T00:00:00`)
    .in("session_id", sessionIds);

  if (!isPaid && (todayCount ?? 0) >= FREE_USER_MAX_MESSAGES) {
    return NextResponse.json(
      {
        error: "free_limit_reached",
        message:
          "You've used all 3 free tutor messages today. Upgrade to Pro for unlimited access.",
      },
      { status: 403 }
    );
  }

  if (isPaid && (todayCount ?? 0) >= MAX_MESSAGES_PER_DAY) {
    return NextResponse.json(
      {
        error: "daily_limit_reached",
        message: "You've reached your daily limit of 20 tutor messages.",
      },
      { status: 429 }
    );
  }

  const { message, sessionId } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  let activeSessionId = sessionId;

  // Create session if none exists
  if (!activeSessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (!newSession) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
    activeSessionId = newSession.id;
  }

  // Save user message
  await supabase.from("chat_messages").insert({
    session_id: activeSessionId,
    role: "user",
    content: message,
  });

  // Get conversation history (last 20 messages)
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", activeSessionId)
    .order("created_at", { ascending: true })
    .limit(20);

  const aiMessages = (messages ?? []).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" as const : "assistant" as const,
    content: m.content,
  }));

  const client = createNvidiaClient();

  const response = await client.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT(profile.cefr_level) },
      ...aiMessages,
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  const reply = response.choices[0]?.message?.content ??
    "I'm not sure how to respond to that. Let's try something else!";

  // Save assistant message
  await supabase.from("chat_messages").insert({
    session_id: activeSessionId,
    role: "assistant",
    content: reply,
  });

  // Update session message count
  const { count: msgCount } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("session_id", activeSessionId);

  await supabase
    .from("chat_sessions")
    .update({
      last_message_at: new Date().toISOString(),
      message_count: msgCount ?? 0,
    })
    .eq("id", activeSessionId);

  return NextResponse.json({
    reply,
    sessionId: activeSessionId,
    messagesToday: (todayCount ?? 0) + 1,
    limit: isPaid ? MAX_MESSAGES_PER_DAY : FREE_USER_MAX_MESSAGES,
    isPaid,
  });
}
