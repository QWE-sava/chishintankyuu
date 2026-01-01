import mammoth from "mammoth";
import { Deck, Question } from "@/types/deck";

export async function importWordDeck(file: File): Promise<Deck> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const questions: Question[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    questions.push({
      id: crypto.randomUUID(),
      question: lines[i],
      answer: lines[i + 1] ?? "",
      options: [],
    });
  }

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(".docx", ""),
    mode: "flashcard",
    questions,
  };
}
