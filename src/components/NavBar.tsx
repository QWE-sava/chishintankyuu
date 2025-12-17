// src/components/NavBar.tsx
import Link from "next/link";
import { AppBar, Toolbar, Button } from "@mui/material";

export default function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} href="/decks">
          ダッシュボード
        </Button>
        <Button color="inherit" component={Link} href="/settings">
          設定
        </Button>
        <Button color="inherit" component={Link} href="/study?deckId=demo">
          学習開始
        </Button>
        <Button color="inherit" component={Link} href="/">
        ホーム
        </Button>
      </Toolbar>
    </AppBar>
  );
}
