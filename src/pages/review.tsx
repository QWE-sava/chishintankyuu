"use client";

import { useStore } from "@/store/store";
import { useState } from "react";

export default function ReviewPage() {
  const { decks, weakCards, recordStudy } = useStore();

  // とりあえず最初のデッキを対象にする（必要なら選択UIに変更可能）
  const deck = decks[0];
  if (!deck) return <p>デッキがありません</p>;

  const cards = weakCards(deck.id);
  if (cards.length === 0) return <p>復習対象のカードはありません</p>;

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<{ chosen: string; correct: boolean } | null>(null);

  const card = cards[index];

  const handleAnswer = (opt: string) => {
    if (!card) return;

    const correct = opt === card.answer;
    const score = correct ? 2 : 0; // ★ SRS対応：boolean → score:number に変換

    recordStudy(deck.id, card.id, score);

    setAnswered({ chosen: opt, correct });
  };

  const next = () => {
    setAnswered(null);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  };

  const prev = () => {
    setAnswered(null);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{deck.name} の復習</h1>
      <p>
        {index + 1} / {cards.length}
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 24,
          borderRadius: 8,
          marginBottom: 24,
          background: "#fafafa",
        }}
      >
        <h2>{card.question}</h2>

        {card.options.map((opt) => {
          const isCorrect = opt === card.answer;
          const isChosen = answered?.chosen === opt;

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={answered !== null}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                margin: "8px 0",
                borderRadius: 6,
                border: "1px solid #ccc",
                cursor: "pointer",
                background:
                  answered === null
                    ? "#eee"
                    : isCorrect
                    ? "#c8f7c5"
                    : isChosen
                    ? "#f7c5c5"
                    : "#eee",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={prev} disabled={index === 0}>
          前へ
        </button>
        <button onClick={next} disabled={index === cards.length - 1}>
          次へ
        </button>
      </div>
    </div>
  );
}
