import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeckMode = "quiz" | "flashcard" | "review";

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

/* --------------------------------------------------
   ★ HistoryRecord は SRS 版に一本化（重複削除）
-------------------------------------------------- */
export interface HistoryRecord {
  deckId: string;
  questionId: string;
  score: number;          // 0=苦手, 1=普通, 2=完璧
  nextReviewDate: string; // ISO
  timestamp: string;
  // SM-2パラメータ
  interval: number;       // 次回まで何日か (初期値: 1)
  repetition: number;     // 連続正解回数 (初期値: 0)
  easeFactor: number;     // 難易度係数 (初期値: 2.5)
}

export interface Deck {
  id: string;
  name: string;
  mode: DeckMode;
  questions: Question[];
}

export interface Notification {
  id: string;
  message: string;
  active: boolean;
}

export interface Summary {
  studiedCards: number;
  correctCount: number;
  incorrectCount: number;
  totalCards: number;
  accuracyPercent: number;
  progressPercent: number;
  lastStudied: string | null;
  reviewCount: number;
  weakCardsCount: number;
}

/* --------------------------------------------------
   ★ normalizeDeck（mode を正しく保持）
-------------------------------------------------- */
function normalizeDeck(input: any): Deck {
  return {
    id: input.id ?? input.deckId ?? crypto.randomUUID(),
    name: input.name ?? input.deckName ?? "名称未設定デッキ",

    // ★ mode を確実に復元（最重要）
    mode:
      input.mode ??
      input.deckMode ??
      input.type ?? // import データが type を持つ場合
      "flashcard", // デフォルトは flashcard に変更

    questions: Array.isArray(input.questions)
      ? input.questions.map((q: any) => ({
          id: q.id ?? q.questionId ?? crypto.randomUUID(),
          question: q.question ?? q.text ?? "",
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer ?? q.correct ?? "",
          explanation: q.explanation ?? q.note ?? undefined,
        }))
      : [],
  };
}
/* --------------------------------------------------
   ★ StoreState（あなたの元コードを維持しつつ SRS に統合）
-------------------------------------------------- */
interface StoreState {
  decks: Deck[];
  history: HistoryRecord[];
  notifications: Notification[];
  groqApiKey: string;

  addDeck: (deck: any) => void;
  upsertDeck: (deck: any) => void;
  removeDeck: (id: string) => void;
  clearDecks: () => void;
  setGroqApiKey: (key: string) => void;

  updateNotification: (id: string, active: boolean) => void;
  getSummary: (deckId: string) => Summary;

  getWeakCards: (deckId: string) => Question[];
  weakCards: (deckId: string) => Question[];

  // ★ SRS版 recordStudy
  recordStudy: (deckId: string, questionId: string, score: number) => void;

  // ★ 今日やるカード
  getTodayCards: (deckId: string) => Question[];

  getDeckByMode: (mode: DeckMode) => Deck[];
}

