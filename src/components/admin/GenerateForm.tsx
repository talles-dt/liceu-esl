"use client";

import { useState } from "react";
import type { CefrLevel, ExerciseSkill, ExerciseType } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS: ExerciseSkill[] = ["grammar", "vocabulary", "listening", "reading"];
const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "vocab_flashcard", label: "Vocabulary Flashcard" },
  { value: "vocab_drag", label: "Vocabulary Drag & Drop" },
  { value: "listening_mcq", label: "Listening MCQ" },
];

interface Props {
  onGenerated: (ids: string[]) => void;
}

export default function GenerateForm({ onGenerated }: Props) {
  const [topic, setTopic] = useState("");
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>("B1");
  const [skill, setSkill] = useState<ExerciseSkill>("grammar");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("mcq");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          cefr_level: cefrLevel,
          skill,
          exercise_type: exerciseType,
          count,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      onGenerated(data.exerciseIds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold">Generate Exercises</h3>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Business meetings, Travel, Food"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CEFR Level</label>
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as CefrLevel)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as ExerciseSkill)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SKILLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Count</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? "Generating..." : `Generate ${count} exercise${count > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
