"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { VocabDragContent } from "@/types/exercise-content";

interface Props {
  content: VocabDragContent;
  submitted: boolean;
  onSelect: (answer: string[]) => void;
  onSubmit: () => void;
}

export default function VocabDragExercise({ content, submitted, onSelect, onSubmit }: Props) {
  const blankCount = (content.sentence.match(/___/g) || []).length;
  const [slots, setSlots] = useState<string[]>(Array(blankCount).fill(""));
  const [availableWords, setAvailableWords] = useState<string[]>([...content.words]);
  const dragOverSlot = useRef<number | null>(null);

  const parts = content.sentence.split("___");

  const handleDragStart = (word: string) => {
    // Store the word being dragged
    (window as any)._dragWord = word;
  };

  const handleDropOnSlot = (slotIndex: number) => {
    if (submitted) return;
    const word = (window as any)._dragWord;
    if (!word) return;

    // If slot already has a word, return it to available
    const newSlots = [...slots];
    if (newSlots[slotIndex]) {
      setAvailableWords((prev) => [...prev, newSlots[slotIndex]]);
    }
    newSlots[slotIndex] = word;
    setSlots(newSlots);

    // Remove word from available
    setAvailableWords((prev) => prev.filter((w, i) => i !== prev.indexOf(word)));

    onSelect(newSlots);
  };

  const handleDropOnWordBank = () => {
    if (submitted) return;
    // Word returned to bank — do nothing special
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (submitted) return;
    const newSlots = [...slots];
    const word = newSlots[slotIndex];
    if (word) {
      setAvailableWords((prev) => [...prev, word]);
    }
    newSlots[slotIndex] = "";
    setSlots(newSlots);
    onSelect(newSlots);
  };

  return (
    <div className="space-y-6">
      {/* Sentence with drop zones */}
      <div className="text-lg leading-loose">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span
                onDragOver={(e) => {
                  e.preventDefault();
                  dragOverSlot.current = i;
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnSlot(i);
                }}
                onClick={() => slots[i] && handleRemoveFromSlot(i)}
                className={cn(
                  "inline-block min-w-[80px] mx-1 px-2 py-1 border-2 rounded text-center cursor-pointer transition-all",
                  slots[i]
                    ? submitted && slots[i] === content.correctOrder[i]
                      ? "border-success bg-success/10 text-success"
                      : submitted
                      ? "border-destructive bg-destructive/10"
                      : "border-primary bg-primary/10 text-primary"
                    : "border-dashed border-border hover:border-primary/50"
                )}
              >
                {slots[i] || "___"}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <div className="bg-secondary rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
          Arraste as palavras para os espacos (clique em um espaco preenchido para remover)
        </p>
        <div
          className="flex flex-wrap gap-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnWordBank}
        >
          {availableWords.map((word, i) => (
            <span
              key={i}
              draggable
              onDragStart={() => handleDragStart(word)}
              className="px-3 py-2 bg-card border border-border rounded-lg cursor-grab active:cursor-grabbing hover:border-primary/50 transition select-none text-sm"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {submitted && (
        <div className="bg-secondary rounded-lg p-4 text-sm">
          <p className="font-medium">
            {JSON.stringify(slots) === JSON.stringify(content.correctOrder)
              ? "✓ Correto!"
              : "✗ Incorreto"}
          </p>
          <p className="text-muted-foreground mt-1">
            Correto: {content.correctOrder.join(" → ")}
          </p>
        </div>
      )}

      {!submitted && slots.every((s) => s !== "") && (
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
