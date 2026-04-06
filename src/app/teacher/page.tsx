"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, Streak, CefrLevel } from "@/types/database";
import { useRouter } from "next/navigation";

interface StudentRow extends UserProfile {
  streaks: Streak | null;
  total_xp: number;
  completion_count: number;
  last_active: string | null;
}

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: students } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (!students) {
        setLoading(false);
        return;
      }

      const rows: StudentRow[] = [];

      for (const s of students) {
        const { data: streak } = await supabase
          .from("streaks")
          .select("*")
          .eq("user_id", s.id)
          .single();

        const { data: xp } = await supabase.rpc("get_user_total_xp", {
          p_user_id: s.id,
        });

        const { count } = await supabase
          .from("completions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", s.id);

        const { data: lastCompletion } = await supabase
          .from("completions")
          .select("created_at")
          .eq("user_id", s.id)
          .order("created_at", { ascending: false })
          .limit(1);

        rows.push({
          ...s,
          streaks: streak,
          total_xp: (xp as number) ?? 0,
          completion_count: count ?? 0,
          last_active: lastCompletion?.[0]?.created_at ?? null,
        });
      }

      setStudents(rows);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === "all" || s.cefr_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "CEFR Level", "XP", "Streak", "Completion Rate", "Last Active"];
    const csvRows = [headers.join(",")];

    for (const s of filtered) {
      const lastActive = s.last_active
        ? new Date(s.last_active).toLocaleDateString()
        : "Never";
      csvRows.push(
        [
          `"${s.name ?? ""}"`,
          s.email,
          s.cefr_level ?? "Not placed",
          s.total_xp,
          s.streaks?.current_streak ?? 0,
          s.completion_count,
          lastActive,
        ].join(",")
      );
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexio-students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetPlacement = async (userId: string) => {
    if (!confirm("Reset this student's CEFR level? They'll need to retake the placement test.")) return;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    await supabase
      .from("user_profiles")
      .update({
        cefr_level: null as unknown as CefrLevel,
        placement_test_eligible_at: thirtyDaysFromNow.toISOString(),
      })
      .eq("id", userId);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === userId
          ? { ...s, cefr_level: null as unknown as CefrLevel }
          : s
      )
    );
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
          >
            Manage Assignments
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All levels</option>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition text-sm"
          >
            Export CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-muted-foreground">Loading students...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No students found.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Student</th>
                    <th className="text-left px-4 py-3 font-medium">Level</th>
                    <th className="text-left px-4 py-3 font-medium">XP</th>
                    <th className="text-left px-4 py-3 font-medium">Streak</th>
                    <th className="text-left px-4 py-3 font-medium">Exercises</th>
                    <th className="text-left px-4 py-3 font-medium">Last Active</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.name ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.cefr_level ? (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {s.cefr_level}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not placed</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">{s.total_xp}</td>
                      <td className="px-4 py-3">
                        {s.streaks?.current_streak ? (
                          <span className="flex items-center gap-1">
                            🔥 {s.streaks.current_streak}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td className="px-4 py-3">{s.completion_count}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {s.last_active
                          ? new Date(s.last_active).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleResetPlacement(s.id)}
                          className="text-xs text-destructive hover:text-destructive/80 transition"
                          disabled={!s.cefr_level}
                        >
                          Reset level
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
