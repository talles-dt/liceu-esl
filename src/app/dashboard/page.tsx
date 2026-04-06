import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome{profile.name ? `, ${profile.name}` : ""}</h1>
            <p className="text-muted-foreground">Role: {profile.role}</p>
          </div>
          <form action="/api/auth/sign-out" method="POST">
            <button className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition text-sm">
              Sign out
            </button>
          </form>
        </header>

        {!profile.onboarding_complete && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Complete your onboarding</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Take the placement test to get your CEFR level and start learning.
            </p>
            <a
              href="/onboarding"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              Start onboarding
            </a>
          </div>
        )}

        {profile.cefr_level && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{profile.cefr_level}</p>
                <p className="text-xs text-muted-foreground">CEFR Level</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Exercises Done</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center py-12 text-muted-foreground">
          <p>Full dashboard coming in Phase 1.</p>
        </div>
      </div>
    </main>
  );
}
