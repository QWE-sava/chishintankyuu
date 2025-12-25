// types/deck.ts
export type DeckMode = "quiz" | "flashcard" | "review";

export type Question = {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
};

export type Deck = {
  id: string;
  name: string;
  mode: DeckMode;
  questions: Question[];
};
