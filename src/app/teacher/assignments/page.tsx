"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exercise, UserProfile } from "@/types/database";
import { useRouter } from "next/navigation";

export default function AssignmentsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: exData } = await supabase
        .from("exercises")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: stData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      setExercises(exData ?? []);
      setStudents(stData ?? []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map((s) => s.id));
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedExercises.length === 0 || selectedStudents.length === 0) return;

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("assignments").insert({
      teacher_id: user.id,
      title: title.trim(),
      exercise_ids: selectedExercises,
      student_ids: selectedStudents,
      due_date: dueDate || null,
    });

    if (error) {
      console.error(error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/teacher");
    }, 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/teacher")}
            className="text-muted-foreground hover:text-foreground transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Create Assignment</h1>
        </div>

        {success && (
          <div className="bg-success/10 border border-success/20 text-success rounded-lg p-3 text-sm">
            Assignment created! Redirecting...
          </div>
        )}

        {/* Title */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Business Vocabulary - Week 1"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1 block">Due Date (optional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>

        {/* Exercise Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              Select Exercises ({selectedExercises.length} selected)
            </h2>
          </div>

          {exercises.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No approved exercises yet. Generate and approve some first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {exercises.map((ex) => (
                <label
                  key={ex.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedExercises.includes(ex.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(ex.id)}
                    onChange={() => toggleExercise(ex.id)}
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {ex.cefr_level}
                    </span>
                    <span className="text-muted-foreground text-xs">{ex.type}</span>
                    <span className="truncate">{ex.skill}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Student Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              Assign To ({selectedStudents.length}/{students.length} students)
            </h2>
            <button
              onClick={selectAllStudents}
              className="text-xs text-primary hover:text-primary/80 transition"
            >
              Select all
            </button>
          </div>

          {students.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {students.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedStudents.includes(s.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                    className="accent-primary"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{s.name ?? "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            submitting ||
            !title.trim() ||
            selectedExercises.length === 0 ||
            selectedStudents.length === 0
          }
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {submitting ? "Creating..." : `Assign to ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </main>
  );
}
