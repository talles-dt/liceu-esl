import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const weekStart = getStartOfWeek(new Date());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Top 10 this week
  const { data: top10 } = await supabase
    .from("xp_log")
    .select("user_id, amount")
    .gte("created_at", `${weekStartStr}T00:00:00`)
    .order("created_at", { ascending: false });

  // Aggregate XP per user
  const xpMap: Record<string, number> = {};
  top10?.forEach((row) => {
    xpMap[row.user_id] = (xpMap[row.user_id] ?? 0) + row.amount;
  });

  const sorted = Object.entries(xpMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Fetch profiles for top 10
  const userIds = sorted.map(([id]) => id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, cefr_level")
    .in("id", userIds);

  const profileMap: Record<string, { name: string | null; cefr_level: string | null }> = {};
  profiles?.forEach((p) => {
    profileMap[p.id] = { name: p.name, cefr_level: p.cefr_level };
  });

  // Current user's rank and XP
  let userRank: number | null = null;
  let userXP = 0;
  if (user) {
    userXP = xpMap[user.id] ?? 0;
    userRank = sorted.findIndex(([id]) => id === user.id) + 1;
    if (userRank === 0 && userXP > 0) {
      // User has XP but not in top 10
      const allEntries = Object.entries(xpMap).sort(([, a], [, b]) => b - a);
      userRank = allEntries.findIndex(([id]) => id === user.id) + 1;
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            🏆 Tabela de Classificação Semanal
          </h1>
          <p className="text-muted-foreground text-sm">
            Semana de {weekStart.toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
          </p>
        </div>

        {userRank && userRank > 10 && (
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sua classificação</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">#{userRank}</span>
              <span className="text-sm text-muted-foreground">{userXP} XP</span>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {sorted.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-2xl mb-2">🏁</p>
              <p>Nenhum XP conquistado nesta semana ainda. Comece a praticar!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sorted.map(([userId, xp], i) => {
                const profile = profileMap[userId];
                const isCurrentUser = userId === user?.id;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;

                return (
                  <div
                    key={userId}
                    className={`flex items-center justify-between px-4 py-3 ${
                      isCurrentUser ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-8 text-center">{medal}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {profile?.name ?? "Anônimo"}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary font-normal">(você)</span>
                          )}
                        </p>
                        {profile?.cefr_level && (
                          <span className="text-xs text-muted-foreground">
                            {profile.cefr_level}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold">{xp} XP</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          A tabela de classificação reseta toda segunda-feira às 00:00 BRT.
        </p>
      </div>
    </main>
  );
}
