"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FillBlankContent } from "@/types/exercise-content";

interface Props {
  content: FillBlankContent;
  submitted: boolean;
  onSelect: (answer: string[]) => void;
  onSubmit: () => void;
}

export default function FillBlankExercise({ content, submitted, onSelect, onSubmit }: Props) {
  const blankCount = (content.sentence.match(/___/g) || []).length;
  const [answers, setAnswers] = useState<string[]>(
    Array.from({ length: Math.max(blankCount, 1) }, () => "")
  );

  const handleChange = (index: number, value: string) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onSelect(newAnswers);
  };

  const parts = content.sentence.split("___");

  return (
    <div className="space-y-6">
      <div className="text-lg leading-loose">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) => handleChange(i, e.target.value)}
                disabled={submitted}
                placeholder="..."
                className={cn(
                  "inline-block w-32 mx-1 px-2 py-1 bg-input border-2 rounded text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary",
                  submitted && answers[i]?.toLowerCase().trim() === content.answers[i]?.toLowerCase().trim()
                    ? "border-success bg-success/10"
                    : submitted
                    ? "border-destructive bg-destructive/10"
                    : "border-border"
                )}
              />
            )}
          </span>
        ))}
      </div>

      {submitted && content.explanation && (
        <div className="bg-secondary rounded-lg p-4 text-sm">
          <p className="font-medium mb-1">
            {answers.every((a, i) => a.toLowerCase().trim() === content.answers[i]?.toLowerCase().trim())
              ? "✓ Correct!"
              : "✗ Incorrect"}
          </p>
          <p className="text-muted-foreground">
            Answer: {content.answers.join(", ")}
          </p>
          {content.explanation && <p className="text-muted-foreground mt-1">{content.explanation}</p>}
        </div>
      )}

      {!submitted && answers.every((a) => a.trim().length > 0) && (
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Submit answer
        </button>
      )}
    </div>
  );
}
