// src/components/Layout.tsx
import Link from "next/link";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>

          <Box sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={Link} href="/">
              ホーム
            </Button>

            <Button color="inherit" component={Link} href="/decks">
              ダッシュボード
            </Button>

            {/* ★ 新しく追加したページ */}
            <Button color="inherit" component={Link} href="/today">
              今日やること
            </Button>

            <Button color="inherit" component={Link} href="/review">
              復習
            </Button>
          </Box>

        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </>
  );
}
