import { Deck, Question } from "@/types/deck";

export async function importExcelDeck(file: File): Promise<Deck> {
  // ブラウザ側で xlsx を読み込む（npm 不要）
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);

  // 最初のシートを読み込む
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 2次元配列として読み込む
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  });

  // --- 1行目でモードを指定 ---
  const firstLine = rows[0]?.[0] ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

  // --- 2行目以降をデータとして扱う ---
  const dataRows = rows.slice(1);

  const questions: Question[] = dataRows
    .filter((row) => row.length >= 2 && row[0])
    .map((row) => ({
      id: crypto.randomUUID(),
      question: row[0],
      answer: row[1],
      options: row[2] ? row[2].split("||") : [],
    }));

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(".xlsx", ""),
    mode,
    questions,
  };
}
