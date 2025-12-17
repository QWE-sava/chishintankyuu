import { useStore } from "@/store/store";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";

export default function ReviewPage() {
  const { decks, weakCards, recordStudy } = useStore();
  const deck = decks[0];
  const weakIds = deck
    ? deck.cards
        .filter(c => weakCards.some(w => w.cardId === c.id && w.deckId === deck.id))
        .map(c => c.id)
    : [];

  const [localOrder] = useState(weakIds);
  const [index, setIndex] = useState(0);
  const card = useMemo(() => deck?.cards.find(c => c.id === localOrder[index]), [deck, localOrder, index]);

  const [answered, setAnswered] = useState<{ chosen?: string; correct?: boolean }>({});

  if (!deck || weakIds.length === 0) {
    return <Typography>復習対象のカードがありません。学習モードで不正解カードを増やすか、設定を見直してください。</Typography>;
  }

  const onChoose = (opt: string) => {
    if (!card) return;
    const correct = opt === card.answer;
    recordStudy(deck.id, card.id, correct);
    setAnswered({ chosen: opt, correct });
  };

  const next = () => {
    setAnswered({});
    setIndex(i => (i + 1) % localOrder.length);
  };

  return (
    <Stack gap={2}>
      <Typography variant="h5">{deck.name} — 復習モード</Typography>
      <Typography variant="body2">進捗: {index + 1} / {localOrder.length}</Typography>

      {card && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>質問: {card.question}</Typography>
            <Stack gap={1}>
              {(card.options ?? []).map((opt) => {
                const isCorrect = answered.chosen === opt && answered.correct;
                const isWrong = answered.chosen === opt && answered.correct === false;
                return (
                  <Button
                    key={opt}
                    variant="contained"
                    color={isCorrect ? "success" : isWrong ? "error" : "primary"}
                    onClick={() => onChoose(opt)}
                    disabled={!!answered.chosen}
                  >
                    {opt}
                  </Button>
                );
              })}
            </Stack>

            {answered.chosen && (
              <Box mt={2}>
                <Typography variant="subtitle1">
                  {answered.correct ? "正解！" : `不正解… 正しい答えは ${card.answer}`}
                </Typography>
                {card.explanation && <Typography variant="body2" mt={1}>解説: {card.explanation}</Typography>}
                <Button sx={{ mt: 2 }} variant="outlined" onClick={next}>次の問題へ</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
