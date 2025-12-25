// src/types/deck.ts
export type DeckMode = "quiz" | "flashcard" | "review";

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Deck {
  id: string;
  name: string;
  mode: DeckMode;
  questions: Question[];
}
