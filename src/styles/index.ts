// src/types/index.ts
export type Deck = {
  id: string;
  title: string;
  description?: string;
  cards: { id: string; question: string; answer: string }[];
};
