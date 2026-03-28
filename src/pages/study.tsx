"use client";

import { useRouter } from "next/router";
import { useStore } from "@/store/store";
import { useState, useMemo } from "react";

export default function StudyPage() {
  const router = useRouter();
  const { deckId, mode: queryMode } = router.query;

  const { decks, getTodayCards, recordStudy } = useStore();

  const deck = decks.find((d) => d.id === deckId);

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ score: number }[]>([]);

  // 復習モードなら getTodayCards、それ以外は全カード
  const cards = useMemo(() => {
    if (!deck) return [];
    if (queryMode === "review") return getTodayCards(deck.id);
    return deck.questions;
  }, [deck, queryMode, getTodayCards]);

  if (!deck) return <p style={{ padding: 24 }}>デッキが見つかりません</p>;

  if (cards.length === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h1>🎉 今日の復習は完了！</h1>
        <p>復習対象のカードはありません。</p>
        <button
          onClick={() => router.push("/decks")}
          style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, cursor: "pointer" }}
        >
          ダッシュボードへ戻る
        </button>
      </div>
    );
  }

  if (done) {
    const totalCards = sessionResults.length;
    const correct = sessionResults.filter((r) => r.score === 2).length;
    const partial = sessionResults.filter((r) => r.score === 1).length;
    const wrong   = sessionResults.filter((r) => r.score === 0).length;

    return (
      <div style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h1>🎊 セッション完了！</h1>
        <div style={{ background: "#f5f5f5", borderRadius: 12, padding: 24, margin: "24px 0" }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>
            合計: <strong>{totalCards}</strong> 枚
          </p>
          <p style={{ color: "#2ecc71" }}>✅ 完璧: {correct} 枚</p>
          <p style={{ color: "#f39c12" }}>🤔 普通: {partial} 枚</p>
          <p style={{ color: "#e74c3c" }}>😰 苦手: {wrong} 枚</p>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => {
              setIndex(0);
              setDone(false);
              setSessionResults([]);
              setShowAnswer(false);
              setSelected(null);
            }}
            style={{ padding: "10px 24px", borderRadius: 8, cursor: "pointer" }}
          >
            もう一度
          </button>
          <button
            onClick={() => router.push("/decks")}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              cursor: "pointer",
              background: "#0070f3",
              color: "#fff",
              border: "none",
            }}
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  // --- 自己評価ボタンを押したとき ---
  const handleSelfEval = (score: number) => {
    recordStudy(deck.id, card.id, score);
    setSessionResults((prev) => [...prev, { score }]);

    if (index >= cards.length - 1) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setShowAnswer(false);
    }
  };

  // --- クイズの選択肢を押したとき ---
  const handleQuizAnswer = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === card.answer;
    const score = correct ? 2 : 0;
    recordStudy(deck.id, card.id, score);
    setSessionResults((prev) => [...prev, { score }]);
  };

  const handleNextQuiz = () => {
    if (index >= cards.length - 1) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const isReview = queryMode === "review";
  const modeLabel = isReview ? "復習" : "学習";

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>
          {deck.name}　<span style={{ fontSize: 14, color: "#888" }}>{modeLabel}モード</span>
        </h1>
        <button
          onClick={() => router.push("/decks")}
          style={{ background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}
        >
          戻る
        </button>
      </div>

      {/* プログレスバー */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#eee", borderRadius: 8, height: 8 }}>
          <div
            style={{
              width: `${((index) / cards.length) * 100}%`,
              background: "#0070f3",
              height: 8,
              borderRadius: 8,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* ===================== */}
      {/* FLASHCARD MODE        */}
      {/* ===================== */}
      {deck.mode === "flashcard" && (
        <>
          <div
            onClick={() => !showAnswer && setShowAnswer(true)}
            style={{
              border: "1px solid #ccc",
              padding: 32,
              borderRadius: 12,
              cursor: showAnswer ? "default" : "pointer",
              marginBottom: 24,
              background: showAnswer ? "#f0f8ff" : "#fafafa",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>問題</p>
            <h2 style={{ margin: 0 }}>{card.question}</h2>

            {showAnswer && (
              <>
                <hr style={{ margin: "20px 0", borderColor: "#ccc" }} />
                <p style={{ fontSize: 13, color: "#0070f3", marginBottom: 8 }}>答え</p>
                <h2 style={{ margin: 0, color: "#0070f3" }}>{card.answer}</h2>
                {card.explanation && (
                  <p style={{ marginTop: 12, fontSize: 14, color: "#555", background: "#fff", padding: 10, borderRadius: 8 }}>
                    💡 {card.explanation}
                  </p>
                )}
              </>
            )}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 10,
                background: "#0070f3",
                color: "#fff",
                border: "none",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              答えを見る
            </button>
          ) : (
            <>
              <p style={{ textAlign: "center", color: "#666", marginBottom: 10 }}>この問題の理解度は？</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleSelfEval(0)}
                  style={{
                    flex: 1, padding: "14px 8px", borderRadius: 10,
                    background: "#fff0f0", border: "1px solid #e74c3c",
                    color: "#e74c3c", fontSize: 15, cursor: "pointer", fontWeight: "bold",
                  }}
                >
                  😰 苦手
                </button>
                <button
                  onClick={() => handleSelfEval(1)}
                  style={{
                    flex: 1, padding: "14px 8px", borderRadius: 10,
                    background: "#fffbf0", border: "1px solid #f39c12",
                    color: "#f39c12", fontSize: 15, cursor: "pointer", fontWeight: "bold",
                  }}
                >
                  🤔 普通
                </button>
                <button
                  onClick={() => handleSelfEval(2)}
                  style={{
                    flex: 1, padding: "14px 8px", borderRadius: 10,
                    background: "#f0fff4", border: "1px solid #2ecc71",
                    color: "#2ecc71", fontSize: 15, cursor: "pointer", fontWeight: "bold",
                  }}
                >
                  ✅ 完璧
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ===================== */}
      {/* QUIZ MODE             */}
      {/* ===================== */}
      {deck.mode === "quiz" && (
        <>
          <div style={{
            border: "1px solid #ccc", padding: 24, borderRadius: 12,
            marginBottom: 20, background: "#fafafa"
          }}>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>問題</p>
            <h2 style={{ margin: 0 }}>{card.question}</h2>
          </div>

          {card.options.length > 0 ? (
            card.options.map((opt) => {
              const isCorrect = opt === card.answer;
              const isChosen = selected === opt;
              let bg = "#eee";
              if (selected !== null) {
                if (isCorrect) bg = "#c8f7c5";
                else if (isChosen) bg = "#f7c5c5";
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={selected !== null}
                  style={{
                    display: "block", width: "100%", padding: 14, margin: "8px 0",
                    background: bg, border: "1px solid #ccc", borderRadius: 8,
                    cursor: selected !== null ? "default" : "pointer",
                    textAlign: "left", fontSize: 15,
                    transition: "background 0.2s",
                  }}
                >
                  {opt}
                </button>
              );
            })
          ) : (
            <p>選択肢がありません</p>
          )}

          {selected !== null && (
            <>
              {card.explanation && (
                <p style={{ margin: "12px 0", fontSize: 14, color: "#444", background: "#fff9e6", padding: 12, borderRadius: 8 }}>
                  💡 {card.explanation}
                </p>
              )}
              <button
                onClick={handleNextQuiz}
                style={{
                  width: "100%", marginTop: 16, padding: 14,
                  background: "#0070f3", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer",
                }}
              >
                {index >= cards.length - 1 ? "結果を見る" : "次の問題へ"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
