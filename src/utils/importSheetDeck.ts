import Papa from "papaparse";
import { Deck, Question } from "@/types/deck";

export async function importSheetDeck(sheetId: string): Promise<Deck> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: false });
  const rows = parsed.data as string[][];

  // --- 1行目でモードを指定 ---
  // 例: ["mode: flashcard"]
  const firstLine = rows[0]?.[0] ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

  // --- 2行目以降をデータとして扱う ---
  const dataRows = rows.slice(1);

  const questions: Question[] = dataRows
    .filter((row) => row.length >= 2 && row[0]) // question がある行だけ
    .map((row) => ({
      id: crypto.randomUUID(),
      question: row[0],
      answer: row[1],
      options: row[2] ? row[2].split("||") : [],
    }));

  return {
    id: crypto.randomUUID(),
    name: `Sheet-${sheetId}`,
    mode,
    questions,
  };
}
