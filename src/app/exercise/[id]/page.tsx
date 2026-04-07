"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exercise } from "@/types/database";
import ExerciseRenderer from "@/components/exercises/ExerciseRenderer";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ correct: boolean; xpEarned: number; explanation: string | null } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { id } = await params;
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setExercise(data);
      setLoading(false);
    };
    load();
  }, [params, supabase, router]);

  const handleComplete = async (answer: unknown, _correct: boolean) => {
    if (!exercise) return;

    const res = await fetch(`/api/exercises/${exercise.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, attemptNumber: 1 }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!exercise) return null;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition text-sm">
            ← Voltar ao painel
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase">
              {exercise.cefr_level}
            </span>
            <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
              {exercise.skill}
            </span>
          </div>
        </div>

        {/* Exercise */}
        <div className="bg-card border border-border rounded-xl p-6">
          <ExerciseRenderer exercise={exercise} onComplete={handleComplete} />
        </div>

        {/* Result */}
        {result && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className={result.correct ? "text-2xl" : "text-2xl"}>
                {result.correct ? "🎉" : "💪"}
              </span>
              <div>
                <p className="font-semibold">{result.correct ? "Parabéns!" : "Continue praticando!"}</p>
                {result.xpEarned > 0 && (
                  <p className="text-primary font-bold">+{result.xpEarned} XP</p>
                )}
              </div>
            </div>
            {result.explanation && (
              <p className="text-muted-foreground text-sm">{result.explanation}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm"
              >
                Tentar outro
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-2 bg-primary text-primary-foreground text-center rounded-lg hover:bg-primary/90 transition text-sm font-medium"
              >
                Painel
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
