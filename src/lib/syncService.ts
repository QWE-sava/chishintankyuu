// src/lib/syncService.ts
import { supabase } from "./supabase";
import { Deck, HistoryRecord } from "@/store/store";

// ======================================
// デッキ同期
// ======================================

/** localStorageのデッキをSupabaseにアップサート */
export async function syncDecksToCloud(userId: string, decks: Deck[]) {
  if (!decks.length) return;

  const rows = decks.map((d) => ({
    id: d.id,
    user_id: userId,
    name: d.name,
    mode: d.mode,
    questions: d.questions,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("decks")
    .upsert(rows, { onConflict: "id" });

  if (error) throw error;
}

/** Supabaseからデッキを取得 */
export async function syncDecksFromCloud(userId: string): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    mode: row.mode,
    questions: row.questions,
  }));
}

// ======================================
// 学習履歴同期
// ======================================

/** ローカルの学習履歴をSupabaseにアップサート（deckId + questionIdをユニークキーとして扱う）*/
export async function syncHistoryToCloud(userId: string, history: HistoryRecord[]) {
  if (!history.length) return;

  const rows = history.map((h) => ({
    user_id: userId,
    deck_id: h.deckId,
    question_id: h.questionId,
    score: h.score,
    interval: h.interval ?? 1,
    repetition: h.repetition ?? 0,
    ease_factor: h.easeFactor ?? 2.5,
    next_review_date: h.nextReviewDate,
    studied_at: h.timestamp,
  }));

  const { error } = await supabase
    .from("study_history")
    .upsert(rows, { onConflict: "user_id,deck_id,question_id" });

  if (error) throw error;
}

/** Supabaseから学習履歴を取得してHistoryRecord[]に変換 */
export async function syncHistoryFromCloud(userId: string): Promise<HistoryRecord[]> {
  const { data, error } = await supabase
    .from("study_history")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    deckId: row.deck_id,
    questionId: row.question_id,
    score: row.score,
    nextReviewDate: row.next_review_date,
    timestamp: row.studied_at,
    interval: row.interval ?? 1,
    repetition: row.repetition ?? 0,
    easeFactor: row.ease_factor ?? 2.5,
  }));
}
