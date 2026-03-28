"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage("ログイン失敗: " + error.message);
    else window.location.href = "/";
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setMessage("登録失敗: " + error.message);
    else setMessage("確認メールを送信しました");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) setMessage("Googleログイン失敗: " + error.message);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        ログイン / 新規登録
      </Typography>

      <TextField
        label="メールアドレス"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="パスワード"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Box mt={2}>
        <Button variant="contained" onClick={handleLogin} sx={{ mr: 2 }}>
          ログイン
        </Button>

        <Button variant="outlined" onClick={handleSignup}>
          新規登録
        </Button>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleGoogleLogin}
        sx={{ mt: 2 }}
      >
        Googleでログイン
      </Button>

      {message && (
        <Typography color="primary" mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
}