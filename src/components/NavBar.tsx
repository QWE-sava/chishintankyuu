import Link from "next/link";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

export default function NavBar() {
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

            <Button color="inherit" component={Link} href="/today">
              今日やること
            </Button>

            <Button color="inherit" component={Link} href="/review">
              復習
            </Button>

            {/* ★ 復活させるタブ */}
            <Button color="inherit" component={Link} href="/import">
              インポート
            </Button>

            <Button color="inherit" component={Link} href="/settings">
              設定
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
