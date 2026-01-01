import { Deck, Question } from "@/types/deck";

export async function importAnkiDeck(file: File): Promise<Deck> {
  const text = await file.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const questions: Question[] = lines.map((line) => {
    const [q, a] = line.split("\t");
    return {
      id: crypto.randomUUID(),
      question: q,
      answer: a ?? "",
      options: [],
    };
  });

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(".txt", ""),
    mode: "flashcard",
    questions,
  };
}
