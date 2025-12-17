import { ImportDeckJSON, Deck } from "@/types";

export const importDeckFromJSON = (json: string): Deck => {
  const parsed: ImportDeckJSON = JSON.parse(json);
  const deck: Deck = {
    id: parsed.deckId,
    name: parsed.deckName,
    cards: parsed.questions.map((q, idx) => ({
      id: q.id || `q-${idx}`,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      accuracy: 0,
      attempts: 0
    })),
    createdAt: parsed.meta?.importedAt
  };
  return deck;
};

export const exportDeckToJSON = (deck: Deck): string => {
  const json = {
    deckId: deck.id,
    deckName: deck.name,
    questions: deck.cards.map(c => ({
      id: c.id,
      question: c.question,
      options: c.options ?? [],
      answer: c.answer,
      explanation: c.explanation
    })),
    meta: { source: "json", importedAt: new Date().toISOString() }
  };
  return JSON.stringify(json, null, 2);
};
