// utils/importDeck.ts
import { Deck } from "@/types/deck";

export async function loadDeckFromSheet(sheetId: string, mode: "quiz" | "flashcard") {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const text = await res.text();

  const rows = text.split("\n").map((line) => line.split(","));
  const [header, ...data] = rows;

  const questions = data.map((row) => ({
    id: row[0],
    question: row[1],
    options: row[2] ? row[2].split("|") : [],
    answer: row[3],
    explanation: row[4],
  }));

  const deck: Deck = {
    id: sheetId,
    name: "インポートデッキ",
    mode,
    questions,
  };

  return deck;
}
