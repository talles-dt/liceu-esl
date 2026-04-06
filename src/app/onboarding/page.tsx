"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
  skill: string;
}

type Phase = "intro" | "testing" | "report";

const LEVEL_DESCRIPTIONS: Record<string, { label: string; desc: string; canDo: string[] }> = {
  A1: {
    label: "Beginner",
    desc: "You understand and use familiar everyday expressions and very basic phrases aimed at concrete needs. You can introduce yourself and ask/answer simple personal questions.",
    canDo: [
      "Understand basic greetings and introductions",
      "Use simple phrases for concrete needs",
      "Interact in a basic way if the other person speaks slowly",
    ],
  },
  A2: {
    label: "Elementary",
    desc: "You understand sentences and frequently used expressions related to basic personal and family information, shopping, local geography, and employment.",
    canDo: [
      "Communicate about routine tasks requiring direct exchange of information",
      "Describe in simple terms aspects of your background and environment",
      "Handle short social exchanges",
    ],
  },
  B1: {
    label: "Intermediate",
    desc: "You understand the main points of clear standard input on familiar matters regularly encountered in work, school, and leisure. You can deal with most travel situations.",
    canDo: [
      "Produce simple connected text on familiar topics",
      "Describe experiences, events, dreams, and ambitions",
      "Give reasons and explanations for opinions and plans",
    ],
  },
  B2: {
    label: "Upper Intermediate",
    desc: "You understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field. You interact with fluency and spontaneity.",
    canDo: [
      "Interact with native speakers without strain",
      "Produce clear, detailed text on a wide range of subjects",
      "Explain a viewpoint with advantages and disadvantages",
    ],
  },
  C1: {
    label: "Advanced",
    desc: "You understand a wide range of demanding, longer texts and recognize implicit meaning. You express yourself fluently and spontaneously without obvious searching for expressions.",
    canDo: [
      "Use language flexibly for social, academic, and professional purposes",
      "Produce clear, well-structured, detailed text on complex subjects",
      "Show controlled use of organizational patterns and connectors",
    ],
  },
  C2: {
    label: "Proficiency",
    desc: "You understand with ease virtually everything heard or read. You summarize information from different spoken and written sources, reconstructing arguments coherently.",
    canDo: [
      "Express yourself spontaneously, very fluently, and precisely",
      "Differentiate finer shades of meaning even in complex situations",
      "Understand idiomatic expressions and colloquialisms with ease",
    ],
  },
};

const SKILL_LABELS: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  reading: "Reading",
  pragmatics: "Pragmatic Usage",
};

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Report data
  const [overallLevel, setOverallLevel] = useState("");
  const [skillBreakdown, setSkillBreakdown] = useState<Record<string, { correct: number; total: number }>>({});
  const [levelBreakdown, setLevelBreakdown] = useState<Record<string, { correct: number; total: number }>>({});

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

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      generateReport(newAnswers);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const generateReport = (finalAnswers: number[]) => {
    // Per-skill breakdown
    const skills: Record<string, { correct: number; total: number }> = {};
    // Per-level breakdown
    const levels: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      if (!skills[q.skill]) skills[q.skill] = { correct: 0, total: 0 };
      if (!levels[q.cefr_level]) levels[q.cefr_level] = { correct: 0, total: 0 };
      skills[q.skill].total++;
      levels[q.cefr_level].total++;
      if (finalAnswers[i] === q.correctIndex) {
        skills[q.skill].correct++;
        levels[q.cefr_level].correct++;
      }
    });

    // Determine overall level: highest CEFR level where accuracy ≥ 60%
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    let determinedLevel = "A1";
    for (const lvl of levelOrder) {
      const data = levels[lvl];
      if (!data || data.total === 0) break;
      const accuracy = data.correct / data.total;
      if (accuracy >= 0.6) {
        determinedLevel = lvl;
      } else {
        break;
      }
    }

    setSkillBreakdown(skills);
    setLevelBreakdown(levels);
    setOverallLevel(determinedLevel);
    setPhase("report");
  };

  // ─── INTRO ───
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
              60 comprehensive questions across grammar, vocabulary, reading,
              and pragmatics. Takes about 20 minutes.
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
            {[
              { icon: "📝", label: "60 Questions" },
              { icon: "⏱️", label: "~20 Minutes" },
              { icon: "📊", label: "A1–C2 Result" },
              { icon: "📋", label: "Full Report" },
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

          <div className="bg-card border border-border rounded-xl p-4 text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
            <p className="font-medium text-foreground">The test covers:</p>
            <div className="grid grid-cols-2 gap-2">
              <span>• Grammar (A1–C2)</span>
              <span>• Vocabulary (A1–C2)</span>
              <span>• Reading (B1–C1)</span>
              <span>• Pragmatic Usage (B2–C2)</span>
            </div>
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

  // ─── TESTING ───
  if (phase === "testing") {
    const q = questions[currentQ];
    if (!q) return null;
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                {q.cefr_level}
              </span>
              <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded">
                {SKILL_LABELS[q.skill] ?? q.skill}
              </span>
            </div>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question card */}
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

  // ─── REPORT ───
  if (phase === "report") {
    const levelInfo = LEVEL_DESCRIPTIONS[overallLevel] ?? LEVEL_DESCRIPTIONS.A1;
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const overallAccuracy =
      questions.length > 0
        ? Math.round(
            (answers.reduce(
              (sum, a, i) => sum + (a === questions[i].correctIndex ? 1 : 0),
              0
            ) /
              questions.length) *
              100
          )
        : 0;

    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8 py-8">
          {/* Result header */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Your CEFR Level:{" "}
              <span className="text-primary">{overallLevel}</span>
            </h1>
            <p className="text-lg font-medium text-foreground-muted">
              {levelInfo.label} — {overallAccuracy}% overall accuracy
            </p>
          </div>

          {/* Level description */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">What {overallLevel} means</h2>
            <p className="text-muted-foreground leading-relaxed">
              {levelInfo.desc}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">You can:</p>
              {levelInfo.canDo.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-success mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* CEFR scale visual */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">CEFR Scale</h2>
            <div className="space-y-2">
              {levelOrder.map((lvl) => {
                const data = levelBreakdown[lvl];
                const accuracy = data ? Math.round((data.correct / data.total) * 100) : 0;
                const isCurrent = lvl === overallLevel;
                const passed = accuracy >= 60;

                return (
                  <div key={lvl} className="flex items-center gap-3">
                    <span
                      className={`w-10 text-center text-sm font-bold py-1 rounded ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : passed
                          ? "bg-success/10 text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {lvl}
                    </span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCurrent
                            ? "bg-primary"
                            : passed
                            ? "bg-success"
                            : "bg-muted-foreground/30"
                        }`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {accuracy}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Skill Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(skillBreakdown).map(([skill, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-muted-foreground">
                      {SKILL_LABELS[skill] ?? skill}
                    </span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/60 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs text-muted-foreground">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-center text-lg neon-glow"
            >
              Create Account &amp; Start Learning
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-center"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Create a free account to access personalized exercises, the AI tutor,
            streaks, and progress tracking.
          </p>
        </div>
      </main>
    );
  }

  return null;
}
