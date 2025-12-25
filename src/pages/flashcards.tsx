// pages/flashcards.tsx
import { useStore } from "@/store/store";
import { useRouter } from "next/router";
import { useState } from "react";
import { Card, CardContent, Button, Typography, Box } from "@mui/material";

export default function FlashcardPage() {
  const router = useRouter();
  const { deckId } = router.query;
  const { decks } = useStore();

  const deck = decks.find((d) => d.id === deckId);

  if (!deck) return <Typography>デッキが見つかりません。</Typography>;
  if (deck.mode !== "flashcard") return <Typography>このデッキはフラッシュカード用ではありません。</Typography>;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck.questions[index];

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>{deck.name} — フラッシュカード</Typography>

      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h5">
            {flipped ? `答え: ${card.answer}` : `質問: ${card.question}`}
          </Typography>

          {flipped && card.explanation && (
            <Typography mt={2}>解説: {card.explanation}</Typography>
          )}

          <Box mt={3}>
            <Button variant="contained" onClick={() => setFlipped(!flipped)} sx={{ mr: 2 }}>
              {flipped ? "質問に戻る" : "答えを見る"}
            </Button>
            <Button variant="outlined" onClick={() => {
              setFlipped(false);
              setIndex((i) => (i + 1) % deck.questions.length);
            }}>
              次のカードへ
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
