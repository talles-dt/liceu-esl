"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(3);
  const [messagesToday, setMessagesToday] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Load latest session
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setSessionId(sessions[0].id);

        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessions[0].id)
          .order("created_at", { ascending: true });

        setMessages((msgs ?? []) as Message[]);
      }

      setLoading(false);
    };
    load();
  }, [supabase, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);
    setError(null);

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: userMessage, created_at: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "free_limit_reached" || data.error === "daily_limit_reached") {
          setError(data.message);
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }
        throw new Error(data.error || "Failed to send message");
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setLimit(data.limit);
      setMessagesToday(data.messagesToday);
      setIsPaid(data.isPaid);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: tempId,
          role: "user",
          content: userMessage,
          created_at: new Date().toISOString(),
        },
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleNewSession = async () => {
    setSessionId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  const remaining = limit - messagesToday;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-semibold flex items-center gap-2">
                Leo <Sparkles size={14} className="text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">
                Your AI English Tutor • {isPaid ? `${remaining} messages left today` : `${remaining}/${limit} free messages today`}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewSession}
              className="text-xs text-muted-foreground hover:text-foreground transition px-3 py-1.5 bg-secondary rounded-lg"
            >
              New conversation
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Hi, I'm Leo!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                I'm your AI English tutor. We can practice conversation, work on grammar, or discuss any topic you want. What would you like to talk about?
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0 mt-1">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
