// pages/index.tsx
import React from "react";
import { useStore } from "@/store/store";
import { Box, Stack, Typography, Button, Card, CardContent } from "@mui/material";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const { getDeckByMode } = useStore();

  const quizDecks = getDeckByMode("quiz");
  const flashDecks = getDeckByMode("flashcard");
  const reviewDecks = getDeckByMode("review");

  return (
    <Stack gap={4} p={4}>
      <Typography variant="h4">学習ダッシュボード</Typography>

      {/* クイズカード */}
      <Box>
        <Typography variant="h5" mb={2}>クイズカード</Typography>
        <Stack gap={2}>
          {quizDecks.map((deck) => (
            <Card key={deck.id}>
              <CardContent>
                <Typography variant="h6">{deck.name}</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => router.push(`/study?deckId=${deck.id}`)}
                >
                  クイズで学習
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* フラッシュカード */}
      <Box>
        <Typography variant="h5" mb={2}>フラッシュカード</Typography>
        <Stack gap={2}>
          {flashDecks.map((deck) => (
            <Card key={deck.id}>
              <CardContent>
                <Typography variant="h6">{deck.name}</Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => router.push(`/flashcards?deckId=${deck.id}`)}
                >
                  フラッシュカードで暗記
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* 苦手カード復習 */}
      <Box>
        <Typography variant="h5" mb={2}>復習デッキ</Typography>
        <Stack gap={2}>
          {reviewDecks.map((deck) => (
            <Card key={deck.id}>
              <CardContent>
                <Typography variant="h6">{deck.name}</Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => router.push(`/review?deckId=${deck.id}`)}
                >
                  苦手カードを復習
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
