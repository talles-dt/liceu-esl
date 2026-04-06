"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  cefr_level: string;
  exerciseId?: string;
}

type Phase = "loading" | "profile" | "testing" | "result" | "redirecting";

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [professionalContext, setProfessionalContext] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exerciseIds, setExerciseIds] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultLevel, setResultLevel] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_complete) {
        router.push("/dashboard");
        return;
      }

      setPhase("profile");
    };
    check();
  }, [supabase, router]);

  const handleProfileSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .update({
        name: name.trim(),
        professional_context: professionalContext.trim() || null,
      })
      .eq("id", user.id);

    setPhase("loading");

    // Generate placement test
    const res = await fetch("/api/placement-test", { method: "POST" });
    if (!res.ok) {
      console.error("Failed to generate placement test");
      return;
    }

    const data = await res.json();
    setQuestions(data.questions);
    setExerciseIds(data.exerciseIds);
    setPhase("testing");
  };

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // Adaptive logic: if wrong, next question stays same or easier; if right, go harder
    // For simplicity, just move to next question
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

      // Record completions for each question
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        for (let i = 0; i < questions.length; i++) {
          if (exerciseIds[i]) {
            await supabase.from("completions").insert({
              user_id: user.id,
              exercise_id: exerciseIds[i],
              correct: newAnswers[i] === questions[i].correctIndex,
              attempt_number: 1,
            });
          }
        }

        // Save level
        setResultLevel(level);
        await fetch("/api/placement-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level }),
        });

        setPhase("result");
      }
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  if (phase === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Generating your test...</p>
        </div>
      </main>
    );
  }

  if (phase === "profile") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Lexio</h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your profile and find your level.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Professional Context (optional)
              </label>
              <select
                value={professionalContext}
                onChange={(e) => setProfessionalContext(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select your field</option>
                <option value="IT">Technology / IT</option>
                <option value="Finance">Finance / Banking</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Business">Business / Management</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={!name.trim()}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              Start Placement Test
            </button>
          </div>
        </div>
      </main>
    );
  }

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
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full text-left p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "result") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">Your Level: {resultLevel}</h1>
          <p className="text-muted-foreground">
            You've been placed at CEFR level <strong>{resultLevel}</strong>.
            Time to put in the work!
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
