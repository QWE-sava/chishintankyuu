// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { CssBaseline, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/store";

// MUI のテーマを使う場合は ThemeProvider を追加してもOK
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// const theme = createTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
  const setGroqApiKey = useStore((state) => state.setGroqApiKey);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ログイン状態の変化を監視し、プロファイルを読み込む
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("groq_api_key")
          .eq("id", session.user.id)
          .single();

        if (data?.groq_api_key) {
          setGroqApiKey(data.groq_api_key);
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
