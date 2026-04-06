"use client";

import { useState } from "react";
import type { Exercise } from "@/types/database";
import type { ExerciseContent } from "@/types/exercise-content";
import MCQExercise from "./MCQExercise";
import FillBlankExercise from "./FillBlankExercise";
import VocabFlashcard from "./VocabFlashcard";
import VocabDragExercise from "./VocabDragExercise";
import ListeningMCQExercise from "./ListeningMCQExercise";

interface Props {
  exercise: Exercise;
  onComplete: (answer: unknown, correct: boolean) => void;
}

export default function ExerciseRenderer({ exercise, onComplete }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState<unknown>(null);

  const content = exercise.content as unknown as ExerciseContent;

  const handleSubmit = async () => {
    setSubmitted(true);
    onComplete(answer, true); // correctness determined server-side
  };

  switch (exercise.type) {
    case "mcq":
      return (
        <MCQExercise
          content={content as any}
          submitted={submitted}
          onSelect={(idx) => setAnswer(idx)}
          onSubmit={handleSubmit}
        />
      );

    case "fill_blank":
      return (
        <FillBlankExercise
          content={content as any}
          submitted={submitted}
          onSelect={(ans) => setAnswer(ans)}
          onSubmit={handleSubmit}
        />
      );

    case "vocab_flashcard":
      return (
        <VocabFlashcard
          content={content as any}
          submitted={submitted}
          onSelect={(idx) => setAnswer(idx)}
          onSubmit={handleSubmit}
        />
      );

    case "vocab_drag":
      return (
        <VocabDragExercise
          content={content as any}
          submitted={submitted}
          onSelect={(ans) => setAnswer(ans)}
          onSubmit={handleSubmit}
        />
      );

    case "listening_mcq":
      return (
        <ListeningMCQExercise
          content={content as any}
          audioUrl={exercise.audio_url}
          submitted={submitted}
          onSelect={(idx) => setAnswer(idx)}
          onSubmit={handleSubmit}
        />
      );

    default:
      return <p className="text-muted-foreground">Unknown exercise type.</p>;
  }
}
