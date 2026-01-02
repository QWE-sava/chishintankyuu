"use client";

import { useState } from "react";
import { importWordDeck } from "@/utils/importWordDeck";
import { importSheetDeck } from "@/utils/importSheetDeck";
import { importAnkiDeck } from "@/utils/importAnkiDeck";
import { importExcelDeck } from "@/utils/importExcelDeck";
import { useStore } from "@/store/store";

export default function ImportPage() {
  const { upsertDeck } = useStore();
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    console.log("handleFile CALLED:", file.name);

    setLoading(true);
    try {
      let deck;

      if (file.name.endsWith(".docx")) {
        deck = await importWordDeck(file);
      } else if (file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        deck = await importAnkiDeck(file);
      } else if (file.name.endsWith(".xlsx")) {
        deck = await importExcelDeck(file);
      } else {
        alert("対応していないファイル形式です");
        return;
      }

      console.log("IMPORTED DECK:", deck);

      upsertDeck(deck);
      alert("デッキをインポートしました！");
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      alert("インポート中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSheet = async () => {
    console.log("handleSheet CALLED");

    if (!sheetId) {
      alert("シートIDを入力してください");
      return;
    }

    setLoading(true);
    try {
      const deck = await importSheetDeck(sheetId);
      console.log("DECK FROM SHEET:", deck);

      upsertDeck(deck);
      alert("Googleスプレッドシートからインポートしました！");
    } catch (err) {
      console.error("SHEET IMPORT ERROR:", err);
      alert("スプレッドシートの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>デッキをインポート</h1>

      {loading && <p>読み込み中...</p>}

      {/* Word */}
      <section style={{ marginBottom: "32px" }}>
        <h2>Word (.docx)</h2>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </section>

      {/* Anki */}
      <section style={{ marginBottom: "32px" }}>
        <h2>Anki (.txt / .csv)</h2>
        <input
          type="file"
          accept=".txt,.csv"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </section>

      {/* Excel */}
      <section style={{ marginBottom: "32px" }}>
        <h2>Excel (.xlsx)</h2>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </section>

      {/* Google Sheets */}
      <section style={{ marginBottom: "32px" }}>
        <h2>Googleスプレッドシート</h2>
        <input
          type="text"
          placeholder="シートIDを入力"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <button type="button" onClick={handleSheet}>
          インポート
        </button>
      </section>
    </div>
  );
}
