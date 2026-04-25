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
  const draggedWord = useRef<string | null>(null);

  const parts = content.sentence.split("___");

  const handleDragStart = (word: string) => {
    draggedWord.current = word;
  };

  const handleDropOnSlot = (slotIndex: number) => {
    if (submitted) return;
    const word = draggedWord.current;
    if (!word) return;
    draggedWord.current = null;

    const prevWord = slots[slotIndex];
    const nextSlots = slots.map((s, i) => (i === slotIndex ? word : s));
    setSlots(nextSlots);

    let bank = [...availableWords];
    if (prevWord) bank.push(prevWord);
    const takeIdx = bank.indexOf(word);
    if (takeIdx !== -1) bank = bank.filter((_, i) => i !== takeIdx);
    setAvailableWords(bank);
    onSelect(nextSlots);
  };

  const handleDropOnWordBank = () => {
    if (submitted) return;
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (submitted) return;
    const word = slots[slotIndex];
    const nextSlots = slots.map((s, i) => (i === slotIndex ? "" : s));
    setSlots(nextSlots);
    if (word) {
      setAvailableWords((prev) => [...prev, word]);
    }
    onSelect(nextSlots);
  };

  return (
    <div className="space-y-6">
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
              key={`${word}-${i}`}
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
          type="button"
          onClick={onSubmit}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Enviar resposta
        </button>
      )}
    </div>
  );
}
