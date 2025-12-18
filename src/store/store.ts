import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Deck {
  id: string;
  name: string;
  questions: Question[];
}

export interface HistoryRecord {
  deckId: string;
  questionId?: string;
  correctCount: number;
  incorrectCount: number;
  timestamp: string;
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

// JSONを正規化して Deck 型に揃える関数
function normalizeDeck(input: any): Deck {
  return {
    id: input.id ?? input.deckId ?? crypto.randomUUID(),
    name: input.name ?? input.deckName ?? "名称未設定デッキ",
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

interface StoreState {
  decks: Deck[];
  history: HistoryRecord[];
  notifications: Notification[];
  addDeck: (deck: any) => void;
  upsertDeck: (deck: any) => void;
  removeDeck: (id: string) => void;
  clearDecks: () => void;
  updateNotification: (id: string, active: boolean) => void;
  getSummary: (deckId: string) => Summary;

  // 追加した機能
  weakCards: (deckId: string) => Question[];
  recordStudy: (deckId: string, questionId: string, correct: boolean) => void;
  addHistory: (record: HistoryRecord) => void;
  releaseWeakCard: (deckId: string, questionId: string) => void;
  resetMistake: (deckId: string, questionId: string) => void;
  getWeakCards: (deckId: string) => Question[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      decks: [],
      history: [],
      notifications: [],

      addDeck: (deck: any) =>
        set((state) => {
          const normalized = normalizeDeck(deck);
          return { decks: [...state.decks, normalized] };
        }),

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
          } else {
            return { decks: [...state.decks, normalized] };
          }
        }),

      addHistory: (record: HistoryRecord) =>
        set((state) => ({
          history: [...state.history, record],
        })),

      releaseWeakCard: (deckId: string, questionId: string) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.deckId === deckId && h.questionId === questionId
              ? { ...h, correctCount: h.correctCount + 1 }
              : h
          ),
        })),

      resetMistake: (deckId: string, questionId: string) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.deckId === deckId && h.questionId === questionId
              ? { ...h, correctCount: 0, incorrectCount: 0 }
              : h
          ),
        })),

      getWeakCards: (deckId: string) => {
        const deck = get().decks.find((d) => d.id === deckId);
        const history = get().history.filter((h) => h.deckId === deckId);

        if (!deck) return [];

        return deck.questions.filter((q) => {
          const qHistory = history.find((h) => h.questionId === q.id);
          return qHistory && qHistory.incorrectCount > qHistory.correctCount;
        });
      },

      weakCards: (deckId: string) => {
        const deck = get().decks.find((d) => d.id === deckId);
        const history = get().history.filter((h) => h.deckId === deckId);

        if (!deck) return [];

        return deck.questions.filter((q) => {
          const qHistory = history.find((h) => h.questionId === q.id);
          return qHistory && qHistory.incorrectCount > qHistory.correctCount;
        });
      },

      recordStudy: (deckId: string, questionId: string, correct: boolean) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const existing = state.history.find(
            (h) => h.deckId === deckId && h.questionId === questionId
          );

          if (existing) {
            return {
              history: state.history.map((h) =>
                h.deckId === deckId && h.questionId === questionId
                  ? {
                      ...h,
                      correctCount: h.correctCount + (correct ? 1 : 0),
                      incorrectCount: h.incorrectCount + (!correct ? 1 : 0),
                      timestamp,
                    }
                  : h
              ),
            };
          } else {
            return {
              history: [
                ...state.history,
                {
                  deckId,
                  questionId,
                  correctCount: correct ? 1 : 0,
                  incorrectCount: correct ? 0 : 1,
                  timestamp,
                },
              ],
            };
          }
        }),

      removeDeck: (id: string) =>
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== id),
        })),

      clearDecks: () =>
        set(() => ({
          decks: [],
        })),

      updateNotification: (id: string, active: boolean) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, active } : n
          ),
        })),

      getSummary: (deckId: string) => {
        const deck = get().decks.find((d) => d.id === deckId);
        const history = get().history.filter((h) => h.deckId === deckId);

        const studiedCards = history.length;
        const correctCount = history.reduce((a, h) => a + h.correctCount, 0);
        const incorrectCount = history.reduce((a, h) => a + h.incorrectCount, 0);

        const totalCards = Array.isArray(deck?.questions)
          ? deck.questions.length
          : 0;

        const accuracyPercent =
          correctCount + incorrectCount > 0
            ? Math.round((correctCount / (correctCount + incorrectCount) * 100))
            : 0;

        const progressPercent =
          totalCards > 0
            ? Math.round((studiedCards / totalCards) * 100)
            : 0;

        const lastStudied =
          history.length > 0 ? history[history.length - 1].timestamp : null;

        const reviewCount = history.length;

        const weakCardsCount =
          Array.isArray(deck?.questions)
            ? deck.questions.filter((q) => {
                const qHistory = history.find((h) => h.questionId === q.id);
                return qHistory && qHistory.correctCount < qHistory.incorrectCount;
              }).length
            : 0;

        return {
          studiedCards,
          correctCount,
          incorrectCount,
          totalCards,
          accuracyPercent,
          progressPercent,
          lastStudied,
          reviewCount,
          weakCardsCount,
        };
      },
    }),
    {
      name: "quiz-app-storage",
    }
  )
);
