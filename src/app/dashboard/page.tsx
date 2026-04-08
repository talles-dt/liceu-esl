import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BASE_XP, XP_THRESHOLDS, type CefrLevel } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </main>
    );
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </main>
    );
  }

  // If onboarding not complete, show CTA to go to onboarding
  if (!profile.onboarding_complete || !profile.cefr_level) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-5xl">🎯</div>
          <h1 className="text-2xl font-bold">Bem-vindo!</h1>
          <p className="text-muted-foreground">
            Faça o teste de nivelamento para descobrir seu nível CEFR e começar a praticar.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition neon-glow"
          >
            Fazer Teste de Nivelamento
          </Link>
          <Link
            href="/"
            className="block text-muted-foreground hover:text-foreground transition text-sm"
          >
            ← Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  // Fetch stats
  const { data: xp } = await supabase.rpc("get_user_total_xp", {
    p_user_id: user.id,
  });
  const totalXP = (xp as number) ?? 0;

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { count: completionCount } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badges(slug, name, icon)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(3);

  // Fetch assigned exercises
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .contains("student_ids", [user.id])
    .order("created_at", { ascending: false });

  // Get exercise details for assignments
  let assignedExercises: any[] = [];
  if (assignments && assignments.length > 0) {
    const exerciseIds = assignments.flatMap((a: any) => a.exercise_ids);
    if (exerciseIds.length > 0) {
      const { data: exs } = await supabase
        .from("exercises")
        .select("*")
        .eq("status", "approved")
        .in("id", exerciseIds.slice(0, 20));
      assignedExercises = exs ?? [];
    }
  }

  // Get some recommended exercises (not assigned, same level)
  let recommendedExercises: any[] = [];
  if (profile.cefr_level) {
    const excludeIds = assignedExercises.map((e: any) => e.id);
    const { data: recs } = await supabase
      .from("exercises")
      .select("*")
      .eq("status", "approved")
      .eq("cefr_level", profile.cefr_level)
      .not("id", "in", `(${excludeIds.length > 0 ? excludeIds.join(",") : "''"})`)
      .order("created_at", { ascending: false })
      .limit(5);
    recommendedExercises = recs ?? [];
  }

  const currentLevel = profile.cefr_level as CefrLevel;
  const nextLevelIndex = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(currentLevel ?? "A1") + 1;
  const nextLevel = (["A1", "A2", "B1", "B2", "C1", "C2"][nextLevelIndex] ?? "C2") as CefrLevel;
  const currentThreshold = XP_THRESHOLDS[currentLevel] ?? 0;
  const nextThreshold = XP_THRESHOLDS[nextLevel] ?? 8000;
  const progressPct = currentLevel
    ? Math.min(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 0;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground text-sm">Vamos manter a sequência.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm flex items-center gap-2"
            >
              📅 Agendar uma Aula
            </Link>
            <Link
              href="/billing"
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm flex items-center gap-2"
            >
              💳 Faturamento
            </Link>
            <Link
              href="/feedback"
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm flex items-center gap-2"
            >
              💬 Feedback
            </Link>
            <Link
              href="/tutor"
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm flex items-center gap-2"
            >
              🤖 Tutor
            </Link>
            <form action="/api/auth/sign-out" method="POST">
              <button className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition text-sm">
                Sair
              </button>
            </form>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            {profile.cefr_level ? (
              <>
                <p className="text-2xl font-bold text-primary">{profile.cefr_level}</p>
                <p className="text-xs text-muted-foreground">Nível CEFR</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground">Faça o teste de nivelamento</p>
              </>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold">{totalXP}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold flex items-center gap-1">
              🔥 {streak?.current_streak ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Dias de Sequência</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold">{completionCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Exercícios Feitos</p>
          </div>
        </div>

        {/* XP Progress */}
        {profile.cefr_level && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {currentLevel} → {nextLevel}
              </span>
              <span className="font-mono text-xs">
                {totalXP} / {nextThreshold} XP
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {!profile.onboarding_complete && !profile.cefr_level && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center space-y-4">
            <div className="text-4xl">🎯</div>
            <h2 className="text-xl font-bold">Descubra seu nível de inglês</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Faça o teste de nivelamento gratuito — 60 perguntas que cobrem
              gramática, vocabulário, leitura e uso pragmático. Leva cerca de
              20 minutos e gera um relatório completo do seu nível CEFR.
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition neon-glow"
            >
              Fazer Teste de Nivelamento
            </Link>
          </div>
        )}

        {/* Assigned Exercises */}
        {assignedExercises.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Exercícios Atribuídos</h2>
            <div className="space-y-2">
              {assignedExercises.map((ex: any) => (
                <Link
                  key={ex.id}
                  href={`/exercise/${ex.id}`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {ex.cefr_level}
                    </span>
                    <span className="text-sm">{ex.skill}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{ex.type}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommendedExercises.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Recomendados para Você</h2>
            <div className="space-y-2">
              {recommendedExercises.map((ex: any) => (
                <Link
                  key={ex.id}
                  href={`/exercise/${ex.id}`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {ex.cefr_level}
                    </span>
                    <span className="text-sm">{ex.skill}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{ex.type}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {userBadges && userBadges.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Conquistas Recentes</h2>
            <div className="flex gap-3">
              {userBadges.map((ub: any) => (
                <div
                  key={ub.id}
                  className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-lg"
                >
                  <span className="text-2xl">{ub.badges.icon}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {ub.badges.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/leaderboard"
            className="p-4 bg-card border border-border rounded-xl text-center hover:border-primary/30 transition"
          >
            <p className="text-2xl mb-1">📊</p>
            <p className="text-sm font-medium">Classificação</p>
          </Link>
          <Link
            href="/tutor"
            className="p-4 bg-card border border-border rounded-xl text-center hover:border-primary/30 transition"
          >
            <p className="text-2xl mb-1">🤖</p>
            <p className="text-sm font-medium">Tutor de IA</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
