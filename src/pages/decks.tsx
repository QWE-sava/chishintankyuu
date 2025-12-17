// src/pages/decks.tsx
import React from "react";
import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";

export default function DecksPage() {
  const router = useRouter();
  const { decks, getSummary } = useStore();

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
                  >
                    苦手カードを復習
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
