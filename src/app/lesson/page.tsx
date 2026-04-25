"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface PillarLesson {
  grammar: string;
  logic: string;
  communication: string;
  mnemonic: string;
}

export default function LessonPage() {
  const [lesson, setLesson] = useState<PillarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const raw = params.get("pillar");
    const p = raw?.toLowerCase().trim();
    const payload =
      p === "grammar" || p === "logic" || p === "communication" ? { pillar: p } : {};

    try {
      const response = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Não foi possível gerar a lição."
        );
        setLesson(null);
        return;
      }

      if (
        data &&
        typeof data.grammar === "string" &&
        typeof data.logic === "string" &&
        typeof data.communication === "string" &&
        typeof data.mnemonic === "string"
      ) {
        setLesson(data as PillarLesson);
      } else {
        setError("Resposta inválida do servidor.");
        setLesson(null);
      }
    } catch {
      setError("Falha de rede. Tente novamente.");
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <p className="text-lg text-muted-foreground">Gerando lição…</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-16 max-w-lg mx-auto space-y-6 text-center">
        <p className="text-destructive">{error ?? "Lição indisponível."}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Tentar de novo
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="block mx-auto text-sm text-muted-foreground underline"
        >
          Voltar ao dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="mb-6 text-sm text-muted-foreground hover:text-foreground transition"
      >
        ← Voltar ao dashboard
      </button>

      <div className="border-l-4 border-primary pl-6">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
          Grammar
        </h2>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{lesson.grammar}</ReactMarkdown>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Logic</h3>
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown>{lesson.logic}</ReactMarkdown>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Communication</h3>
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown>{lesson.communication}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-secondary/30 p-6">
        <h3 className="text-lg font-semibold mb-2">Memory palace</h3>
        <p className="text-muted-foreground leading-relaxed">
          {lesson.mnemonic.split("→").join(" → ")}
        </p>
      </div>
    </div>
  );
}