/* --------------------------------------------------
   ★ Zustand Store（完全修正版）
-------------------------------------------------- */
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      decks: [],
      history: [],
      notifications: [],
      groqApiKey: "",

      setGroqApiKey: (key: string) => set({ groqApiKey: key }),

      addDeck: (deck: any) =>
        set((state) => ({
          decks: [...state.decks, normalizeDeck(deck)],
        })),

      upsertDeck: (deck: any) =>
        set((state) => {
          const normalized = normalizeDeck(deck);
          const exists = state.decks.find((d) => d.id === normalized.id);

          if (exists) {
            return {
              decks: state.decks.map((d) =>
                d.id === normalized.id ? normalized : d
              ),
            };
          }
          return { decks: [...state.decks, normalized] };
        }),

      /* --------------------------------------------------
         ★ removeDeck（エラー原因だったので復活）
      -------------------------------------------------- */
      removeDeck: (id: string) =>
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== id),
        })),

      clearDecks: () =>
        set(() => ({
          decks: [],
        })),

      getDeckByMode: (mode: DeckMode) => {
        return get().decks.filter((d) => d.mode === mode);
      },

      /* --------------------------------------------------
         ★ SRS対応：学習記録
      -------------------------------------------------- */
      recordStudy: (deckId, questionId, score) =>
        set((state) => {
          const now = new Date();
          const existing = state.history.find(
            (h) => h.deckId === deckId && h.questionId === questionId
          );

          // SM-2 アルゴリズム
          const prevInterval    = existing?.interval    ?? 1;
          const prevRepetition  = existing?.repetition  ?? 0;
          const prevEaseFactor  = existing?.easeFactor  ?? 2.5;

          let newInterval: number;
          let newRepetition: number;
          let newEaseFactor: number;

          if (score === 0) {
            // 苦手: リセット
            newRepetition = 0;
            newInterval   = 1;
            newEaseFactor = Math.max(1.3, prevEaseFactor - 0.2);
          } else if (score === 1) {
            // 普通: intervalは変えず翌日
            newRepetition = prevRepetition + 1;
            newInterval   = prevRepetition === 0 ? 1 : prevInterval;
            newEaseFactor = prevEaseFactor; // 係数は変動なし
          } else {
            // 完璧: intervalを指数的に延長
            newRepetition = prevRepetition + 1;
            if (prevRepetition === 0)       newInterval = 1;
            else if (prevRepetition === 1)  newInterval = 3;
            else newInterval = Math.min(180, Math.round(prevInterval * prevEaseFactor));
            newEaseFactor = prevEaseFactor + 0.1;
          }

          const next = new Date();
          next.setDate(now.getDate() + newInterval);
          const nextReviewDate = next.toISOString();

          const updated: HistoryRecord = {
            deckId,
            questionId,
            score,
            nextReviewDate,
            timestamp: now.toISOString(),
            interval:    newInterval,
            repetition:  newRepetition,
            easeFactor:  newEaseFactor,
          };

          if (existing) {
            return {
              history: state.history.map((h) =>
                h.deckId === deckId && h.questionId === questionId ? updated : h
              ),
            };
          }
          return { history: [...state.history, updated] };
        }),

      /* --------------------------------------------------
         ★ 今日やるカード
      -------------------------------------------------- */
      getTodayCards: (deckId: string) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const history = get().history.filter((h) => h.deckId === deckId);

        return deck.questions.filter((q) => {
          const h = history.find((x) => x.questionId === q.id);
          if (!h) return true;

          const next = new Date(h.nextReviewDate);
          next.setHours(0, 0, 0, 0);

          return next <= today;
        });
      },

      /* --------------------------------------------------
         ★ 弱点カード（score=0）
      -------------------------------------------------- */
      getWeakCards: (deckId: string) => {
        const deck = get().decks.find((d) => d.id === deckId);
        const history = get().history.filter((h) => h.deckId === deckId);

        if (!deck) return [];

        return deck.questions.filter((q) => {
          const h = history.find((x) => x.questionId === q.id);
          return h && h.score === 0;
        });
      },

      weakCards: (deckId: string) => get().getWeakCards(deckId),

      /* --------------------------------------------------
         ★ 統計
      -------------------------------------------------- */
      getSummary: (deckId: string) => {
  　　    const deck = get().decks.find((d) => d.id === deckId);
          const history = get().history.filter((h) => h.deckId === deckId);

          const studiedCards = history.length;
          const correctCount = history.filter((h) => h.score === 2).length;
          const incorrectCount = history.filter((h) => h.score === 0).length;

          const totalCards = deck?.questions.length ?? 0;

          const accuracyPercent =
            studiedCards > 0
              ? Math.round((correctCount / studiedCards) * 100)
              : 0;

          const progressPercent =
            totalCards > 0
              ? Math.round((studiedCards / totalCards) * 100)
              : 0;

          const lastStudied =
            history.length > 0 ? history[history.length - 1].timestamp : null;

          const weakCardsCount = incorrectCount;

          return {
            studiedCards,
            correctCount,
            incorrectCount,
            totalCards,
            accuracyPercent,
            progressPercent,
            lastStudied,
            reviewCount: studiedCards,
            weakCardsCount,
          };
        },


      updateNotification: (id: string, active: boolean) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, active } : n
          ),
        })),
    }),
    {
      name: "quiz-app-storage",
    }
  )
);
