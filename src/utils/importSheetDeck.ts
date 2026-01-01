import Papa from "papaparse";
import { Deck, Question } from "@/types/deck";

export async function importSheetDeck(sheetId: string): Promise<Deck> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: false });
  const rows = parsed.data as string[][];

  console.log("CSV RAW:", csv);
  console.log("PARSED ROWS:", rows);

  const firstLine = rows[0]?.[0]?.trim() ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

  const dataRows = rows.slice(2); // skip mode + header

  const questions: Question[] = dataRows
    .map((row) => {
      if (!Array.isArray(row)) return null;
      const [q, a, opts] = row;
      if (!q || !a) return null;

      return {
        id: crypto.randomUUID(),
        question: q.trim(),
        answer: a.trim(),
        options: opts?.trim() ? opts.trim().split("||") : [],
      };
    })
    .filter((q) => q !== null) as Question[];

  console.log("FINAL QUESTIONS:", questions);

  return {
    id: crypto.randomUUID(),
    name: `Sheet-${sheetId}`,
    mode,
    questions,
  };
}
