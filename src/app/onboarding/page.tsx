"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
}

type Phase = "intro" | "testing" | "result";

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultLevel, setResultLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/placement-test", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate test");
      }
      const data = await res.json();
      setQuestions(data.questions);
      setPhase("testing");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      // Calculate result
      const correctCount = newAnswers.reduce(
        (sum, a, i) => sum + (a === questions[i].correctIndex ? 1 : 0),
        0
      );

      const pct = correctCount / questions.length;
      let level = "A1";
      if (pct >= 0.9) level = "C2";
      else if (pct >= 0.8) level = "C1";
      else if (pct >= 0.7) level = "B2";
      else if (pct >= 0.55) level = "B1";
      else if (pct >= 0.4) level = "A2";

      setResultLevel(level);
      setPhase("result");
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  // Intro screen
  if (phase === "intro") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary mb-6">
              🎯 Free CEFR Assessment
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find Your English Level
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              15 adaptive questions. Takes about 5 minutes. No account
              required.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm max-w-md mx-auto">
              {error}
              <button
                onClick={startTest}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { icon: "🎯", label: "15 Questions" },
              { icon: "⏱️", label: "~5 Minutes" },
              { icon: "📊", label: "A1–C2 Result" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card border border-border rounded-xl p-4 space-y-2"
              >
                <div className="text-2xl">{item.icon}</div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startTest}
            disabled={loading}
            className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg disabled:opacity-50 neon-glow"
          >
            {loading ? "Generating your test..." : "Start Placement Test"}
          </button>

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Testing screen
  if (phase === "testing") {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
              {q.cefr_level}
            </span>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((currentQ + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-3">
              {q.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full text-left p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition text-sm md:text-base"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="block text-center text-muted-foreground hover:text-foreground transition text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Result screen
  if (phase === "result") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your Level: {resultLevel}</h1>
            <p className="text-muted-foreground">
              You've been placed at CEFR level{" "}
              <strong className="text-primary">{resultLevel}</strong>.
            </p>
          </div>

          {/* Level description */}
          <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-medium">
              {resultLevel === "A1" && "Beginner"}
              {resultLevel === "A2" && "Elementary"}
              {resultLevel === "B1" && "Intermediate"}
              {resultLevel === "B2" && "Upper Intermediate"}
              {resultLevel === "C1" && "Advanced"}
              {resultLevel === "C2" && "Proficiency"}
            </p>
            <p className="text-xs text-muted-foreground">
              {resultLevel === "A1" &&
                "You can understand and use familiar everyday expressions and very basic phrases."}
              {resultLevel === "A2" &&
                "You can understand sentences and frequently used expressions related to basic personal and family information."}
              {resultLevel === "B1" &&
                "You can understand the main points of clear standard input on familiar matters regularly encountered in work, school, and leisure."}
              {resultLevel === "B2" &&
                "You can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions."}
              {resultLevel === "C1" &&
                "You can understand a wide range of demanding, longer texts, and recognize implicit meaning."}
              {resultLevel === "C2" &&
                "You can understand with ease virtually everything heard or read."}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition neon-glow"
            >
              Create Account & Start Learning
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Create a free account to track your progress, access exercises, and
            chat with Leo — our AI tutor.
          </p>
        </div>
      </main>
    );
  }

  return null;
}
