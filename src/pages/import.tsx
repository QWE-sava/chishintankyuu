"use client";

import { useState } from "react";
import { importWordDeck } from "@/utils/importWordDeck";
import { importSheetDeck } from "@/utils/importSheetDeck";
import { importAnkiDeck } from "@/utils/importAnkiDeck";
import { importExcelDeck } from "@/utils/importExcelDeck";
import { generateDeckWithGroq } from "@/utils/aiGenerator";
import { useStore } from "@/store/store";

export default function ImportPage() {
  const { upsertDeck, groqApiKey } = useStore();
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiMode, setAiMode] = useState<"flashcard" | "quiz">("flashcard");

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

  const handleAiGenerate = async () => {
    if (!aiText.trim()) {
      alert("テキストを入力してください");
      return;
    }
    if (!groqApiKey) {
      alert("設定画面からGroq APIキーを登録してください");
      return;
    }

    setLoading(true);
    try {
      const deck = await generateDeckWithGroq(aiText, groqApiKey, "AI生成デッキ", aiMode);
      upsertDeck(deck);
      alert("AIでデッキを生成しました！");
      setAiText("");
    } catch (err: any) {
      console.error("AI GENERATE ERROR:", err);
      alert("生成に失敗しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>デッキをインポート</h1>

      {loading && <p>読み込み中...</p>}

      {/* AI自動生成 */}
      <section style={{ marginBottom: "32px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h2>AIで自動生成 (Groq)</h2>
        <p style={{ fontSize: "14px", color: "#666" }}>学習したい文章を貼り付けてください</p>
        <textarea
          rows={6}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px" }}
          placeholder="英語の記事や、歴史のテキストなどを貼り付けてください..."
        />
        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          <select 
            value={aiMode} 
            onChange={(e) => setAiMode(e.target.value as "flashcard" | "quiz")}
            style={{ padding: "8px" }}
          >
            <option value="flashcard">フラッシュカード</option>
            <option value="quiz">クイズ (4択)</option>
          </select>
          <button type="button" onClick={handleAiGenerate} disabled={!groqApiKey}>
            自動生成する
          </button>
        </div>
        {!groqApiKey && (
          <p style={{ color: "red", fontSize: "12px" }}>※設定画面でAPIキーを登録してください</p>
        )}
      </section>

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
