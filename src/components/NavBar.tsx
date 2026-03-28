"use client";

import Link from "next/link";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NavBar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 初回ロード時にユーザー取得
    supabase.auth.getUser().then((response: any) => {
      if (response && response.data) setUser(response.data.user);
    });

    // ログイン状態の変化を監視
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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

            <Button color="inherit" component={Link} href="/import">
              インポート
            </Button>

            <Button color="inherit" component={Link} href="/settings">
              設定
            </Button>
          </Box>

          {/* 右側：ログイン状態 */}
          {user ? (
            <>
              <Typography sx={{ mr: 2 }}>
                {user.email} でログイン中
              </Typography>
              <Button color="inherit" onClick={logout}>
                ログアウト
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} href="/login">
              ログイン
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}