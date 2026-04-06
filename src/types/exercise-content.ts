// ============================================================
// Exercise content schemas — what Claude returns and what DB stores
// ============================================================

export interface MCQContent {
  question: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
  explanation: string;
}

export interface FillBlankContent {
  sentence: string; // use ___ for blanks
  answers: string[]; // one per blank
  explanation: string;
}

export interface VocabFlashcardContent {
  term: string;
  definition: string;
  distractors: string[]; // 3 wrong definitions
}

export interface VocabDragContent {
  sentence: string; // use ___ for slots
  words: string[]; // all words including distractors
  correctOrder: string[]; // correct words in order for the blanks
}

export interface ListeningMCQContent {
  // Text for TTS generation
  transcript: string;
  // Comprehension question about the transcript
  question: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
  explanation: string;
}

export type ExerciseContent =
  | MCQContent
  | FillBlankContent
  | VocabFlashcardContent
  | VocabDragContent
  | ListeningMCQContent;

// ============================================================
// Generation request/response types
// ============================================================

export interface GenerateExerciseRequest {
  topic: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skill: 'grammar' | 'vocabulary' | 'listening' | 'reading';
  exercise_type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq';
  count: number;
}

export interface GeneratedExercise {
  type: string;
  cefr_level: string;
  skill: string;
  content: ExerciseContent;
}

export interface GenerateExerciseResponse {
  exercises: GeneratedExercise[];
  exerciseIds: string[];
  count: number;
}
