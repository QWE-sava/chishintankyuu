// src/pages/study.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { Typography, Box, Button } from "@mui/material";

export default function StudyPage() {
  const router = useRouter();
  const { deckId, mode } = router.query;
  const { decks, addHistory, getWeakCards, releaseWeakCard, resetMistake } = useStore();

  const deck = typeof deckId === "string"
    ? decks.find((d) => d.id === deckId)
    : undefined;

  let questions: any[] = [];
  if (deck) {
    if (mode === "weak") {
      questions = getWeakCards(deck.id);
    } else {
      questions = deck.questions;
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [releasedCards, setReleasedCards] = useState<string[]>([]);

  useEffect(() => {
    if (finished) {
      if (mode === "weak" && deck) {
        releasedCards.forEach((qid) => {
          releaseWeakCard(deck.id, qid);
        });
      }
      setTimeout(() => {
        router.push("/decks");
      }, 2000);
    }
  }, [finished, router, mode, deck, releasedCards, releaseWeakCard]);

  if (!deck) return <Typography>デッキが見つかりません。</Typography>;
  if (questions.length === 0) return <Typography>このモードで出題できるカードはありません。</Typography>;

  const current = questions[currentIndex];

  const handleAnswer = (option: string) => {
    const correct = option === current.answer;
    setIsCorrect(correct);
    setAnswered(true);

    // 履歴保存
    addHistory({
      deckId: deck.id,
      questionId: current.id,
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
      timestamp: new Date().toISOString(),
    });

    if (mode === "weak" && correct) {
      // 復習モード → 正解したら解除
      setReleasedCards((prev) => [...prev, current.id]);
    } else if (mode !== "weak" && !correct) {
      // ✅ 通常学習モード → ミスしたら問答無用でリセット
      resetMistake(deck.id, current.id);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setIsCorrect(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        {deck.name} の学習 {mode === "weak" && "(苦手カード復習)"}
      </Typography>

      {!finished ? (
        <>
          <Typography variant="h6" mb={2}>{current.question}</Typography>
          {current.options.map((opt, idx) => (
            <Button
              key={idx}
              variant="outlined"
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              sx={{ mr: 1, mb: 1 }}
            >
              {opt}
            </Button>
          ))}
          {answered && (
            <Box mt={2}>
              <Typography color={isCorrect ? "primary" : "error"}>
                {isCorrect ? "正解！" : `不正解… 正解は「${current.answer}」`}
              </Typography>
              <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
                {currentIndex < questions.length - 1 ? "次の問題へ" : "終了"}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box mt={4}>
          <Typography>学習完了！ダッシュボードに戻ります…</Typography>
          {mode === "weak" && releasedCards.length > 0 && (
            <Typography sx={{ mt: 2 }} color="primary">
              {releasedCards.length} 枚の苦手カードを解除しました！
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
