import { useState } from "react";
import { importWordDeck } from "@/utils/importWordDeck";
import { importSheetDeck } from "@/utils/importSheetDeck";
import { importAnkiDeck } from "@/utils/importAnkiDeck";
import { useStore } from "@/store/store";

export default function ImportPage() {
  const { upsertDeck } = useStore();
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      let deck;

      if (file.name.endsWith(".docx")) {
        deck = await importWordDeck(file);
      } else if (file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        deck = await importAnkiDeck(file);
      } else {
        alert("対応していないファイル形式です");
        return;
      }

      upsertDeck(deck);
      alert("デッキをインポートしました！");
    } catch (err) {
      console.error(err);
      alert("インポート中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSheet = async () => {
    if (!sheetId) {
      alert("シートIDを入力してください");
      return;
    }

    setLoading(true);
    try {
      const deck = await importSheetDeck(sheetId);
      upsertDeck(deck);
      alert("Googleスプレッドシートからインポートしました！");
    } catch (err) {
      console.error(err);
      alert("スプレッドシートの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>デッキをインポート</h1>

      {loading && <p>読み込み中...</p>}

      <section style={{ marginBottom: "32px" }}>
        <h2>Word (.docx)</h2>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>Anki (.txt / .csv)</h2>
        <input
          type="file"
          accept=".txt,.csv"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>Googleスプレッドシート</h2>
        <input
          type="text"
          placeholder="シートIDを入力"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <button onClick={handleSheet}>インポート</button>
      </section>
    </div>
  );
}
