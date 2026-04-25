import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Flame,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CefrLevel } from "@/types/database";
import { XP_THRESHOLDS } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("cefr_level, name")
    .eq("id", user.id)
    .single();

  const { data: streakRow } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("user_id", user.id)
    .single();

  const { data: xpRpc } = await supabase.rpc("get_user_total_xp", {
    p_user_id: user.id,
  });
  const totalXp = typeof xpRpc === "number" ? xpRpc : 0;

  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: latestLesson } = await supabase
    .from("lessons")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cefr = profile?.cefr_level as CefrLevel | null;
  const streakDays = streakRow?.current_streak ?? 0;

  const xpEntries = Object.entries(XP_THRESHOLDS) as [CefrLevel, number][];
  const sortedByXp = [...xpEntries].sort((a, b) => a[1] - b[1]);
  let nextLabel: CefrLevel | null = null;
  let nextAt = 0;
  let prevAt = 0;
  for (const [label, at] of sortedByXp) {
    if (at > totalXp) {
      nextLabel = label;
      nextAt = at;
      break;
    }
    prevAt = at;
  }
  const xpProgress =
    nextLabel === null
      ? 100
      : Math.min(
          100,
          Math.round(((totalXp - prevAt) / (nextAt - prevAt || 1)) * 100)
        );

  const displayName = profile?.name?.trim() || "Learner";

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            Dashboard
          </p>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Olá, {displayName}
          </h1>
          <p className="text-muted-foreground">
            {cefr
              ? `Nível CEFR atual: ${cefr}`
              : "Complete o teste de nivelamento para desbloquear lições personalizadas."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ofensiva (dias)"
            value={`${streakDays}`}
            hint={`Recorde: ${streakRow?.longest_streak ?? 0} dias`}
            icon={<Flame className="size-5 text-primary" />}
          />
          <StatCard
            title="XP total"
            value={totalXp.toLocaleString("pt-BR")}
            hint={
              nextLabel
                ? `Próximo marco (${nextLabel}): ${nextAt.toLocaleString("pt-BR")} XP`
                : "Marco máximo atingido"
            }
            icon={<Sparkles className="size-5 text-primary" />}
          />
          <StatCard
            title="Lições geradas"
            value={`${lessonCount ?? 0}`}
            hint="Inclui mnemônicos do palácio da memória"
            icon={<BookOpen className="size-5 text-primary" />}
          />
          <StatCard
            title="Última lição"
            value={
              latestLesson?.created_at
                ? new Date(latestLesson.created_at).toLocaleDateString("pt-BR")
                : "—"
            }
            hint="Pilares: Grammar · Logic · Communication"
            icon={<Calendar className="size-5 text-primary" />}
          />
        </div>

        {nextLabel && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso até {nextLabel}</span>
              <span className="font-medium">{xpProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        )}

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Lição do dia (pilares)</h2>
          <p className="text-sm text-muted-foreground">
            Cada lição inclui gramática, lógica de uso, comunicação real e um mnemônico no
            formato do palácio da memória. Sem parâmetros na URL, usamos o pilar do dia no
            fuso de São Paulo (rotina Grammar / Logic / Communication).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lesson"
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Pilar de hoje (automático)
            </Link>
            <Link
              href="/lesson?pillar=grammar"
              className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Grammar
            </Link>
            <Link
              href="/lesson?pillar=logic"
              className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Logic
            </Link>
            <Link
              href="/lesson?pillar=communication"
              className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Communication
            </Link>
            <Link
              href="/memory-palace"
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition"
            >
              Memory palace
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard(props: {
  title: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {props.icon}
        <span>{props.title}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{props.value}</p>
      {props.hint ? (
        <p className="text-xs text-muted-foreground leading-snug">{props.hint}</p>
      ) : null}
    </div>
  );
}
