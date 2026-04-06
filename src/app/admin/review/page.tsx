"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Exercise } from "@/types/database";
import GenerateForm from "@/components/admin/GenerateForm";
import MCQExercise from "@/components/exercises/MCQExercise";
import FillBlankExercise from "@/components/exercises/FillBlankExercise";
import VocabFlashcard from "@/components/exercises/VocabFlashcard";
import VocabDragExercise from "@/components/exercises/VocabDragExercise";
import ListeningMCQExercise from "@/components/exercises/ListeningMCQExercise";
import type { ExerciseContent, ListeningMCQContent } from "@/types/exercise-content";

export default function AdminReviewPage() {
  const [drafts, setDrafts] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setDrafts(data ?? []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/exercises/${id}/approve`, { method: "POST" });
    if (res.ok) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    await supabase.from("exercises").delete().eq("id", id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleGenerated = (ids: string[]) => {
    // Refresh drafts
    const load = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setDrafts((prev) => [...(data ?? []), ...prev]);
    };
    load();
  };

  const renderPreview = (exercise: Exercise) => {
    const content = exercise.content as unknown as ExerciseContent;

    switch (exercise.type) {
      case "mcq":
        return <MCQExercise content={content as any} submitted={false} onSelect={() => {}} onSubmit={() => {}} />;
      case "fill_blank":
        return <FillBlankExercise content={content as any} submitted={false} onSelect={() => {}} onSubmit={() => {}} />;
      case "vocab_flashcard":
        return <VocabFlashcard content={content as any} submitted={false} onSelect={() => {}} onSubmit={() => {}} />;
      case "vocab_drag":
        return <VocabDragExercise content={content as any} submitted={false} onSelect={() => {}} onSubmit={() => {}} />;
      case "listening_mcq":
        return (
          <ListeningMCQExercise
            content={content as ListeningMCQContent}
            audioUrl={exercise.audio_url}
            submitted={false}
            onSelect={() => {}}
            onSubmit={() => {}}
          />
        );
      default:
        return <pre className="text-xs overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Exercise Review Queue</h1>

        <GenerateForm onGenerated={handleGenerated} />

        {loading ? (
          <p className="text-muted-foreground">Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <p className="text-muted-foreground">No draft exercises. Generate some above.</p>
        ) : (
          <div className="space-y-6">
            {drafts.map((ex) => (
              <div key={ex.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase">
                      {ex.cefr_level}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                      {ex.skill}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                      {ex.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(ex.id)}
                      className="px-4 py-1.5 bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(ex.id)}
                      className="px-4 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  {renderPreview(ex)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
