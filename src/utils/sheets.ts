// 注意: ブラウザからGoogle Sheets APIを直接叩く場合はOAuthなどの認可が必要です。
// ここではデータ変換ヘルパーのみを提供し、API呼び出しはサーバー側やApps Script経由などで設計してください。

type Row = string[];

export type SheetRow = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export const rowsToDeckCards = (rows: Row[]): SheetRow[] => {
  // 列構造: A:質問 B:選択肢1 C:選択肢2 D:選択肢3 E:選択肢4 F:正解 G:解説
  return rows.map((row) => ({
    question: row[0],
    options: [row[1], row[2], row[3], row[4]].filter(Boolean),
    answer: row[5],
    explanation: row[6]
  }));
};
