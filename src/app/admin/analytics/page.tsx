import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total users
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  // Active subscribers
  const { count: activeSubscribers } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // DAU — unique users with completions today
  const { count: dau } = await supabase
    .from("completions")
    .select("user_id", { count: "exact" })
    .gte("created_at", startOfDay.toISOString())
    .order("user_id");

  // WAU — unique users with completions this week
  const { count: wau } = await supabase
    .from("completions")
    .select("user_id", { count: "exact" })
    .gte("created_at", startOfWeek.toISOString());

  // MAU — unique users with completions this month
  const { count: mau } = await supabase
    .from("completions")
    .select("user_id", { count: "exact" })
    .gte("created_at", startOfMonth.toISOString());

  // Total exercises served today
  const { count: exercisesToday } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay.toISOString());

  // Total exercises served
  const { count: totalCompletions } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true });

  // Approved exercises count
  const { count: approvedExercises } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // Draft exercises count
  const { count: draftExercises } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  // Conversion: placement test → paid
  const { count: placedUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .not("cefr_level", "is", null);

  const conversionRate =
    totalUsers && placedUsers
      ? ((activeSubscribers ?? 0) / placedUsers) * 100
      : 0;

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: newThisWeek } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  // Average XP per active user
  const { data: xpData } = await supabase.rpc("get_user_total_xp", {
    p_user_id: user.id,
  });

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Users" value={totalUsers ?? 0} />
          <MetricCard label="Active Subscribers" value={activeSubscribers ?? 0} />
          <MetricCard label="DAU" value={dau ?? 0} />
          <MetricCard label="WAU" value={wau ?? 0} />
          <MetricCard label="MAU" value={mau ?? 0} />
          <MetricCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} />
          <MetricCard label="New This Week" value={newThisWeek ?? 0} />
          <MetricCard label="Exercises Today" value={exercisesToday ?? 0} />
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Approved Exercises" value={approvedExercises ?? 0} />
          <MetricCard label="Draft Exercises" value={draftExercises ?? 0} />
          <MetricCard label="Total Completions" value={totalCompletions ?? 0} />
        </div>

        {/* Funnel */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Conversion Funnel</h2>
          <div className="space-y-3">
            <FunnelBar label="Total Users" count={totalUsers ?? 0} max={totalUsers ?? 1} />
            <FunnelBar label="Completed Placement" count={placedUsers ?? 0} max={totalUsers ?? 1} />
            <FunnelBar label="Active Subscribers" count={activeSubscribers ?? 0} max={totalUsers ?? 1} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Recent Signups</h2>
          <p className="text-muted-foreground text-sm">
            {newThisWeek ?? 0} new users in the last 7 days
          </p>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
