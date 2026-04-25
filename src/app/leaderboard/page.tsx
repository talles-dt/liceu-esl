import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { brtMondayStartUtcIso, brtNextMondayStartUtcIso } from "@/lib/brt-dates";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const weekStartIso = brtMondayStartUtcIso();
  const weekEndIso = brtNextMondayStartUtcIso();

  const { data: weekRows } = await supabase
    .from("xp_log")
    .select("user_id, amount")
    .gte("created_at", weekStartIso)
    .lt("created_at", weekEndIso);

  const xpMap: Record<string, number> = {};
  weekRows?.forEach((row) => {
    xpMap[row.user_id] = (xpMap[row.user_id] ?? 0) + row.amount;
  });

  const allSorted = Object.entries(xpMap).sort(([, a], [, b]) => b - a);
  const sorted = allSorted.slice(0, 10);

  const userIds = sorted.map(([id]) => id);
  let profiles: { id: string; name: string | null; cefr_level: string | null }[] | null = null;
  if (userIds.length > 0) {
    const res = await supabase
      .from("user_profiles")
      .select("id, name, cefr_level")
      .in("id", userIds);
    profiles = res.data;
  }

  const profileMap: Record<string, { name: string | null; cefr_level: string | null }> = {};
  profiles?.forEach((p) => {
    profileMap[p.id] = { name: p.name, cefr_level: p.cefr_level };
  });

  const userXP = xpMap[user.id] ?? 0;
  const userRank =
    userXP > 0 ? allSorted.findIndex(([id]) => id === user.id) + 1 : null;

  const weekLabel = new Date(weekStartIso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            🏆 Tabela de Classificação Semanal
          </h1>
          <p className="text-muted-foreground text-sm">
            Semana a partir de {weekLabel} (BRT)
          </p>
        </div>

        {userRank !== null && userRank > 10 && (
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
