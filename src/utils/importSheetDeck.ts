import Papa from "papaparse";
import { Deck, Question } from "@/types/deck";

export async function importSheetDeck(sheetId: string): Promise<Deck> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: false });
  const rows = parsed.data as string[][];

  // --- 1行目でモードを指定 ---
  const firstLine = rows[0]?.[0] ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

  // --- 2行目以降をデータとして扱う ---
  const dataRows = rows.slice(1);

  const questions: Question[] = dataRows
    .map((row) => {
      if (!row || row.length === 0) return null;

      const question = row[0]?.trim();
      const answer = row[1]?.trim();
      const options = row[2]?.trim();

      if (!question || !answer) return null;

      return {
        id: crypto.randomUUID(),
        question,
        answer,
        options: options ? options.split("||") : [],
      };
    })
    .filter(Boolean) as Question[];

  return {
    id: crypto.randomUUID(),
    name: `Sheet-${sheetId}`,
    mode,
    questions,
  };
}
