import * as XLSX from "xlsx";
import { Deck, Question } from "@/types/deck";

export async function importExcelDeck(file: File): Promise<Deck> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  });

  const firstLine = rows[0]?.[0] ?? "";
  const mode = firstLine.includes("quiz") ? "quiz" : "flashcard";

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
