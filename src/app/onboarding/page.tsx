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
    label: "Iniciante",
    desc: "Você compreende e usa expressões cotidianas familiares e frases muito básicas voltadas a necessidades concretas. Pode se apresentar e fazer/responder perguntas pessoais simples.",
    canDo: [
      "Compreender saudações e apresentações básicas",
      "Usar frases simples para necessidades concretas",
      "Interagir de forma básica se a outra pessoa falar devagar",
    ],
  },
  A2: {
    label: "Elementar",
    desc: "Você compreende frases e expressões frequentemente usadas relacionadas a informações pessoais e familiares básicas, compras, geografia local e emprego.",
    canDo: [
      "Comunicar-se sobre tarefas rotineiras que exigem troca direta de informação",
      "Descrever de forma simples aspectos da sua formação e ambiente",
      "Manter breves conversas sociais",
    ],
  },
  B1: {
    label: "Intermediário",
    desc: "Você compreende os pontos principais de uma entrada clara e padrão sobre assuntos familiares encontrados regularmente no trabalho, escola e lazer. Consegue lidar com a maioria das situações de viagem.",
    canDo: [
      "Produzir texto simples e coeso sobre tópicos familiares",
      "Descrever experiências, eventos, sonhos e ambições",
      "Dar razões e explicações para opiniões e planos",
    ],
  },
  B2: {
    label: "Intermediário Superior",
    desc: "Você compreende as ideias principais de textos complexos sobre tópicos concretos e abstratos, incluindo discussões técnicas na sua área. Interage com fluência e espontaneidade.",
    canDo: [
      "Interagir com falantes nativos sem esforço",
      "Produzir texto claro e detalhado sobre uma ampla gama de assuntos",
      "Explicar um ponto de vista com vantagens e desvantagens",
    ],
  },
  C1: {
    label: "Avançado",
    desc: "Você compreende uma ampla gama de textos longos e exigentes, e reconhece significados implícitos. Expressa-se de forma fluente e espontânea sem procurar expressões de forma óbvia.",
    canDo: [
      "Usar o idioma de forma flexível para fins sociais, acadêmicos e profissionais",
      "Produzir texto claro, bem estruturado e detalhado sobre assuntos complexos",
      "Demonstrar uso controlado de padrões organizacionais e conectores",
    ],
  },
  C2: {
    label: "Proficiência",
    desc: "Você compreende com facilidade virtualmente tudo o que ouve ou lê. Resume informações de diferentes fontes faladas e escritas, reconstruindo argumentos de forma coerente.",
    canDo: [
      "Expressar-se espontaneamente, de forma muito fluente e precisa",
      "Diferenciar nuances mais sutis de significado mesmo em situações complexas",
      "Compreender expressões idiomáticas e coloquialismos com facilidade",
    ],
  },
};

const SKILL_LABELS: Record<string, string> = {
  grammar: "Gramática",
  vocabulary: "Vocabulário",
  reading: "Leitura",
  pragmatics: "Uso Pragmático",
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
              Avaliação CEFR Gratuita
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Descubra Seu Nível de Inglês
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              60 perguntas abrangentes sobre gramática, vocabulário, leitura
              e uso pragmático. Leva cerca de 20 minutos.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm max-w-md mx-auto">
              {error}
              <button
                onClick={startTest}
                className="ml-2 underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
            {[
              { icon: "📝", label: "60 Perguntas" },
              { icon: "⏱️", label: "~20 Minutos" },
              { icon: "📊", label: "Resultado A1–C2" },
              { icon: "📋", label: "Relatório Completo" },
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
            <p className="font-medium text-foreground">O teste cobre:</p>
            <div className="grid grid-cols-2 gap-2">
              <span>• Gramática (A1–C2)</span>
              <span>• Vocabulário (A1–C2)</span>
              <span>• Leitura (B1–C1)</span>
              <span>• Uso Pragmático (B2–C2)</span>
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={loading}
            className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg disabled:opacity-50 neon-glow"
          >
            {loading ? "Gerando seu teste..." : "Iniciar Teste de Nivelamento"}
          </button>

          <p className="text-xs text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Entrar
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
              Pergunta {currentQ + 1} de {questions.length}
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
            ← Voltar ao início
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
              Seu Nível CEFR:{" "}
              <span className="text-primary">{overallLevel}</span>
            </h1>
            <p className="text-lg font-medium text-foreground-muted">
              {levelInfo.label} — {overallAccuracy}% de precisão geral
            </p>
          </div>

          {/* Level description */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">O que {overallLevel} significa</h2>
            <p className="text-muted-foreground leading-relaxed">
              {levelInfo.desc}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Você consegue:</p>
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
            <h2 className="text-lg font-semibold">Escala CEFR</h2>
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
            <h2 className="text-lg font-semibold">Detalhamento por Habilidade</h2>
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
              Criar Conta e Começar a Aprender
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-center"
            >
              Voltar ao Início
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Crie uma conta gratuita para acessar exercícios personalizados, o tutor de IA,
            sequências e acompanhamento de progresso.
          </p>
        </div>
      </main>
    );
  }

  return null;
}
