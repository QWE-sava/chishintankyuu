// src/pages/decks.tsx
import React from "react";
import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { unparse } from "papaparse";

export default function DecksPage() {
  const router = useRouter();
  const { decks, getSummary } = useStore();

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

        return (
          <Card key={deck.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5">{deck.name}</Typography>

              <Box mt={2}>
                <Typography>学習進捗: {summary.studiedCards} / {summary.totalCards}</Typography>
                <Typography>進捗率: {summary.progressPercent}%</Typography>
                <Typography>正解率: {summary.accuracyPercent}%</Typography>
                <Typography>復習履歴: {summary.reviewCount} 回</Typography>
                <Typography>最終学習: {summary.lastStudied ?? "未学習"}</Typography>
                <Typography>苦手カード: {summary.weakCardsCount} 枚</Typography>
              </Box>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/study?deckId=${deck.id}`)}
                  sx={{ mr: 2 }}
                >
                  学習開始
                </Button>

                {summary.weakCardsCount > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => router.push(`/study?deckId=${deck.id}&mode=weak`)}
                    sx={{ mr: 2 }}
                  >
                    苦手カードを復習
                  </Button>
                )}

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
