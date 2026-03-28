// src/pages/decks.tsx
import React from "react";
import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { unparse } from "papaparse";

export default function DecksPage() {
  const router = useRouter();
  const { decks, getSummary, getTodayCards } = useStore();

  const handleExportJSON = (deck: any) => {
    const jsonString = JSON.stringify(deck, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.href = url;
    dlAnchorElem.download = `${deck.name}.json`;
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    document.body.removeChild(dlAnchorElem);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (deck: any) => {
    const csvData = deck.questions.map((q: any) => ({
      question: q.question,
      answer: q.answer,
      options: q.options ? q.options.join("|") : "",
      explanation: q.explanation || ""
    }));
    const csvStr = unparse(csvData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvStr], { type: "text/csv;charset=utf-8" }); // BOM追加で文字化け防止
    const url = URL.createObjectURL(blob);

    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.href = url;
    dlAnchorElem.download = `${deck.name}.csv`;
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    document.body.removeChild(dlAnchorElem);
    URL.revokeObjectURL(url);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        学習ダッシュボード
      </Typography>

      {decks.length === 0 && (
        <Typography>まだデッキがありません。設定画面からインポートしてください。</Typography>
      )}

      {decks.map((deck) => {
        const summary = getSummary(deck.id);
        const todayCards = getTodayCards(deck.id);
        const todayCount = todayCards.length;

        return (
          <Card key={deck.id} sx={{ mb: 3, border: todayCount > 0 ? "2px solid #0070f3" : undefined }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h5">{deck.name}</Typography>
                {todayCount > 0 && (
                  <Box
                    sx={{
                      background: "#0070f3",
                      color: "#fff",
                      borderRadius: "12px",
                      px: 1.5,
                      py: 0.3,
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    🔔 今日の復習 {todayCount}枚
                  </Box>
                )}
              </Box>
              <Box mt={2}>
                <Typography>学習進捗: {summary.studiedCards} / {summary.totalCards}</Typography>
                <Typography>進捗率: {summary.progressPercent}%</Typography>
                <Typography>正解率: {summary.accuracyPercent}%</Typography>
                <Typography>苦手カード: {summary.weakCardsCount} 枚</Typography>
                <Typography>
                  最終学習:{" "}
                  {summary.lastStudied
                    ? new Date(summary.lastStudied).toLocaleString("ja-JP")
                    : "未学習"}
                </Typography>
              </Box>

              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {todayCount > 0 && (
                  <Button
                    variant="contained"
                    sx={{ background: "#0070f3", "&:hover": { background: "#005fd4" } }}
                    onClick={() => router.push(`/study?deckId=${deck.id}&mode=review`)}
                  >
                    🔔 今日の復習を開始 ({todayCount}枚)
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={() => router.push(`/study?deckId=${deck.id}`)}
                >
                  全カードを学習
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => handleExportJSON(deck)}
                  sx={{ mr: 2 }}
                >
                  JSONで出力
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => handleExportCSV(deck)}
                >
                  CSVで出力
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
