"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VocabFlashcardContent } from "@/types/exercise-content";

interface Props {
  content: VocabFlashcardContent;
  submitted: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

export default function VocabFlashcard({ content, submitted, onSelect, onSubmit }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  // Shuffle options: correct definition + 3 distractors
  const [options] = useState(() => {
    const all = [content.definition, ...content.distractors];
    // Simple shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  });

  const correctIndex = options.indexOf(content.definition);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    onSelect(index === correctIndex ? 0 : index); // 0 means correct
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center">
        <p className="text-2xl font-display font-bold text-primary">{content.term}</p>
      </div>

      <p className="text-muted-foreground text-sm">Selecione a definicao correta:</p>

      <div className="space-y-3">
        {options.map((option, i) => {
          const isCorrect = i === correctIndex;
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
              {option}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="bg-secondary rounded-lg p-4 text-sm">
          <p className="font-medium">
            {selected === correctIndex ? "✓ Correto!" : "✗ Incorreto"}
          </p>
          <p className="text-muted-foreground mt-1">
            <strong>{content.term}</strong>: {content.definition}
          </p>
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
