"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MCQContent } from "@/types/exercise-content";

interface Props {
  content: MCQContent;
  submitted: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

export default function MCQExercise({ content, submitted, onSelect, onSubmit }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    onSelect(index);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{content.question}</h3>
      <div className="space-y-3">
        {content.options.map((option, i) => {
          const isCorrect = i === content.correctIndex;
          const isSelected = i === selected;
          let borderColor = "border-border";
          let bgColor = "bg-card";

          if (submitted) {
            if (isCorrect) {
              borderColor = "border-success";
              bgColor = "bg-success/10";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-destructive";
              bgColor = "bg-destructive/10";
            }
          } else if (isSelected) {
            borderColor = "border-primary";
            bgColor = "bg-primary/10";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                borderColor,
                bgColor,
                "hover:border-primary/50",
                submitted && "cursor-default"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                    submitted && isCorrect
                      ? "border-success bg-success text-white"
                      : submitted && isSelected && !isCorrect
                      ? "border-destructive bg-destructive text-white"
                      : isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {submitted && content.explanation && (
        <div className="bg-secondary rounded-lg p-4 text-sm">
          <p className="font-medium mb-1">
            {selected === content.correctIndex ? "✓ Correto!" : "✗ Incorreto"}
          </p>
          <p className="text-muted-foreground">{content.explanation}</p>
        </div>
      )}

      {!submitted && selected !== null && (
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Enviar resposta
        </button>
      )}
    </div>
  );
}
