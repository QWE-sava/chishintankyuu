"use client";

import { useStore } from "@/store/store";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useRouter } from "next/router";

export default function TodayPage() {
  const router = useRouter();
  const { decks, getTodayCards } = useStore();

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        今日やること
      </Typography>

      {decks.length === 0 && (
        <Typography>まだデッキがありません。設定画面からインポートしてください。</Typography>
      )}

      {decks.map((deck) => {
        const cards = getTodayCards(deck.id);

        return (
          <Card key={deck.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5">{deck.name}</Typography>

              <Box mt={2}>
                <Typography>今日のカード: {cards.length} 枚</Typography>
              </Box>

              <Box mt={2}>
                {cards.length > 0 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push(`/study?deckId=${deck.id}`)}
                  >
                    学習を始める
                  </Button>
                ) : (
                  <Typography color="text.secondary">
                    今日はやることはありません
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
