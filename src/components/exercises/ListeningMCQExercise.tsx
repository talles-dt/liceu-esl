"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ListeningMCQContent } from "@/types/exercise-content";
import { Volume2, Pause } from "lucide-react";

interface Props {
  content: ListeningMCQContent;
  audioUrl: string | null;
  submitted: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

export default function ListeningMCQExercise({
  content,
  audioUrl,
  submitted,
  onSelect,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    onSelect(index);
  };

  return (
    <div className="space-y-6">
      {/* Audio player */}
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">Ouca o audio e responda a pergunta abaixo.</p>
        <button
          onClick={togglePlay}
          disabled={!audioUrl}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all",
            audioUrl
              ? "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
          {isPlaying ? "Pausar" : "Reproduzir audio"}
        </button>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold">{content.question}</h3>

      {/* Options */}
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
