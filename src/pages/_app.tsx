// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { CssBaseline, Container } from "@mui/material";

// MUI のテーマを使う場合は ThemeProvider を追加してもOK
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// const theme = createTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
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
        <Component {...pageProps} />
      </Container>
      {/* </ThemeProvider> */}
    </>
  );
}
