// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { CssBaseline, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/store";
import { syncDecksFromCloud, syncDecksToCloud, syncHistoryFromCloud, syncHistoryToCloud } from "@/lib/syncService";

// MUI のテーマを使う場合は ThemeProvider を追加してもOK
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// const theme = createTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
  const setGroqApiKey = useStore((state) => state.setGroqApiKey);
  const upsertDeck    = useStore((state) => state.upsertDeck);
  const decks         = useStore((state) => state.decks);
  const history       = useStore((state) => state.history);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ログイン状態の変化を監視し、プロファイルを読み込む
    const { data: listener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const userId = session.user.id;

        // Groq APIキーをプロファイルから読み込む
        const { data: profile } = await supabase
          .from("profiles")
          .select("groq_api_key")
          .eq("id", userId)
          .single();
        if (profile?.groq_api_key) setGroqApiKey(profile.groq_api_key);

        // クラウドからデッキと履歴をダウンロード
        try {
          const cloudDecks   = await syncDecksFromCloud(userId);
          const cloudHistory = await syncHistoryFromCloud(userId);

          // クラウドのデッキをローカルにマージ
          cloudDecks.forEach((d) => upsertDeck(d));

          // クラウド履歴をZustandに反映
          if (cloudHistory.length > 0) {
            useStore.setState((state) => {
              const merged = [...state.history];
              cloudHistory.forEach((ch) => {
                const idx = merged.findIndex(
                  (lh) => lh.deckId === ch.deckId && lh.questionId === ch.questionId
                );
                if (idx === -1) merged.push(ch);
                else if (new Date(ch.timestamp) > new Date(merged[idx].timestamp)) {
                  merged[idx] = ch; // クラウドが新しければ上書き
                }
              });
              return { history: merged };
            });
          }

          // ローカルのデッキ・履歴をクラウドにアップロード
          if (decks.length > 0)   await syncDecksToCloud(userId, decks);
          if (history.length > 0) await syncHistoryToCloud(userId, history);
        } catch (e) {
          console.warn("[Sync] クラウド同期エラー:", e);
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setGroqApiKey]);

  return (
    <>
      <Head>
        <title>知新探求 学習アプリ</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      {/* <ThemeProvider theme={theme}> */}
      <CssBaseline />
      <NavBar /> {/* ✅ 全ページ共通ナビバー */}

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {mounted ? <Component {...pageProps} /> : null}
      </Container>
      {/* </ThemeProvider> */}
    </>
  );
}
