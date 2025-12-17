export type ChoiceQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type Card = {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  accuracy: number;    // 0~100
  attempts: number;    // 試行回数
  lastStudied?: string; // ISO
  // クイズ型のための選択肢
  options?: string[];
};

export type Deck = {
  id: string;
  name: string;
  cards: Card[];
  createdAt?: string;
  updatedAt?: string;
};

export type StudyHistory = {
  deckId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  lastStudied?: string;
};

export type WeakCard = {
  cardId: string;
  deckId: string;
  accuracy: number;
};

export type NotificationSettings = {
  enabled: boolean;
  time: string; // "20:00"
  frequency: "daily" | "weekly";
};

export type DashboardSummary = {
  totalCards: number;
  studiedCards: number;
  accuracyPercent: number;
  lastStudied?: string;
  weakCount: number;
  avgWeakAccuracy?: number;
};

export type ImportDeckJSON = {
  deckId: string;
  deckName: string;
  questions: ChoiceQuestion[];
  meta?: {
    source?: "manual" | "sheets" | "json";
    importedAt?: string;
  };
};
