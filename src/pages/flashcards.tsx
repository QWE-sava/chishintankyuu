// src/pages/flashcards.tsx
import { useStore } from "@/store/store";
import { useRouter } from "next/router";
import { useState } from "react";
import { Card, CardContent, Button, Typography, Box } from "@mui/material";

export default function FlashcardPage() {
  const router = useRouter();
  const { deckId } = router.query;
  const { decks } = useStore();

  const deck = typeof deckId === "string"
    ? decks.find((d) => d.id === deckId)
    : undefined;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!deck) return <Typography>デッキが見つかりません。</Typography>;

  const card = deck.questions[index];

  const nextCard = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.questions.length);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        {deck.name} — フラッシュカードモード
      </Typography>

      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            {flipped ? `答え: ${card.answer}` : `質問: ${card.question}`}
          </Typography>

          {flipped && card.explanation && (
            <Typography variant="body2" mt={2}>
              解説: {card.explanation}
            </Typography>
          )}

          {/* ✅ ボタンを必ず表示する */}
          <Box mt={3}>
            <Button
              variant="contained"
              onClick={() => setFlipped(!flipped)}
              sx={{ mr: 2 }}
            >
              {flipped ? "質問に戻る" : "答えを見る"}
            </Button>
            <Button variant="outlined" onClick={nextCard}>
              次のカードへ
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 進捗表示 */}
      <Typography variant="body2" color="text.secondary" mt={2}>
        {index + 1} / {deck.questions.length} 枚目
      </Typography>
    </Box>
  );
}
