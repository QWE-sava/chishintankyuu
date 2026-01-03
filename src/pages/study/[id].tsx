"use client";

import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { decks, getWeakCards } = useStore();

  const [hydrated, setHydrated] = useState(false);
  const [deck, setDeck] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof id !== "string") return;

    const found = decks.find((d) => d.id === id);
    setDeck(found ?? null);

    if (found) {
      const weak = getWeakCards(found.id);
      setQuestions(weak);
    }
  }, [hydrated, id, decks, getWeakCards]);

  if (!hydrated) return <p>読み込み中...</p>;
  if (!deck) return <p>デッキが見つかりません</p>;
  if (questions.length === 0) return <p>復習対象のカードはありません</p>;

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const question = questions[index];

  const next = () => {
    setShowAnswer(false);
    setSelected(null);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const prev = () => {
    setShowAnswer(false);
    setSelected(null);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>{deck.name} の復習</h1>
      <p>
        {index + 1} / {questions.length}
      </p>

      {deck.mode === "flashcard" && (
        <div
          onClick={() => setShowAnswer((v) => !v)}
          style={{
            border: "1px solid #ccc",
            padding: "24px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "24px",
            background: "#fafafa",
          }}
        >
          {!showAnswer ? (
            <h2>{question.question}</h2>
          ) : (
            <h2 style={{ color: "#0070f3" }}>{question.answer}</h2>
          )}
        </div>
      )}

      {deck.mode === "quiz" && (
        <div style={{ marginBottom: "24px" }}>
          <h2>{question.question}</h2>
          {question.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                margin: "8px 0",
                background:
                  selected === null
                    ? "#eee"
                    : opt === question.answer
                    ? "#c8f7c5"
                    : selected === opt
                    ? "#f7c5c5"
                    : "#eee",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={prev} disabled={index === 0}>
          前へ
        </button>
        <button onClick={next} disabled={index === questions.length - 1}>
          次へ
        </button>
      </div>
    </div>
  );
}
