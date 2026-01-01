import Papa from "papaparse";
import { Deck, Question } from "@/types/deck";

export async function importSheetDeck(sheetId: string): Promise<Deck> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: false });
  const rows = parsed.data as string[][];

  // --- 1行目でモードを指定 ---
  const firstLine = rows[0]?.[0]?.trim() ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

  // --- 2行目はヘッダーなのでスキップ ---
  const dataRows = rows.slice(2);

  const questions: Question[] = dataRows
    .map((row) => {
      const [q, a, opts] = row.map((cell) => cell?.trim() ?? "");
      if (!q || !a) return null;

      return {
        id: crypto.randomUUID(),
        question: q,
        answer: a,
        options: opts ? opts.split("||") : [],
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
