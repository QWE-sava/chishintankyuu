"use client";

import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";

export default function StudyPage() {
  const router = useRouter();
  const { id } = router.query;
  const { decks } = useStore();

  const [hydrated, setHydrated] = useState(false);
  const [deck, setDeck] = useState<any>(null);

  // Zustand persist の復元を待つ
  useEffect(() => {
    setHydrated(true);
  }, []);

  // idとdecksが揃ってからdeckを取得
  useEffect(() => {
    if (!hydrated) return;
    if (typeof id !== "string") return;

    const found = decks.find((d) => d.id === id);
    setDeck(found ?? null);
  }, [hydrated, id, decks]);

  if (!hydrated) return <p>読み込み中...</p>;
  if (!deck) return <p>デッキが見つかりません</p>;

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const question = deck.questions[index];

  const next = () => {
    setShowAnswer(false);
    setSelected(null);
    setIndex((i) => Math.min(i + 1, deck.questions.length - 1));
  };

  const prev = () => {
    setShowAnswer(false);
    setSelected(null);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>{deck.name} の学習</h1>
      <p>
        {index + 1} / {deck.questions.length}
      </p>

      {/* フラッシュカードモード */}
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

      {/* クイズモード */}
      {deck.mode === "quiz" && (
        <div style={{ marginBottom: "24px" }}>
          <h2>{question.question}</h2>
          {question.options.length > 0 ? (
            question.options.map((opt: string) => (
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
            ))
          ) : (
            <p>選択肢がありません</p>
          )}
        </div>
      )}

      {/* ナビゲーション */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={prev} disabled={index === 0}>
          前へ
        </button>
        <button onClick={next} disabled={index === deck.questions.length - 1}>
          次へ
        </button>
      </div>
    </div>
  );
}
