import Papa from "papaparse";
import { Deck, Question } from "@/types/deck";

export async function importSheetDeck(sheetId: string): Promise<Deck> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: true });
  const rows = parsed.data as any[];

  const questions: Question[] = rows.map((row) => ({
    id: crypto.randomUUID(),
    question: row.question,
    answer: row.answer,
    options: row.options ? row.options.split("||") : [],
  }));

  return {
    id: crypto.randomUUID(),
    name: `Sheet-${sheetId}`,
    mode: "quiz",
    questions,
  };
}
