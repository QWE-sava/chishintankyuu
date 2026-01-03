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
  score: number; // 0,1,2
  nextReviewDate: string; // ISO
  timestamp: string;
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
    mode:
      typeof input.mode === "string"
        ? input.mode
        : typeof input.deckMode === "string"
        ? input.deckMode
        : "quiz",
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
  weakCards: (deckId: string) => Question[];
  addDeck: (deck: any) => void;
  upsertDeck: (deck: any) => void;
  removeDeck: (id: string) => void;
  clearDecks: () => void;

  updateNotification: (id: string, active: boolean) => void;
  getSummary: (deckId: string) => Summary;

  getWeakCards: (deckId: string) => Question[];

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

      getDeckByMode: (mode: DeckMode) => {
        return get().decks.filter((d) => d.mode === mode);
      },

      /* --------------------------------------------------
         ★ SRS対応：学習記録
      -------------------------------------------------- */
      recordStudy: (deckId, questionId, score) =>
        set((state) => {
          const now = new Date();
          const next = new Date();

          if (score === 2) next.setDate(now.getDate() + 3);
          else if (score === 1) next.setDate(now.getDate() + 1);
          else next.setDate(now.getDate());

          const nextReviewDate = next.toISOString();

          const existing = state.history.find(
            (h) => h.deckId === deckId && h.questionId === questionId
          );

          if (existing) {
            return {
              history: state.history.map((h) =>
                h.deckId === deckId && h.questionId === questionId
                  ? { ...h, score, nextReviewDate, timestamp: now.toISOString() }
                  : h
              ),
            };
          }

          return {
            history: [
              ...state.history,
              {
                deckId,
                questionId,
                score,
                nextReviewDate,
                timestamp: now.toISOString(),
              },
            ],
          };
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

      clearDecks: () =>
        set(() => ({
          decks: [],
        })),
      weakCards: (deckId: string) => get().getWeakCards(deckId),

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
